
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
  { id: 'c10', name: 'Plan Meals', icon: 'ClipboardList', category: 'kitchen' },
  { id: 'c11', name: 'Order Food', icon: 'Smartphone', category: 'kitchen' },
  { id: 'c12', name: 'Pick Up Food', icon: 'Car', category: 'kitchen' },
  { id: 'c13', name: 'Put Away Groceries', icon: 'Package', category: 'kitchen' },
  { id: 'c14', name: 'Prep Food', icon: 'UtensilsCrossed', category: 'kitchen' },
  { id: 'c15', name: 'Cook Food', icon: 'ChefHat', category: 'kitchen' },
  { id: 'c16', name: 'Wash Dishes', icon: 'Droplets', category: 'kitchen' },
  { id: 'c17', name: 'Put Away Dishes', icon: 'ArrowDownToLine', category: 'kitchen' },

  // Drinks
  { id: 'c23', name: 'Make Coffee', icon: 'Coffee', category: 'drinks' },
  { id: 'c24', name: 'Make Water', icon: 'GlassWater', category: 'drinks' },
  { id: 'c25', name: 'Make Sparkling Water', icon: 'Zap', category: 'drinks' },

  // Home (formerly Cleaning)
  { id: 'c3', name: 'Trash', icon: 'Trash2', category: 'home' },
  { id: 'c4', name: 'Vacuum', icon: 'Wind', category: 'home' },
  { id: 'c8', name: 'Tidy Up', icon: 'Sparkles', category: 'home' },
  { id: 'c22', name: 'Steam Carpet', icon: 'CloudFog', category: 'home' },
  { id: 'c26', name: 'Get Mail', icon: 'Mail', category: 'home' },

  // Clothing
  { id: 'c18', name: 'Wash Clothes', icon: 'Waves', category: 'clothing' },
  { id: 'c19', name: 'Dry Clothes', icon: 'Sun', category: 'clothing' },
  { id: 'c20', name: 'Fold Clothes', icon: 'Layers', category: 'clothing' },
  { id: 'c21', name: 'Organize Clothes', icon: 'LayoutGrid', category: 'clothing' },

  // Pets
  { id: 'c27', name: 'Take Dog Out', icon: 'Footprints', category: 'pets' },
  { id: 'c28', name: 'Feed Dog', icon: 'Bone', category: 'pets' },
  { id: 'c29', name: 'Give Meds to Dog', icon: 'Pill', category: 'pets' },
  { id: 'c30', name: 'Take Dog to Daycare', icon: 'Car', category: 'pets' },
];
