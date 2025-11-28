
import React, { useState, useEffect, useMemo } from 'react';
import { ChoreLog, FamilyMember, CHORES } from './types';
import { getLogs, saveLog, getMembers, getCurrentMemberId, saveCurrentMemberId, deleteLog, saveMembers, clearAllLogs } from './services/storageService';
import StatsView from './components/StatsView';
import * as LucideIcons from 'lucide-react';

const App: React.FC = () => {
  const [logs, setLogs] = useState<ChoreLog[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  
  // Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logModalMode, setLogModalMode] = useState<'selection' | 'logging'>('logging');
  const [selectedChoreIds, setSelectedChoreIds] = useState<string[]>([]);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Member Management State
  const [isManagingMembers, setIsManagingMembers] = useState(false);
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<FamilyMember>>({});

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

  const handleClearAllLogs = () => {
    setIsClearConfirmOpen(true);
  };

  const performClearAllLogs = () => {
    const updatedLogs = clearAllLogs();
    setLogs(updatedLogs);
    setNotification('All history cleared.');
    setTimeout(() => setNotification(null), 2000);
    setIsClearConfirmOpen(false);
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
    if (isManagingMembers) {
      // Enter Edit Mode for this member
      const memberToEdit = members.find(m => m.id === id);
      if (memberToEdit) {
        setEditingMember(memberToEdit);
        setIsMemberFormOpen(true);
      }
    } else {
      // Normal Selection
      handleMemberSelect(id);
      if (logModalMode === 'selection') {
        setIsLogModalOpen(false);
      }
    }
  };

  const handleHeaderChipClick = () => {
    setLogModalMode('selection');
    setIsManagingMembers(false); // Reset to selection mode
    setIsLogModalOpen(true);
  };
  
  const handleOpenLogModal = () => {
    setLogModalMode('logging');
    setIsLogModalOpen(true);
  };

  // Member Management Functions
  const handleAddNewMember = () => {
    setEditingMember({
      name: '',
      avatar: '😊',
      color: 'bg-violet-100 text-violet-700 border-violet-300'
    });
    setIsMemberFormOpen(true);
  };

  const handleSaveMember = () => {
    if (!editingMember.name || !editingMember.avatar || !editingMember.color) return;

    let updatedMembers = [...members];
    
    if (editingMember.id) {
      // Update existing
      updatedMembers = updatedMembers.map(m => 
        m.id === editingMember.id ? { ...m, ...editingMember } as FamilyMember : m
      );
    } else {
      // Add new
      const newMember: FamilyMember = {
        id: 'm-' + Date.now(),
        name: editingMember.name,
        avatar: editingMember.avatar,
        color: editingMember.color
      };
      updatedMembers.push(newMember);
    }

    setMembers(updatedMembers);
    saveMembers(updatedMembers);
    setIsMemberFormOpen(false);
    setEditingMember({});
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      const updatedMembers = members.filter(m => m.id !== id);
      setMembers(updatedMembers);
      saveMembers(updatedMembers);
      
      if (activeMemberId === id) {
        setActiveMemberId(null);
        saveCurrentMemberId(null);
      }
    }
  };

  const activeMember = members.find(m => m.id === activeMemberId);

  const renderIcon = (iconName: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.CheckCircle;
    return <Icon size={28} strokeWidth={2.5} />;
  };

  const COLOR_OPTIONS = [
    { label: 'Whale', class: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { label: 'Bear', class: 'bg-amber-100 text-amber-700 border-amber-300' },
    { label: 'Rose', class: 'bg-rose-100 text-rose-700 border-rose-300' },
    { label: 'Sky', class: 'bg-sky-100 text-sky-700 border-sky-300' },
    { label: 'Fuchsia', class: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300' },
    { label: 'Orange', class: 'bg-orange-100 text-orange-700 border-orange-300' },
    { label: 'Violet', class: 'bg-violet-100 text-violet-700 border-violet-300' },
    { label: 'Emerald', class: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  ];

  return (
    <div className="max-w-md mx-auto h-screen bg-cream flex flex-col relative overflow-hidden shadow-2xl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-sm z-10 min-h-[72px] border-b border-indigo-50">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-white p-2 rounded-xl shadow-md rotate-3 transform transition-transform hover:rotate-6">
            <LucideIcons.CheckSquare size={20} />
          </div>
          <h1 className="text-2xl font-bold text-violet-900 tracking-tight">ChoreLog</h1>
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
            <div className="bg-violet-100 p-1 rounded-full"><LucideIcons.User size={14} className="text-violet-500" /></div>
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 scroll-smooth no-scrollbar">
        <div className="animate-in slide-in-from-left-4 duration-300">
          <StatsView 
            logs={logs} 
            members={members} 
            onOpenLogModal={handleOpenLogModal}
            onDeleteLog={handleDeleteLog}
            onClearAllLogs={handleClearAllLogs}
          />
        </div>
      </main>

      {/* Log Chores / Member Select Modal Overlay */}
      {isLogModalOpen && (
        <div className="absolute inset-0 z-50 bg-cream flex flex-col animate-in slide-in-from-bottom-full duration-300">
           {/* Modal Header */}
           <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm border-b border-indigo-50">
             <div className="flex items-center gap-2">
                {isMemberFormOpen && (
                  <button onClick={() => setIsMemberFormOpen(false)} className="mr-2 text-gray-500 hover:text-gray-800">
                    <LucideIcons.ArrowLeft size={24} />
                  </button>
                )}
                <h2 className="text-2xl font-bold text-violet-900">
                  {isMemberFormOpen ? (editingMember.id ? 'Edit Member' : 'Add Member') :
                   logModalMode === 'selection' ? 'Select Member' : 'Log Chores'}
                </h2>
             </div>
             <button 
               onClick={() => {
                 setIsLogModalOpen(false);
                 setSelectedChoreIds([]);
                 setIsManagingMembers(false);
                 setIsMemberFormOpen(false);
               }}
               className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
             >
               <LucideIcons.X size={20} />
             </button>
           </div>

           {/* Modal Content */}
           <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
             
             {/* MEMBER SELECTION / MANAGEMENT */}
             {(!activeMemberId || logModalMode === 'selection') && !isMemberFormOpen && (
               <div className="animate-in fade-in duration-300 h-full flex flex-col">
                  <div className="flex justify-end mb-4 px-2">
                    <button 
                      onClick={() => setIsManagingMembers(!isManagingMembers)}
                      className={`text-sm font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                        isManagingMembers ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <LucideIcons.Settings2 size={16} />
                      {isManagingMembers ? 'Done' : 'Manage'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 px-1 pb-20">
                    {members.map((member) => (
                      <div key={member.id} className="relative group">
                        <button
                          onClick={() => handleModalMemberSelect(member.id)}
                          className={`w-full flex flex-col items-center justify-center p-6 rounded-[2rem] border-4 transition-all shadow-sm hover:shadow-lg ${member.color} bg-opacity-40 border-opacity-30 hover:bg-opacity-80
                            ${isManagingMembers ? 'animate-pulse' : 'active:scale-95'}
                          `}
                        >
                          <span className="text-7xl mb-4 filter drop-shadow-sm transform hover:rotate-6 transition-transform">{member.avatar}</span>
                          <span className="text-xl font-bold tracking-wide">{member.name}</span>
                          {isManagingMembers && (
                            <div className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full shadow-sm text-indigo-500">
                              <LucideIcons.Pencil size={16} />
                            </div>
                          )}
                        </button>
                        
                        {isManagingMembers && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleDeleteMember(member.id); }}
                             className="absolute -top-2 -left-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 active:scale-90 transition-transform z-10"
                           >
                             <LucideIcons.Trash2 size={16} />
                           </button>
                        )}
                      </div>
                    ))}
                    
                    {/* Add Member Button */}
                    {isManagingMembers && (
                      <button
                        onClick={handleAddNewMember}
                        className="flex flex-col items-center justify-center p-6 rounded-[2rem] border-4 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
                      >
                        <LucideIcons.Plus size={48} className="mb-2 opacity-50" />
                        <span className="font-bold">Add New</span>
                      </button>
                    )}
                  </div>
               </div>
             )}

             {/* MEMBER FORM */}
             {isMemberFormOpen && (
               <div className="animate-in fade-in duration-300 space-y-6 px-2">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                    <input 
                      type="text" 
                      value={editingMember.name || ''}
                      onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                      className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-violet-300 focus:ring-4 focus:ring-violet-100 outline-none font-bold text-lg text-violet-900 transition-all"
                      placeholder="e.g. Mom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Avatar (Emoji)</label>
                    <input 
                      type="text" 
                      value={editingMember.avatar || ''}
                      onChange={(e) => setEditingMember({...editingMember, avatar: e.target.value})}
                      className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-violet-300 focus:ring-4 focus:ring-violet-100 outline-none font-bold text-4xl text-center transition-all"
                      placeholder="😊"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Color Theme</label>
                    <div className="grid grid-cols-4 gap-3">
                      {COLOR_OPTIONS.map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => setEditingMember({...editingMember, color: opt.class})}
                          className={`h-16 rounded-xl border-4 transition-all active:scale-95 ${opt.class} ${editingMember.color === opt.class ? 'ring-2 ring-offset-2 ring-gray-400 shadow-lg scale-105' : 'opacity-60 hover:opacity-100'}`}
                        />
                      ))}
                    </div>
                  </div>
               </div>
             )}

             {/* CHORE LOGGING GRID */}
             {(activeMemberId && logModalMode === 'logging' && !isMemberFormOpen) && (
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

           {/* Modal Footer */}
           {isMemberFormOpen ? (
             <div className="bg-white/90 backdrop-blur border-t border-indigo-50 p-4 absolute bottom-0 left-0 right-0 z-20">
               <button
                 onClick={handleSaveMember}
                 className="w-full bg-violet-600 text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:bg-violet-700 active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 <LucideIcons.Save size={20} />
                 Save Member
               </button>
             </div>
           ) : (activeMemberId && logModalMode === 'logging') && (
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

      {/* Clear All Confirmation Modal */}
      {isClearConfirmOpen && (
        <div className="absolute inset-0 z-[70] bg-black/20 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm border-2 border-indigo-50 transform transition-all scale-100">
             <div className="flex flex-col items-center text-center">
               <div className="bg-red-100 p-4 rounded-full text-red-500 mb-4">
                 <LucideIcons.AlertTriangle size={32} />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">Clear All Activity?</h3>
               <p className="text-slate-500 font-medium mb-6">
                 Are you sure you want to clear all logs?
               </p>
               <div className="grid grid-cols-2 gap-3 w-full">
                 <button 
                   onClick={() => setIsClearConfirmOpen(false)}
                   className="py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={performClearAllLogs}
                   className="py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-200 transition-colors"
                 >
                   Yes, Clear All
                 </button>
               </div>
             </div>
           </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-violet-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 z-[60] border-2 border-violet-700">
          <LucideIcons.PartyPopper size={20} className="text-yellow-300" />
          <span className="font-bold text-sm">{notification}</span>
        </div>
      )}
      
      {/* Safe Area Padding for Mobile */}
      <div className="h-6 bg-white w-full" /> 
    </div>
  );
};

export default App;
