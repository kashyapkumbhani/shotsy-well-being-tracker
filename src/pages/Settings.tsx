
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useShotsy } from "@/contexts/ShotsyContext";
import { LogOut, Scale, Bell, Trash2, Download, User } from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { useMetricSystem, toggleMetricSystem, logout } = useShotsy();

  const handleExportData = () => {
    // Get all data from localStorage
    const shots = localStorage.getItem("shotsy_shots");
    const wellness = localStorage.getItem("shotsy_wellness");
    const reminders = localStorage.getItem("shotsy_reminders");

    // Combine into one object
    const exportData = {
      shots: shots ? JSON.parse(shots) : [],
      wellness: wellness ? JSON.parse(wellness) : [],
      reminders: reminders ? JSON.parse(reminders) : [],
      exportDate: new Date().toISOString(),
    };

    // Create a download link
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `shotsy-data-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Data exported",
      description: "Your data has been exported successfully.",
    });
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to delete all your data? This cannot be undone.")) {
      localStorage.removeItem("shotsy_shots");
      localStorage.removeItem("shotsy_wellness");
      localStorage.removeItem("shotsy_reminders");

      toast({
        title: "Data cleared",
        description: "All your data has been deleted.",
        variant: "destructive",
      });

      // Reload the page to reset the app state
      window.location.reload();
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/login");
  };

  const handleNotificationChange = () => {
    toast({
      title: "Notifications toggled",
      description: "Notification settings updated.",
    });
  };

  const userEmail = localStorage.getItem("shotsy_user_email") || "Guest User";
  const userName = localStorage.getItem("shotsy_user_name") || "Guest";

  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-shotsy-900">Settings</h1>
        <p className="text-shotsy-600">Customize your Shotsy experience</p>
      </header>

      <div className="space-y-4">
        {/* User Profile Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-shotsy-50 pb-2">
            <CardTitle className="text-shotsy-800">Account</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center mb-4">
              <div className="mr-4 bg-shotsy-100 rounded-full w-12 h-12 flex items-center justify-center">
                <User className="h-6 w-6 text-shotsy-600" />
              </div>
              <div>
                <h3 className="font-medium">{userName}</h3>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="w-full justify-start border-shotsy-200 text-shotsy-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card>
          <CardHeader className="bg-shotsy-50 pb-2">
            <CardTitle className="text-shotsy-800">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Scale className="h-5 w-5 text-shotsy-600 mr-2" />
                <div>
                  <p className="font-medium">Use metric system</p>
                  <p className="text-sm text-muted-foreground">Switch between kg/lbs</p>
                </div>
              </div>
              <Switch 
                checked={useMetricSystem} 
                onCheckedChange={toggleMetricSystem} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-shotsy-600 mr-2" />
                <div>
                  <p className="font-medium">Browser notifications</p>
                  <p className="text-sm text-muted-foreground">For shot reminders</p>
                </div>
              </div>
              <Switch onCheckedChange={handleNotificationChange} />
            </div>
          </CardContent>
        </Card>

        {/* Data Management Card */}
        <Card>
          <CardHeader className="bg-shotsy-50 pb-2">
            <CardTitle className="text-shotsy-800">Data</CardTitle>
            <CardDescription>Manage your health data</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            <Button 
              variant="outline" 
              onClick={handleExportData} 
              className="w-full justify-start border-shotsy-200"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClearData} 
              className="w-full justify-start text-red-500 border-red-100 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
