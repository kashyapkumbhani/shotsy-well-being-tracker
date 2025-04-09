import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ShotData, WellnessData, Reminder } from "@/types";
import { storageKeys } from "@/lib/storage";

interface ShotsyContextType {
  shots: ShotData[];
  addShot: (shot: Omit<ShotData, "id">) => void;
  updateShot: (id: string, shot: Partial<ShotData>) => void;
  deleteShot: (id: string) => void;
  wellnessData: WellnessData[];
  addWellnessData: (data: Omit<WellnessData, "id">) => void;
  updateWellnessData: (id: string, data: Partial<WellnessData>) => void;
  deleteWellnessData: (id: string) => void;
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, "id">) => void;
  updateReminder: (id: string, reminder: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  useMetricSystem: boolean;
  toggleMetricSystem: () => void;
  isLoggedIn: boolean;
  setLoggedIn: (status: boolean) => void;
  logout: () => void;
}

const ShotsyContext = createContext<ShotsyContextType | undefined>(undefined);

export const ShotsyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for tracking shots
  const [shots, setShots] = useState<ShotData[]>([]);
  
  // State for tracking wellness data
  const [wellnessData, setWellnessData] = useState<WellnessData[]>([]);
  
  // State for tracking reminders
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  // State for measurement system preference
  const [useMetricSystem, setUseMetricSystem] = useState(false);
  
  // State for login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Load data from localStorage on initial mount
  useEffect(() => {
    const savedShots = localStorage.getItem(storageKeys.SHOTS);
    if (savedShots) {
      setShots(JSON.parse(savedShots));
    }

    const savedWellnessData = localStorage.getItem(storageKeys.WELLNESS);
    if (savedWellnessData) {
      setWellnessData(JSON.parse(savedWellnessData));
    }

    const savedReminders = localStorage.getItem(storageKeys.REMINDERS);
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }

    const savedMetricPreference = localStorage.getItem(storageKeys.USE_METRIC);
    if (savedMetricPreference) {
      setUseMetricSystem(JSON.parse(savedMetricPreference));
    }

    // Check login status
    const loggedIn = localStorage.getItem("shotsy_logged_in") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  // Save shots to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(storageKeys.SHOTS, JSON.stringify(shots));
  }, [shots]);

  // Save wellness data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(storageKeys.WELLNESS, JSON.stringify(wellnessData));
  }, [wellnessData]);

  // Save reminders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(storageKeys.REMINDERS, JSON.stringify(reminders));
  }, [reminders]);

  // Save metric preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(storageKeys.USE_METRIC, JSON.stringify(useMetricSystem));
  }, [useMetricSystem]);

  // Add a new shot
  const addShot = (shot: Omit<ShotData, "id">) => {
    const newShot = { ...shot, id: Date.now().toString() };
    setShots([...shots, newShot]);
  };

  // Update an existing shot
  const updateShot = (id: string, updatedShot: Partial<ShotData>) => {
    setShots(shots.map(shot => shot.id === id ? { ...shot, ...updatedShot } : shot));
  };

  // Delete a shot
  const deleteShot = (id: string) => {
    setShots(shots.filter(shot => shot.id !== id));
  };

  // Add wellness data
  const addWellnessData = (data: Omit<WellnessData, "id">) => {
    const newData = { ...data, id: Date.now().toString() };
    setWellnessData([...wellnessData, newData]);
  };

  // Update wellness data
  const updateWellnessData = (id: string, updatedData: Partial<WellnessData>) => {
    setWellnessData(wellnessData.map(item => item.id === id ? { ...item, ...updatedData } : item));
  };

  // Delete wellness data
  const deleteWellnessData = (id: string) => {
    setWellnessData(wellnessData.filter(item => item.id !== id));
  };

  // Add a reminder
  const addReminder = (reminder: Omit<Reminder, "id">) => {
    const newReminder = { ...reminder, id: Date.now().toString() };
    setReminders([...reminders, newReminder]);
  };

  // Update a reminder
  const updateReminder = (id: string, updatedReminder: Partial<Reminder>) => {
    setReminders(reminders.map(reminder => reminder.id === id ? { ...reminder, ...updatedReminder } : reminder));
  };

  // Delete a reminder
  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  // Toggle between metric and imperial
  const toggleMetricSystem = () => {
    setUseMetricSystem(!useMetricSystem);
  };

  // Set login status
  const setLoggedIn = (status: boolean) => {
    setIsLoggedIn(status);
    localStorage.setItem("shotsy_logged_in", status.toString());
  };

  // Logout function
  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("shotsy_logged_in");
    localStorage.removeItem("shotsy_user_email");
    localStorage.removeItem("shotsy_user_name");
  };

  return (
    <ShotsyContext.Provider value={{
      shots,
      addShot,
      updateShot,
      deleteShot,
      wellnessData,
      addWellnessData,
      updateWellnessData,
      deleteWellnessData,
      reminders,
      addReminder,
      updateReminder,
      deleteReminder,
      useMetricSystem,
      toggleMetricSystem,
      isLoggedIn,
      setLoggedIn,
      logout
    }}>
      {children}
    </ShotsyContext.Provider>
  );
};

export const useShotsy = () => {
  const context = useContext(ShotsyContext);
  if (context === undefined) {
    throw new Error("useShotsy must be used within a ShotsyProvider");
  }
  return context;
};
