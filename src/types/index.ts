
export interface ShotData {
  id: string;
  date: string;
  medication: string;
  dose: number;
  location?: string;
  notes?: string;
  sideEffects?: string[];
  shotNumber?: number;
  taken?: boolean;
}

export interface WellnessData {
  id: string;
  date: string;
  weight?: number;
  protein?: number;
  water?: number;
  calories?: number;
  notes?: string;
  customMetrics?: {
    [key: string]: number | string;
  };
}

export interface ReminderSettings {
  enabled: boolean;
  time: string;
  daysBefore: number;
  message: string;
}

export interface UserSettings {
  medicationName: string;
  defaultDose: number;
  defaultLocation?: string;
  reminderSettings: ReminderSettings;
  useMetricSystem: boolean;
  customMetrics: string[];
}

export interface Reminder {
  id: string;
  date: string;
  message: string;
  read: boolean;
  type: 'shot' | 'wellness' | 'custom';
}
