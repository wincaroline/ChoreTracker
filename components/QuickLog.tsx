
import React, { useState } from 'react';
import { FamilyMember, ChoreType, CHORES } from '../types';
import * as LucideIcons from 'lucide-react';

interface QuickLogProps {
  members: FamilyMember[];
  activeMemberId: string | null;
  onMemberSelect: (id: string) => void;
  onLogChore: (memberId: string, choreId: string) => void;
}

const QuickLog: React.FC<QuickLogProps> = ({ members, activeMemberId, onMemberSelect, onLogChore }) => {
  const [clickedChoreId, setClickedChoreId] = useState<string | null>(null);

  const handleChoreClick = (choreId: string) => {
    if (!activeMemberId) return;
    
    setClickedChoreId(choreId);
    onLogChore(activeMemberId, choreId);
    
    // Reset feedback animation
    setTimeout(() => {
      setClickedChoreId(null);
    }, 400);
  };

  const renderIcon = (iconName: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.CheckCircle;
    return <Icon size={28} strokeWidth={2.5} />;
  };

  if (activeMemberId) {
    const member = members.find(m => m.id === activeMemberId);
    return (
      <div className="flex flex-col animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl text-violet-900">What did you do?</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 px-1">
          {CHORES.map((chore) => {
            const isClicked = clickedChoreId === chore.id;
            return (
              <button
                key={chore.id}
                onClick={() => handleChoreClick(chore.id)}
                className={`flex flex-col items-center justify-center p-3 bg-white rounded-3xl border-2 transition-all duration-200 min-h-[9rem] relative overflow-hidden group
                  ${isClicked ? 'scale-95 border-pink-400 bg-pink-50 z-20' : 'border-indigo-50 hover:border-pink-200 hover:shadow-md hover:z-10 active:scale-95'}
                  shadow-[0_4px_0_0_rgba(0,0,0,0.02)]
                `}
              >
                {isClicked && (
                   <div className="absolute inset-0 bg-pink-200 opacity-20 animate-ping rounded-3xl" />
                )}
                <div className={`mb-2 p-3 rounded-2xl transition-transform duration-200 group-hover:scale-110 ${isClicked ? 'scale-110 rotate-12' : ''} ${
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
  }

  return (
    <div className="flex flex-col animate-in fade-in duration-300">
      <h2 className="text-2xl font-bold text-violet-900 mb-6 px-2">Who is working?</h2>
      <div className="grid grid-cols-2 gap-4 px-1">
        {members.map((member) => (
          <button
            key={member.id}
            onClick={() => onMemberSelect(member.id)}
            className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-4 transition-all active:scale-95 shadow-sm hover:shadow-lg ${member.color} bg-opacity-40 border-opacity-30 hover:bg-opacity-80`}
          >
            <span className="text-7xl mb-4 filter drop-shadow-sm transform hover:rotate-6 transition-transform">{member.avatar}</span>
            <span className="text-xl font-bold tracking-wide">{member.name}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-8 p-6 bg-white rounded-3xl border-2 border-indigo-100 shadow-[4px_4px_0px_0px_rgba(224,231,255,1)]">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-yellow-100 rounded-2xl text-yellow-600 rotate-3">
             <LucideIcons.Sparkles size={24} fill="currentColor" className="text-yellow-400" />
          </div>
          <div>
            <h3 className="font-bold text-indigo-900 text-lg">Teamwork makes the dream work!</h3>
            <p className="text-indigo-600/80 mt-1 font-medium">
              Tap your face above to start logging chores!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickLog;
