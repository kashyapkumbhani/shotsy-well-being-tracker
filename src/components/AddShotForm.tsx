
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useShotsy } from "@/contexts/ShotsyContext";
import { cn } from "@/lib/utils";

interface AddShotFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddShotForm: React.FC<AddShotFormProps> = ({ isOpen, onClose }) => {
  const { addShot, settings } = useShotsy();
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<string>(`${new Date().getHours()}:${new Date().getMinutes()}`);
  const [medication, setMedication] = useState<string>(settings.medicationName);
  const [dose, setDose] = useState<number>(settings.defaultDose);
  const [location, setLocation] = useState<string>(settings.defaultLocation || "");
  const [notes, setNotes] = useState<string>("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date and time
    const combinedDate = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    combinedDate.setHours(hours, minutes, 0, 0);
    
    addShot({
      date: combinedDate.toISOString(),
      medication,
      dose,
      location,
      notes,
      taken: true,
    });
    
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setDate(new Date());
    setTime(`${new Date().getHours()}:${new Date().getMinutes()}`);
    setMedication(settings.medicationName);
    setDose(settings.defaultDose);
    setLocation(settings.defaultLocation || "");
    setNotes("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-shotsy-800">Log Your Shot</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
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
            
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-9"
                  required
                />
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="medication">Medication</Label>
            <Input
              id="medication"
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dose">Dose (mg)</Label>
              <Input
                id="dose"
                type="number"
                step="0.1"
                min="0"
                value={dose}
                onChange={(e) => setDose(parseFloat(e.target.value))}
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Injection Site</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full"
                placeholder="e.g., Stomach, Thigh"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
              placeholder="Add any notes or side effects..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-shotsy-500 hover:bg-shotsy-600">
              Save Shot
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddShotForm;
