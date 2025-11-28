
import { ChoreLog, FamilyMember, DEFAULT_MEMBERS, CHORES } from '../types';

const LOGS_KEY = 'chore_harmony_logs_v5';
const MEMBERS_KEY = 'chore_harmony_members_v5';
const CURRENT_MEMBER_KEY = 'chore_harmony_current_member_v5';

const generateSampleData = (): ChoreLog[] => {
  const logs: ChoreLog[] = [];
  const now = Date.now();
  const dayMs = 86400000;
  
  // Generate data for the last 14 days
  for (let i = 0; i < 14; i++) {
    // Calculate date for this iteration
    const targetDate = new Date(now - (i * dayMs));
    const dateString = targetDate.toISOString().split('T')[0];
    
    // Create a deterministic but somewhat random set of chores per day (4 to 9 chores)
    // Using simple math to make it vary but look consistent
    const dailyCount = 4 + Math.floor(Math.random() * 6);
    
    for (let j = 0; j < dailyCount; j++) {
      // Pick a random member
      const member = DEFAULT_MEMBERS[Math.floor(Math.random() * DEFAULT_MEMBERS.length)];
      
      // Filter chores to create somewhat realistic habits
      let availableChores = CHORES;
      
      // Example: 'C' (m2) does more miscellaneous or food related tasks
      if (member.id === 'm2') {
         if (Math.random() > 0.6) {
           availableChores = CHORES.filter(c => c.category === 'misc' || c.category === 'kitchen' || c.id === 'c12');
         }
      }

      const chore = availableChores[Math.floor(Math.random() * availableChores.length)];
      
      // Randomize time during the day (8am to 8pm)
      const startOfDay = new Date(targetDate.setHours(0,0,0,0)).getTime();
      const timeOffset = (8 * 60 * 60 * 1000) + Math.floor(Math.random() * (12 * 60 * 60 * 1000));
      
      logs.push({
        id: `sample-${i}-${j}-${Math.random().toString(36).substr(2, 5)}`,
        memberId: member.id,
        choreId: chore.id,
        timestamp: startOfDay + timeOffset,
        dateString: dateString
      });
    }
  }
  
  // Sort by newest first
  return logs.sort((a, b) => b.timestamp - a.timestamp);
};

export const getLogs = (): ChoreLog[] => {
  try {
    const stored = localStorage.getItem(LOGS_KEY);
    if (stored) {
      const parsedLogs = JSON.parse(stored);
      // If we have an empty array (or just initialized), seed with sample data for the demo
      if (Array.isArray(parsedLogs) && parsedLogs.length > 0) {
        return parsedLogs;
      }
    }
    
    // Seed data if missing or empty
    const sampleData = generateSampleData();
    localStorage.setItem(LOGS_KEY, JSON.stringify(sampleData));
    return sampleData;
  } catch (e) {
    console.error("Failed to parse logs", e);
    // Fallback to sample data on error
    const sampleData = generateSampleData();
    return sampleData;
  }
};

export const saveLog = (log: ChoreLog) => {
  const current = getLogs();
  const updated = [log, ...current];
  localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteLog = (logId: string) => {
  const current = getLogs();
  const updated = current.filter(l => l.id !== logId);
  localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  return updated;
};

export const getMembers = (): FamilyMember[] => {
  try {
    const stored = localStorage.getItem(MEMBERS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_MEMBERS;
  } catch (e) {
    return DEFAULT_MEMBERS;
  }
};

export const saveMembers = (members: FamilyMember[]) => {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
};

export const getCurrentMemberId = (): string | null => {
  return localStorage.getItem(CURRENT_MEMBER_KEY);
};

export const saveCurrentMemberId = (id: string | null) => {
  if (id) {
    localStorage.setItem(CURRENT_MEMBER_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_MEMBER_KEY);
  }
};
