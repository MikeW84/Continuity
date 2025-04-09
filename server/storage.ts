import {
  users, type User, type InsertUser,
  projects, type Project, type InsertProject, type ProjectWithRelations,
  ideas, type Idea, type InsertIdea,
  learningItems, type LearningItem, type InsertLearningItem,
  habits, type Habit, type InsertHabit,
  healthMetrics, type HealthMetric, type InsertHealthMetric,
  dateIdeas, type DateIdea, type InsertDateIdea,
  parentingTasks, type ParentingTask, type InsertParentingTask,
  values, type Value, type InsertValue,
  dreams, type Dream, type InsertDream
} from "@shared/schema";
import * as schema from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  getProjects(userId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  setPriorityProject(id: number, userId: number): Promise<Project | undefined>;
  
  // Idea methods
  getIdeas(userId: number): Promise<Idea[]>;
  getIdea(id: number): Promise<Idea | undefined>;
  createIdea(idea: InsertIdea): Promise<Idea>;
  updateIdea(id: number, idea: Partial<InsertIdea>): Promise<Idea | undefined>;
  deleteIdea(id: number): Promise<boolean>;
  voteIdea(id: number, upvote: boolean): Promise<Idea | undefined>;
  
  // Learning methods
  getLearningItems(userId: number): Promise<LearningItem[]>;
  getLearningItem(id: number): Promise<LearningItem | undefined>;
  createLearningItem(learningItem: InsertLearningItem): Promise<LearningItem>;
  updateLearningItem(id: number, learningItem: Partial<InsertLearningItem>): Promise<LearningItem | undefined>;
  deleteLearningItem(id: number): Promise<boolean>;
  
  // Habit methods
  getHabits(userId: number): Promise<Habit[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<boolean>;
  toggleHabitCompletion(id: number): Promise<Habit | undefined>;
  
  // Health Metric methods
  getHealthMetrics(userId: number): Promise<HealthMetric[]>;
  getHealthMetric(id: number): Promise<HealthMetric | undefined>;
  createHealthMetric(healthMetric: InsertHealthMetric): Promise<HealthMetric>;
  updateHealthMetric(id: number, healthMetric: Partial<InsertHealthMetric>): Promise<HealthMetric | undefined>;
  deleteHealthMetric(id: number): Promise<boolean>;
  
  // Date Idea methods
  getDateIdeas(userId: number): Promise<DateIdea[]>;
  getDateIdea(id: number): Promise<DateIdea | undefined>;
  createDateIdea(dateIdea: InsertDateIdea): Promise<DateIdea>;
  updateDateIdea(id: number, dateIdea: Partial<InsertDateIdea>): Promise<DateIdea | undefined>;
  deleteDateIdea(id: number): Promise<boolean>;
  
  // Parenting Task methods
  getParentingTasks(userId: number): Promise<ParentingTask[]>;
  getParentingTask(id: number): Promise<ParentingTask | undefined>;
  createParentingTask(parentingTask: InsertParentingTask): Promise<ParentingTask>;
  updateParentingTask(id: number, parentingTask: Partial<InsertParentingTask>): Promise<ParentingTask | undefined>;
  deleteParentingTask(id: number): Promise<boolean>;
  toggleParentingTaskCompletion(id: number): Promise<ParentingTask | undefined>;
  
  // Value methods
  getValues(userId: number): Promise<Value[]>;
  getValue(id: number): Promise<Value | undefined>;
  createValue(value: InsertValue): Promise<Value>;
  updateValue(id: number, value: Partial<InsertValue>): Promise<Value | undefined>;
  deleteValue(id: number): Promise<boolean>;
  
  // Dream methods
  getDreams(userId: number): Promise<Dream[]>;
  getDream(id: number): Promise<Dream | undefined>;
  createDream(dream: InsertDream): Promise<Dream>;
  updateDream(id: number, dream: Partial<InsertDream>): Promise<Dream | undefined>;
  deleteDream(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private ideas: Map<number, Idea>;
  private learningItems: Map<number, LearningItem>;
  private habits: Map<number, Habit>;
  private healthMetrics: Map<number, HealthMetric>;
  private dateIdeas: Map<number, DateIdea>;
  private parentingTasks: Map<number, ParentingTask>;
  private values: Map<number, Value>;
  private dreams: Map<number, Dream>;
  
  private userId: number;
  private projectId: number;
  private ideaId: number;
  private learningItemId: number;
  private habitId: number;
  private healthMetricId: number;
  private dateIdeaId: number;
  private parentingTaskId: number;
  private valueId: number;
  private dreamId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.ideas = new Map();
    this.learningItems = new Map();
    this.habits = new Map();
    this.healthMetrics = new Map();
    this.dateIdeas = new Map();
    this.parentingTasks = new Map();
    this.values = new Map();
    this.dreams = new Map();
    
    this.userId = 1;
    this.projectId = 1;
    this.ideaId = 1;
    this.learningItemId = 1;
    this.habitId = 1;
    this.healthMetricId = 1;
    this.dateIdeaId = 1;
    this.parentingTaskId = 1;
    this.valueId = 1;
    this.dreamId = 1;
    
    // Initialize with a sample user
    this.createUser({
      username: "johndoe",
      password: "password",
      displayName: "John Doe",
      email: "john@example.com"
    });
    
    // Create initial data for demo
    this.initializeData(1);
  }
  
  private initializeData(userId: number) {
    // Create sample projects
    this.createProject({
      title: "Life Management System",
      description: "Complete MVP development by June 30th",
      progress: 75,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isPriority: true,
      userId
    });
    
    this.createProject({
      title: "Home Renovation Plan",
      description: "Finalize kitchen design and get contractor quotes",
      progress: 25,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isPriority: false,
      userId
    });
    
    this.createProject({
      title: "Yearly Financial Review",
      description: "Update investment strategy and tax planning",
      progress: 50,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      isPriority: false,
      userId
    });
    
    // Create sample ideas
    this.createIdea({
      title: "Podcast on Life Management",
      description: "Weekly podcast sharing productivity tips and life management strategies",
      votes: 12,
      tags: ["content creation", "productivity"],
      userId
    });
    
    this.createIdea({
      title: "Family Recipe Collection App",
      description: "Digital cookbook to preserve family recipes with photos and stories",
      votes: 8,
      tags: ["app", "family"],
      userId
    });
    
    this.createIdea({
      title: "Home Workout Space",
      description: "Convert garage corner into compact exercise area with basic equipment",
      votes: 5,
      tags: ["health", "home"],
      userId
    });
    
    // Create sample learning items
    this.createLearningItem({
      title: "React Advanced Patterns",
      category: "Frontend Development",
      progress: 67,
      isCurrentlyLearning: true,
      userId
    });
    
    this.createLearningItem({
      title: "Spanish Language",
      category: "Language",
      progress: 33,
      isCurrentlyLearning: true,
      userId
    });
    
    this.createLearningItem({
      title: "Docker & Kubernetes",
      category: "DevOps",
      progress: 0,
      isCurrentlyLearning: false,
      userId
    });
    
    this.createLearningItem({
      title: "UX Research Methods",
      category: "Design",
      progress: 0,
      isCurrentlyLearning: false,
      userId
    });
    
    // Create sample habits
    this.createHabit({
      title: "Morning Meditation",
      completedDays: 20,
      totalDays: 30,
      isCompletedToday: true,
      userId
    });
    
    this.createHabit({
      title: "8 Glasses of Water",
      completedDays: 15,
      totalDays: 30,
      isCompletedToday: false,
      userId
    });
    
    this.createHabit({
      title: "Exercise (30min)",
      completedDays: 25,
      totalDays: 30,
      isCompletedToday: true,
      userId
    });
    
    // Create sample health metrics
    this.createHealthMetric({
      name: "Avg. Sleep",
      value: "7.2",
      change: "+0.5 hrs",
      icon: "heart-pulse",
      userId
    });
    
    this.createHealthMetric({
      name: "Avg. Steps",
      value: "8,752",
      change: "+1,203",
      icon: "footprint",
      userId
    });
    
    // Create sample date ideas
    this.createDateIdea({
      title: "Dinner at Bella's followed by outdoor movie at the park",
      description: "Upcoming Date",
      date: new Date("2023-06-25"),
      isScheduled: true,
      userId
    });
    
    this.createDateIdea({
      title: "Cooking class together",
      description: "",
      date: null,
      isScheduled: false,
      userId
    });
    
    this.createDateIdea({
      title: "Weekend hiking trip",
      description: "",
      date: null,
      isScheduled: false,
      userId
    });
    
    // Create sample parenting tasks
    this.createParentingTask({
      title: "Research summer camps",
      description: "Find STEM and outdoor activity options",
      isCompleted: true,
      userId
    });
    
    this.createParentingTask({
      title: "Schedule pediatrician appointment",
      description: "Annual check-up in July",
      isCompleted: false,
      userId
    });
    
    // Create sample values
    this.createValue({
      title: "Family Connection",
      description: "Nurturing meaningful relationships with family through quality time and shared experiences",
      alignmentScore: 75,
      userId
    });
    
    this.createValue({
      title: "Continuous Growth",
      description: "Consistently developing skills and knowledge to reach full potential",
      alignmentScore: 80,
      userId
    });
    
    // Create sample dreams
    this.createDream({
      title: "Build Mountain Cabin Retreat",
      description: "Peaceful family getaway in the mountains with hiking access",
      tags: ["long-term", "5-year plan"],
      timeframe: "long-term",
      userId
    });
    
    this.createDream({
      title: "Remote Work Sabbatical",
      description: "Work remotely while exploring different countries with family",
      tags: ["medium-term", "2-year plan"],
      timeframe: "medium-term",
      userId
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Project methods
  async getProjects(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId
    );
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectId++;
    const newProject: Project = { ...project, id };
    this.projects.set(id, newProject);
    return newProject;
  }
  
  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) return undefined;
    
    const updatedProject = { ...existingProject, ...project };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }
  
  async setPriorityProject(id: number, userId: number): Promise<Project | undefined> {
    // Reset priority for all user's projects
    for (const project of this.projects.values()) {
      if (project.userId === userId && project.isPriority) {
        project.isPriority = false;
        this.projects.set(project.id, project);
      }
    }
    
    // Set the selected project as priority
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    project.isPriority = true;
    this.projects.set(id, project);
    return project;
  }
  
  // Idea methods
  async getIdeas(userId: number): Promise<Idea[]> {
    return Array.from(this.ideas.values()).filter(
      (idea) => idea.userId === userId
    );
  }
  
  async getIdea(id: number): Promise<Idea | undefined> {
    return this.ideas.get(id);
  }
  
  async createIdea(idea: InsertIdea): Promise<Idea> {
    const id = this.ideaId++;
    const newIdea: Idea = { ...idea, id };
    this.ideas.set(id, newIdea);
    return newIdea;
  }
  
  async updateIdea(id: number, idea: Partial<InsertIdea>): Promise<Idea | undefined> {
    const existingIdea = this.ideas.get(id);
    if (!existingIdea) return undefined;
    
    const updatedIdea = { ...existingIdea, ...idea };
    this.ideas.set(id, updatedIdea);
    return updatedIdea;
  }
  
  async deleteIdea(id: number): Promise<boolean> {
    return this.ideas.delete(id);
  }
  
  async voteIdea(id: number, upvote: boolean): Promise<Idea | undefined> {
    const idea = this.ideas.get(id);
    if (!idea) return undefined;
    
    if (upvote) {
      idea.votes += 1;
    } else {
      idea.votes -= 1;
    }
    
    this.ideas.set(id, idea);
    return idea;
  }
  
  // Learning methods
  async getLearningItems(userId: number): Promise<LearningItem[]> {
    return Array.from(this.learningItems.values()).filter(
      (item) => item.userId === userId
    );
  }
  
  async getLearningItem(id: number): Promise<LearningItem | undefined> {
    return this.learningItems.get(id);
  }
  
  async createLearningItem(learningItem: InsertLearningItem): Promise<LearningItem> {
    const id = this.learningItemId++;
    const newLearningItem: LearningItem = { ...learningItem, id };
    this.learningItems.set(id, newLearningItem);
    return newLearningItem;
  }
  
  async updateLearningItem(id: number, learningItem: Partial<InsertLearningItem>): Promise<LearningItem | undefined> {
    const existingLearningItem = this.learningItems.get(id);
    if (!existingLearningItem) return undefined;
    
    const updatedLearningItem = { ...existingLearningItem, ...learningItem };
    this.learningItems.set(id, updatedLearningItem);
    return updatedLearningItem;
  }
  
  async deleteLearningItem(id: number): Promise<boolean> {
    return this.learningItems.delete(id);
  }
  
  // Habit methods
  async getHabits(userId: number): Promise<Habit[]> {
    return Array.from(this.habits.values()).filter(
      (habit) => habit.userId === userId
    );
  }
  
  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }
  
  async createHabit(habit: InsertHabit): Promise<Habit> {
    const id = this.habitId++;
    const newHabit: Habit = { ...habit, id };
    this.habits.set(id, newHabit);
    return newHabit;
  }
  
  async updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined> {
    const existingHabit = this.habits.get(id);
    if (!existingHabit) return undefined;
    
    const updatedHabit = { ...existingHabit, ...habit };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }
  
  async deleteHabit(id: number): Promise<boolean> {
    return this.habits.delete(id);
  }
  
  async toggleHabitCompletion(id: number): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;
    
    const wasCompleted = habit.isCompletedToday;
    habit.isCompletedToday = !habit.isCompletedToday;
    
    if (habit.isCompletedToday && !wasCompleted) {
      habit.completedDays += 1;
    } else if (!habit.isCompletedToday && wasCompleted) {
      habit.completedDays -= 1;
    }
    
    this.habits.set(id, habit);
    return habit;
  }
  
  // Health Metric methods
  async getHealthMetrics(userId: number): Promise<HealthMetric[]> {
    return Array.from(this.healthMetrics.values()).filter(
      (metric) => metric.userId === userId
    );
  }
  
  async getHealthMetric(id: number): Promise<HealthMetric | undefined> {
    return this.healthMetrics.get(id);
  }
  
  async createHealthMetric(healthMetric: InsertHealthMetric): Promise<HealthMetric> {
    const id = this.healthMetricId++;
    const newHealthMetric: HealthMetric = { ...healthMetric, id };
    this.healthMetrics.set(id, newHealthMetric);
    return newHealthMetric;
  }
  
  async updateHealthMetric(id: number, healthMetric: Partial<InsertHealthMetric>): Promise<HealthMetric | undefined> {
    const existingHealthMetric = this.healthMetrics.get(id);
    if (!existingHealthMetric) return undefined;
    
    const updatedHealthMetric = { ...existingHealthMetric, ...healthMetric };
    this.healthMetrics.set(id, updatedHealthMetric);
    return updatedHealthMetric;
  }
  
  async deleteHealthMetric(id: number): Promise<boolean> {
    return this.healthMetrics.delete(id);
  }
  
  // Date Idea methods
  async getDateIdeas(userId: number): Promise<DateIdea[]> {
    return Array.from(this.dateIdeas.values()).filter(
      (dateIdea) => dateIdea.userId === userId
    );
  }
  
  async getDateIdea(id: number): Promise<DateIdea | undefined> {
    return this.dateIdeas.get(id);
  }
  
  async createDateIdea(dateIdea: InsertDateIdea): Promise<DateIdea> {
    const id = this.dateIdeaId++;
    const newDateIdea: DateIdea = { ...dateIdea, id };
    this.dateIdeas.set(id, newDateIdea);
    return newDateIdea;
  }
  
  async updateDateIdea(id: number, dateIdea: Partial<InsertDateIdea>): Promise<DateIdea | undefined> {
    const existingDateIdea = this.dateIdeas.get(id);
    if (!existingDateIdea) return undefined;
    
    const updatedDateIdea = { ...existingDateIdea, ...dateIdea };
    this.dateIdeas.set(id, updatedDateIdea);
    return updatedDateIdea;
  }
  
  async deleteDateIdea(id: number): Promise<boolean> {
    return this.dateIdeas.delete(id);
  }
  
  // Parenting Task methods
  async getParentingTasks(userId: number): Promise<ParentingTask[]> {
    return Array.from(this.parentingTasks.values()).filter(
      (task) => task.userId === userId
    );
  }
  
  async getParentingTask(id: number): Promise<ParentingTask | undefined> {
    return this.parentingTasks.get(id);
  }
  
  async createParentingTask(parentingTask: InsertParentingTask): Promise<ParentingTask> {
    const id = this.parentingTaskId++;
    const newParentingTask: ParentingTask = { ...parentingTask, id };
    this.parentingTasks.set(id, newParentingTask);
    return newParentingTask;
  }
  
  async updateParentingTask(id: number, parentingTask: Partial<InsertParentingTask>): Promise<ParentingTask | undefined> {
    const existingParentingTask = this.parentingTasks.get(id);
    if (!existingParentingTask) return undefined;
    
    const updatedParentingTask = { ...existingParentingTask, ...parentingTask };
    this.parentingTasks.set(id, updatedParentingTask);
    return updatedParentingTask;
  }
  
  async deleteParentingTask(id: number): Promise<boolean> {
    return this.parentingTasks.delete(id);
  }
  
  async toggleParentingTaskCompletion(id: number): Promise<ParentingTask | undefined> {
    const task = this.parentingTasks.get(id);
    if (!task) return undefined;
    
    task.isCompleted = !task.isCompleted;
    this.parentingTasks.set(id, task);
    return task;
  }
  
  // Value methods
  async getValues(userId: number): Promise<Value[]> {
    return Array.from(this.values.values()).filter(
      (value) => value.userId === userId
    );
  }
  
  async getValue(id: number): Promise<Value | undefined> {
    return this.values.get(id);
  }
  
  async createValue(value: InsertValue): Promise<Value> {
    const id = this.valueId++;
    const newValue: Value = { ...value, id };
    this.values.set(id, newValue);
    return newValue;
  }
  
  async updateValue(id: number, value: Partial<InsertValue>): Promise<Value | undefined> {
    const existingValue = this.values.get(id);
    if (!existingValue) return undefined;
    
    const updatedValue = { ...existingValue, ...value };
    this.values.set(id, updatedValue);
    return updatedValue;
  }
  
  async deleteValue(id: number): Promise<boolean> {
    return this.values.delete(id);
  }
  
  // Dream methods
  async getDreams(userId: number): Promise<Dream[]> {
    return Array.from(this.dreams.values()).filter(
      (dream) => dream.userId === userId
    );
  }
  
  async getDream(id: number): Promise<Dream | undefined> {
    return this.dreams.get(id);
  }
  
  async createDream(dream: InsertDream): Promise<Dream> {
    const id = this.dreamId++;
    const newDream: Dream = { ...dream, id };
    this.dreams.set(id, newDream);
    return newDream;
  }
  
  async updateDream(id: number, dream: Partial<InsertDream>): Promise<Dream | undefined> {
    const existingDream = this.dreams.get(id);
    if (!existingDream) return undefined;
    
    const updatedDream = { ...existingDream, ...dream };
    this.dreams.set(id, updatedDream);
    return updatedDream;
  }
  
  async deleteDream(id: number): Promise<boolean> {
    return this.dreams.delete(id);
  }
}

// Use database storage instead of memory storage
import { db } from "./db";
import { eq, and, desc, asc, inArray } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(schema.users).values(insertUser).returning();
    return user;
  }

  // Project methods
  async getProjects(userId: number): Promise<Project[]> {
    return await db.select().from(schema.projects).where(eq(schema.projects.userId, userId));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(schema.projects).where(eq(schema.projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    // Transaction to create project and associate values and dreams if provided
    const projectWithRelations = project as unknown as ProjectWithRelations;
    const { valueIds, dreamIds, ...projectData } = projectWithRelations;
    
    const [createdProject] = await db.insert(schema.projects).values(projectData).returning();
    
    // Insert project-value relations if valueIds are provided
    if (valueIds && valueIds.length > 0) {
      await db.insert(schema.projectValues).values(
        valueIds.map(valueId => ({
          projectId: createdProject.id,
          valueId
        }))
      );
    }
    
    // Insert project-dream relations if dreamIds are provided
    if (dreamIds && dreamIds.length > 0) {
      await db.insert(schema.projectDreams).values(
        dreamIds.map(dreamId => ({
          projectId: createdProject.id,
          dreamId
        }))
      );
    }
    
    return createdProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const projectWithRelations = project as unknown as Partial<ProjectWithRelations>;
    const { valueIds, dreamIds, ...projectData } = projectWithRelations;
    
    // Update project data
    const [updatedProject] = await db.update(schema.projects)
      .set(projectData)
      .where(eq(schema.projects.id, id))
      .returning();
    
    if (!updatedProject) return undefined;
    
    // Update project-value relations if valueIds are provided
    if (valueIds) {
      // Delete existing relations
      await db.delete(schema.projectValues)
        .where(eq(schema.projectValues.projectId, id));
      
      // Insert new relations
      if (valueIds.length > 0) {
        await db.insert(schema.projectValues).values(
          valueIds.map(valueId => ({
            projectId: id,
            valueId
          }))
        );
      }
    }
    
    // Update project-dream relations if dreamIds are provided
    if (dreamIds) {
      // Delete existing relations
      await db.delete(schema.projectDreams)
        .where(eq(schema.projectDreams.projectId, id));
      
      // Insert new relations
      if (dreamIds.length > 0) {
        await db.insert(schema.projectDreams).values(
          dreamIds.map(dreamId => ({
            projectId: id,
            dreamId
          }))
        );
      }
    }
    
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    // Related records in projectValues and projectDreams will be automatically deleted due to CASCADE
    const result = await db.delete(schema.projects).where(eq(schema.projects.id, id));
    return result.rowCount > 0;
  }

  async setPriorityProject(id: number, userId: number): Promise<Project | undefined> {
    // Reset priority for all projects of the user
    await db.update(schema.projects)
      .set({ isPriority: false })
      .where(eq(schema.projects.userId, userId));
    
    // Set priority for the selected project
    const [project] = await db.update(schema.projects)
      .set({ isPriority: true })
      .where(eq(schema.projects.id, id))
      .returning();
    
    return project;
  }

  // Idea methods
  async getIdeas(userId: number): Promise<Idea[]> {
    return await db.select().from(schema.ideas).where(eq(schema.ideas.userId, userId));
  }

  async getIdea(id: number): Promise<Idea | undefined> {
    const [idea] = await db.select().from(schema.ideas).where(eq(schema.ideas.id, id));
    return idea;
  }

  async createIdea(idea: InsertIdea): Promise<Idea> {
    const [createdIdea] = await db.insert(schema.ideas).values(idea).returning();
    return createdIdea;
  }

  async updateIdea(id: number, idea: Partial<InsertIdea>): Promise<Idea | undefined> {
    const [updatedIdea] = await db.update(schema.ideas)
      .set(idea)
      .where(eq(schema.ideas.id, id))
      .returning();
    
    return updatedIdea;
  }

  async deleteIdea(id: number): Promise<boolean> {
    const result = await db.delete(schema.ideas).where(eq(schema.ideas.id, id));
    return result.rowCount > 0;
  }

  async voteIdea(id: number, upvote: boolean): Promise<Idea | undefined> {
    const [idea] = await db.select().from(schema.ideas).where(eq(schema.ideas.id, id));
    if (!idea) return undefined;
    
    const votes = idea.votes + (upvote ? 1 : -1);
    
    const [updatedIdea] = await db.update(schema.ideas)
      .set({ votes })
      .where(eq(schema.ideas.id, id))
      .returning();
    
    return updatedIdea;
  }

  // Learning methods
  async getLearningItems(userId: number): Promise<LearningItem[]> {
    return await db.select().from(schema.learningItems).where(eq(schema.learningItems.userId, userId));
  }

  async getLearningItem(id: number): Promise<LearningItem | undefined> {
    const [item] = await db.select().from(schema.learningItems).where(eq(schema.learningItems.id, id));
    return item;
  }

  async createLearningItem(learningItem: InsertLearningItem): Promise<LearningItem> {
    const [item] = await db.insert(schema.learningItems).values(learningItem).returning();
    return item;
  }

  async updateLearningItem(id: number, learningItem: Partial<InsertLearningItem>): Promise<LearningItem | undefined> {
    const [item] = await db.update(schema.learningItems)
      .set(learningItem)
      .where(eq(schema.learningItems.id, id))
      .returning();
    
    return item;
  }

  async deleteLearningItem(id: number): Promise<boolean> {
    const result = await db.delete(schema.learningItems).where(eq(schema.learningItems.id, id));
    return result.rowCount > 0;
  }

  // Habit methods
  async getHabits(userId: number): Promise<Habit[]> {
    return await db.select().from(schema.habits).where(eq(schema.habits.userId, userId));
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    const [habit] = await db.select().from(schema.habits).where(eq(schema.habits.id, id));
    return habit;
  }

  async createHabit(habit: InsertHabit): Promise<Habit> {
    const [createdHabit] = await db.insert(schema.habits).values(habit).returning();
    return createdHabit;
  }

  async updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined> {
    const [updatedHabit] = await db.update(schema.habits)
      .set(habit)
      .where(eq(schema.habits.id, id))
      .returning();
    
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<boolean> {
    const result = await db.delete(schema.habits).where(eq(schema.habits.id, id));
    return result.rowCount > 0;
  }

  async toggleHabitCompletion(id: number): Promise<Habit | undefined> {
    const [habit] = await db.select().from(schema.habits).where(eq(schema.habits.id, id));
    if (!habit) return undefined;
    
    const isCompletedToday = !habit.isCompletedToday;
    const completedDays = isCompletedToday ? habit.completedDays + 1 : habit.completedDays - 1;
    
    const [updatedHabit] = await db.update(schema.habits)
      .set({ isCompletedToday, completedDays })
      .where(eq(schema.habits.id, id))
      .returning();
    
    return updatedHabit;
  }

  // Health Metric methods
  async getHealthMetrics(userId: number): Promise<HealthMetric[]> {
    return await db.select().from(schema.healthMetrics).where(eq(schema.healthMetrics.userId, userId));
  }

  async getHealthMetric(id: number): Promise<HealthMetric | undefined> {
    const [metric] = await db.select().from(schema.healthMetrics).where(eq(schema.healthMetrics.id, id));
    return metric;
  }

  async createHealthMetric(healthMetric: InsertHealthMetric): Promise<HealthMetric> {
    const [metric] = await db.insert(schema.healthMetrics).values(healthMetric).returning();
    return metric;
  }

  async updateHealthMetric(id: number, healthMetric: Partial<InsertHealthMetric>): Promise<HealthMetric | undefined> {
    const [metric] = await db.update(schema.healthMetrics)
      .set(healthMetric)
      .where(eq(schema.healthMetrics.id, id))
      .returning();
    
    return metric;
  }

  async deleteHealthMetric(id: number): Promise<boolean> {
    const result = await db.delete(schema.healthMetrics).where(eq(schema.healthMetrics.id, id));
    return result.rowCount > 0;
  }

  // Date Idea methods
  async getDateIdeas(userId: number): Promise<DateIdea[]> {
    return await db.select().from(schema.dateIdeas).where(eq(schema.dateIdeas.userId, userId));
  }

  async getDateIdea(id: number): Promise<DateIdea | undefined> {
    const [idea] = await db.select().from(schema.dateIdeas).where(eq(schema.dateIdeas.id, id));
    return idea;
  }

  async createDateIdea(dateIdea: InsertDateIdea): Promise<DateIdea> {
    const [idea] = await db.insert(schema.dateIdeas).values(dateIdea).returning();
    return idea;
  }

  async updateDateIdea(id: number, dateIdea: Partial<InsertDateIdea>): Promise<DateIdea | undefined> {
    const [idea] = await db.update(schema.dateIdeas)
      .set(dateIdea)
      .where(eq(schema.dateIdeas.id, id))
      .returning();
    
    return idea;
  }

  async deleteDateIdea(id: number): Promise<boolean> {
    const result = await db.delete(schema.dateIdeas).where(eq(schema.dateIdeas.id, id));
    return result.rowCount > 0;
  }

  // Parenting Task methods
  async getParentingTasks(userId: number): Promise<ParentingTask[]> {
    return await db.select().from(schema.parentingTasks).where(eq(schema.parentingTasks.userId, userId));
  }

  async getParentingTask(id: number): Promise<ParentingTask | undefined> {
    const [task] = await db.select().from(schema.parentingTasks).where(eq(schema.parentingTasks.id, id));
    return task;
  }

  async createParentingTask(parentingTask: InsertParentingTask): Promise<ParentingTask> {
    const [task] = await db.insert(schema.parentingTasks).values(parentingTask).returning();
    return task;
  }

  async updateParentingTask(id: number, parentingTask: Partial<InsertParentingTask>): Promise<ParentingTask | undefined> {
    const [task] = await db.update(schema.parentingTasks)
      .set(parentingTask)
      .where(eq(schema.parentingTasks.id, id))
      .returning();
    
    return task;
  }

  async deleteParentingTask(id: number): Promise<boolean> {
    const result = await db.delete(schema.parentingTasks).where(eq(schema.parentingTasks.id, id));
    return result.rowCount > 0;
  }

  async toggleParentingTaskCompletion(id: number): Promise<ParentingTask | undefined> {
    const [task] = await db.select().from(schema.parentingTasks).where(eq(schema.parentingTasks.id, id));
    if (!task) return undefined;
    
    const isCompleted = !task.isCompleted;
    
    const [updatedTask] = await db.update(schema.parentingTasks)
      .set({ isCompleted })
      .where(eq(schema.parentingTasks.id, id))
      .returning();
    
    return updatedTask;
  }

  // Value methods
  async getValues(userId: number): Promise<Value[]> {
    return await db.select().from(schema.values).where(eq(schema.values.userId, userId));
  }

  async getValue(id: number): Promise<Value | undefined> {
    const [value] = await db.select().from(schema.values).where(eq(schema.values.id, id));
    return value;
  }

  async createValue(value: InsertValue): Promise<Value> {
    const [createdValue] = await db.insert(schema.values).values(value).returning();
    return createdValue;
  }

  async updateValue(id: number, value: Partial<InsertValue>): Promise<Value | undefined> {
    const [updatedValue] = await db.update(schema.values)
      .set(value)
      .where(eq(schema.values.id, id))
      .returning();
    
    return updatedValue;
  }

  async deleteValue(id: number): Promise<boolean> {
    const result = await db.delete(schema.values).where(eq(schema.values.id, id));
    return result.rowCount > 0;
  }

  // Dream methods
  async getDreams(userId: number): Promise<Dream[]> {
    return await db.select().from(schema.dreams).where(eq(schema.dreams.userId, userId));
  }

  async getDream(id: number): Promise<Dream | undefined> {
    const [dream] = await db.select().from(schema.dreams).where(eq(schema.dreams.id, id));
    return dream;
  }

  async createDream(dream: InsertDream): Promise<Dream> {
    const [createdDream] = await db.insert(schema.dreams).values(dream).returning();
    return createdDream;
  }

  async updateDream(id: number, dream: Partial<InsertDream>): Promise<Dream | undefined> {
    const [updatedDream] = await db.update(schema.dreams)
      .set(dream)
      .where(eq(schema.dreams.id, id))
      .returning();
    
    return updatedDream;
  }

  async deleteDream(id: number): Promise<boolean> {
    const result = await db.delete(schema.dreams).where(eq(schema.dreams.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
