
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useShotsy } from "@/contexts/ShotsyContext";
import { cn } from "@/lib/utils";

interface WellnessFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const WellnessForm: React.FC<WellnessFormProps> = ({ isOpen, onClose }) => {
  const { addWellnessData, settings } = useShotsy();
  const [date, setDate] = useState<Date>(new Date());
  const [weight, setWeight] = useState<string>("");
  const [protein, setProtein] = useState<string>("");
  const [water, setWater] = useState<string>("");
  const [calories, setCalories] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [customMetrics, setCustomMetrics] = useState<{ [key: string]: string }>({});
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Initialize custom metrics based on user settings
  React.useEffect(() => {
    const metrics: { [key: string]: string } = {};
    settings.customMetrics.forEach(metric => {
      metrics[metric] = "";
    });
    setCustomMetrics(metrics);
  }, [settings.customMetrics]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string values to numbers where appropriate
    const parsedCustomMetrics: { [key: string]: number | string } = {};
    
    Object.entries(customMetrics).forEach(([key, value]) => {
      const numberValue = parseFloat(value);
      parsedCustomMetrics[key] = isNaN(numberValue) ? value : numberValue;
    });
    
    addWellnessData({
      date: date.toISOString(),
      weight: weight ? parseFloat(weight) : undefined,
      protein: protein ? parseFloat(protein) : undefined,
      water: water ? parseFloat(water) : undefined,
      calories: calories ? parseFloat(calories) : undefined,
      notes,
      customMetrics: parsedCustomMetrics
    });
    
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setDate(new Date());
    setWeight("");
    setProtein("");
    setWater("");
    setCalories("");
    setNotes("");
    
    const resetMetrics: { [key: string]: string } = {};
    settings.customMetrics.forEach(metric => {
      resetMetrics[metric] = "";
    });
    setCustomMetrics(resetMetrics);
  };

  const handleCustomMetricChange = (metric: string, value: string) => {
    setCustomMetrics({
      ...customMetrics,
      [metric]: value
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-shotsy-800">Track Wellness</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate || new Date());
                    setCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">
                Weight ({settings.useMetricSystem ? "kg" : "lbs"})
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full"
                placeholder={settings.useMetricSystem ? "e.g., 70.5" : "e.g., 155.5"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                min="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full"
                placeholder="e.g., 80"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="water">Water (oz)</Label>
              <Input
                id="water"
                type="number"
                min="0"
                value={water}
                onChange={(e) => setWater(e.target.value)}
                className="w-full"
                placeholder="e.g., 64"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full"
                placeholder="e.g., 1800"
              />
            </div>
          </div>
          
          {settings.customMetrics.length > 0 && (
            <div className="space-y-3 border-t border-b py-3 my-3">
              <h3 className="font-medium text-gray-700">Custom Metrics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {settings.customMetrics.map((metric) => (
                  <div key={metric} className="space-y-2">
                    <Label htmlFor={`metric-${metric}`}>{metric}</Label>
                    <Input
                      id={`metric-${metric}`}
                      value={customMetrics[metric] || ""}
                      onChange={(e) => handleCustomMetricChange(metric, e.target.value)}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
              placeholder="Add any wellness notes..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-shotsy-500 hover:bg-shotsy-600">
              Save Data
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WellnessForm;
