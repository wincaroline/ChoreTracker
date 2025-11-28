import { ChoreLog, FamilyMember, DEFAULT_MEMBERS } from '../types';
import { db } from '../firebaseConfig';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';

const MEMBERS_KEY = 'chore_harmony_members_v5';
const CURRENT_MEMBER_KEY = 'chore_harmony_current_member_v5';

// --- LOGS (FIREBASE) ---

export const subscribeToLogs = (callback: (logs: ChoreLog[]) => void) => {
  const q = query(collection(db, "logs"), orderBy("timestamp", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChoreLog));
    callback(logs);
  });
};

export const saveLog = async (log: ChoreLog) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...logData } = log; 
  await addDoc(collection(db, "logs"), logData);
};

export const deleteLog = async (logId: string) => {
  await deleteDoc(doc(db, "logs", logId));
};

export const clearAllLogs = async () => {
  const q = query(collection(db, "logs"));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
};


// --- MEMBERS (LOCAL STORAGE) ---

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
