import React, { useState } from 'react';
import { analyzeChoreHabits } from '../services/geminiService';
import { ChoreLog, FamilyMember, CHORES } from '../types';
import * as LucideIcons from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIInsightsProps {
  logs: ChoreLog[];
  members: FamilyMember[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ logs, members }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeChoreHabits(logs, members, CHORES);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gradient-to-br from-fuchsia-400 via-violet-400 to-indigo-400 p-8 rounded-[2rem] text-white shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-300 opacity-20 rounded-full -ml-10 -mb-10 blur-xl"></div>
        
        <h2 className="text-3xl font-bold mb-3 flex items-center gap-2 relative z-10">
          <LucideIcons.Sparkles className="text-yellow-300" /> AI Coach
        </h2>
        <p className="opacity-95 mb-8 text-sm font-medium relative z-10 leading-relaxed">
          Let Gemini analyze your family's habits to find trends and boost motivation with a sprinkle of fun!
        </p>
        
        {!analysis && !loading && (
          <button
            onClick={handleAnalyze}
            className="w-full bg-white text-violet-600 font-bold py-4 px-6 rounded-2xl hover:bg-opacity-95 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 relative z-10"
          >
            <LucideIcons.Zap size={20} fill="currentColor" className="text-yellow-400" /> Analyze This Week
          </button>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-4 relative z-10">
            <LucideIcons.Loader2 className="animate-spin mb-3 text-white" size={40} />
            <span className="text-base font-bold animate-pulse text-white">Mixing up insights...</span>
          </div>
        )}
      </div>

      {analysis && (
        <div className="flex-1 overflow-y-auto bg-white p-8 rounded-[2rem] shadow-sm border-2 border-indigo-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="prose prose-indigo prose-sm max-w-none font-medium">
             {analysis.split('\n').map((line, i) => {
               if (line.startsWith('###') || line.startsWith('**')) {
                 return <p key={i} className="font-bold text-violet-900 text-lg mt-6 mb-2">{line.replace(/[#*]/g, '')}</p>
               }
               return <p key={i} className="text-slate-600 leading-relaxed mb-3">{line.replace(/\*\*/g, '')}</p>
             })}
           </div>
           
           <button 
             onClick={() => setAnalysis(null)}
             className="mt-8 text-pink-500 text-sm font-bold hover:text-pink-600 flex items-center gap-2 transition-colors"
           >
             <LucideIcons.RefreshCw size={16} /> Start Over
           </button>
        </div>
      )}
    </div>
  );
};

export default AIInsights;