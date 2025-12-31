
export enum Tab {
  HOME = 'HOME',
  MEALS = 'MEALS',
  BODY = 'BODY',
  PHARMACY = 'PHARMACY',
  FINANCE = 'FINANCE',
  HISTORY = 'HISTORY'
}

export interface NavItem {
  id: Tab;
  label: string;
  icon: string;
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  type: 'HRT' | 'Supplement' | 'Pain' | 'Other';
  frequency: 'Daily' | 'Every Other Day' | 'As Needed';
  timeOfDay: 'Morning' | 'Midday' | 'Night';
  instructions?: string;
  warningLabel?: string;
  surgerySafe: boolean; // Managed by AI
  lastTakenDate?: string; // ISO Date string
}

export interface SkincareItem {
  id: string;
  name: string; // Product Name
  brand: string;
  activeIngredient?: string; // e.g. Retinol, Vitamin C
  note?: string; // e.g. "Wait 20 mins"
  timeOfDay: 'Morning' | 'Midday' | 'Night';
  lastUsedDate?: string;
  frequency: 'Daily' | 'Every Other Day' | 'Specific Days';
  specificDays?: string[]; // e.g. ["Mon", "Wed", "Fri"]
}

export interface BodyMetrics {
    height: string;
    waist: string;
    bust: string;
    hips: string;
    shoeSize: string;
}

export interface NutritionalGoals {
    calories: number;
    protein: number;
}
