
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { ChoreLog, FamilyMember, CHORES } from '../types';
import * as LucideIcons from 'lucide-react';
import RecentLogList from './RecentLogList';

interface StatsViewProps {
  logs: ChoreLog[];
  members: FamilyMember[];
  onOpenLogModal?: () => void;
  onDeleteLog?: (logId: string) => void;
}

// Custom shape to render "squares" or blocks for each chore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomStackShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  const { count, colors } = payload;
  
  if (!count || count <= 0) return null;

  // We split the total bar height into 'value' number of segments
  const unitHeight = height / count;
  
  // Calculate a gap that looks good but doesn't vanish small bars
  const gap = Math.min(3, unitHeight * 0.25);
  const blockHeight = Math.max(1, unitHeight - gap);
  
  const rects = [];
  for (let i = 0; i < count; i++) {
    // Determine color for this specific block from the payload
    // i=0 corresponds to the first element in the colors array (latest chore),
    // which renders at 'y' (the top of the bar).
    const color = (colors && colors[i]) ? colors[i] : '#8b5cf6';

    rects.push(
      <rect
        key={i}
        x={x}
        y={y + (i * unitHeight)}
        width={width}
        height={blockHeight}
        fill={color}
        rx={4}
        ry={4}
        opacity={0.9}
      />
    );
  }

  return <g>{rects}</g>;
};

const StatsView: React.FC<StatsViewProps> = ({ logs, members, onOpenLogModal, onDeleteLog }) => {
  const choreTypeStats = useMemo(() => {
    const stats: Record<string, number> = {};
    logs.forEach(log => {
      const chore = CHORES.find(c => c.id === log.choreId);
      if (chore) {
        stats[chore.name] = (stats[chore.name] || 0) + 1;
      }
    });
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [logs]);

  const dailyStats = useMemo(() => {
    const stats: { date: string; count: number; colors: string[] }[] = [];
    const now = new Date();
    // 14 days history
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      
      const dayLogs = logs.filter(l => l.dateString === dateString);
      const count = dayLogs.length;

      // Map logs to colors based on chore category
      // Logs are assumed to be sorted newest first, so index 0 is the top block.
      const colors = dayLogs.map(log => {
        const chore = CHORES.find(c => c.id === log.choreId);
        const category = chore?.category || 'misc';
        switch (category) {
          case 'kitchen': return '#fb7185'; // rose-400
          case 'drinks': return '#22d3ee'; // cyan-400
          case 'home': return '#38bdf8'; // sky-400
          case 'clothing': return '#e879f9'; // fuchsia-400
          case 'pets': return '#fb923c'; // orange-400
          case 'misc': default: return '#a78bfa'; // violet-400
        }
      });

      stats.push({ date: displayDate, count, colors });
    }
    return stats;
  }, [logs]);

  // Pastel Whimsy Palette for Pie Chart
  const COLORS = ['#f472b6', '#60a5fa', '#fcd34d', '#a78bfa', '#34d399'];

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-4 px-2">
         <h2 className="text-2xl font-bold text-violet-900">Family Stats</h2>
         {onOpenLogModal && (
           <button 
             onClick={onOpenLogModal}
             className="w-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white p-4 rounded-2xl shadow-lg shadow-pink-200 active:scale-95 transition-all hover:shadow-xl flex items-center justify-center gap-2"
           >
             <LucideIcons.Plus size={24} strokeWidth={3} />
             <span className="text-lg font-bold">Log Chore</span>
           </button>
         )}
      </div>

      {/* 2-Week Trend Bar Chart (Stacked Blocks) */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-indigo-50">
        <h3 className="text-lg font-bold text-violet-900 mb-4 flex items-center gap-2">
          <div className="p-1.5 bg-green-100 rounded-lg text-green-500"><LucideIcons.TrendingUp size={18} /></div>
          Activity Trends (Last 14 Days)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyStats} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="date" 
                tick={{fontSize: 10, fill: '#94a3b8', fontFamily: 'Quicksand'}} 
                axisLine={false}
                tickLine={false}
                interval={1} 
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{fontSize: 12, fill: '#94a3b8', fontFamily: 'Quicksand'}}
              />
              <Tooltip 
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px -1px rgb(0 0 0 / 0.1)', fontFamily: 'Quicksand'}}
                cursor={{fill: '#f0f9ff', radius: 8}}
              />
              {/* Using Custom Shape to render blocks/squares */}
              <Bar 
                dataKey="count" 
                shape={<CustomStackShape />} 
                barSize={16} 
                fill="#8b5cf6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-indigo-50">
        <h3 className="text-lg font-bold text-violet-900 mb-4 flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-lg text-blue-500"><LucideIcons.PieChart size={18} /></div>
          Top Chores
        </h3>
        {logs.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400">
             <p className="text-sm">No data yet</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={choreTypeStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={6}
                  dataKey="value"
                  cornerRadius={6}
                >
                  {choreTypeStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'Quicksand'}} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <RecentLogList logs={logs} members={members} onDeleteLog={onDeleteLog} />
    </div>
  );
};

export default StatsView;
