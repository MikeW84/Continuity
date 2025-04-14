import {
  type User, type InsertUser,
  type Project, type InsertProject, type ProjectWithRelations,
  type Idea, type InsertIdea,
  type LearningItem, type InsertLearningItem,
  type Habit, type InsertHabit,
  type HealthMetric, type InsertHealthMetric,
  type DateIdea, type InsertDateIdea,
  type ParentingTask, type InsertParentingTask,
  type Value, type InsertValue,
  type Dream, type InsertDream
} from "@shared/schema";

// Database imports commented out until PostgreSQL is properly set up
// import * as schema from "@shared/schema";
// import { Pool, neonConfig } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-serverless';
// import { eq } from "drizzle-orm";
// import ws from "ws";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  getProjects(userId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: ProjectWithRelations): Promise<Project>;
  updateProject(id: number, project: Partial<ProjectWithRelations>): Promise<Project | undefined>;
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
    
    // Add default user
    this.createUser({
      username: "user",
      password: "password",
      displayName: "User",
      email: "user@example.com"
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
  
  async createProject(project: ProjectWithRelations): Promise<Project> {
    console.log("Creating project with data:", project);
    const id = this.projectId++;
    
    // Extract the valueIds and dreamIds from the project data
    const { valueIds, dreamIds, ...projectData } = project;
    
    // Create the base project 
    const newProject: Project = { ...projectData, id };
    this.projects.set(id, newProject);
    
    console.log("Project created with ID:", id);
    
    // Handle relations in a real database this would create entries in the junction tables
    if (valueIds && valueIds.length > 0) {
      console.log(`Linking project ${id} with values:`, valueIds);
      // In a real database implementation, this would create entries in the project_values table
    }
    
    if (dreamIds && dreamIds.length > 0) {
      console.log(`Linking project ${id} with dreams:`, dreamIds);
      // In a real database implementation, this would create entries in the project_dreams table
    }
    
    return newProject;
  }
  
  async updateProject(id: number, project: Partial<ProjectWithRelations>): Promise<Project | undefined> {
    console.log("Updating project with ID:", id, "Data:", project);
    
    const existingProject = this.projects.get(id);
    if (!existingProject) return undefined;
    
    // Extract the valueIds and dreamIds from the project data
    const { valueIds, dreamIds, ...projectData } = project;
    
    const updatedProject = { ...existingProject, ...projectData };
    this.projects.set(id, updatedProject);
    
    console.log("Project updated:", updatedProject);
    
    // Handle relations in a real database this would update entries in the junction tables
    if (valueIds && valueIds.length > 0) {
      console.log(`Updating project ${id} with values:`, valueIds);
      // In a real database implementation, this would update entries in the project_values table
    }
    
    if (dreamIds && dreamIds.length > 0) {
      console.log(`Updating project ${id} with dreams:`, dreamIds);
      // In a real database implementation, this would update entries in the project_dreams table
    }
    
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
      idea.votes = (idea.votes || 0) + 1;
    } else {
      idea.votes = (idea.votes || 0) - 1;
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
    const existingItem = this.learningItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { ...existingItem, ...learningItem };
    this.learningItems.set(id, updatedItem);
    return updatedItem;
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
    
    const isCompletedToday = !habit.isCompletedToday;
    const completedDays = isCompletedToday 
      ? (habit.completedDays || 0) + 1 
      : (habit.completedDays || 0) - 1;
    
    const updatedHabit = { ...habit, isCompletedToday, completedDays };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
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
    const existingMetric = this.healthMetrics.get(id);
    if (!existingMetric) return undefined;
    
    const updatedMetric = { ...existingMetric, ...healthMetric };
    this.healthMetrics.set(id, updatedMetric);
    return updatedMetric;
  }
  
  async deleteHealthMetric(id: number): Promise<boolean> {
    return this.healthMetrics.delete(id);
  }
  
  // Date Idea methods
  async getDateIdeas(userId: number): Promise<DateIdea[]> {
    return Array.from(this.dateIdeas.values()).filter(
      (idea) => idea.userId === userId
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
    const existingIdea = this.dateIdeas.get(id);
    if (!existingIdea) return undefined;
    
    const updatedIdea = { ...existingIdea, ...dateIdea };
    this.dateIdeas.set(id, updatedIdea);
    return updatedIdea;
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
    const existingTask = this.parentingTasks.get(id);
    if (!existingTask) return undefined;
    
    const updatedTask = { ...existingTask, ...parentingTask };
    this.parentingTasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteParentingTask(id: number): Promise<boolean> {
    return this.parentingTasks.delete(id);
  }
  
  async toggleParentingTaskCompletion(id: number): Promise<ParentingTask | undefined> {
    const task = this.parentingTasks.get(id);
    if (!task) return undefined;
    
    const isCompleted = !task.isCompleted;
    const updatedTask = { ...task, isCompleted };
    this.parentingTasks.set(id, updatedTask);
    return updatedTask;
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

export const storage = new MemStorage();