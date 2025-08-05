import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTimer } from "@/hooks/use-timer";
import type { Exercise, WorkoutWithDetails } from "@shared/schema";

const addSetSchema = z.object({
  exerciseId: z.string().min(1, "Please select an exercise"),
  bodyPart: z.string().min(1, "Please select a body part"),
  weight: z.coerce.number().min(0, "Weight must be positive"),
  reps: z.coerce.number().min(1, "Reps must be at least 1"),
});

type AddSetFormData = z.infer<typeof addSetSchema>;

interface CurrentSet {
  exerciseId: string;
  exerciseName: string;
  bodyPart: string;
  category: string;
  sets: {
    setNumber: number;
    weight: number;
    reps: number;
    volume: number;
  }[];
}

export default function WorkoutLogger() {
  const [currentWorkoutId, setCurrentWorkoutId] = useState<string | null>(null);
  const [currentExercises, setCurrentExercises] = useState<CurrentSet[]>([]);
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [showCustomExercise, setShowCustomExercise] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { time: sessionTime, start: startSession, reset: resetSession, isRunning } = useTimer();
  const { time: restTime, start: startRest, reset: resetRest } = useTimer();

  // Fetch exercises
  const { data: exercises = [] } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  // Current workout query
  const { data: currentWorkout } = useQuery<WorkoutWithDetails>({
    queryKey: ["/api/workouts", currentWorkoutId],
    enabled: !!currentWorkoutId,
  });

  const form = useForm<AddSetFormData>({
    resolver: zodResolver(addSetSchema),
    defaultValues: {
      exerciseId: "",
      bodyPart: "",
      weight: 0,
      reps: 1,
    },
  });

  // Create workout mutation
  const createWorkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/workouts", {
        name: `Workout - ${new Date().toLocaleDateString()}`,
        startTime: new Date().toISOString(),
        totalVolume: "0",
      });
      return response.json();
    },
    onSuccess: (workout) => {
      setCurrentWorkoutId(workout.id);
      startSession();
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
    },
  });

  // Create custom exercise mutation
  const createExerciseMutation = useMutation({
    mutationFn: async (exerciseData: { name: string; bodyPart: string; category: string }) => {
      const response = await apiRequest("POST", "/api/exercises", {
        ...exerciseData,
        isCustom: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      setShowCustomExercise(false);
      setCustomExerciseName("");
    },
  });

  // Add set mutation
  const addSetMutation = useMutation({
    mutationFn: async ({ workoutExerciseId, setData }: { workoutExerciseId: string; setData: any }) => {
      const response = await apiRequest("POST", `/api/workout-exercises/${workoutExerciseId}/sets`, setData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts", currentWorkoutId] });
      startRest();
      form.reset();
    },
  });

  // Finish workout mutation
  const finishWorkoutMutation = useMutation({
    mutationFn: async () => {
      if (!currentWorkoutId) return;
      
      const response = await apiRequest("PATCH", `/api/workouts/${currentWorkoutId}`, {
        endTime: new Date().toISOString(),
        duration: sessionTime,
      });
      return response.json();
    },
    onSuccess: () => {
      setCurrentWorkoutId(null);
      setCurrentExercises([]);
      resetSession();
      resetRest();
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      toast({
        title: "Workout Complete!",
        description: "Great job on finishing your workout session.",
      });
    },
  });

  const startNewWorkout = () => {
    createWorkoutMutation.mutate();
  };

  const onSubmit = async (data: AddSetFormData) => {
    if (!currentWorkoutId) return;

    try {
      const exercise = exercises.find(e => e.id === data.exerciseId);
      if (!exercise) return;

      // Find or create workout exercise
      let workoutExercise = currentWorkout?.exercises.find(we => we.exerciseId === data.exerciseId);
      
      if (!workoutExercise) {
        // Add exercise to workout first
        const response = await apiRequest("POST", `/api/workouts/${currentWorkoutId}/exercises`, {
          exerciseId: data.exerciseId,
          order: (currentWorkout?.exercises.length || 0) + 1,
        });
        const newWorkoutExercise = await response.json();
        
        // Add the set
        const setNumber = 1;
        await addSetMutation.mutateAsync({
          workoutExerciseId: newWorkoutExercise.id,
          setData: {
            setNumber,
            weight: data.weight.toString(),
            reps: data.reps,
          },
        });
      } else {
        // Add set to existing exercise
        const setNumber = workoutExercise.sets.length + 1;
        await addSetMutation.mutateAsync({
          workoutExerciseId: workoutExercise.id,
          setData: {
            setNumber,
            weight: data.weight.toString(),
            reps: data.reps,
          },
        });
      }

      toast({
        title: "Set Added!",
        description: `Added ${data.reps} reps at ${data.weight} lbs`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add set",
        variant: "destructive",
      });
    }
  };

  const handleCustomExercise = () => {
    const bodyPart = form.getValues("bodyPart");
    if (!customExerciseName || !bodyPart) return;

    const category = ["Chest", "Back", "Shoulders", "Arms"].includes(bodyPart) ? "upper" : "lower";
    
    createExerciseMutation.mutate({
      name: customExerciseName,
      bodyPart,
      category,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateSessionStats = () => {
    if (!currentWorkout) {
      return { exercises: 0, sets: 0, volume: 0 };
    }

    const exercises = currentWorkout.exercises.length;
    const sets = currentWorkout.exercises.reduce((total, ex) => total + ex.sets.length, 0);
    const volume = parseFloat(currentWorkout.totalVolume || "0");

    return { exercises, sets, volume };
  };

  const stats = calculateSessionStats();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Workout Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">
                {currentWorkoutId ? "Current Workout Session" : "New Workout Session"}
              </CardTitle>
              <div className="text-sm text-muted-foreground flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!currentWorkoutId ? (
              <Button
                onClick={startNewWorkout}
                disabled={createWorkoutMutation.isPending}
                className="w-full bg-primary text-primary-foreground"
                data-testid="button-start-workout"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start New Workout
              </Button>
            ) : (
              <>
                {/* Exercise Entry Form */}
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Add Exercise</h3>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="exerciseId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Exercise Name</FormLabel>
                              <Select onValueChange={(value) => {
                                if (value === "custom") {
                                  setShowCustomExercise(true);
                                  field.onChange("");
                                } else {
                                  setShowCustomExercise(false);
                                  field.onChange(value);
                                  const exercise = exercises.find(e => e.id === value);
                                  if (exercise) {
                                    form.setValue("bodyPart", exercise.bodyPart);
                                  }
                                }
                              }} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-exercise">
                                    <SelectValue placeholder="Select exercise" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {exercises.map((exercise) => (
                                    <SelectItem key={exercise.id} value={exercise.id}>
                                      {exercise.name}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="custom">+ Add Custom Exercise</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bodyPart"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Body Part</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-body-part">
                                    <SelectValue placeholder="Select body part" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Chest">Chest (Upper)</SelectItem>
                                  <SelectItem value="Back">Back (Upper)</SelectItem>
                                  <SelectItem value="Shoulders">Shoulders (Upper)</SelectItem>
                                  <SelectItem value="Arms">Arms (Upper)</SelectItem>
                                  <SelectItem value="Legs">Legs (Lower)</SelectItem>
                                  <SelectItem value="Core">Core (Lower)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weight (lbs)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="185"
                                  {...field}
                                  data-testid="input-weight"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="reps"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reps</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="10"
                                  {...field}
                                  data-testid="input-reps"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {showCustomExercise && (
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Custom exercise name"
                            value={customExerciseName}
                            onChange={(e) => setCustomExerciseName(e.target.value)}
                            data-testid="input-custom-exercise"
                          />
                          <Button
                            type="button"
                            onClick={handleCustomExercise}
                            disabled={createExerciseMutation.isPending}
                            data-testid="button-add-custom-exercise"
                          >
                            Add
                          </Button>
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground"
                        disabled={addSetMutation.isPending}
                        data-testid="button-add-set"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Set
                      </Button>
                    </form>
                  </Form>
                </div>

                {/* Current Session Exercises */}
                {currentWorkout && currentWorkout.exercises.length > 0 && (
                  <div className="space-y-4">
                    {currentWorkout.exercises.map((workoutExercise) => (
                      <div key={workoutExercise.id} className="bg-muted rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{workoutExercise.exercise.name}</h4>
                          <Badge variant={workoutExercise.exercise.category === "upper" ? "default" : "secondary"}>
                            {workoutExercise.exercise.bodyPart}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          {workoutExercise.sets.map((set) => (
                            <div key={set.id} className="flex items-center justify-between bg-background rounded p-2">
                              <span className="text-sm">Set {set.setNumber}</span>
                              <span className="text-sm font-medium">
                                {set.weight} lbs × {set.reps} reps
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {(parseFloat(set.weight) * set.reps).toLocaleString()} lbs
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Finish Workout */}
                {currentWorkout && currentWorkout.exercises.length > 0 && (
                  <Button
                    onClick={() => finishWorkoutMutation.mutate()}
                    disabled={finishWorkoutMutation.isPending}
                    className="w-full bg-success text-success-foreground"
                    data-testid="button-finish-workout"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Finish Workout
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Session Stats Sidebar */}
      <div className="space-y-6">
        {/* Session Timer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Timer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2" data-testid="text-session-timer">
                {formatTime(sessionTime)}
              </div>
              <p className="text-sm text-muted-foreground">Total Time</p>
            </div>
          </CardContent>
        </Card>

        {/* Rest Timer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rest Timer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-4" data-testid="text-rest-timer">
                {formatTime(restTime)}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[60, 90, 120, 180].map((seconds) => (
                  <Button
                    key={seconds}
                    variant="outline"
                    size="sm"
                    onClick={() => resetRest()}
                    className="text-xs"
                    data-testid={`button-rest-${seconds}`}
                  >
                    {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Stats */}
        {currentWorkoutId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Exercises</span>
                  <span className="font-semibold" data-testid="text-session-exercises">{stats.exercises}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sets</span>
                  <span className="font-semibold" data-testid="text-session-sets">{stats.sets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Volume</span>
                  <span className="font-semibold" data-testid="text-session-volume">
                    {stats.volume.toLocaleString()} lbs
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}