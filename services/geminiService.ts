import { GoogleGenAI } from "@google/genai";
import { ChoreLog, FamilyMember, ChoreType } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is not defined in process.env");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeChoreHabits = async (
  logs: ChoreLog[],
  members: FamilyMember[],
  chores: ChoreType[]
): Promise<string> => {
  const client = getClient();
  if (!client) return "Error: API Key missing.";

  // Filter logs to last 7 days for relevant context
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentLogs = logs.filter(l => l.timestamp > oneWeekAgo);

  if (recentLogs.length === 0) {
    return "Not enough data yet! Log some chores to get insights.";
  }

  // Enrich data for the prompt
  const enrichedLogs = recentLogs.map(log => {
    const member = members.find(m => m.id === log.memberId)?.name || 'Unknown';
    const chore = chores.find(c => c.id === log.choreId)?.name || 'Unknown';
    return { member, chore, date: new Date(log.timestamp).toLocaleDateString() };
  });

  const prompt = `
    You are a friendly, witty, and motivating family productivity coach.
    Here is the chore data for the family for the last 7 days:
    ${JSON.stringify(enrichedLogs)}

    Please provide a concise analysis (max 200 words) with the following sections formatted in Markdown:
    1. **🏆 MVP of the Week**: Who did the most or hardest tasks?
    2. **📊 Trends**: A quick observation on what chores are being done most/least.
    3. **💡 Tip**: A gentle efficiency suggestion or a fun motivation for anyone slacking (be kind but nudge them).
    
    Keep the tone lighthearted and encouraging.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "I couldn't generate an analysis right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Oops! I had trouble thinking about your chores. Please try again later.";
  }
};