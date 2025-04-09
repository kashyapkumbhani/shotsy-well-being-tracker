
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useShotsy } from "@/contexts/ShotsyContext";
import { Plus, Download } from "lucide-react";
import WellnessForm from "@/components/WellnessForm";
import { formatDateShort, formatWeight } from "@/lib/utils";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

const Results: React.FC = () => {
  const { shots, wellnessData, settings } = useShotsy();
  const [addWellnessOpen, setAddWellnessOpen] = useState(false);
  const [combinedData, setCombinedData] = useState<any[]>([]);
  
  // Calculate weight stats
  const calculateWeightStats = () => {
    const weightData = wellnessData
      .filter(data => data.weight !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (weightData.length < 2) {
      return { totalChange: 0, percentChange: 0, weeklyAvg: 0 };
    }
    
    const firstWeight = weightData[0].weight!;
    const lastWeight = weightData[weightData.length - 1].weight!;
    const totalChange = lastWeight - firstWeight;
    const percentChange = (totalChange / firstWeight) * 100;
    
    // Calculate average weekly change
    const totalDays = (new Date(weightData[weightData.length - 1].date).getTime() - 
                      new Date(weightData[0].date).getTime()) / (1000 * 60 * 60 * 24);
    const totalWeeks = totalDays / 7;
    const weeklyAvg = totalChange / totalWeeks;
    
    return { 
      totalChange, 
      percentChange, 
      weeklyAvg,
      firstWeight,
      lastWeight
    };
  };
  
  const stats = calculateWeightStats();
  
  // Combine shot and weight data for the chart
  useEffect(() => {
    if (shots.length === 0 || wellnessData.filter(d => d.weight).length === 0) {
      return;
    }
    
    const weightEntries = wellnessData
      .filter(data => data.weight !== undefined)
      .map(data => ({
        date: new Date(data.date),
        formattedDate: formatDateShort(data.date),
        weight: data.weight
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const shotEntries = shots.map(shot => ({
      date: new Date(shot.date),
      formattedDate: formatDateShort(shot.date),
      dose: shot.dose,
      medication: shot.medication
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Create combined timeline
    let allDates = new Set([
      ...weightEntries.map(entry => entry.date.getTime()),
      ...shotEntries.map(entry => entry.date.getTime())
    ]);
    
    const sortedDates = [...allDates].sort();
    
    // Create the combined data array
    const combined = sortedDates.map(timestamp => {
      const date = new Date(timestamp);
      const formattedDate = formatDateShort(date);
      
      // Find weight entry for this date if it exists
      const weightEntry = weightEntries.find(entry => 
        entry.date.getTime() === timestamp
      );
      
      // Find shot entry for this date if it exists
      const shotEntry = shotEntries.find(entry => 
        entry.date.getTime() === timestamp
      );
      
      return {
        timestamp,
        date: formattedDate,
        weight: weightEntry?.weight,
        dose: shotEntry?.dose,
        medication: shotEntry?.medication
      };
    });
    
    setCombinedData(combined);
  }, [shots, wellnessData]);
  
  // Generate and download CSV data
  const downloadCSV = () => {
    // Combine shot and wellness data
    const allData = [...shots, ...wellnessData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Create CSV headers
    const headers = [
      "Date",
      "Type",
      "Medication",
      "Dose (mg)",
      "Location",
      "Weight",
      "Protein (g)",
      "Water (oz)",
      "Calories",
      "Notes"
    ];
    
    // Create CSV rows
    const rows = allData.map(data => {
      const isShot = 'medication' in data;
      return [
        new Date(data.date).toLocaleDateString(),
        isShot ? "Shot" : "Wellness",
        isShot ? data.medication : "",
        isShot ? data.dose : "",
        isShot && data.location ? data.location : "",
        !isShot && data.weight ? data.weight : "",
        !isShot && data.protein ? data.protein : "",
        !isShot && data.water ? data.water : "",
        !isShot && data.calories ? data.calories : "",
        data.notes || ""
      ];
    });
    
    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "shotsy_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="text-xs font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="text-xs">
              {entry.name === "weight" && (
                <p style={{ color: entry.color }}>
                  Weight: {entry.value}{settings.useMetricSystem ? "kg" : "lbs"}
                </p>
              )}
              {entry.name === "dose" && (
                <p className="font-semibold" style={{ color: entry.color }}>
                  {entry.payload.medication}: {entry.value}mg
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-shotsy-900">Results</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCSV}
            className="text-shotsy-700 border-shotsy-200"
          >
            <Download className="mr-1 h-4 w-4" /> Export
          </Button>
          <Button 
            onClick={() => setAddWellnessOpen(true)}
            className="bg-shotsy-500 hover:bg-shotsy-600 text-white"
          >
            <Plus className="mr-1 h-4 w-4" /> Add data
          </Button>
        </div>
      </header>
      
      {wellnessData.filter(d => d.weight).length > 1 ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">Weight Change</h2>
              
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-shotsy-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Total change</p>
                  <p className={`font-semibold ${stats.totalChange < 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {stats.totalChange < 0 ? "-" : "+"}
                    {Math.abs(stats.totalChange).toFixed(1)}
                    {settings.useMetricSystem ? "kg" : "lbs"}
                  </p>
                </div>
                
                <div className="bg-shotsy-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Percent</p>
                  <p className={`font-semibold ${stats.percentChange < 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {stats.percentChange < 0 ? "-" : "+"}
                    {Math.abs(stats.percentChange).toFixed(1)}%
                  </p>
                </div>
                
                <div className="bg-shotsy-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Weekly avg</p>
                  <p className={`font-semibold ${stats.weeklyAvg < 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {stats.weeklyAvg < 0 ? "-" : "+"}
                    {Math.abs(stats.weeklyAvg).toFixed(1)}
                    {settings.useMetricSystem ? "kg" : "lbs"}/wk
                  </p>
                </div>
              </div>
              
              {combinedData.length > 1 && (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={combinedData}
                      margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }}
                        tickMargin={5}
                      />
                      <YAxis 
                        yAxisId="left"
                        orientation="left"
                        domain={[
                          dataMin => Math.floor(dataMin - 5), 
                          dataMax => Math.ceil(dataMax + 5)
                        ]}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 20]}
                        hide
                      />
                      <Tooltip content={<CustomTooltip />} />
                      
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="weight"
                        stroke="#26c6da"
                        strokeWidth={2}
                        connectNulls
                        dot={{ r: 3, strokeWidth: 1 }}
                        activeDot={{ r: 5 }}
                      />
                      
                      {combinedData.map((entry, index) => {
                        if (entry.dose) {
                          // Render a dot for each dose
                          return (
                            <ReferenceLine
                              key={index}
                              x={entry.date}
                              yAxisId="left"
                              stroke="#9c27b0"
                              strokeWidth={1}
                              strokeDasharray="3 3"
                            />
                          );
                        }
                        return null;
                      })}
                      
                      {combinedData.filter(d => d.dose).map((entry, index) => (
                        <Line
                          key={`dose-${index}`}
                          yAxisId="right"
                          type="monotone"
                          dataKey="dose"
                          stroke="#9c27b0"
                          strokeWidth={0}
                          dot={(props) => {
                            const { cx, cy, payload } = props;
                            if (!payload.dose) return null;
                            
                            // Map dose to different colors
                            let bgColor = "#9c27b0"; // default purple
                            if (payload.dose <= 2.5) bgColor = "#78909c"; // gray
                            else if (payload.dose <= 5) bgColor = "#9c27b0"; // purple
                            else if (payload.dose <= 7.5) bgColor = "#26a69a"; // teal
                            else if (payload.dose <= 10) bgColor = "#ec407a"; // pink
                            else bgColor = "#42a5f5"; // blue
                            
                            return (
                              <g>
                                <rect
                                  x={cx - 16}
                                  y={10}
                                  width={32}
                                  height={20}
                                  rx={10}
                                  fill={bgColor}
                                />
                                <text
                                  x={cx}
                                  y={22}
                                  textAnchor="middle"
                                  fill="white"
                                  fontSize={10}
                                >
                                  {payload.dose}mg
                                </text>
                              </g>
                            );
                          }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">Progress Timeline</h2>
              
              <div className="space-y-4">
                {wellnessData
                  .filter(data => data.weight !== undefined)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((data, index, array) => {
                    const currentWeight = data.weight;
                    const prevWeight = index < array.length - 1 ? array[index + 1].weight : null;
                    const weightChange = prevWeight && currentWeight ? currentWeight - prevWeight : null;
                    
                    return (
                      <div key={data.id} className="flex justify-between border-b border-gray-100 pb-3">
                        <div>
                          <p className="font-medium">{formatDateShort(data.date)}</p>
                          <p className="text-gray-500 text-sm">
                            {formatWeight(currentWeight!, settings.useMetricSystem)}
                          </p>
                        </div>
                        
                        {weightChange !== null && (
                          <div className={`text-sm font-medium ${
                            weightChange < 0 ? 'text-green-600' : 
                            weightChange > 0 ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            {weightChange === 0 ? 'No change' : 
                             weightChange < 0 ? `-${Math.abs(weightChange).toFixed(1)}` : 
                             `+${weightChange.toFixed(1)}`}
                            {settings.useMetricSystem ? 'kg' : 'lbs'}
                          </div>
                        )}
                      </div>
                    );
                  })
                }
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-500 mb-3">
            Add at least two weight entries to see your progress
          </p>
          <Button
            size="sm"
            onClick={() => setAddWellnessOpen(true)}
            className="bg-shotsy-500 hover:bg-shotsy-600"
          >
            Log your weight
          </Button>
        </div>
      )}
      
      <WellnessForm isOpen={addWellnessOpen} onClose={() => setAddWellnessOpen(false)} />
    </div>
  );
};

export default Results;
