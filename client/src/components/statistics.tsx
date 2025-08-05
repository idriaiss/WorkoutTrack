import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Calendar, Weight, Clock, FileText, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import type { ExerciseProgress, Exercise } from "@shared/schema";

interface WorkoutStats {
  totalWorkouts: number;
  totalVolume: number;
  avgDuration: number;
  bodyPartDistribution: { bodyPart: string; count: number }[];
}

export default function Statistics() {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month');

  // Fetch workout statistics
  const { data: stats } = useQuery<WorkoutStats>({
    queryKey: ["/api/stats", { timeframe }],
  });

  // Fetch exercises for progress chart
  const { data: exercises = [] } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  // Fetch exercise progress
  const { data: exerciseProgress } = useQuery<ExerciseProgress>({
    queryKey: ["/api/exercises", selectedExerciseId, "progress"],
    enabled: !!selectedExerciseId,
  });

  const handleExportJSON = async () => {
    try {
      const response = await fetch("/api/workouts");
      if (response.ok) {
        const data = await response.json();
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "workout-data.json";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Failed to export JSON:", error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch("/api/export/csv");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "workout-data.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Failed to export CSV:", error);
    }
  };

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      default:
        return 'All Time';
    }
  };

  const maxBodyPartCount = Math.max(...(stats?.bodyPartDistribution.map(bp => bp.count) || [1]));

  return (
    <div className="space-y-6">
      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{getTimeframeLabel()}</p>
                <p className="text-2xl font-bold" data-testid={`text-${timeframe}-workouts`}>
                  {stats?.totalWorkouts || 0}
                </p>
                <p className="text-xs text-success">Workouts completed</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                {timeframe === 'week' ? (
                  <CalendarDays className="text-primary w-6 h-6" />
                ) : (
                  <Calendar className="text-primary w-6 h-6" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Volume</p>
                <p className="text-2xl font-bold" data-testid="text-total-volume">
                  {stats?.totalVolume.toLocaleString() || 0}
                </p>
                <p className="text-xs text-muted-foreground">lbs lifted {timeframe !== 'all' ? `${timeframe === 'week' ? 'this week' : 'this month'}` : 'total'}</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Weight className="text-success w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Avg Duration</p>
                <p className="text-2xl font-bold" data-testid="text-avg-duration">
                  {stats?.avgDuration || 0}
                </p>
                <p className="text-xs text-muted-foreground">minutes per workout</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Clock className="text-accent w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Select value={timeframe} onValueChange={(value: 'week' | 'month' | 'all') => setTimeframe(value)}>
                  <SelectTrigger className="w-full" data-testid="select-timeframe">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Exercise Progress</CardTitle>
              <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                <SelectTrigger className="w-48" data-testid="select-exercise-progress">
                  <SelectValue placeholder="Select exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {exerciseProgress && exerciseProgress.progressData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={exerciseProgress.progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: any, name: string) => [
                        name === 'weight' ? `${value} lbs` : `${value} lbs`,
                        name === 'weight' ? 'Max Weight' : 'Volume'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="hsl(15, 100%, 60%)" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(15, 100%, 60%)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                {selectedExerciseId ? "No progress data available" : "Select an exercise to view progress"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Body Parts Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Body Parts Trained</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.bodyPartDistribution.map((bodyPart, index) => {
                const colors = [
                  "hsl(15, 100%, 60%)", // primary
                  "hsl(200, 57%, 43%)", // secondary
                  "hsl(135, 56%, 42%)", // success
                  "hsl(210, 11%, 46%)", // accent
                ];
                const color = colors[index % colors.length];
                const percentage = (bodyPart.count / maxBodyPartCount) * 100;

                return (
                  <div key={bodyPart.bodyPart} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded mr-3" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm">{bodyPart.bodyPart}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 mr-3">
                        <Progress value={percentage} className="h-2" />
                      </div>
                      <span className="text-sm font-semibold w-8 text-right" data-testid={`text-bodypart-${bodyPart.bodyPart.toLowerCase()}`}>
                        {bodyPart.count}
                      </span>
                    </div>
                  </div>
                );
              }) || (
                <div className="text-center text-muted-foreground py-8">
                  No workout data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Export Data</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Download your workout data for external analysis
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleExportCSV}
                className="bg-primary text-primary-foreground"
                data-testid="button-export-csv-stats"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={handleExportJSON}
                className="bg-secondary text-secondary-foreground"
                data-testid="button-export-json"
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}