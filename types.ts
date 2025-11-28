
export interface FamilyMember {
  id: string;
  name: string;
  avatar: string; // Emoji or generic avatar id
  color: string;
}

export interface ChoreType {
  id: string;
  name: string;
  icon: string; // Lucide icon name mapped
  category: 'home' | 'kitchen' | 'clothing' | 'drinks' | 'pets' | 'misc';
  pastTense: string;
}

export interface ChoreLog {
  id: string;
  memberId: string;
  choreId: string;
  timestamp: number; // Date.now()
  dateString: string; // ISO date string YYYY-MM-DD
}

export type ViewState = 'stats' | 'settings' | 'ai';

export const DEFAULT_MEMBERS: FamilyMember[] = [
  { id: 'm1', name: 'J', avatar: '🐳', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  { id: 'm2', name: 'C', avatar: '🐻', color: 'bg-amber-100 text-amber-700 border-amber-300' },
];

export const CHORES: ChoreType[] = [
  // Kitchen
  { id: 'c10', name: 'Plan Meals', icon: 'ClipboardList', category: 'kitchen', pastTense: 'planned meals' },
  { id: 'c11', name: 'Order Food', icon: 'Smartphone', category: 'kitchen', pastTense: 'ordered food' },
  { id: 'c12', name: 'Pick Up Food', icon: 'Car', category: 'kitchen', pastTense: 'picked up food' },
  { id: 'c13', name: 'Put Away Groceries', icon: 'Package', category: 'kitchen', pastTense: 'put away groceries' },
  { id: 'c14', name: 'Prep Food', icon: 'UtensilsCrossed', category: 'kitchen', pastTense: 'prepped food' },
  { id: 'c15', name: 'Cook Food', icon: 'ChefHat', category: 'kitchen', pastTense: 'cooked food' },
  { id: 'c16', name: 'Wash Dishes', icon: 'Droplets', category: 'kitchen', pastTense: 'washed dishes' },
  { id: 'c17', name: 'Put Away Dishes', icon: 'ArrowDownToLine', category: 'kitchen', pastTense: 'put away dishes' },

  // Drinks
  { id: 'c23', name: 'Make Coffee', icon: 'Coffee', category: 'drinks', pastTense: 'made coffee' },
  { id: 'c24', name: 'Make Water', icon: 'GlassWater', category: 'drinks', pastTense: 'made water' },
  { id: 'c25', name: 'Make Sparkling Water', icon: 'Zap', category: 'drinks', pastTense: 'made sparkling water' },

  // Home (formerly Cleaning)
  { id: 'c3', name: 'Trash', icon: 'Trash2', category: 'home', pastTense: 'took out the trash' },
  { id: 'c4', name: 'Vacuum', icon: 'Wind', category: 'home', pastTense: 'vacuumed' },
  { id: 'c8', name: 'Tidy Up', icon: 'Sparkles', category: 'home', pastTense: 'tidied up' },
  { id: 'c22', name: 'Steam Carpet', icon: 'CloudFog', category: 'home', pastTense: 'steamed the carpet' },
  { id: 'c26', name: 'Get Mail', icon: 'Mail', category: 'home', pastTense: 'got the mail' },

  // Clothing
  { id: 'c18', name: 'Wash Clothes', icon: 'Waves', category: 'clothing', pastTense: 'washed clothes' },
  { id: 'c19', name: 'Dry Clothes', icon: 'Sun', category: 'clothing', pastTense: 'dried clothes' },
  { id: 'c20', name: 'Fold Clothes', icon: 'Layers', category: 'clothing', pastTense: 'folded clothes' },
  { id: 'c21', name: 'Organize Clothes', icon: 'LayoutGrid', category: 'clothing', pastTense: 'organized clothes' },

  // Pets
  { id: 'c27', name: 'Take Dog Out', icon: 'Footprints', category: 'pets', pastTense: 'took the dog out' },
  { id: 'c28', name: 'Feed Dog', icon: 'Bone', category: 'pets', pastTense: 'fed the dog' },
  { id: 'c29', name: 'Give Meds to Dog', icon: 'Pill', category: 'pets', pastTense: 'gave meds to the dog' },
  { id: 'c30', name: 'Take Dog to Daycare', icon: 'Car', category: 'pets', pastTense: 'took the dog to daycare' },
];
