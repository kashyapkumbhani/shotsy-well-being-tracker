
import React, { createContext, useContext, useEffect, useState } from "react";
import { ShotData, WellnessData, UserSettings } from "@/types";
import {
  getShots,
  getWellnessData,
  getUserSettings,
  saveShots,
  saveWellnessData,
  saveUserSettings,
  calculateNextShotDate,
  calculateStreak,
  requestNotificationPermission,
  scheduleNotification,
} from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ShotsyContextType {
  shots: ShotData[];
  wellnessData: WellnessData[];
  settings: UserSettings;
  streak: number;
  nextShotDate: string;
  notificationsPermission: boolean;
  addShot: (shot: Partial<ShotData>) => void;
  updateShot: (shot: ShotData) => void;
  deleteShot: (id: string) => void;
  addWellnessData: (data: Partial<WellnessData>) => void;
  updateWellnessData: (data: WellnessData) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  refreshData: () => void;
}

const ShotsyContext = createContext<ShotsyContextType | undefined>(undefined);

export const ShotsyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shots, setShots] = useState<ShotData[]>([]);
  const [wellnessData, setWellnessData] = useState<WellnessData[]>([]);
  const [settings, setSettings] = useState<UserSettings>(getUserSettings());
  const [streak, setStreak] = useState<number>(0);
  const [nextShotDate, setNextShotDate] = useState<string>(calculateNextShotDate());
  const [notificationsPermission, setNotificationsPermission] = useState<boolean>(false);
  const { toast } = useToast();

  // Load data from localStorage on component mount
  useEffect(() => {
    refreshData();
    checkNotificationPermission();
  }, []);

  const refreshData = () => {
    setShots(getShots());
    setWellnessData(getWellnessData());
    setSettings(getUserSettings());
    setStreak(calculateStreak());
    setNextShotDate(calculateNextShotDate());
  };

  const checkNotificationPermission = async () => {
    const hasPermission = await requestNotificationPermission();
    setNotificationsPermission(hasPermission);
  };

  const addShot = (shotData: Partial<ShotData>) => {
    const newShot: ShotData = {
      id: generateId(),
      date: new Date().toISOString(),
      medication: settings.medicationName,
      dose: settings.defaultDose,
      location: settings.defaultLocation,
      notes: "",
      sideEffects: [],
      shotNumber: shots.length + 1,
      taken: true,
      ...shotData,
    };

    const updatedShots = [...shots, newShot];
    saveShots(updatedShots);
    setShots(updatedShots);
    setStreak(calculateStreak());
    setNextShotDate(calculateNextShotDate());
    
    toast({
      title: "Shot logged successfully!",
      description: "Your GLP-1 shot has been recorded.",
    });
  };

  const updateShot = (updatedShot: ShotData) => {
    const updatedShots = shots.map((shot) =>
      shot.id === updatedShot.id ? updatedShot : shot
    );
    saveShots(updatedShots);
    setShots(updatedShots);
    setStreak(calculateStreak());
    
    toast({
      title: "Shot updated",
      description: "Your shot information has been updated.",
    });
  };

  const deleteShot = (id: string) => {
    const updatedShots = shots.filter((shot) => shot.id !== id);
    saveShots(updatedShots);
    setShots(updatedShots);
    setStreak(calculateStreak());
    setNextShotDate(calculateNextShotDate());
    
    toast({
      title: "Shot deleted",
      description: "The shot record has been removed.",
    });
  };

  const addWellnessData = (data: Partial<WellnessData>) => {
    const newData: WellnessData = {
      id: generateId(),
      date: new Date().toISOString(),
      ...data,
    };

    const updatedWellnessData = [...wellnessData, newData];
    saveWellnessData(updatedWellnessData);
    setWellnessData(updatedWellnessData);
    
    toast({
      title: "Wellness data saved",
      description: "Your health data has been recorded.",
    });
  };

  const updateWellnessData = (updatedData: WellnessData) => {
    const updated = wellnessData.map((data) =>
      data.id === updatedData.id ? updatedData : data
    );
    saveWellnessData(updated);
    setWellnessData(updated);
    
    toast({
      title: "Wellness data updated",
      description: "Your health information has been updated.",
    });
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    saveUserSettings(updated);
    setSettings(updated);
    
    toast({
      title: "Settings updated",
      description: "Your preferences have been saved.",
    });
  };

  // Schedule notifications for upcoming shots if enabled
  useEffect(() => {
    if (settings.reminderSettings.enabled && notificationsPermission) {
      const nextDate = new Date(nextShotDate);
      const reminderDate = new Date(nextDate);
      reminderDate.setDate(reminderDate.getDate() - settings.reminderSettings.daysBefore);
      
      // Set the time from settings
      const [hours, minutes] = settings.reminderSettings.time.split(':').map(Number);
      reminderDate.setHours(hours, minutes, 0, 0);
      
      scheduleNotification(
        "Shotsy Reminder",
        settings.reminderSettings.message,
        reminderDate
      );
    }
  }, [nextShotDate, settings.reminderSettings, notificationsPermission]);

  return (
    <ShotsyContext.Provider
      value={{
        shots,
        wellnessData,
        settings,
        streak,
        nextShotDate,
        notificationsPermission,
        addShot,
        updateShot,
        deleteShot,
        addWellnessData,
        updateWellnessData,
        updateSettings,
        refreshData,
      }}
    >
      {children}
    </ShotsyContext.Provider>
  );
};

export const useShotsy = (): ShotsyContextType => {
  const context = useContext(ShotsyContext);
  if (context === undefined) {
    throw new Error("useShotsy must be used within a ShotsyProvider");
  }
  return context;
};
