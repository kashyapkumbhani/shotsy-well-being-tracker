
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { useShotsy } from "@/contexts/ShotsyContext";
import { Plus, ChevronDown, ChevronUp, Syringe, Weight, Droplet, Apple } from "lucide-react";
import AddShotForm from "@/components/AddShotForm";
import WellnessForm from "@/components/WellnessForm";
import { ShotData, WellnessData } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";
import { isSameDay } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Calendar: React.FC = () => {
  const { shots, wellnessData } = useShotsy();
  const [addShotOpen, setAddShotOpen] = useState(false);
  const [addWellnessOpen, setAddWellnessOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Find all data for the selected date
  const getShotsForDate = (date: Date) => {
    return shots.filter(shot => 
      isSameDay(new Date(shot.date), date)
    );
  };
  
  const getWellnessDataForDate = (date: Date) => {
    return wellnessData.filter(data => 
      isSameDay(new Date(data.date), date)
    );
  };
  
  // Calendar custom rendering
  const getDayContent = (day: Date) => {
    const shotsOnDay = shots.filter(shot => 
      isSameDay(new Date(shot.date), day)
    );
    
    const wellnessOnDay = wellnessData.filter(data => 
      isSameDay(new Date(data.date), day)
    );
    
    if (shotsOnDay.length === 0 && wellnessOnDay.length === 0) {
      return null;
    }
    
    return (
      <div className="flex flex-col items-center">
        {shotsOnDay.length > 0 && (
          <div className="w-[5px] h-[5px] rounded-full bg-shotsy-600" />
        )}
        {wellnessOnDay.length > 0 && (
          <div className="w-[5px] h-[5px] rounded-full bg-green-500 mt-0.5" />
        )}
      </div>
    );
  };
  
  // Data for the selected date
  const selectedDateShots = getShotsForDate(selectedDate);
  const selectedDateWellness = getWellnessDataForDate(selectedDate);
  
  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-shotsy-900">Calendar</h1>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => setAddWellnessOpen(true)}
            className="border-shotsy-200"
          >
            <Weight className="mr-1 h-4 w-4" /> Track
          </Button>
          <Button 
            onClick={() => setAddShotOpen(true)}
            className="bg-shotsy-500 hover:bg-shotsy-600 text-white"
          >
            <Plus className="mr-1 h-4 w-4" /> Shot
          </Button>
        </div>
      </header>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
            components={{
              DayContent: ({ day }) => (
                <>
                  {day.day}
                  {getDayContent(day.date)}
                </>
              ),
            }}
          />
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Data for {formatDate(selectedDate, "MMMM d, yyyy")}
        </h2>
        
        {selectedDateShots.length === 0 && selectedDateWellness.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500 mb-3">No data recorded for this date</p>
            <div className="flex justify-center gap-2">
              <Button
                size="sm"
                onClick={() => setAddShotOpen(true)}
                className="bg-shotsy-500 hover:bg-shotsy-600"
              >
                Log shot
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAddWellnessOpen(true)}
              >
                Log wellness
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedDateShots.length > 0 && (
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-shotsy-50 rounded-md">
                  <div className="flex items-center">
                    <Syringe className="h-5 w-5 text-shotsy-700 mr-2" />
                    <h3 className="font-medium">Shot Records</h3>
                  </div>
                  <div className="text-shotsy-700">
                    <ChevronDown className="h-5 w-5 chevron-down hidden group-data-[state=open]:block" />
                    <ChevronUp className="h-5 w-5 chevron-up group-data-[state=open]:hidden" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  {selectedDateShots.map(shot => (
                    <Card key={shot.id} className="mb-2 bg-white">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{shot.medication}</h4>
                            <p className="text-sm text-gray-500">
                              {formatTime(shot.date)}
                              {shot.location && ` • ${shot.location}`}
                            </p>
                          </div>
                          <div className="bg-shotsy-100 text-shotsy-800 px-2 py-1 rounded-full text-sm font-medium">
                            {shot.dose} mg
                          </div>
                        </div>
                        {shot.notes && (
                          <p className="mt-2 text-sm text-gray-600 border-t border-gray-100 pt-2">
                            {shot.notes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
            
            {selectedDateWellness.length > 0 && (
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-green-50 rounded-md">
                  <div className="flex items-center">
                    <Weight className="h-5 w-5 text-green-700 mr-2" />
                    <h3 className="font-medium">Wellness Records</h3>
                  </div>
                  <div className="text-green-700">
                    <ChevronDown className="h-5 w-5 chevron-down hidden group-data-[state=open]:block" />
                    <ChevronUp className="h-5 w-5 chevron-up group-data-[state=open]:hidden" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  {selectedDateWellness.map(data => (
                    <Card key={data.id} className="mb-2 bg-white">
                      <CardContent className="p-3">
                        <div className="grid grid-cols-2 gap-2">
                          {data.weight !== undefined && (
                            <div className="flex items-center">
                              <Weight className="h-4 w-4 text-gray-500 mr-1" />
                              <span className="text-sm">
                                {data.weight} {data.weight !== undefined ? (data.weight === 1 ? "lb" : "lbs") : ""}
                              </span>
                            </div>
                          )}
                          
                          {data.water !== undefined && (
                            <div className="flex items-center">
                              <Droplet className="h-4 w-4 text-gray-500 mr-1" />
                              <span className="text-sm">{data.water} oz water</span>
                            </div>
                          )}
                          
                          {data.protein !== undefined && (
                            <div className="flex items-center">
                              <span className="font-bold text-gray-500 mr-1 text-xs">P</span>
                              <span className="text-sm">{data.protein}g protein</span>
                            </div>
                          )}
                          
                          {data.calories !== undefined && (
                            <div className="flex items-center">
                              <Apple className="h-4 w-4 text-gray-500 mr-1" />
                              <span className="text-sm">{data.calories} calories</span>
                            </div>
                          )}
                        </div>
                        
                        {data.customMetrics && Object.keys(data.customMetrics).length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Custom Metrics</p>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(data.customMetrics).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="font-medium">{key}:</span> {value}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {data.notes && (
                          <p className="mt-2 text-sm text-gray-600 border-t border-gray-100 pt-2">
                            {data.notes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}
      </div>
      
      <AddShotForm isOpen={addShotOpen} onClose={() => setAddShotOpen(false)} />
      <WellnessForm isOpen={addWellnessOpen} onClose={() => setAddWellnessOpen(false)} />
    </div>
  );
};

export default Calendar;
