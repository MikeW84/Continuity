import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  insertProjectSchema,
  insertProjectTaskSchema,
  insertIdeaSchema,
  insertLearningItemSchema,
  insertHabitSchema,
  insertExerciseSchema,
  insertExerciseCompletionSchema,
  insertDateIdeaSchema,
  insertParentingTaskSchema,
  insertValueSchema,
  insertDreamSchema,
  insertTodayTaskSchema,
  insertQuoteSchema,
  projectWithRelationsSchema,
  // Tables
  projects,
  projectValues,
  projectDreams,
  values,
  dreams,
  todayTasks,
  quotes
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  
  // Current user for development (normally would use authentication)
  const TEMP_USER_ID = 1;
  
  // Helper function to handle validation errors
  const validateRequest = (schema: any, data: any) => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw { status: 400, message: fromZodError(error).message };
      }
      throw error;
    }
  };

  // Helper function to calculate project progress based on tasks
  const calculateProjectProgress = async (projectId: number): Promise<number> => {
    const tasks = await storage.getProjectTasks(projectId);
    if (!tasks || tasks.length === 0) {
      return 0; // If no tasks, progress is 0%
    }
    
    const completedTasks = tasks.filter(task => task.isCompleted).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  // Authentication endpoint
  app.post("/api/login", async (req: Request, res: Response) => {
    console.log("[LOGIN] Received:", req.body);

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        console.log("[LOGIN] No user found for username:", username);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      console.log("[LOGIN] Found user in DB:", user);
      // Plain text password check (for now)
      if (user.password !== password) {
        console.log(`[LOGIN] Password mismatch. Entered: '${password}', DB: '${user.password}'`);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      // For now, just return a success (no token/session)
      return res.json({ success: true, user: { id: user.id, username: user.username, displayName: user.displayName, email: user.email } });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Projects endpoints
  app.get("/api/projects", async (req: Request, res: Response) => {
    // Get showArchived query parameter, defaults to false
    const showArchived = req.query.showArchived === 'true';
    
    const projects = await storage.getProjects(TEMP_USER_ID);
    
    // Filter projects based on archive status
    const filteredProjects = showArchived 
      ? projects 
      : projects.filter(project => !project.isArchived);
    
    // Get values, dreams, and calculate progress for each project
    const projectsWithRelations = await Promise.all(
      filteredProjects.map(async (project) => {
        // Get the associated value IDs
        const projectValueItems = await db.select().from(projectValues)
          .where(eq(projectValues.projectId, project.id));
        const valueIds = projectValueItems.map(pv => pv.valueId);
        
        // Get the associated dream IDs
        const projectDreamItems = await db.select().from(projectDreams)
          .where(eq(projectDreams.projectId, project.id));
        const dreamIds = projectDreamItems.map(pd => pd.dreamId);
        
        // Calculate current progress based on completed tasks
        const progress = await calculateProjectProgress(project.id);
        
        return { ...project, valueIds, dreamIds, progress };
      })
    );
    
    res.json(projectsWithRelations);
  });
  
  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const project = await storage.getProject(id);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Get the associated value IDs
    const projectValueItems = await db.select().from(projectValues)
      .where(eq(projectValues.projectId, project.id));
    const valueIds = projectValueItems.map(pv => pv.valueId);
    
    // Get the associated dream IDs
    const projectDreamItems = await db.select().from(projectDreams)
      .where(eq(projectDreams.projectId, project.id));
    const dreamIds = projectDreamItems.map(pd => pd.dreamId);
    
    // Calculate current progress based on completed tasks
    const progress = await calculateProjectProgress(id);
    
    const projectWithRelations = { ...project, valueIds, dreamIds, progress };
    
    res.json(projectWithRelations);
  });
  
  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      console.log("Received project data:", req.body);
      
      // Use the projectWithRelationsSchema for validation to handle valueIds and dreamIds
      // Use the userId from the request if provided, otherwise use TEMP_USER_ID
      const projectData = validateRequest(projectWithRelationsSchema, {
        ...req.body,
        userId: req.body.userId || TEMP_USER_ID
      });
      
      console.log("Validated project data:", projectData);
      
      const newProject = await storage.createProject(projectData);
      console.log("Created new project:", newProject);
      
      res.status(201).json(newProject);
    } catch (error: any) {
      console.error("Error creating project:", error);
      res.status(400).json({ error: error.message || 'Unknown error' });
    }
  });
  
  app.patch("/api/projects/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const projectData = validateRequest(projectWithRelationsSchema.partial(), req.body);
    
    const updatedProject = await storage.updateProject(id, projectData);
    
    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.json(updatedProject);
  });
  
  app.delete("/api/projects/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteProject(id);
    
    if (!success) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.status(204).send();
  });
  
  app.post("/api/projects/:id/priority", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const project = await storage.setPriorityProject(id, TEMP_USER_ID);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.json(project);
  });
  
  // Toggle project archive status
  app.post("/api/projects/:id/archive", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const project = await storage.toggleProjectArchive(id);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.json(project);
  });
  
  // Project Task endpoints
  // Get all tasks for a project
  app.get("/api/projects/:projectId/tasks", async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    const tasks = await storage.getProjectTasks(projectId);
    res.json(tasks);
  });
  
  // Get a specific task
  app.get("/api/project-tasks/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const task = await storage.getProjectTask(id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.json(task);
  });
  
  // Create a new task
  app.post("/api/project-tasks", async (req: Request, res: Response) => {
    try {
      const taskData = validateRequest(insertProjectTaskSchema, req.body);
      const task = await storage.createProjectTask(taskData);
      
      // Calculate and update the project's progress
      const progress = await calculateProjectProgress(task.projectId);
      
      // Update the project's progress in the database
      await db.update(projects)
        .set({ progress })
        .where(eq(projects.id, task.projectId));
      
      res.status(201).json(task);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });
  
  // Update a task
  app.patch("/api/project-tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const taskData = validateRequest(insertProjectTaskSchema.partial(), req.body);
      const task = await storage.updateProjectTask(id, taskData);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });
  
  // Delete a task
  app.delete("/api/project-tasks/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    // Get the task first to know which project to update
    const task = await storage.getProjectTask(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    const projectId = task.projectId;
    const success = await storage.deleteProjectTask(id);
    
    if (!success) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    // Calculate and update the project's progress after deletion
    const progress = await calculateProjectProgress(projectId);
    
    // Update the project's progress in the database
    await db.update(projects)
      .set({ progress })
      .where(eq(projects.id, projectId));
    
    res.status(204).send();
  });
  
  // Toggle task completion status
  app.post("/api/project-tasks/:id/toggle", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const task = await storage.toggleProjectTaskCompletion(id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    // Calculate the updated progress for the project after toggling the task
    const progress = await calculateProjectProgress(task.projectId);
    
    // Update the project's progress in the database (silently)
    await db.update(projects)
      .set({ progress })
      .where(eq(projects.id, task.projectId));
    
    res.json(task);
  });
  
  // Ideas endpoints
  app.get("/api/ideas", async (req: Request, res: Response) => {
    const ideas = await storage.getIdeas(TEMP_USER_ID);
    res.json(ideas);
  });
  
  app.get("/api/ideas/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const idea = await storage.getIdea(id);
    
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }
    
    res.json(idea);
  });
  
  app.post("/api/ideas", async (req: Request, res: Response) => {
    try {
      console.log("Received idea data:", req.body);
      
      const ideaData = validateRequest(insertIdeaSchema, {
        ...req.body,
        userId: req.body.userId || TEMP_USER_ID
      });
      
      console.log("Validated idea data:", ideaData);
      
      const newIdea = await storage.createIdea(ideaData);
      console.log("Created new idea:", newIdea);
      
      res.status(201).json(newIdea);
    } catch (error: any) {
      console.error("Error creating idea:", error);
      res.status(400).json({ error: error.message || 'Unknown error' });
    }
  });
  
  app.patch("/api/ideas/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const ideaData = req.body;
    
    const updatedIdea = await storage.updateIdea(id, ideaData);
    
    if (!updatedIdea) {
      return res.status(404).json({ message: "Idea not found" });
    }
    
    res.json(updatedIdea);
  });
  
  app.delete("/api/ideas/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteIdea(id);
    
    if (!success) {
      return res.status(404).json({ message: "Idea not found" });
    }
    
    res.status(204).send();
  });
  
  app.post("/api/ideas/:id/vote", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { upvote } = req.body;
    
    const idea = await storage.voteIdea(id, upvote);
    
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }
    
    res.json(idea);
  });
  
  // Learning Items endpoints
  app.get("/api/learning", async (req: Request, res: Response) => {
    const learningItems = await storage.getLearningItems(TEMP_USER_ID);
    res.json(learningItems);
  });
  
  app.get("/api/learning/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const learningItem = await storage.getLearningItem(id);
    
    if (!learningItem) {
      return res.status(404).json({ message: "Learning item not found" });
    }
    
    res.json(learningItem);
  });
  
  app.post("/api/learning", async (req: Request, res: Response) => {
    const learningItemData = validateRequest(insertLearningItemSchema, {
      ...req.body,
      userId: req.body.userId || TEMP_USER_ID
    });
    
    const newLearningItem = await storage.createLearningItem(learningItemData);
    res.status(201).json(newLearningItem);
  });
  
  app.patch("/api/learning/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const learningItemData = req.body;
    
    const updatedLearningItem = await storage.updateLearningItem(id, learningItemData);
    
    if (!updatedLearningItem) {
      return res.status(404).json({ message: "Learning item not found" });
    }
    
    res.json(updatedLearningItem);
  });
  
  app.delete("/api/learning/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteLearningItem(id);
    
    if (!success) {
      return res.status(404).json({ message: "Learning item not found" });
    }
    
    res.status(204).send();
  });
  
  // Habits endpoints
  app.get("/api/habits", async (req: Request, res: Response) => {
    const habits = await storage.getHabits(TEMP_USER_ID);
    res.json(habits);
  });
  
  app.get("/api/habits/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const habit = await storage.getHabit(id);
    
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    
    res.json(habit);
  });
  
  app.post("/api/habits", async (req: Request, res: Response) => {
    const habitData = validateRequest(insertHabitSchema, {
      ...req.body,
      userId: req.body.userId || TEMP_USER_ID
    });
    
    const newHabit = await storage.createHabit(habitData);
    res.status(201).json(newHabit);
  });
  
  app.patch("/api/habits/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const habitData = req.body;
    
    const updatedHabit = await storage.updateHabit(id, habitData);
    
    if (!updatedHabit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    
    res.json(updatedHabit);
  });
  
  app.delete("/api/habits/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteHabit(id);
    
    if (!success) {
      return res.status(404).json({ message: "Habit not found" });
    }
    
    res.status(204).send();
  });
  
  app.post("/api/habits/:id/toggle", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const habit = await storage.toggleHabitCompletion(id);
    
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    
    res.json(habit);
  });
  
  // Get habit completions for a specific month
  app.get("/api/habits/:id/completions/:year/:month", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    
    const completions = await storage.getHabitCompletions(id, year, month);
    res.json(completions);
  });
  
  // Toggle habit completion using just year, month, and day integers
  app.post("/api/habits/:id/toggle-day", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { year, month, day } = req.body;
    
    if (!year || !month || !day) {
      return res.status(400).json({ message: "Year, month and day are all required" });
    }
    
    console.log(`Toggling habit day: ${year}-${month}-${day}`);
    
    const completion = await storage.toggleHabitDay(id, year, month, day);
    
    if (!completion) {
      return res.status(404).json({ message: "Habit not found" });
    }
    
    res.json(completion);
  });
  
  // Exercise endpoints
  app.get("/api/exercises", async (req: Request, res: Response) => {
    const exercises = await storage.getExercises(TEMP_USER_ID);
    res.json(exercises);
  });
  
  app.get("/api/exercises/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const exercise = await storage.getExercise(id);
    
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    
    res.json(exercise);
  });
  
  app.post("/api/exercises", async (req: Request, res: Response) => {
    try {
      // Store date as a string in YYYY-MM-DD format only
      let modifiedBody = { ...req.body };
      
      // If date is provided as a Date object, convert it to string
      if (modifiedBody.date instanceof Date) {
        // Get the date portion only in YYYY-MM-DD format
        modifiedBody.date = modifiedBody.date.toISOString().split('T')[0];
      }
      
      const exerciseData = validateRequest(insertExerciseSchema, {
        ...modifiedBody,
        userId: modifiedBody.userId || TEMP_USER_ID
      });
      
      const newExercise = await storage.createExercise(exerciseData);
      res.status(201).json(newExercise);
    } catch (error) {
      console.error('Error creating exercise:', error);
      res.status(500).json({ 
        message: "Failed to create exercise",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.patch("/api/exercises/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Store date as a string in YYYY-MM-DD format only
      let exerciseData = { ...req.body };
      
      // If date is provided as a Date object, convert it to string
      if (exerciseData.date instanceof Date) {
        // Get the date portion only in YYYY-MM-DD format
        exerciseData.date = exerciseData.date.toISOString().split('T')[0];
      }
      
      const updatedExercise = await storage.updateExercise(id, exerciseData);
      
      if (!updatedExercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(updatedExercise);
    } catch (error) {
      console.error('Error updating exercise:', error);
      res.status(500).json({ 
        message: "Failed to update exercise",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.delete("/api/exercises/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteExercise(id);
      
      if (!success) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting exercise:', error);
      res.status(500).json({ 
        message: "Failed to delete exercise",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Exercise Completion endpoints
  app.get("/api/exercise-completions/:year/:month", async (req: Request, res: Response) => {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    
    const completions = await storage.getExerciseCompletions(year, month, TEMP_USER_ID);
    res.json(completions);
  });
  
  app.post("/api/exercise-completions", async (req: Request, res: Response) => {
    const completionData = validateRequest(insertExerciseCompletionSchema, {
      ...req.body,
      userId: req.body.userId || TEMP_USER_ID
    });
    
    const newCompletion = await storage.createExerciseCompletion(completionData);
    res.status(201).json(newCompletion);
  });
  
  // Date Ideas endpoints
  app.get("/api/date-ideas", async (req: Request, res: Response) => {
    const dateIdeas = await storage.getDateIdeas(TEMP_USER_ID);
    res.json(dateIdeas);
  });
  
  app.get("/api/date-ideas/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const dateIdea = await storage.getDateIdea(id);
    
    if (!dateIdea) {
      return res.status(404).json({ message: "Date idea not found" });
    }
    
    res.json(dateIdea);
  });
  
  app.post("/api/date-ideas", async (req: Request, res: Response) => {
    const dateIdeaData = validateRequest(insertDateIdeaSchema, {
      ...req.body,
      userId: req.body.userId || TEMP_USER_ID
    });
    
    const newDateIdea = await storage.createDateIdea(dateIdeaData);
    res.status(201).json(newDateIdea);
  });
  
  app.patch("/api/date-ideas/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const dateIdeaData = req.body;
    
    const updatedDateIdea = await storage.updateDateIdea(id, dateIdeaData);
    
    if (!updatedDateIdea) {
      return res.status(404).json({ message: "Date idea not found" });
    }
    
    res.json(updatedDateIdea);
  });
  
  app.delete("/api/date-ideas/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteDateIdea(id);
    
    if (!success) {
      return res.status(404).json({ message: "Date idea not found" });
    }
    
    res.status(204).send();
  });
  
  // Parenting Tasks endpoints
  app.get("/api/parenting-tasks", async (req: Request, res: Response) => {
    const parentingTasks = await storage.getParentingTasks(TEMP_USER_ID);
    res.json(parentingTasks);
  });
  
  app.get("/api/parenting-tasks/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const parentingTask = await storage.getParentingTask(id);
    
    if (!parentingTask) {
      return res.status(404).json({ message: "Parenting task not found" });
    }
    
    res.json(parentingTask);
  });
  
  app.post("/api/parenting-tasks", async (req: Request, res: Response) => {
    const parentingTaskData = validateRequest(insertParentingTaskSchema, {
      ...req.body,
      userId: req.body.userId || TEMP_USER_ID
    });
    
    const newParentingTask = await storage.createParentingTask(parentingTaskData);
    res.status(201).json(newParentingTask);
  });
  
  app.patch("/api/parenting-tasks/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const parentingTaskData = req.body;
    
    const updatedParentingTask = await storage.updateParentingTask(id, parentingTaskData);
    
    if (!updatedParentingTask) {
      return res.status(404).json({ message: "Parenting task not found" });
    }
    
    res.json(updatedParentingTask);
  });
  
  app.delete("/api/parenting-tasks/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteParentingTask(id);
    
    if (!success) {
      return res.status(404).json({ message: "Parenting task not found" });
    }
    
    res.status(204).send();
  });
  
  app.post("/api/parenting-tasks/:id/toggle", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const task = await storage.toggleParentingTaskCompletion(id);
    
    if (!task) {
      return res.status(404).json({ message: "Parenting task not found" });
    }
    
    res.json(task);
  });
  
  // Values endpoints
  app.get("/api/values", async (req: Request, res: Response) => {
    const values = await storage.getValues(TEMP_USER_ID);
    res.json(values);
  });
  
  app.get("/api/values/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const value = await storage.getValue(id);
    
    if (!value) {
      return res.status(404).json({ message: "Value not found" });
    }
    
    res.json(value);
  });
  
  app.post("/api/values", async (req: Request, res: Response) => {
    const valueData = validateRequest(insertValueSchema, {
      ...req.body,
      userId: req.body.userId || TEMP_USER_ID
    });
    
    const newValue = await storage.createValue(valueData);
    res.status(201).json(newValue);
  });
  
  app.patch("/api/values/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const valueData = req.body;
    
    const updatedValue = await storage.updateValue(id, valueData);
    
    if (!updatedValue) {
      return res.status(404).json({ message: "Value not found" });
    }
    
    res.json(updatedValue);
  });
  
  app.delete("/api/values/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteValue(id);
    
    if (!success) {
      return res.status(404).json({ message: "Value not found" });
    }
    
    res.status(204).send();
  });
  
  // Dreams endpoints
  app.get("/api/dreams", async (req: Request, res: Response) => {
    const dreams = await storage.getDreams(TEMP_USER_ID);
    res.json(dreams);
  });
  
  app.get("/api/dreams/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const dream = await storage.getDream(id);
    
    if (!dream) {
      return res.status(404).json({ message: "Dream not found" });
    }
    
    res.json(dream);
  });
  
  app.post("/api/dreams", async (req: Request, res: Response) => {
    const dreamData = validateRequest(insertDreamSchema, {
      ...req.body,
      userId: req.body.userId || TEMP_USER_ID
    });
    
    const newDream = await storage.createDream(dreamData);
    res.status(201).json(newDream);
  });
  
  app.patch("/api/dreams/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const dreamData = req.body;
    
    const updatedDream = await storage.updateDream(id, dreamData);
    
    if (!updatedDream) {
      return res.status(404).json({ message: "Dream not found" });
    }
    
    res.json(updatedDream);
  });
  
  app.delete("/api/dreams/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteDream(id);
    
    if (!success) {
      return res.status(404).json({ message: "Dream not found" });
    }
    
    res.status(204).send();
  });
  
  // Today Tasks API endpoints
  
  // Get all today tasks
  app.get("/api/today-tasks", async (req: Request, res: Response) => {
    try {
      const userId = TEMP_USER_ID;
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const tasks = await storage.getTodayTasks(userId, date);
      res.status(200).json(tasks);
    } catch (error) {
      console.error("Error getting today tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Get priority tasks
  app.get("/api/today-tasks/priority", async (req: Request, res: Response) => {
    try {
      const userId = TEMP_USER_ID;
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const tasks = await storage.getPriorityTasks(userId, date);
      res.status(200).json(tasks);
    } catch (error) {
      console.error("Error getting priority tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Get regular tasks
  app.get("/api/today-tasks/regular", async (req: Request, res: Response) => {
    try {
      const userId = TEMP_USER_ID;
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const tasks = await storage.getRegularTasks(userId, date);
      res.status(200).json(tasks);
    } catch (error) {
      console.error("Error getting regular tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Get a specific today task
  app.get("/api/today-tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTodayTask(id);
      
      if (task) {
        res.status(200).json(task);
      } else {
        res.status(404).json({ error: "Task not found" });
      }
    } catch (error) {
      console.error("Error getting today task:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Create a new today task
  app.post("/api/today-tasks", async (req: Request, res: Response) => {
    try {
      const taskData = validateRequest(insertTodayTaskSchema, {
        ...req.body,
        userId: req.body.userId || TEMP_USER_ID
      });
      
      const task = await storage.createTodayTask(taskData);
      res.status(201).json(task);
    } catch (error: any) {
      console.error("Error creating today task:", error);
      res.status(error.status || 500).json({ error: error.message || "Internal server error" });
    }
  });
  
  // Update a today task
  app.patch("/api/today-tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const taskData = validateRequest(insertTodayTaskSchema.partial(), req.body);
      const task = await storage.updateTodayTask(id, taskData);
      
      if (task) {
        res.status(200).json(task);
      } else {
        res.status(404).json({ error: "Task not found" });
      }
    } catch (error: any) {
      console.error("Error updating today task:", error);
      res.status(error.status || 500).json({ error: error.message || "Internal server error" });
    }
  });
  
  // Delete a today task
  app.delete("/api/today-tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteTodayTask(id);
      
      if (result) {
        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ error: "Task not found" });
      }
    } catch (error) {
      console.error("Error deleting today task:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Toggle completion status of a today task
  app.post("/api/today-tasks/:id/toggle", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.toggleTodayTaskCompletion(id);
      
      if (task) {
        res.status(200).json(task);
      } else {
        res.status(404).json({ error: "Task not found" });
      }
    } catch (error) {
      console.error("Error toggling today task completion:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Update priorities of today tasks
  app.post("/api/today-tasks/:id/priority", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { isPriority } = req.body;
      
      if (isPriority === undefined) {
        return res.status(400).json({ error: "isPriority field is required" });
      }
      
      const task = await storage.setTaskPriority(id, isPriority);
      
      if (task) {
        res.status(200).json(task);
      } else {
        res.status(404).json({ error: "Task not found" });
      }
    } catch (error) {
      console.error("Error updating today task priority:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Update order of today tasks
  app.post("/api/today-tasks/reorder", async (req: Request, res: Response) => {
    try {
      const { taskIds } = req.body;
      
      if (!taskIds || !Array.isArray(taskIds)) {
        return res.status(400).json({ error: "taskIds array is required" });
      }
      
      const result = await storage.updateTodayTaskPositions(taskIds);
      
      if (result) {
        res.status(200).json({ success: true });
      } else {
        res.status(500).json({ error: "Failed to update task positions" });
      }
    } catch (error) {
      console.error("Error reordering today tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Quotes endpoints
  app.get("/api/quotes", async (req: Request, res: Response) => {
    const quotes = await storage.getQuotes(TEMP_USER_ID);
    res.json(quotes);
  });
  
  app.get("/api/quotes/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const quote = await storage.getQuote(id);
    
    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }
    
    res.json(quote);
  });
  
  app.post("/api/quotes", async (req: Request, res: Response) => {
    try {
      const quoteData = validateRequest(insertQuoteSchema, {
        ...req.body,
        userId: req.body.userId || TEMP_USER_ID
      });
      
      const newQuote = await storage.createQuote(quoteData);
      res.status(201).json(newQuote);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  });
  
  app.patch("/api/quotes/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const quoteData = validateRequest(insertQuoteSchema.partial(), req.body);
    
    const updatedQuote = await storage.updateQuote(id, quoteData);
    
    if (!updatedQuote) {
      return res.status(404).json({ message: "Quote not found" });
    }
    
    res.json(updatedQuote);
  });
  
  app.delete("/api/quotes/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteQuote(id);
    
    if (!success) {
      return res.status(404).json({ message: "Quote not found" });
    }
    
    res.status(204).send();
  });

  const httpServer = createServer(app);
  return httpServer;
}
