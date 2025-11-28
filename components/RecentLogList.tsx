
import React, { useState, useEffect, useRef } from 'react';
import { ChoreLog, FamilyMember, CHORES } from '../types';
import * as LucideIcons from 'lucide-react';

interface RecentLogListProps {
  logs: ChoreLog[];
  members: FamilyMember[];
  onDeleteLog?: (logId: string) => void;
  onClearAllLogs?: () => void;
}

const RecentLogList: React.FC<RecentLogListProps> = ({ logs, members, onDeleteLog, onClearAllLogs }) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Close menus if clicking elsewhere
  useEffect(() => {
    const closeMenus = () => {
      setOpenMenuId(null);
      setIsHeaderMenuOpen(false);
    };
    window.addEventListener('click', closeMenus);
    return () => window.removeEventListener('click', closeMenus);
  }, []);

  // Intersection Observer for Lazy Loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 20);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [logs]);

  if (logs.length === 0) return null;

  // Slice logs for lazy loading
  const visibleLogs = logs.slice(0, visibleCount);

  // Group logs by date
  const groupedLogs: Record<string, ChoreLog[]> = {};
  visibleLogs.forEach(log => {
    const date = log.dateString === new Date().toISOString().split('T')[0] ? 'Today' : 
                 log.dateString === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? 'Yesterday' : log.dateString;
    if (!groupedLogs[date]) groupedLogs[date] = [];
    groupedLogs[date].push(log);
  });

  const handleMenuClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
    setIsHeaderMenuOpen(false);
  };
  
  const handleHeaderMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHeaderMenuOpen(!isHeaderMenuOpen);
    setOpenMenuId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onDeleteLog) {
      onDeleteLog(id);
      setOpenMenuId(null);
    }
  };
  
  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClearAllLogs) {
      onClearAllLogs();
      setIsHeaderMenuOpen(false);
    }
  };

  const renderIcon = (iconName: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.CheckCircle;
    return <Icon size={18} strokeWidth={2.5} />;
  };

  return (
    <div className="mt-8 pb-4">
      <div className="flex items-center justify-between px-2 mb-4 relative">
        <h3 className="font-bold text-violet-900 text-lg">All Activity</h3>
        
        {onClearAllLogs && (
          <div className="relative">
            <button 
              onClick={handleHeaderMenuClick}
              className="p-1.5 text-violet-300 hover:text-violet-600 hover:bg-violet-50 rounded-full transition-colors"
            >
              <LucideIcons.MoreHorizontal size={20} />
            </button>
            
            {isHeaderMenuOpen && (
              <div className="absolute right-0 top-full mt-1 z-30 bg-white rounded-xl shadow-lg border border-slate-100 p-1 min-w-[120px] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <button 
                  onClick={handleClearAll}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LucideIcons.Trash2 size={14} /> Clear All
                </button>
              </div>
            )}
          </div>
        )}
      </div>

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
                        <span className={`font-bold ${member?.color.split(' ')[1]}`}>{member?.name}</span> {chore?.pastTense || `did ${chore?.name.toLowerCase() || 'task'}`}
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
        {/* Loading Sentinel */}
        {visibleCount < logs.length && (
          <div ref={observerTarget} className="h-10 flex items-center justify-center">
            <LucideIcons.Loader2 className="animate-spin text-violet-300" size={20} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentLogList;
