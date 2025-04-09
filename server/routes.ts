import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  insertProjectSchema,
  insertIdeaSchema,
  insertLearningItemSchema,
  insertHabitSchema,
  insertHealthMetricSchema,
  insertDateIdeaSchema,
  insertParentingTaskSchema,
  insertValueSchema,
  insertDreamSchema,
  projectWithRelationsSchema,
  // Tables
  projects,
  projectValues,
  projectDreams,
  values,
  dreams
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

  // Projects endpoints
  app.get("/api/projects", async (req: Request, res: Response) => {
    const projects = await storage.getProjects(TEMP_USER_ID);
    
    // Get values and dreams for each project
    const projectsWithRelations = await Promise.all(
      projects.map(async (project) => {
        // Get the associated value IDs
        const projectValueItems = await db.select().from(projectValues)
          .where(eq(projectValues.projectId, project.id));
        const valueIds = projectValueItems.map(pv => pv.valueId);
        
        // Get the associated dream IDs
        const projectDreamItems = await db.select().from(projectDreams)
          .where(eq(projectDreams.projectId, project.id));
        const dreamIds = projectDreamItems.map(pd => pd.dreamId);
        
        return { ...project, valueIds, dreamIds };
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
    
    const projectWithRelations = { ...project, valueIds, dreamIds };
    
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
  
  // Health Metrics endpoints
  app.get("/api/health-metrics", async (req: Request, res: Response) => {
    const healthMetrics = await storage.getHealthMetrics(TEMP_USER_ID);
    res.json(healthMetrics);
  });
  
  app.get("/api/health-metrics/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const healthMetric = await storage.getHealthMetric(id);
    
    if (!healthMetric) {
      return res.status(404).json({ message: "Health metric not found" });
    }
    
    res.json(healthMetric);
  });
  
  app.post("/api/health-metrics", async (req: Request, res: Response) => {
    const healthMetricData = validateRequest(insertHealthMetricSchema, {
      ...req.body,
      userId: req.body.userId || TEMP_USER_ID
    });
    
    const newHealthMetric = await storage.createHealthMetric(healthMetricData);
    res.status(201).json(newHealthMetric);
  });
  
  app.patch("/api/health-metrics/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const healthMetricData = req.body;
    
    const updatedHealthMetric = await storage.updateHealthMetric(id, healthMetricData);
    
    if (!updatedHealthMetric) {
      return res.status(404).json({ message: "Health metric not found" });
    }
    
    res.json(updatedHealthMetric);
  });
  
  app.delete("/api/health-metrics/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteHealthMetric(id);
    
    if (!success) {
      return res.status(404).json({ message: "Health metric not found" });
    }
    
    res.status(204).send();
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

  const httpServer = createServer(app);
  return httpServer;
}
