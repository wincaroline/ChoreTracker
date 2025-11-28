
import { ChoreLog, FamilyMember, DEFAULT_MEMBERS } from '../types';

const LOGS_KEY = 'chore_harmony_logs_v6';
const MEMBERS_KEY = 'chore_harmony_members_v5';
const CURRENT_MEMBER_KEY = 'chore_harmony_current_member_v5';

export const getLogs = (): ChoreLog[] => {
  try {
    const stored = localStorage.getItem(LOGS_KEY);
    if (stored) {
      const parsedLogs = JSON.parse(stored);
      if (Array.isArray(parsedLogs)) {
        return parsedLogs;
      }
    }
    
    // Default to empty array if no logs exist
    return [];
  } catch (e) {
    console.error("Failed to parse logs", e);
    return [];
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

export const clearAllLogs = () => {
  localStorage.setItem(LOGS_KEY, JSON.stringify([]));
  return [];
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
