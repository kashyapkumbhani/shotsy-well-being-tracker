
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useShotsy } from "@/contexts/ShotsyContext";
import { AlertCircle, Info, Save, Plus, Trash2, Download, Share2, Github } from "lucide-react";
import { requestNotificationPermission } from "@/lib/storage";

const Settings: React.FC = () => {
  const { settings, updateSettings, shots, wellnessData } = useShotsy();
  const { toast } = useToast();
  
  const [medicationName, setMedicationName] = useState(settings.medicationName);
  const [defaultDose, setDefaultDose] = useState(settings.defaultDose.toString());
  const [defaultLocation, setDefaultLocation] = useState(settings.defaultLocation || "");
  const [useMetric, setUseMetric] = useState(settings.useMetricSystem);
  const [reminderEnabled, setReminderEnabled] = useState(settings.reminderSettings.enabled);
  const [reminderTime, setReminderTime] = useState(settings.reminderSettings.time);
  const [reminderDays, setReminderDays] = useState(settings.reminderSettings.daysBefore.toString());
  const [reminderMessage, setReminderMessage] = useState(settings.reminderSettings.message);
  const [customMetrics, setCustomMetrics] = useState<string[]>(settings.customMetrics);
  const [newMetricName, setNewMetricName] = useState("");
  
  const handleSave = () => {
    updateSettings({
      medicationName,
      defaultDose: parseFloat(defaultDose),
      defaultLocation,
      useMetricSystem: useMetric,
      reminderSettings: {
        enabled: reminderEnabled,
        time: reminderTime,
        daysBefore: parseInt(reminderDays),
        message: reminderMessage,
      },
      customMetrics,
    });
    
    toast({
      title: "Settings saved successfully",
      description: "Your preferences have been updated.",
    });
  };
  
  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    
    if (granted) {
      toast({
        title: "Notifications enabled",
        description: "You will now receive reminders for your shots.",
      });
    } else {
      toast({
        title: "Notifications blocked",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive",
      });
    }
  };
  
  const handleAddCustomMetric = () => {
    if (!newMetricName.trim()) {
      toast({
        title: "Cannot add empty metric",
        description: "Please enter a name for your custom metric.",
        variant: "destructive",
      });
      return;
    }
    
    if (customMetrics.includes(newMetricName.trim())) {
      toast({
        title: "Duplicate metric",
        description: "This metric name already exists.",
        variant: "destructive",
      });
      return;
    }
    
    setCustomMetrics([...customMetrics, newMetricName.trim()]);
    setNewMetricName("");
  };
  
  const handleRemoveCustomMetric = (metric: string) => {
    setCustomMetrics(customMetrics.filter(m => m !== metric));
  };
  
  const exportAppData = () => {
    const data = {
      shots,
      wellnessData,
      settings,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "shotsy_backup.json");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Data exported successfully",
      description: "Your Shotsy data has been downloaded as a JSON file.",
    });
  };
  
  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-shotsy-900">Settings</h1>
        <p className="text-gray-500">Customize your tracking preferences</p>
      </header>
      
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-3">Medication Defaults</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medicationName">Default Medication Name</Label>
                <Input
                  id="medicationName"
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  placeholder="e.g., Ozempic, Wegovy, Mounjaro"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultDose">Default Dose (mg)</Label>
                <Input
                  id="defaultDose"
                  type="number"
                  step="0.1"
                  min="0"
                  value={defaultDose}
                  onChange={(e) => setDefaultDose(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultLocation">Default Injection Site</Label>
                <Input
                  id="defaultLocation"
                  value={defaultLocation}
                  onChange={(e) => setDefaultLocation(e.target.value)}
                  placeholder="e.g., Stomach, Thigh"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-3">Reminders</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableReminders">Enable Shot Reminders</Label>
                  <p className="text-sm text-gray-500">
                    Receive browser notifications for upcoming shots
                  </p>
                </div>
                <Switch
                  id="enableReminders"
                  checked={reminderEnabled}
                  onCheckedChange={setReminderEnabled}
                />
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRequestNotifications}
                  className="w-full"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Request Notification Permission
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  Browser notifications must be enabled for reminders to work
                </p>
              </div>
              
              {reminderEnabled && (
                <div className="space-y-4 pt-3">
                  <div className="space-y-2">
                    <Label htmlFor="reminderTime">Reminder Time</Label>
                    <Input
                      id="reminderTime"
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reminderDays">Days Before Shot</Label>
                    <Input
                      id="reminderDays"
                      type="number"
                      min="0"
                      max="7"
                      value={reminderDays}
                      onChange={(e) => setReminderDays(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      How many days before your shot to send a reminder
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reminderMessage">Reminder Message</Label>
                    <Input
                      id="reminderMessage"
                      value={reminderMessage}
                      onChange={(e) => setReminderMessage(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-3">Custom Tracking</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="useMetric">Use Metric System</Label>
                  <p className="text-sm text-gray-500">
                    Switch between pounds and kilograms
                  </p>
                </div>
                <Switch
                  id="useMetric"
                  checked={useMetric}
                  onCheckedChange={setUseMetric}
                />
              </div>
              
              <div className="pt-3 space-y-3">
                <Label>Custom Metrics</Label>
                <p className="text-sm text-gray-500">
                  Add custom metrics to track with your wellness data
                </p>
                
                <div className="flex gap-2">
                  <Input
                    value={newMetricName}
                    onChange={(e) => setNewMetricName(e.target.value)}
                    placeholder="e.g., Steps, Blood Pressure"
                    className="flex-grow"
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomMetric}
                    className="bg-shotsy-500 hover:bg-shotsy-600"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {customMetrics.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    {customMetrics.map((metric, index) => (
                      <div 
                        key={index} 
                        className="flex justify-between items-center bg-shotsy-50 p-2 rounded"
                      >
                        <span>{metric}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCustomMetric(metric)}
                          className="h-8 w-8 p-0 text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No custom metrics added yet
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-3">Data Management</h2>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={exportAppData}
              >
                <Download className="mr-2 h-4 w-4" />
                Export All Data
              </Button>
              
              <p className="text-xs text-gray-500">
                <Info className="inline h-3 w-3 mr-1" />
                All your data is stored locally on your device. Backup regularly to avoid data loss.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} className="bg-shotsy-500 hover:bg-shotsy-600">
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
        
        <div className="text-center text-xs text-gray-500 pt-6">
          <p>Shotsy • A Personal GLP-1 Shot Tracker</p>
          <p className="mt-1">
            Your data stays on your device. We respect your privacy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;

const Bell = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);
