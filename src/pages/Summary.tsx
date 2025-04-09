
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO, isSameDay, isSameMonth, subDays, subMonths } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useShotsy } from "@/contexts/ShotsyContext";
import { formatDate, formatDateShort, getMotivationalQuote } from "@/lib/utils";
import { Plus, Star, Calendar, ArrowRight } from "lucide-react";
import AddShotForm from "@/components/AddShotForm";
import WellnessForm from "@/components/WellnessForm";
import { ShotData, WellnessData } from "@/types";
import { useNavigate } from "react-router-dom";

const Summary: React.FC = () => {
  const { shots, wellnessData, settings, streak, nextShotDate } = useShotsy();
  const [addShotOpen, setAddShotOpen] = useState(false);
  const [addWellnessOpen, setAddWellnessOpen] = useState(false);
  const [timeframe, setTimeframe] = useState("week");
  const [chartData, setChartData] = useState<any[]>([]);
  const [quote, setQuote] = useState<string>("");
  const navigate = useNavigate();
  
  const nextShotDateObj = new Date(nextShotDate);
  const today = new Date();
  
  // Calculate if next shot is today
  const isShotToday = isSameDay(nextShotDateObj, today);
  
  // Calculate days until next shot
  const daysUntilNextShot = Math.ceil(
    (nextShotDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Calculate next shot status message
  const getNextShotMessage = () => {
    if (shots.length === 0) {
      return "Log your first shot to start tracking";
    }
    
    if (isShotToday) {
      return "Your shot is scheduled for today";
    }
    
    if (daysUntilNextShot < 0) {
      return `Shot overdue by ${Math.abs(daysUntilNextShot)} day${Math.abs(daysUntilNextShot) !== 1 ? 's' : ''}`;
    }
    
    return `Next shot in ${daysUntilNextShot} day${daysUntilNextShot !== 1 ? 's' : ''}`;
  };
  
  // Get a random motivational quote on component mount
  useEffect(() => {
    setQuote(getMotivationalQuote());
  }, []);
  
  // Prepare chart data based on time frame
  useEffect(() => {
    if (wellnessData.length === 0) return;
    
    const sortedData = [...wellnessData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const cutoffDate = timeframe === "week" 
      ? subDays(new Date(), 7) 
      : timeframe === "month"
      ? subMonths(new Date(), 1)
      : new Date(0); // All time
    
    const filteredData = sortedData.filter(item => 
      new Date(item.date) >= cutoffDate && item.weight !== undefined
    );
    
    const chartData = filteredData.map(item => ({
      date: formatDateShort(item.date),
      weight: item.weight,
    }));
    
    setChartData(chartData);
  }, [wellnessData, timeframe]);
  
  // Find the most recent shot
  const lastShot = [...shots]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    [0];
    
  // Calculate weight change if data exists
  const getWeightChange = () => {
    if (wellnessData.length < 2) return null;
    
    const sortedData = [...wellnessData]
      .filter(item => item.weight !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (sortedData.length < 2) return null;
    
    const firstWeight = sortedData[0].weight;
    const lastWeight = sortedData[sortedData.length - 1].weight;
    
    if (firstWeight === undefined || lastWeight === undefined) return null;
    
    const change = lastWeight - firstWeight;
    const percentChange = (change / firstWeight) * 100;
    
    return {
      change,
      percentChange,
      isLoss: change < 0,
    };
  };
  
  const weightChange = getWeightChange();
  
  return (
    <div className="p-4 max-w-md mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-shotsy-900">Summary</h1>
        </div>
        <Button 
          onClick={() => setAddShotOpen(true)}
          className="bg-shotsy-500 hover:bg-shotsy-600 text-white"
        >
          <Plus className="mr-1 h-4 w-4" /> Add shot
        </Button>
      </header>
      
      {streak > 0 && (
        <Card className="mb-6 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="h-6 w-6 text-amber-500 mr-2" />
              <div>
                <h3 className="font-semibold text-amber-800">
                  {streak} Week Streak!
                </h3>
                <p className="text-sm text-amber-700">
                  You've been consistent with your shots
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">Next Shot</h2>
          
          {shots.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-700 mb-1">{getNextShotMessage()}</p>
                  <p className="text-shotsy-800 font-medium">
                    {formatDate(nextShotDate, "EEEE, MMMM d")}
                  </p>
                </div>
                
                {daysUntilNextShot <= 7 && daysUntilNextShot >= 0 && (
                  <div className="relative h-14 w-14">
                    <svg className="h-14 w-14 transform -rotate-90">
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        stroke="#e2e8f0"
                        strokeWidth="6"
                        fill="none"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        stroke={isShotToday ? "#4CAF50" : "#26c6da"}
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${(7 - daysUntilNextShot) * (150 / 7)} 150`}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                      {daysUntilNextShot}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {settings.medicationName}, {settings.defaultDose}mg
                  </span>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-shotsy-600"
                    onClick={() => navigate("/shots")}
                  >
                    Schedule <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-3">No shots scheduled yet</p>
              <Button
                size="sm"
                onClick={() => setAddShotOpen(true)}
                className="bg-shotsy-500 hover:bg-shotsy-600"
              >
                Log your first shot
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Progress Tracker</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-shotsy-600 h-8"
              onClick={() => setAddWellnessOpen(true)}
            >
              Add data
            </Button>
          </div>
          
          {wellnessData.length > 1 && weightChange ? (
            <div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-shotsy-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className={`font-semibold ${weightChange.isLoss ? 'text-green-600' : 'text-red-500'}`}>
                    {weightChange.isLoss ? "-" : "+"}
                    {Math.abs(weightChange.change).toFixed(1)}
                    {settings.useMetricSystem ? "kg" : "lbs"}
                  </p>
                </div>
                
                <div className="bg-shotsy-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500">Percent</p>
                  <p className={`font-semibold ${weightChange.isLoss ? 'text-green-600' : 'text-red-500'}`}>
                    {weightChange.isLoss ? "-" : "+"}
                    {Math.abs(weightChange.percentChange).toFixed(1)}%
                  </p>
                </div>
                
                <div className="bg-shotsy-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-semibold text-gray-700">
                    {Math.ceil(
                      (new Date().getTime() - new Date(wellnessData[0].date).getTime()) / 
                      (1000 * 60 * 60 * 24 * 7)
                    )} wks
                  </p>
                </div>
              </div>
              
              <Tabs defaultValue="week" onValueChange={setTimeframe}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
                
                <div className="h-48 mt-4">
                  {chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickMargin={5}
                          tickFormatter={(value) => value.split('/')[1]}
                        />
                        <YAxis 
                          domain={['dataMin - 5', 'dataMax + 5']}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="weight"
                          stroke="#26c6da"
                          strokeWidth={2}
                          dot={{ r: 4, fill: "#26c6da" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      Not enough data for this time period
                    </div>
                  )}
                </div>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-3">
                Track your weight to see progress over time
              </p>
              <Button
                size="sm"
                onClick={() => setAddWellnessOpen(true)}
                className="bg-shotsy-500 hover:bg-shotsy-600"
              >
                Add weight data
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="mb-6 bg-shotsy-50 border-shotsy-100">
        <CardContent className="p-4">
          <div className="flex items-start">
            <div className="flex-grow">
              <h3 className="font-medium text-shotsy-800 mb-1">Today's Motivation</h3>
              <p className="text-shotsy-700 italic">"{quote}"</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-shotsy-700"
              onClick={() => setQuote(getMotivationalQuote())}
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <AddShotForm isOpen={addShotOpen} onClose={() => setAddShotOpen(false)} />
      <WellnessForm isOpen={addWellnessOpen} onClose={() => setAddWellnessOpen(false)} />
    </div>
  );
};

export default Summary;
