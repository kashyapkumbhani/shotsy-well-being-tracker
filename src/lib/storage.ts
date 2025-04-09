
import { ShotData, WellnessData, UserSettings } from "@/types";

// Storage keys
export const storageKeys = {
  SHOTS: "shotsy_shots",
  WELLNESS: "shotsy_wellness",
  SETTINGS: "shotsy_settings",
  REMINDERS: "shotsy_reminders",
  USE_METRIC: "shotsy_use_metric"
};

const SHOTS_KEY = "shotsy_shots";
const WELLNESS_KEY = "shotsy_wellness";
const SETTINGS_KEY = "shotsy_settings";

// Default settings
const defaultSettings: UserSettings = {
  medicationName: "Ozempic",
  defaultDose: 1.0,
  defaultLocation: "Stomach",
  reminderSettings: {
    enabled: true,
    time: "09:00",
    daysBefore: 1,
    message: "Time to prepare for your GLP-1 shot tomorrow"
  },
  useMetricSystem: false,
  customMetrics: []
};

// Get shots from localStorage
export const getShots = (): ShotData[] => {
  const shotsJson = localStorage.getItem(SHOTS_KEY);
  return shotsJson ? JSON.parse(shotsJson) : [];
};

// Save shots to localStorage
export const saveShots = (shots: ShotData[]): void => {
  localStorage.setItem(SHOTS_KEY, JSON.stringify(shots));
};

// Add a new shot
export const addShot = (shot: ShotData): void => {
  const shots = getShots();
  shots.push(shot);
  saveShots(shots);
};

// Update a shot
export const updateShot = (updatedShot: ShotData): void => {
  const shots = getShots();
  const index = shots.findIndex(shot => shot.id === updatedShot.id);
  if (index !== -1) {
    shots[index] = updatedShot;
    saveShots(shots);
  }
};

// Delete a shot
export const deleteShot = (id: string): void => {
  const shots = getShots();
  const filteredShots = shots.filter(shot => shot.id !== id);
  saveShots(filteredShots);
};

// Get wellness data from localStorage
export const getWellnessData = (): WellnessData[] => {
  const wellnessJson = localStorage.getItem(WELLNESS_KEY);
  return wellnessJson ? JSON.parse(wellnessJson) : [];
};

// Save wellness data to localStorage
export const saveWellnessData = (wellnessData: WellnessData[]): void => {
  localStorage.setItem(WELLNESS_KEY, JSON.stringify(wellnessData));
};

// Add new wellness data
export const addWellnessData = (wellnessData: WellnessData): void => {
  const allWellnessData = getWellnessData();
  allWellnessData.push(wellnessData);
  saveWellnessData(allWellnessData);
};

// Get user settings from localStorage
export const getUserSettings = (): UserSettings => {
  const settingsJson = localStorage.getItem(SETTINGS_KEY);
  return settingsJson ? JSON.parse(settingsJson) : defaultSettings;
};

// Save user settings to localStorage
export const saveUserSettings = (settings: UserSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// Calculate next shot date based on the last shot
export const calculateNextShotDate = (): string => {
  const shots = getShots();
  
  if (shots.length === 0) {
    // If no shots, return tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString();
  }
  
  // Sort shots by date (newest first)
  shots.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Get the most recent shot date
  const lastShotDate = new Date(shots[0].date);
  
  // Add 7 days for next shot
  const nextShotDate = new Date(lastShotDate);
  nextShotDate.setDate(lastShotDate.getDate() + 7);
  
  return nextShotDate.toISOString();
};

// Check if user has a streak going
export const calculateStreak = (): number => {
  const shots = getShots();
  if (shots.length === 0) return 0;
  
  // Sort shots by date (oldest first)
  shots.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let streak = 1;
  let expectedDate = new Date(shots[0].date);
  
  for (let i = 1; i < shots.length; i++) {
    expectedDate.setDate(expectedDate.getDate() + 7);
    const shotDate = new Date(shots[i].date);
    
    // Allow a 2-day buffer (early or late)
    const timeDiff = Math.abs(shotDate.getTime() - expectedDate.getTime());
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff <= 2) {
      streak++;
      // Reset expected date to actual date to prevent drift
      expectedDate = new Date(shots[i].date);
    } else {
      // Streak broken, start a new one
      streak = 1;
      expectedDate = new Date(shots[i].date);
    }
  }
  
  return streak;
};

// Request browser notifications permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return false;
  }
  
  if (Notification.permission === "granted") {
    return true;
  }
  
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  
  return false;
};

// Schedule a notification
export const scheduleNotification = (
  title: string, 
  body: string, 
  scheduleTime: Date
): void => {
  const now = new Date();
  const timeUntilNotification = scheduleTime.getTime() - now.getTime();
  
  if (timeUntilNotification > 0) {
    setTimeout(() => {
      new Notification(title, { body });
    }, timeUntilNotification);
  }
};
