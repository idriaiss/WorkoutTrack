import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWorkoutSchema, insertExerciseSchema, insertSetSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Workouts
  app.get("/api/workouts", async (req, res) => {
    try {
      const workouts = await storage.getAllWorkouts();
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.get("/api/workouts/:id", async (req, res) => {
    try {
      const workout = await storage.getWorkout(req.params.id);
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.json(workout);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout" });
    }
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      const workoutData = insertWorkoutSchema.parse(req.body);
      const workout = await storage.createWorkout(workoutData);
      res.status(201).json(workout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workout data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workout" });
    }
  });

  app.patch("/api/workouts/:id", async (req, res) => {
    try {
      const updateData = insertWorkoutSchema.partial().parse(req.body);
      const workout = await storage.updateWorkout(req.params.id, updateData);
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.json(workout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workout data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update workout" });
    }
  });

  app.delete("/api/workouts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteWorkout(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete workout" });
    }
  });

  // Exercises
  app.get("/api/exercises", async (req, res) => {
    try {
      const exercises = await storage.getAllExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.post("/api/exercises", async (req, res) => {
    try {
      const exerciseData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(exerciseData);
      res.status(201).json(exercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid exercise data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create exercise" });
    }
  });

  // Workout Exercises
  app.post("/api/workouts/:workoutId/exercises", async (req, res) => {
    try {
      const workoutExerciseData = {
        workoutId: req.params.workoutId,
        exerciseId: req.body.exerciseId,
        order: req.body.order || 1,
      };
      const workoutExercise = await storage.addExerciseToWorkout(workoutExerciseData);
      res.status(201).json(workoutExercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to add exercise to workout" });
    }
  });

  // Sets
  app.post("/api/workout-exercises/:workoutExerciseId/sets", async (req, res) => {
    try {
      const setData = insertSetSchema.parse({
        ...req.body,
        workoutExerciseId: req.params.workoutExerciseId,
      });
      const set = await storage.addSet(setData);
      
      // Update workout total volume
      const workoutExercise = await storage.getWorkoutExercises(setData.workoutExerciseId);
      if (workoutExercise.length > 0) {
        const workout = await storage.getWorkout(workoutExercise[0].workoutId);
        if (workout) {
          const newVolume = parseFloat(setData.weight) * setData.reps;
          const currentVolume = parseFloat(workout.totalVolume || "0");
          await storage.updateWorkout(workout.id, {
            totalVolume: (currentVolume + newVolume).toString(),
          });
        }
      }
      
      res.status(201).json(set);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid set data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add set" });
    }
  });

  // Statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const timeframe = req.query.timeframe as 'week' | 'month' | 'all' || 'all';
      const stats = await storage.getWorkoutStats(timeframe);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.get("/api/exercises/:id/progress", async (req, res) => {
    try {
      const progress = await storage.getExerciseProgress(req.params.id);
      if (!progress) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise progress" });
    }
  });

  // CSV Export
  app.get("/api/export/csv", async (req, res) => {
    try {
      const workouts = await storage.getAllWorkouts();
      
      // Create CSV data
      const csvData = [];
      csvData.push(['Date', 'Workout', 'Exercise', 'Body Part', 'Set', 'Weight', 'Reps', 'Volume']);
      
      for (const workout of workouts) {
        for (const exercise of workout.exercises) {
          for (const set of exercise.sets) {
            csvData.push([
              workout.startTime.toISOString().split('T')[0],
              workout.name,
              exercise.exercise.name,
              exercise.exercise.bodyPart,
              set.setNumber.toString(),
              set.weight,
              set.reps.toString(),
              (parseFloat(set.weight) * set.reps).toString()
            ]);
          }
        }
      }
      
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="workout-data.csv"');
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to export CSV" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
