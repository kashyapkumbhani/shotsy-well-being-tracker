
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShotData } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShotCardProps {
  shot: ShotData;
  isNext?: boolean;
  onEdit: (shot: ShotData) => void;
  onDelete: (id: string) => void;
}

const ShotCard: React.FC<ShotCardProps> = ({ shot, isNext = false, onEdit, onDelete }) => {
  const shotDate = new Date(shot.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const isToday = new Date(shot.date).toDateString() === today.toDateString();
  const isPast = shotDate < today;
  const isFuture = shotDate > today;
  
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      isNext && "border-2 border-shotsy-400 bg-shotsy-50/40",
      isToday && "border-shotsy-600",
    )}>
      <CardContent className="p-0">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">
              {isNext ? "Next Shot" : `Shot ${shot.shotNumber || ""}`}
            </span>
            {isToday && (
              <span className="bg-shotsy-500 text-white text-xs px-2 py-0.5 rounded-full">
                Today
              </span>
            )}
          </div>
          
          <div className="text-gray-500 text-sm">
            {isToday 
              ? `Today at ${formatTime(shot.date)}`
              : `${formatDate(shot.date, "EEE, MMM d")} at ${formatTime(shot.date)}`
            }
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-lg font-semibold">{shot.medication}</h3>
              {shot.location && (
                <div className="text-sm text-gray-500">{shot.location}</div>
              )}
            </div>
            
            <div className="bg-shotsy-200 text-shotsy-800 px-3 py-1 rounded-full font-medium">
              {shot.dose} mg
            </div>
          </div>
          
          {shot.notes && (
            <div className="mt-3 text-sm text-gray-600 border-t border-gray-100 pt-3">
              {shot.notes}
            </div>
          )}
          
          {!isNext && (
            <div className="flex justify-end mt-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-500 hover:text-shotsy-600"
                onClick={() => onEdit(shot)}
              >
                <Pencil size={16} className="mr-1" />
                Edit
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="text-gray-500 hover:text-red-600"
                onClick={() => onDelete(shot.id)}
              >
                <Trash2 size={16} className="mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShotCard;
