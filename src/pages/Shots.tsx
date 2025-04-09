
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { useShotsy } from "@/contexts/ShotsyContext";
import { Plus, AlertCircle } from "lucide-react";
import AddShotForm from "@/components/AddShotForm";
import ShotCard from "@/components/ShotCard";
import { ShotData } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Shots: React.FC = () => {
  const { shots, nextShotDate, deleteShot } = useShotsy();
  const [addShotOpen, setAddShotOpen] = useState(false);
  const [editingShotData, setEditingShotData] = useState<ShotData | null>(null);
  const [deletingShotId, setDeletingShotId] = useState<string | null>(null);
  
  // Sort shots by date (most recent first)
  const sortedShots = [...shots].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Group shots by month for better organization
  const groupedShots: { [key: string]: ShotData[] } = {};
  
  sortedShots.forEach(shot => {
    const date = new Date(shot.date);
    const monthYear = format(date, "MMMM yyyy");
    
    if (!groupedShots[monthYear]) {
      groupedShots[monthYear] = [];
    }
    
    groupedShots[monthYear].push(shot);
  });
  
  const handleEditShot = (shot: ShotData) => {
    setEditingShotData(shot);
    setAddShotOpen(true);
  };
  
  const handleCloseEditDialog = () => {
    setEditingShotData(null);
    setAddShotOpen(false);
  };
  
  const handleRequestDelete = (id: string) => {
    setDeletingShotId(id);
  };
  
  const confirmDelete = () => {
    if (deletingShotId) {
      deleteShot(deletingShotId);
      setDeletingShotId(null);
    }
  };
  
  // Create a next shot object for display
  const nextShot: ShotData = {
    id: "next-shot",
    date: nextShotDate,
    medication: shots.length > 0 ? shots[0].medication : "GLP-1 Medication",
    dose: shots.length > 0 ? shots[0].dose : 1.0,
    location: shots.length > 0 ? shots[0].location : "Stomach",
    shotNumber: (shots.length > 0 ? shots[0].shotNumber || 0 : 0) + 1,
  };
  
  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-shotsy-900">Shots</h1>
        </div>
        <Button 
          onClick={() => setAddShotOpen(true)}
          className="bg-shotsy-500 hover:bg-shotsy-600 text-white"
        >
          <Plus className="mr-1 h-4 w-4" /> Add shot
        </Button>
      </header>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Next Shot</h2>
          <ShotCard 
            shot={nextShot} 
            isNext={true}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-3">History</h2>
          
          {Object.keys(groupedShots).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedShots).map(([monthYear, monthShots]) => (
                <div key={monthYear}>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    {monthYear}
                  </h3>
                  <div className="space-y-3">
                    {monthShots.map(shot => (
                      <ShotCard
                        key={shot.id}
                        shot={shot}
                        onEdit={handleEditShot}
                        onDelete={handleRequestDelete}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-500 mb-3">No shot history yet</p>
              <Button
                size="sm"
                onClick={() => setAddShotOpen(true)}
                className="bg-shotsy-500 hover:bg-shotsy-600"
              >
                Log your first shot
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <AddShotForm isOpen={addShotOpen} onClose={handleCloseEditDialog} />
      
      <AlertDialog open={deletingShotId !== null} onOpenChange={(open) => !open && setDeletingShotId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shot Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this shot record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Shots;
