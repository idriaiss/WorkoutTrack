import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workouts = pgTable("workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  totalVolume: decimal("total_volume", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
});

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  bodyPart: text("body_part").notNull(),
  category: text("category").notNull(), // "upper" or "lower"
  isCustom: boolean("is_custom").default(false),
});

export const workoutExercises = pgTable("workout_exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutId: varchar("workout_id").notNull(),
  exerciseId: varchar("exercise_id").notNull(),
  order: integer("order").notNull(),
});

export const sets = pgTable("sets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutExerciseId: varchar("workout_exercise_id").notNull(),
  setNumber: integer("set_number").notNull(),
  weight: decimal("weight", { precision: 6, scale: 2 }).notNull(),
  reps: integer("reps").notNull(),
  restTime: integer("rest_time"), // in seconds
});

// Insert schemas
export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
}).extend({
  startTime: z.string().transform((val) => new Date(val)),
  endTime: z.string().transform((val) => new Date(val)).optional(),
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercises).omit({
  id: true,
});

export const insertSetSchema = createInsertSchema(sets).omit({
  id: true,
});

// Types
export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type InsertWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;

export type Set = typeof sets.$inferSelect;
export type InsertSet = z.infer<typeof insertSetSchema>;

// Extended types for API responses
export type WorkoutWithDetails = Workout & {
  exercises: (WorkoutExercise & {
    exercise: Exercise;
    sets: Set[];
  })[];
};

export type ExerciseProgress = {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  totalVolume: number;
  progressData: {
    date: string;
    weight: number;
    volume: number;
  }[];
};
