import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import type { WorkoutWithDetails } from "@shared/schema";

export default function History() {
  const [dateFilter, setDateFilter] = useState("");
  const [bodyPartFilter, setBodyPartFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all workouts
  const { data: workouts = [], isLoading } = useQuery<WorkoutWithDetails[]>({
    queryKey: ["/api/workouts"],
  });

  // Filter and paginate workouts
  const filteredWorkouts = workouts.filter((workout) => {
    const matchesDate = !dateFilter || 
      new Date(workout.startTime).toISOString().split('T')[0] >= dateFilter;
    
    const matchesBodyPart = bodyPartFilter === "all" || 
      workout.exercises.some(we => {
        const category = we.exercise.category;
        return (bodyPartFilter === "upper" && category === "upper") ||
               (bodyPartFilter === "lower" && category === "lower");
      });

    return matchesDate && matchesBodyPart;
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const totalPages = Math.ceil(filteredWorkouts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWorkouts = filteredWorkouts.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (duration: number | null) => {
    if (!duration) return "N/A";
    const minutes = Math.floor(duration / 60);
    return `${minutes} min`;
  };

  const getWorkoutTitle = (workout: WorkoutWithDetails) => {
    const bodyParts = Array.from(new Set(workout.exercises.map(we => we.exercise.bodyPart)));
    if (bodyParts.length === 0) return "Empty Workout";
    if (bodyParts.length === 1) return `${bodyParts[0]} Workout`;
    if (bodyParts.length > 3) return "Full Body Workout";
    return `${bodyParts.join(" & ")} Workout`;
  };

  const getUniqueBodyParts = (workout: WorkoutWithDetails) => {
    return Array.from(new Set(workout.exercises.map(we => we.exercise.bodyPart)));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading workout history...</div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Workout History</CardTitle>
          <div className="flex space-x-3">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-40"
              data-testid="input-date-filter"
            />
            <Select value={bodyPartFilter} onValueChange={setBodyPartFilter}>
              <SelectTrigger className="w-40" data-testid="select-bodypart-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Body Parts</SelectItem>
                <SelectItem value="upper">Upper Body</SelectItem>
                <SelectItem value="lower">Lower Body</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {paginatedWorkouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workouts found</h3>
            <p className="text-muted-foreground">
              {workouts.length === 0 
                ? "Start tracking your workouts to see them here!"
                : "Try adjusting your filters to see more results."
              }
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {paginatedWorkouts.map((workout) => {
              const bodyParts = getUniqueBodyParts(workout);
              const totalSets = workout.exercises.reduce((sum, we) => sum + we.sets.length, 0);
              
              return (
                <div 
                  key={workout.id} 
                  className="p-6 hover:bg-muted/50 transition-colors"
                  data-testid={`workout-${workout.id}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg" data-testid={`text-workout-title-${workout.id}`}>
                        {getWorkoutTitle(workout)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(workout.startTime)} • {formatTime(workout.startTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-semibold" data-testid={`text-workout-duration-${workout.id}`}>
                        {formatDuration(workout.duration)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Exercises</p>
                      <p className="font-semibold" data-testid={`text-workout-exercises-${workout.id}`}>
                        {workout.exercises.length}
                      </p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Total Sets</p>
                      <p className="font-semibold" data-testid={`text-workout-sets-${workout.id}`}>
                        {totalSets}
                      </p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Volume</p>
                      <p className="font-semibold" data-testid={`text-workout-volume-${workout.id}`}>
                        {parseFloat(workout.totalVolume || "0").toLocaleString()} lbs
                      </p>
                    </div>
                  </div>

                  {bodyParts.length > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {bodyParts.map((bodyPart) => {
                          const isUpperBody = workout.exercises.some(we => 
                            we.exercise.bodyPart === bodyPart && we.exercise.category === "upper"
                          );
                          
                          return (
                            <Badge
                              key={bodyPart}
                              variant={isUpperBody ? "default" : "secondary"}
                              className={isUpperBody ? "bg-secondary text-secondary-foreground" : "bg-success text-success-foreground"}
                              data-testid={`badge-bodypart-${bodyPart.toLowerCase()}`}
                            >
                              {bodyPart}
                            </Badge>
                          );
                        })}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:underline"
                        data-testid={`button-view-details-${workout.id}`}
                      >
                        View Details
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground" data-testid="text-pagination-info">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredWorkouts.length)} of {filteredWorkouts.length} workouts
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  data-testid="button-previous-page"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-primary text-primary-foreground"
                  data-testid="button-next-page"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}