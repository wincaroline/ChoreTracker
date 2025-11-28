
import React, { useState } from 'react';
import { ChoreLog, FamilyMember, CHORES } from '../types';
import * as LucideIcons from 'lucide-react';

interface RecentLogListProps {
  logs: ChoreLog[];
  members: FamilyMember[];
  onDeleteLog?: (logId: string) => void;
}

const RecentLogList: React.FC<RecentLogListProps> = ({ logs, members, onDeleteLog }) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Close menu if clicking elsewhere (handled by parent click usually, but simplified here)
  React.useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // Filter for last 3 days
  const cutoff = Date.now() - (3 * 24 * 60 * 60 * 1000);
  const filteredLogs = logs.filter(log => log.timestamp > cutoff);

  if (filteredLogs.length === 0) return null;

  // Group logs by date
  const groupedLogs: Record<string, ChoreLog[]> = {};
  filteredLogs.forEach(log => {
    const date = log.dateString === new Date().toISOString().split('T')[0] ? 'Today' : 
                 log.dateString === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? 'Yesterday' : log.dateString;
    if (!groupedLogs[date]) groupedLogs[date] = [];
    groupedLogs[date].push(log);
  });

  const handleMenuClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onDeleteLog) {
      onDeleteLog(id);
      setOpenMenuId(null);
    }
  };

  const renderIcon = (iconName: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.CheckCircle;
    return <Icon size={18} strokeWidth={2.5} />;
  };

  return (
    <div className="mt-8 pb-4">
      <h3 className="font-bold text-violet-900 text-lg mb-4 px-2">Recent Activity (Last 3 Days)</h3>
      <div className="space-y-6">
        {Object.entries(groupedLogs).map(([date, dayLogs]) => (
          <div key={date}>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">{date}</h4>
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-indigo-50 overflow-hidden">
              {dayLogs.map((log, index) => {
                const member = members.find(m => m.id === log.memberId);
                const chore = CHORES.find(c => c.id === log.choreId);
                const isMenuOpen = openMenuId === log.id;

                return (
                  <div key={log.id} className={`relative flex items-center p-4 ${index !== dayLogs.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-slate-50 transition-colors`}>
                    <div className="text-3xl mr-4 filter drop-shadow-sm">{member?.avatar}</div>
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="font-medium text-slate-700 text-sm truncate">
                        <span className={`font-bold ${member?.color.split(' ')[1]}`}>{member?.name}</span> did {chore?.name.toLowerCase()}
                      </p>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    
                    {/* Action Area */}
                    <div className="flex items-center gap-2">
                      {chore && (
                        <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                          chore.category === 'home' ? 'bg-sky-50 text-sky-500' :
                          chore.category === 'kitchen' ? 'bg-rose-50 text-rose-500' :
                          chore.category === 'drinks' ? 'bg-cyan-50 text-cyan-500' :
                          chore.category === 'clothing' ? 'bg-fuchsia-50 text-fuchsia-500' :
                          chore.category === 'pets' ? 'bg-orange-50 text-orange-500' :
                          'bg-violet-50 text-violet-500'
                        }`}>
                          {renderIcon(chore.icon)}
                        </div>
                      )}
                      
                      {onDeleteLog && (
                        <div className="relative ml-1">
                          <button 
                            onClick={(e) => handleMenuClick(e, log.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                          >
                            <LucideIcons.MoreVertical size={18} />
                          </button>
                          
                          {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-lg border border-slate-100 p-1 min-w-[100px] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                              <button 
                                onClick={(e) => handleDelete(e, log.id)}
                                className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <LucideIcons.Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentLogList;
