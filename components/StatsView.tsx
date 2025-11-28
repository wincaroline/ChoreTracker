
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChoreLog, FamilyMember, CHORES } from '../types';
import * as LucideIcons from 'lucide-react';
import RecentLogList from './RecentLogList';

interface StatsViewProps {
  logs: ChoreLog[];
  members: FamilyMember[];
  onOpenLogModal?: () => void;
  onDeleteLog?: (logId: string) => void;
  onClearAllLogs?: () => void;
}

interface TooltipData {
  x: number;
  y: number;
  choreName: string;
  memberName: string;
  memberAvatar: string;
  color: string;
}

// Helper for colors
const getCategoryColor = (category?: string) => {
  switch (category) {
    case 'kitchen': return '#fb7185'; // rose-400
    case 'drinks': return '#22d3ee'; // cyan-400
    case 'home': return '#38bdf8'; // sky-400
    case 'clothing': return '#e879f9'; // fuchsia-400
    case 'pets': return '#fb923c'; // orange-400
    case 'misc': default: return '#a78bfa'; // violet-400
  }
};

// Custom shape to render "squares" or blocks for each chore with icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomStackShape = (props: any) => {
  const { x, y, width, height, payload, onSelect } = props;
  const { logs } = payload; // Array of rich log data

  if (!logs || logs.length === 0) return null;

  const count = logs.length;
  // Determine block height based on total available height for the bar value
  const unitHeight = height / count;
  
  // Visual tweaks - Increased gap
  const gap = Math.min(8, unitHeight * 0.2); 
  const blockHeight = Math.max(1, unitHeight - gap);
  
  // Icon size calculation (clamp between 12 and 24)
  const iconSize = Math.min(28, Math.max(14, blockHeight - 8));
  const showIcon = blockHeight > 24;

  return (
    <g>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {logs.map((log: any, i: number) => {
        // Index 0 is at the top (y)
        const itemY = y + (i * unitHeight);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Icon = (LucideIcons as any)[log.choreIcon] || LucideIcons.Circle;

        const handleClick = (e: any) => {
          e.stopPropagation(); // Prevent parent from clearing tooltip
          if (onSelect) {
            onSelect({
              x: x + width / 2,
              y: itemY + blockHeight / 2,
              choreName: log.choreName,
              memberName: log.memberName,
              memberAvatar: log.memberAvatar,
              color: log.color
            });
          }
        };

        return (
          <g 
            key={log.id}
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x={x}
              y={itemY}
              width={width}
              height={blockHeight}
              fill={log.color}
              rx={4}
              ry={4}
              opacity={0.95}
              className="transition-opacity hover:opacity-100"
            />
            {showIcon && (
              <foreignObject x={x} y={itemY} width={width} height={blockHeight} style={{ pointerEvents: 'none' }}>
                <div className="w-full h-full flex items-center justify-center text-white/80 drop-shadow-sm opacity-90">
                  <Icon size={iconSize} strokeWidth={1.75} />
                </div>
              </foreignObject>
            )}
          </g>
        );
      })}
    </g>
  );
};

// Custom Tick Component for XAxis
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomAxisTick = (props: any) => {
  const { x, y, payload, data } = props;
  const entry = data[payload.index];
  
  if (!entry) return null;

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Increased dy to 24 to add more spacing between chart and text */}
      <text x={0} y={0} dy={24} textAnchor="middle" fill="#94a3b8" fontSize={12} fontFamily="Quicksand" fontWeight={700}>
        <tspan x={0} dy="0">{entry.labelDate}</tspan>
        <tspan x={0} dy="16" fontSize={11} fontWeight={600} fill="#cbd5e1">{entry.labelDay}</tspan>
      </text>
    </g>
  );
};

const StatsView: React.FC<StatsViewProps> = ({ logs, members, onOpenLogModal, onDeleteLog, onClearAllLogs }) => {
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);

  const dailyStats = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stats: { dateString: string; labelDate: string; labelDay: string; count: number; logs: any[] }[] = [];
    const now = new Date();
    // 7 days history
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      
      const labelDate = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }); // "11/27"
      const labelDay = d.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon"
      
      const dayLogs = logs.filter(l => l.dateString === dateString);
      // Sort newest first so they stack nicely (top down visually in logic, but standard bars are bottom up.. 
      // Actually we are drawing manually from y downwards in the shape loop, so index 0 is top.)
      const sortedLogs = dayLogs.sort((a, b) => b.timestamp - a.timestamp); 

      const enrichedLogs = sortedLogs.map(log => {
        const chore = CHORES.find(c => c.id === log.choreId);
        const member = members.find(m => m.id === log.memberId);
        const category = chore?.category || 'misc';
        
        return {
          id: log.id,
          choreName: chore?.name || 'Unknown',
          choreIcon: chore?.icon || 'Circle',
          memberName: member?.name || 'Unknown',
          memberAvatar: member?.avatar || '?',
          color: getCategoryColor(category),
        };
      });

      stats.push({ dateString, labelDate, labelDay, count: dayLogs.length, logs: enrichedLogs });
    }
    return stats;
  }, [logs, members]);

  return (
    <div 
      className="space-y-6 pb-28 relative"
      onClick={() => setTooltipData(null)}
    >
      {/* 1-Week Trend Bar Chart (Stacked Blocks) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-indigo-50 mt-0 relative">
        <h3 className="text-lg font-bold text-violet-900 mb-4 flex items-center gap-2">
          <div className="p-1.5 bg-green-100 rounded-lg text-green-500"><LucideIcons.TrendingUp size={18} /></div>
          Logged In Last 7 Days
        </h3>
        
        {/* Tooltip Popup */}
        {tooltipData && (
          <div 
            className="absolute z-50 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-xl border-2 border-indigo-100 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150 pointer-events-none transform -translate-x-1/2 -translate-y-[120%]"
            style={{ 
              left: tooltipData.x,
              top: tooltipData.y 
            }}
          >
             <span className="text-3xl filter drop-shadow-sm">{tooltipData.memberAvatar}</span>
             <div className="min-w-0">
               <p className="font-bold text-slate-700 text-sm leading-tight truncate max-w-[120px]">{tooltipData.choreName}</p>
               <div className="flex items-center gap-1.5 mt-1">
                 <div className="w-2 h-2 rounded-full" style={{ background: tooltipData.color }} />
                 <p className="text-xs text-slate-400 font-bold">{tooltipData.memberName}</p>
               </div>
             </div>
             {/* Little arrow at bottom */}
             <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r-2 border-b-2 border-indigo-100 shadow-sm"></div>
          </div>
        )}

        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyStats} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <XAxis 
                dataKey="dateString" 
                tick={<CustomAxisTick data={dailyStats} />} 
                axisLine={false}
                tickLine={false}
                interval={0} 
                height={50}
              />
              <YAxis 
                hide={true}
              />
              {/* Using Custom Shape to render blocks/squares */}
              <Bar 
                dataKey="count" 
                shape={<CustomStackShape onSelect={setTooltipData} />} 
                barSize={56}
                isAnimationActive={false} // Disable animation to prevent tooltip flickering during updates
                activeBar={false} // Disable highlight on tap
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <RecentLogList logs={logs} members={members} onDeleteLog={onDeleteLog} onClearAllLogs={onClearAllLogs} />
      
      {/* Floating Log Button */}
      {onOpenLogModal && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-md px-6 z-40" onClick={(e) => e.stopPropagation()}>
           <button 
             onClick={onOpenLogModal}
             className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-4 rounded-2xl shadow-xl shadow-violet-200/50 active:scale-95 transition-all flex items-center justify-center gap-2 border-2 border-white/20"
           >
             <LucideIcons.PlusCircle size={24} strokeWidth={2.5} />
             <span className="text-lg font-bold tracking-wide">Log Chore</span>
           </button>
        </div>
      )}
    </div>
  );
};

export default StatsView;
