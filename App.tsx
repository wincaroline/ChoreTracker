
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState, ChoreLog, FamilyMember, CHORES } from './types';
import { getLogs, saveLog, getMembers, getCurrentMemberId, saveCurrentMemberId, deleteLog } from './services/storageService';
import StatsView from './components/StatsView';
import AIInsights from './components/AIInsights';
import * as LucideIcons from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('stats');
  const [logs, setLogs] = useState<ChoreLog[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  
  // Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logModalMode, setLogModalMode] = useState<'selection' | 'logging'>('logging');
  const [selectedChoreIds, setSelectedChoreIds] = useState<string[]>([]);

  // Initial Load
  useEffect(() => {
    setLogs(getLogs());
    setMembers(getMembers());
    setActiveMemberId(getCurrentMemberId());
  }, []);

  // Group chores for display in selector
  const groupedChores = useMemo(() => {
    const groups: Record<string, typeof CHORES> = {
      kitchen: [],
      drinks: [],
      home: [],
      clothing: [],
      pets: [],
      misc: []
    };
    CHORES.forEach(c => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, []);
  
  const categoryOrder = ['kitchen', 'drinks', 'home', 'clothing', 'pets', 'misc'];
  const categoryTitles: Record<string, string> = {
    kitchen: 'Food & Kitchen',
    drinks: 'Drinks',
    home: 'Home',
    clothing: 'Clothing',
    pets: 'Pets',
    misc: 'Miscellaneous'
  };

  const handleLogChore = (memberId: string, choreId: string) => {
    const newLog: ChoreLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      memberId,
      choreId,
      timestamp: Date.now(),
      dateString: new Date().toISOString().split('T')[0]
    };
    
    const updatedLogs = saveLog(newLog);
    setLogs(updatedLogs);
    return updatedLogs;
  };

  const handleBatchSave = () => {
    if (!activeMemberId || selectedChoreIds.length === 0) return;

    let updatedLogs = logs;
    // We iterate manually to ensure unique IDs and timestamps slightly offset if needed
    selectedChoreIds.forEach((choreId, index) => {
       const newLog: ChoreLog = {
        id: Date.now().toString() + index,
        memberId: activeMemberId,
        choreId,
        timestamp: Date.now() + index, // slight offset to keep order
        dateString: new Date().toISOString().split('T')[0]
      };
      updatedLogs = saveLog(newLog);
    });
    
    setLogs(updatedLogs);
    setNotification(`Logged ${selectedChoreIds.length} chores! Awesome! 🎉`);
    setTimeout(() => setNotification(null), 3000);
    
    // Reset and close
    setSelectedChoreIds([]);
    setIsLogModalOpen(false);
  };

  const handleDeleteLog = (logId: string) => {
    const updatedLogs = deleteLog(logId);
    setLogs(updatedLogs);
    setNotification('Activity removed.');
    setTimeout(() => setNotification(null), 2000);
  };

  const toggleChoreSelection = (choreId: string) => {
    setSelectedChoreIds(prev => 
      prev.includes(choreId) 
        ? prev.filter(id => id !== choreId)
        : [...prev, choreId]
    );
  };

  const handleMemberSelect = (id: string) => {
    setActiveMemberId(id);
    saveCurrentMemberId(id);
  };

  const handleModalMemberSelect = (id: string) => {
    handleMemberSelect(id);
    if (logModalMode === 'selection') {
      setIsLogModalOpen(false);
    }
  };

  const handleHeaderChipClick = () => {
    setLogModalMode('selection');
    setIsLogModalOpen(true);
  };
  
  const handleOpenLogModal = () => {
    setLogModalMode('logging');
    setIsLogModalOpen(true);
  };

  const activeMember = members.find(m => m.id === activeMemberId);

  const NavButton = ({ target, icon: Icon, label }: { target: ViewState; icon: any; label: string }) => (
    <button 
      onClick={() => setView(target)}
      className={`flex flex-col items-center justify-center w-full py-3 transition-all duration-300 ${
        view === target ? 'text-pink-500 scale-110' : 'text-gray-400 hover:text-pink-300'
      }`}
    >
      <Icon size={26} strokeWidth={view === target ? 2.5 : 2} className={view === target ? 'drop-shadow-sm' : ''} />
      <span className="text-[11px] font-bold mt-1">{label}</span>
    </button>
  );

  const renderIcon = (iconName: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.CheckCircle;
    return <Icon size={28} strokeWidth={2.5} />;
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-cream flex flex-col relative overflow-hidden shadow-2xl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-sm z-10 min-h-[72px] border-b border-indigo-50">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-white p-2 rounded-xl shadow-md rotate-3 transform transition-transform hover:rotate-6">
            <LucideIcons.CheckSquare size={20} />
          </div>
          <h1 className="text-2xl font-bold text-violet-900 tracking-tight">ChoreHarmony</h1>
        </div>
        
        <button
          onClick={handleHeaderChipClick}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all active:scale-95 shadow-sm hover:shadow-md 
            ${activeMember 
              ? activeMember.color.replace('text-', 'border-').replace('bg-', 'bg-opacity-20 bg-')
              : 'bg-white border-violet-100 text-violet-400 hover:border-violet-300 hover:text-violet-600'
            }`}
        >
          {activeMember ? (
            <>
              <span className="text-xl leading-none filter drop-shadow-sm">{activeMember.avatar}</span>
              <span className={`font-bold text-sm ${activeMember.color.split(' ')[1]}`}>{activeMember.name}</span>
              <LucideIcons.ChevronDown size={14} className="opacity-40 text-gray-600" />
            </>
          ) : (
            <>
              <div className="bg-violet-100 p-1 rounded-full"><LucideIcons.User size={14} className="text-violet-500" /></div>
              <span className="font-bold text-sm">Who is working?</span>
            </>
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 scroll-smooth no-scrollbar">
        
        {view === 'stats' && (
          <div className="animate-in slide-in-from-left-4 duration-300">
            <StatsView 
              logs={logs} 
              members={members} 
              onOpenLogModal={handleOpenLogModal}
              onDeleteLog={handleDeleteLog}
            />
          </div>
        )}

        {view === 'ai' && (
          <div className="animate-in slide-in-from-right-4 duration-300 h-full">
            <AIInsights logs={logs} members={members} />
          </div>
        )}
      </main>

      {/* Log Chores Modal Overlay */}
      {isLogModalOpen && (
        <div className="absolute inset-0 z-50 bg-cream flex flex-col animate-in slide-in-from-bottom-full duration-300">
           {/* Modal Header */}
           <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm border-b border-indigo-50">
             <h2 className="text-2xl font-bold text-violet-900">
               {logModalMode === 'selection' ? 'Select Member' : 'Log Chores'}
             </h2>
             <button 
               onClick={() => {
                 setIsLogModalOpen(false);
                 setSelectedChoreIds([]);
               }}
               className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
             >
               <LucideIcons.X size={20} />
             </button>
           </div>

           {/* Modal Content */}
           <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
             {(!activeMemberId || logModalMode === 'selection') ? (
               <div className="animate-in fade-in duration-300">
                  <h3 className="text-xl font-bold text-violet-900 mb-6 px-2 text-center">Who is logging?</h3>
                  <div className="grid grid-cols-2 gap-4 px-1">
                    {members.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => handleModalMemberSelect(member.id)}
                        className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-4 transition-all active:scale-95 shadow-sm hover:shadow-lg ${member.color} bg-opacity-40 border-opacity-30 hover:bg-opacity-80`}
                      >
                        <span className="text-7xl mb-4 filter drop-shadow-sm transform hover:rotate-6 transition-transform">{member.avatar}</span>
                        <span className="text-xl font-bold tracking-wide">{member.name}</span>
                      </button>
                    ))}
                  </div>
               </div>
             ) : (
               <div className="animate-in fade-in duration-300 pb-24">
                 {categoryOrder.map((catKey) => {
                   const categoryChores = groupedChores[catKey];
                   if (!categoryChores || categoryChores.length === 0) return null;
                   
                   return (
                     <div key={catKey} className="mb-6">
                       <h3 className="text-lg font-bold text-violet-900 mb-3 px-2 flex items-center gap-2">
                         {catKey === 'kitchen' && <LucideIcons.Utensils className="text-rose-400" size={20} />}
                         {catKey === 'drinks' && <LucideIcons.Coffee className="text-cyan-500" size={20} />}
                         {catKey === 'home' && <LucideIcons.Home className="text-sky-400" size={20} />}
                         {catKey === 'clothing' && <LucideIcons.Shirt className="text-fuchsia-400" size={20} />}
                         {catKey === 'pets' && <LucideIcons.PawPrint className="text-orange-400" size={20} />}
                         {catKey === 'misc' && <LucideIcons.Box className="text-violet-400" size={20} />}
                         {categoryTitles[catKey]}
                       </h3>
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-1">
                         {categoryChores.map((chore) => {
                            const isSelected = selectedChoreIds.includes(chore.id);
                            return (
                              <button
                                key={chore.id}
                                onClick={() => toggleChoreSelection(chore.id)}
                                className={`flex flex-col items-center justify-center p-3 bg-white rounded-3xl border-2 transition-all duration-200 min-h-[9rem] relative overflow-hidden group
                                  ${isSelected ? 'scale-95 border-pink-500 bg-pink-50 z-20 ring-2 ring-pink-200 ring-offset-2' : 'border-indigo-50 hover:border-pink-200 hover:shadow-md hover:z-10 active:scale-95'}
                                  shadow-[0_4px_0_0_rgba(0,0,0,0.02)]
                                `}
                              >
                                 {isSelected && (
                                   <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-1 animate-in zoom-in duration-200">
                                     <LucideIcons.Check size={12} strokeWidth={4} />
                                   </div>
                                 )}
                                <div className={`mb-2 p-3 rounded-2xl transition-transform duration-200 ${isSelected ? 'scale-110 rotate-12' : 'group-hover:scale-110'} ${
                                  chore.category === 'home' ? 'bg-sky-100 text-sky-500' :
                                  chore.category === 'kitchen' ? 'bg-rose-100 text-rose-500' :
                                  chore.category === 'drinks' ? 'bg-cyan-100 text-cyan-600' :
                                  chore.category === 'clothing' ? 'bg-fuchsia-100 text-fuchsia-500' :
                                  chore.category === 'pets' ? 'bg-orange-100 text-orange-500' :
                                  'bg-violet-100 text-violet-500'
                                }`}>
                                  {renderIcon(chore.icon)}
                                </div>
                                <span className="text-xs sm:text-sm font-bold text-gray-700 text-center leading-snug px-1">{chore.name}</span>
                              </button>
                            )
                         })}
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}
           </div>

           {/* Modal Footer - Save Button */}
           {(activeMemberId && logModalMode === 'logging') && (
             <div className="bg-white/90 backdrop-blur border-t border-indigo-50 p-4 absolute bottom-0 left-0 right-0 z-20">
               <button
                 onClick={handleBatchSave}
                 disabled={selectedChoreIds.length === 0}
                 className={`w-full py-4 rounded-2xl font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2
                   ${selectedChoreIds.length === 0 
                     ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                     : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:shadow-lg active:scale-95'
                   }
                 `}
               >
                 <LucideIcons.Save size={20} />
                 Save {selectedChoreIds.length > 0 ? `(${selectedChoreIds.length})` : ''}
               </button>
             </div>
           )}
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-violet-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 z-[60] border-2 border-violet-700">
          <LucideIcons.PartyPopper size={20} className="text-yellow-300" />
          <span className="font-bold text-sm">{notification}</span>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="bg-white/90 backdrop-blur-lg border-t border-indigo-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-t-3xl">
        <div className="flex justify-around items-center pt-1">
          <NavButton target="stats" icon={LucideIcons.BarChart2} label="Stats" />
          <NavButton target="ai" icon={LucideIcons.Sparkles} label="Coach" />
        </div>
      </nav>
      
      {/* Safe Area Padding for Mobile */}
      <div className="h-6 bg-white w-full" /> 
    </div>
  );
};

export default App;
