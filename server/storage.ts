import { 
  type Workout, 
  type InsertWorkout,
  type Exercise,
  type InsertExercise,
  type WorkoutExercise,
  type InsertWorkoutExercise,
  type Set,
  type InsertSet,
  type WorkoutWithDetails,
  type ExerciseProgress
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Workouts
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  getWorkout(id: string): Promise<WorkoutWithDetails | undefined>;
  getAllWorkouts(): Promise<WorkoutWithDetails[]>;
  updateWorkout(id: string, workout: Partial<InsertWorkout>): Promise<Workout | undefined>;
  deleteWorkout(id: string): Promise<boolean>;

  // Exercises
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  getExercise(id: string): Promise<Exercise | undefined>;
  getAllExercises(): Promise<Exercise[]>;
  getExercisesByBodyPart(bodyPart: string): Promise<Exercise[]>;

  // Workout Exercises
  addExerciseToWorkout(workoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise>;
  getWorkoutExercises(workoutId: string): Promise<WorkoutExercise[]>;

  // Sets
  addSet(set: InsertSet): Promise<Set>;
  getSetsByWorkoutExercise(workoutExerciseId: string): Promise<Set[]>;
  updateSet(id: string, set: Partial<InsertSet>): Promise<Set | undefined>;
  deleteSet(id: string): Promise<boolean>;

  // Statistics
  getWorkoutStats(timeframe?: 'week' | 'month' | 'all'): Promise<{
    totalWorkouts: number;
    totalVolume: number;
    avgDuration: number;
    bodyPartDistribution: { bodyPart: string; count: number }[];
  }>;
  getExerciseProgress(exerciseId: string): Promise<ExerciseProgress | undefined>;
}

export class MemStorage implements IStorage {
  private workouts: Map<string, Workout>;
  private exercises: Map<string, Exercise>;
  private workoutExercises: Map<string, WorkoutExercise>;
  private sets: Map<string, Set>;

  constructor() {
    this.workouts = new Map();
    this.exercises = new Map();
    this.workoutExercises = new Map();
    this.sets = new Map();
    this.initializeDefaultExercises();
  }

  private initializeDefaultExercises() {
    const defaultExercises = [
      { name: "Bench Press", bodyPart: "Chest", category: "upper", isCustom: false },
      { name: "Squat", bodyPart: "Legs", category: "lower", isCustom: false },
      { name: "Deadlift", bodyPart: "Back", category: "lower", isCustom: false },
      { name: "Overhead Press", bodyPart: "Shoulders", category: "upper", isCustom: false },
      { name: "Barbell Row", bodyPart: "Back", category: "upper", isCustom: false },
      { name: "Pull-ups", bodyPart: "Back", category: "upper", isCustom: false },
      { name: "Dips", bodyPart: "Chest", category: "upper", isCustom: false },
      { name: "Bicep Curls", bodyPart: "Arms", category: "upper", isCustom: false },
      { name: "Tricep Extensions", bodyPart: "Arms", category: "upper", isCustom: false },
      { name: "Lunges", bodyPart: "Legs", category: "lower", isCustom: false },
    ];

    defaultExercises.forEach(exercise => {
      const id = randomUUID();
      this.exercises.set(id, { ...exercise, id });
    });
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const id = randomUUID();
    const workout: Workout = { ...insertWorkout, id };
    this.workouts.set(id, workout);
    return workout;
  }

  async getWorkout(id: string): Promise<WorkoutWithDetails | undefined> {
    const workout = this.workouts.get(id);
    if (!workout) return undefined;

    const workoutExercises = Array.from(this.workoutExercises.values())
      .filter(we => we.workoutId === id)
      .sort((a, b) => a.order - b.order);

    const exercises = await Promise.all(
      workoutExercises.map(async (we) => {
        const exercise = this.exercises.get(we.exerciseId);
        const sets = Array.from(this.sets.values())
          .filter(s => s.workoutExerciseId === we.id)
          .sort((a, b) => a.setNumber - b.setNumber);
        
        return {
          ...we,
          exercise: exercise!,
          sets,
        };
      })
    );

    return { ...workout, exercises };
  }

  async getAllWorkouts(): Promise<WorkoutWithDetails[]> {
    const workoutIds = Array.from(this.workouts.keys());
    const workouts = await Promise.all(
      workoutIds.map(id => this.getWorkout(id))
    );
    return workouts.filter(w => w !== undefined) as WorkoutWithDetails[];
  }

  async updateWorkout(id: string, updateData: Partial<InsertWorkout>): Promise<Workout | undefined> {
    const existing = this.workouts.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updateData };
    this.workouts.set(id, updated);
    return updated;
  }

  async deleteWorkout(id: string): Promise<boolean> {
    return this.workouts.delete(id);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const exercise: Exercise = { ...insertExercise, id };
    this.exercises.set(id, exercise);
    return exercise;
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async getAllExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExercisesByBodyPart(bodyPart: string): Promise<Exercise[]> {
    return Array.from(this.exercises.values())
      .filter(e => e.bodyPart.toLowerCase() === bodyPart.toLowerCase());
  }

  async addExerciseToWorkout(insertWorkoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise> {
    const id = randomUUID();
    const workoutExercise: WorkoutExercise = { ...insertWorkoutExercise, id };
    this.workoutExercises.set(id, workoutExercise);
    return workoutExercise;
  }

  async getWorkoutExercises(workoutId: string): Promise<WorkoutExercise[]> {
    return Array.from(this.workoutExercises.values())
      .filter(we => we.workoutId === workoutId);
  }

  async addSet(insertSet: InsertSet): Promise<Set> {
    const id = randomUUID();
    const set: Set = { ...insertSet, id };
    this.sets.set(id, set);
    return set;
  }

  async getSetsByWorkoutExercise(workoutExerciseId: string): Promise<Set[]> {
    return Array.from(this.sets.values())
      .filter(s => s.workoutExerciseId === workoutExerciseId)
      .sort((a, b) => a.setNumber - b.setNumber);
  }

  async updateSet(id: string, updateData: Partial<InsertSet>): Promise<Set | undefined> {
    const existing = this.sets.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updateData };
    this.sets.set(id, updated);
    return updated;
  }

  async deleteSet(id: string): Promise<boolean> {
    return this.sets.delete(id);
  }

  async getWorkoutStats(timeframe: 'week' | 'month' | 'all' = 'all') {
    const workouts = Array.from(this.workouts.values());
    const now = new Date();
    let filteredWorkouts = workouts;

    if (timeframe === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredWorkouts = workouts.filter(w => new Date(w.startTime) >= weekAgo);
    } else if (timeframe === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredWorkouts = workouts.filter(w => new Date(w.startTime) >= monthAgo);
    }

    const totalWorkouts = filteredWorkouts.length;
    const totalVolume = filteredWorkouts.reduce((sum, w) => sum + parseFloat(w.totalVolume || "0"), 0);
    const avgDuration = totalWorkouts > 0 ? 
      filteredWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / totalWorkouts : 0;

    // Get body part distribution
    const bodyPartCounts = new Map<string, number>();
    
    for (const workout of filteredWorkouts) {
      const workoutExercises = Array.from(this.workoutExercises.values())
        .filter(we => we.workoutId === workout.id);
      
      for (const we of workoutExercises) {
        const exercise = this.exercises.get(we.exerciseId);
        if (exercise) {
          const count = bodyPartCounts.get(exercise.bodyPart) || 0;
          bodyPartCounts.set(exercise.bodyPart, count + 1);
        }
      }
    }

    const bodyPartDistribution = Array.from(bodyPartCounts.entries())
      .map(([bodyPart, count]) => ({ bodyPart, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalWorkouts,
      totalVolume,
      avgDuration: Math.round(avgDuration / 60), // Convert to minutes
      bodyPartDistribution,
    };
  }

  async getExerciseProgress(exerciseId: string): Promise<ExerciseProgress | undefined> {
    const exercise = this.exercises.get(exerciseId);
    if (!exercise) return undefined;

    const workoutExercises = Array.from(this.workoutExercises.values())
      .filter(we => we.exerciseId === exerciseId);

    const progressData: { date: string; weight: number; volume: number }[] = [];
    let maxWeight = 0;
    let totalVolume = 0;

    for (const we of workoutExercises) {
      const workout = this.workouts.get(we.workoutId);
      const sets = this.sets.has(we.id) ? 
        Array.from(this.sets.values()).filter(s => s.workoutExerciseId === we.id) : [];

      if (workout && sets.length > 0) {
        const sessionMaxWeight = Math.max(...sets.map(s => parseFloat(s.weight)));
        const sessionVolume = sets.reduce((sum, s) => sum + parseFloat(s.weight) * s.reps, 0);
        
        maxWeight = Math.max(maxWeight, sessionMaxWeight);
        totalVolume += sessionVolume;

        progressData.push({
          date: workout.startTime.toISOString().split('T')[0],
          weight: sessionMaxWeight,
          volume: sessionVolume,
        });
      }
    }

    progressData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      exerciseId,
      exerciseName: exercise.name,
      maxWeight,
      totalVolume,
      progressData,
    };
  }
}

export const storage = new MemStorage();
