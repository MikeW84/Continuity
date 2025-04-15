import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Projects Schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  resources: text("resources"),
  progress: integer("progress").default(0),
  dueDate: timestamp("due_date"),
  isPriority: boolean("is_priority").default(false),
  userId: integer("user_id").notNull(),
});

// Project-Value Relations
export const projectValues = pgTable("project_values", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  valueId: integer("value_id").notNull().references(() => values.id, { onDelete: "cascade" }),
});

// Project-Dream Relations
export const projectDreams = pgTable("project_dreams", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  dreamId: integer("dream_id").notNull().references(() => dreams.id, { onDelete: "cascade" }),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  title: true,
  description: true,
  resources: true,
  progress: true,
  dueDate: true,
  isPriority: true,
  userId: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Define relations for projects
export const projectsRelations = relations(projects, ({ many }) => ({
  projectValues: many(projectValues),
  projectDreams: many(projectDreams)
}));

// Define relations for values through project_values
export const projectValuesRelations = relations(projectValues, ({ one }) => ({
  project: one(projects, {
    fields: [projectValues.projectId],
    references: [projects.id]
  }),
  value: one(values, {
    fields: [projectValues.valueId],
    references: [values.id]
  })
}));

// Define relations for dreams through project_dreams
export const projectDreamsRelations = relations(projectDreams, ({ one }) => ({
  project: one(projects, {
    fields: [projectDreams.projectId],
    references: [projects.id]
  }),
  dream: one(dreams, {
    fields: [projectDreams.dreamId],
    references: [dreams.id]
  })
}));

// Schema for the project with relations to values and dreams
export const projectWithRelationsSchema = insertProjectSchema.extend({
  valueIds: z.array(z.number()).optional(),
  dreamIds: z.array(z.number()).optional(),
  // Accept either a Date object or a date string for dueDate
  dueDate: z.union([
    z.date(),
    z.string().transform((str) => str ? new Date(str) : null)
  ]).optional().nullable(),
});

export type ProjectWithRelations = z.infer<typeof projectWithRelationsSchema>;

// Ideas Schema
export const ideas = pgTable("ideas", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  resources: text("resources"),
  votes: integer("votes").default(0),
  tags: text("tags").array(),
  userId: integer("user_id").notNull(),
});

export const insertIdeaSchema = createInsertSchema(ideas).pick({
  title: true,
  description: true,
  resources: true,
  votes: true,
  tags: true,
  userId: true,
});

export type InsertIdea = z.infer<typeof insertIdeaSchema>;
export type Idea = typeof ideas.$inferSelect;

// Learning Schema
export const learningItems = pgTable("learning_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category"),
  resources: text("resources"),
  progress: integer("progress").default(0),
  isCurrentlyLearning: boolean("is_currently_learning").default(false),
  userId: integer("user_id").notNull(),
});

export const insertLearningItemSchema = createInsertSchema(learningItems).pick({
  title: true,
  category: true,
  resources: true,
  progress: true,
  isCurrentlyLearning: true,
  userId: true,
});

export type InsertLearningItem = z.infer<typeof insertLearningItemSchema>;
export type LearningItem = typeof learningItems.$inferSelect;

// Habits Schema
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  completedDays: integer("completed_days").default(0),
  targetDays: integer("target_days").default(20), // Monthly target
  isCompletedToday: boolean("is_completed_today").default(false),
  userId: integer("user_id").notNull(),
});

// Habit Completions Schema - for tracking individual days with simple integer days
export const habitCompletions = pgTable("habit_completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull().references(() => habits.id, { onDelete: "cascade" }),
  date: timestamp("date"), // Make this optional (we removed NOT NULL constraint)
  completed: boolean("completed").default(true),
  year: integer("year").notNull(),
  month: integer("month").notNull(), // 1-12
  day: integer("day").notNull(), // 1-31
});

export const insertHabitSchema = createInsertSchema(habits).pick({
  title: true,
  completedDays: true,
  targetDays: true,
  isCompletedToday: true,
  userId: true,
});

export const insertHabitCompletionSchema = createInsertSchema(habitCompletions).pick({
  habitId: true,
  date: true,
  completed: true,
  year: true,
  month: true,
  day: true,
});

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;
export type InsertHabitCompletion = z.infer<typeof insertHabitCompletionSchema>;
export type HabitCompletion = typeof habitCompletions.$inferSelect;

// Define relations for habits
export const habitsRelations = relations(habits, ({ many }) => ({
  completions: many(habitCompletions)
}));

// Define relations for habit completions
export const habitCompletionsRelations = relations(habitCompletions, ({ one }) => ({
  habit: one(habits, { fields: [habitCompletions.habitId], references: [habits.id] })
}));

// Exercise Schema
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: timestamp("date").notNull(),
  category: text("category").notNull(), // 'Cardio', 'Strength', 'Flexibility'
  // Optional fields that depend on the category
  time: integer("time"), // in minutes - for Cardio
  distance: integer("distance"), // in meters - for Cardio
  heartRate: integer("heart_rate"), // peak heart rate - for Cardio
  weight: integer("weight"), // in kg - for Strength
  reps: integer("reps"), // for Strength
  sets: integer("sets"), // for Strength
  duration: integer("duration"), // in minutes - for Flexibility
  musclesWorked: text("muscles_worked"), // for Flexibility
  userId: integer("user_id").notNull(),
});

// Exercise Completion Schema - for tracking which days exercises were completed
export const exerciseCompletions = pgTable("exercise_completions", {
  id: serial("id").primaryKey(),
  exerciseId: integer("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(), // 1-12
  day: integer("day").notNull(), // 1-31
  category: text("category").notNull(), // 'Cardio', 'Strength', 'Flexibility'
  userId: integer("user_id").notNull(),
});

// First create the base schema
const baseExerciseSchema = createInsertSchema(exercises).pick({
  name: true,
  date: true,
  category: true,
  time: true,
  distance: true,
  heartRate: true,
  weight: true,
  reps: true,
  sets: true,
  duration: true,
  musclesWorked: true,
  userId: true,
});

// Then extend it to handle string dates (similar to projectWithRelationsSchema)
export const insertExerciseSchema = baseExerciseSchema.extend({
  // Accept either a Date object or a date string for date
  date: z.union([
    z.date(),
    z.string().transform((str) => str ? new Date(str) : null)
  ]),
});

export const insertExerciseCompletionSchema = createInsertSchema(exerciseCompletions).pick({
  exerciseId: true,
  date: true,
  year: true,
  month: true,
  day: true,
  category: true,
  userId: true,
});

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type InsertExerciseCompletion = z.infer<typeof insertExerciseCompletionSchema>;
export type ExerciseCompletion = typeof exerciseCompletions.$inferSelect;

// Define relations for exercises
export const exercisesRelations = relations(exercises, ({ many }) => ({
  completions: many(exerciseCompletions)
}));

// Define relations for exercise completions
export const exerciseCompletionsRelations = relations(exerciseCompletions, ({ one }) => ({
  exercise: one(exercises, { fields: [exerciseCompletions.exerciseId], references: [exercises.id] })
}));

// Family Planning - Dates Schema
export const dateIdeas = pgTable("date_ideas", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date"),
  isScheduled: boolean("is_scheduled").default(false),
  userId: integer("user_id").notNull(),
});

export const insertDateIdeaSchema = createInsertSchema(dateIdeas).pick({
  title: true,
  description: true,
  date: true,
  isScheduled: true,
  userId: true,
});

export type InsertDateIdea = z.infer<typeof insertDateIdeaSchema>;
export type DateIdea = typeof dateIdeas.$inferSelect;

// Family Planning - Parenting Tasks Schema
export const parentingTasks = pgTable("parenting_tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  isCompleted: boolean("is_completed").default(false),
  userId: integer("user_id").notNull(),
});

export const insertParentingTaskSchema = createInsertSchema(parentingTasks).pick({
  title: true,
  description: true,
  isCompleted: true,
  userId: true,
});

export type InsertParentingTask = z.infer<typeof insertParentingTaskSchema>;
export type ParentingTask = typeof parentingTasks.$inferSelect;

// Values Schema
export const values = pgTable("values", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull(),
});

export const insertValueSchema = createInsertSchema(values).pick({
  title: true,
  description: true,
  userId: true,
});

export type InsertValue = z.infer<typeof insertValueSchema>;
export type Value = typeof values.$inferSelect;

// Define relations for values
export const valuesRelations = relations(values, ({ many }) => ({
  projectValues: many(projectValues)
}));

// Dreams Schema
export const dreams = pgTable("dreams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  tags: text("tags").array(),
  timeframe: text("timeframe"),
  userId: integer("user_id").notNull(),
});

export const insertDreamSchema = createInsertSchema(dreams).pick({
  title: true,
  description: true,
  tags: true,
  timeframe: true,
  userId: true,
});

export type InsertDream = z.infer<typeof insertDreamSchema>;
export type Dream = typeof dreams.$inferSelect;

// Define relations for dreams
export const dreamsRelations = relations(dreams, ({ many }) => ({
  projectDreams: many(projectDreams)
}));