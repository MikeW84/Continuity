import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Project, Idea, LearningItem, Habit, HealthMetric, 
  DateIdea, ParentingTask, Value, Dream 
} from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

// HabitCompletion type - matches the backend type
export interface HabitCompletion {
  id: number;
  habitId: number;
  date: Date;
  completed: boolean;
}

// Interface for our context
interface AppContextProps {
  user: { id: number, displayName: string } | null;
  projects: Project[];
  ideas: Idea[];
  learningItems: LearningItem[];
  habits: Habit[];
  healthMetrics: HealthMetric[];
  dateIdeas: DateIdea[];
  parentingTasks: ParentingTask[];
  values: Value[];
  dreams: Dream[];
  priorityProject: Project | null;
  
  // Projects
  fetchProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'userId'> & { valueIds?: number[], dreamIds?: number[] }) => Promise<void>;
  updateProject: (id: number, project: Partial<Project> & { valueIds?: number[], dreamIds?: number[] }) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  setPriorityProject: (id: number) => Promise<void>;
  
  // Ideas
  fetchIdeas: () => Promise<void>;
  addIdea: (idea: Omit<Idea, 'id' | 'userId'>) => Promise<void>;
  updateIdea: (id: number, idea: Partial<Idea>) => Promise<void>;
  deleteIdea: (id: number) => Promise<void>;
  voteIdea: (id: number, upvote: boolean) => Promise<void>;
  
  // Learning
  fetchLearningItems: () => Promise<void>;
  addLearningItem: (item: Omit<LearningItem, 'id' | 'userId'>) => Promise<void>;
  updateLearningItem: (id: number, item: Partial<LearningItem>) => Promise<void>;
  deleteLearningItem: (id: number) => Promise<void>;
  
  // Habits
  fetchHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'userId'>) => Promise<void>;
  updateHabit: (id: number, habit: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: number) => Promise<void>;
  toggleHabit: (id: number) => Promise<void>;
  getHabitCompletions: (habitId: number, year: number, month: number) => Promise<HabitCompletion[]>;
  toggleHabitByDate: (habitId: number, date: Date) => Promise<void>;
  
  // Health Metrics
  fetchHealthMetrics: () => Promise<void>;
  addHealthMetric: (metric: Omit<HealthMetric, 'id' | 'userId'>) => Promise<void>;
  updateHealthMetric: (id: number, metric: Partial<HealthMetric>) => Promise<void>;
  deleteHealthMetric: (id: number) => Promise<void>;
  
  // Date Ideas
  fetchDateIdeas: () => Promise<void>;
  addDateIdea: (dateIdea: Omit<DateIdea, 'id' | 'userId'>) => Promise<void>;
  updateDateIdea: (id: number, dateIdea: Partial<DateIdea>) => Promise<void>;
  deleteDateIdea: (id: number) => Promise<void>;
  
  // Parenting Tasks
  fetchParentingTasks: () => Promise<void>;
  addParentingTask: (task: Omit<ParentingTask, 'id' | 'userId'>) => Promise<void>;
  updateParentingTask: (id: number, task: Partial<ParentingTask>) => Promise<void>;
  deleteParentingTask: (id: number) => Promise<void>;
  toggleParentingTask: (id: number) => Promise<void>;
  
  // Values
  fetchValues: () => Promise<void>;
  addValue: (value: Omit<Value, 'id' | 'userId'>) => Promise<void>;
  updateValue: (id: number, value: Partial<Value>) => Promise<void>;
  deleteValue: (id: number) => Promise<void>;
  
  // Dreams
  fetchDreams: () => Promise<void>;
  addDream: (dream: Omit<Dream, 'id' | 'userId'>) => Promise<void>;
  updateDream: (id: number, dream: Partial<Dream>) => Promise<void>;
  deleteDream: (id: number) => Promise<void>;
  
  // Dashboard data
  fetchAllData: () => Promise<void>;
  isLoading: boolean;
}

// Create default context value
const AppContext = createContext<AppContextProps | null>(null);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // User state
  const [user, setUser] = useState<{ id: number; displayName: string } | null>({ id: 1, displayName: 'John Doe' });
  
  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [learningItems, setLearningItems] = useState<LearningItem[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([]);
  const [parentingTasks, setParentingTasks] = useState<ParentingTask[]>([]);
  const [values, setValues] = useState<Value[]>([]);
  const [dreams, setDreams] = useState<Dream[]>([]);
  
  // Derived state
  const priorityProject = projects.find(project => project.isPriority) || null;
  
  // All fetch methods with useCallback
  const fetchProjects = useCallback(async () => {
    try {
      console.log('Fetching projects...');
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      console.log('Projects data received:', data);
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }, []);
  
  const fetchIdeas = useCallback(async () => {
    try {
      const res = await fetch('/api/ideas');
      if (!res.ok) throw new Error('Failed to fetch ideas');
      const data = await res.json();
      setIdeas(data);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      throw error;
    }
  }, []);
  
  const fetchLearningItems = useCallback(async () => {
    try {
      const res = await fetch('/api/learning');
      if (!res.ok) throw new Error('Failed to fetch learning items');
      const data = await res.json();
      setLearningItems(data);
    } catch (error) {
      console.error('Error fetching learning items:', error);
      throw error;
    }
  }, []);
  
  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch('/api/habits');
      if (!res.ok) throw new Error('Failed to fetch habits');
      const data = await res.json();
      setHabits(data);
    } catch (error) {
      console.error('Error fetching habits:', error);
      throw error;
    }
  }, []);
  
  const fetchHealthMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/health-metrics');
      if (!res.ok) throw new Error('Failed to fetch health metrics');
      const data = await res.json();
      setHealthMetrics(data);
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      throw error;
    }
  }, []);
  
  const fetchDateIdeas = useCallback(async () => {
    try {
      const res = await fetch('/api/date-ideas');
      if (!res.ok) throw new Error('Failed to fetch date ideas');
      const data = await res.json();
      setDateIdeas(data);
    } catch (error) {
      console.error('Error fetching date ideas:', error);
      throw error;
    }
  }, []);
  
  const fetchParentingTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/parenting-tasks');
      if (!res.ok) throw new Error('Failed to fetch parenting tasks');
      const data = await res.json();
      setParentingTasks(data);
    } catch (error) {
      console.error('Error fetching parenting tasks:', error);
      throw error;
    }
  }, []);
  
  const fetchValues = useCallback(async () => {
    try {
      const res = await fetch('/api/values');
      if (!res.ok) throw new Error('Failed to fetch values');
      const data = await res.json();
      setValues(data);
    } catch (error) {
      console.error('Error fetching values:', error);
      throw error;
    }
  }, []);
  
  const fetchDreams = useCallback(async () => {
    try {
      const res = await fetch('/api/dreams');
      if (!res.ok) throw new Error('Failed to fetch dreams');
      const data = await res.json();
      setDreams(data);
    } catch (error) {
      console.error('Error fetching dreams:', error);
      throw error;
    }
  }, []);
  
  // Fetch all data needs to reference the other fetch methods
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch each data type separately to prevent all failing if one fails
      const fetchPromises = [
        fetchProjects().catch(err => console.error("Error fetching projects:", err)),
        fetchIdeas().catch(err => console.error("Error fetching ideas:", err)),
        fetchLearningItems().catch(err => console.error("Error fetching learning items:", err)),
        fetchHabits().catch(err => console.error("Error fetching habits:", err)),
        fetchHealthMetrics().catch(err => console.error("Error fetching health metrics:", err)),
        fetchDateIdeas().catch(err => console.error("Error fetching date ideas:", err)),
        fetchParentingTasks().catch(err => console.error("Error fetching parenting tasks:", err)),
        fetchValues().catch(err => console.error("Error fetching values:", err)),
        fetchDreams().catch(err => console.error("Error fetching dreams:", err))
      ];
      
      await Promise.all(fetchPromises);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "There was a problem loading some of your data.",
        variant: "destructive"
      });
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    fetchProjects, 
    fetchIdeas, 
    fetchLearningItems, 
    fetchHabits, 
    fetchHealthMetrics,
    fetchDateIdeas,
    fetchParentingTasks,
    fetchValues,
    fetchDreams,
    toast
  ]);
  
  // Initialize data on mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);
  
  // Non-memoized API methods
  const addProject = async (project: Omit<Project, 'id' | 'userId'> & { valueIds?: number[], dreamIds?: number[] }) => {
    try {
      await apiRequest('POST', '/api/projects', { ...project, userId: user?.id || 1 });
      await fetchProjects();
      toast({
        title: "Project Added",
        description: "Your project has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to add project",
        description: "There was a problem adding your project.",
        variant: "destructive"
      });
      console.error('Error adding project:', error);
      throw error;
    }
  };
  
  const updateProject = async (id: number, project: Partial<Project> & { valueIds?: number[], dreamIds?: number[] }) => {
    try {
      await apiRequest('PATCH', `/api/projects/${id}`, project);
      await fetchProjects();
      toast({
        title: "Project Updated",
        description: "Your project has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update project",
        description: "There was a problem updating your project.",
        variant: "destructive"
      });
      console.error('Error updating project:', error);
      throw error;
    }
  };
  
  const deleteProject = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/projects/${id}`);
      await fetchProjects();
      toast({
        title: "Project Deleted",
        description: "Your project has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete project",
        description: "There was a problem deleting your project.",
        variant: "destructive"
      });
      console.error('Error deleting project:', error);
      throw error;
    }
  };
  
  const setPriorityProject = async (id: number) => {
    try {
      await apiRequest('POST', `/api/projects/${id}/priority`, {});
      await fetchProjects();
      toast({
        title: "Priority Set",
        description: "Your priority project has been updated.",
      });
    } catch (error) {
      toast({
        title: "Failed to set priority",
        description: "There was a problem updating your priority project.",
        variant: "destructive"
      });
      console.error('Error setting priority project:', error);
      throw error;
    }
  };
  
  const addIdea = async (idea: Omit<Idea, 'id' | 'userId'>) => {
    try {
      await apiRequest('POST', '/api/ideas', { ...idea, userId: user?.id || 1 });
      await fetchIdeas();
      toast({
        title: "Idea Added",
        description: "Your idea has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to add idea",
        description: "There was a problem adding your idea.",
        variant: "destructive"
      });
      console.error('Error adding idea:', error);
      throw error;
    }
  };
  
  const updateIdea = async (id: number, idea: Partial<Idea>) => {
    try {
      await apiRequest('PATCH', `/api/ideas/${id}`, idea);
      await fetchIdeas();
      toast({
        title: "Idea Updated",
        description: "Your idea has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update idea",
        description: "There was a problem updating your idea.",
        variant: "destructive"
      });
      console.error('Error updating idea:', error);
      throw error;
    }
  };
  
  const deleteIdea = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/ideas/${id}`);
      await fetchIdeas();
      toast({
        title: "Idea Deleted",
        description: "Your idea has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete idea",
        description: "There was a problem deleting your idea.",
        variant: "destructive"
      });
      console.error('Error deleting idea:', error);
      throw error;
    }
  };
  
  const voteIdea = async (id: number, upvote: boolean) => {
    try {
      await apiRequest('POST', `/api/ideas/${id}/vote`, { upvote });
      await fetchIdeas();
    } catch (error) {
      toast({
        title: "Failed to vote on idea",
        description: "There was a problem registering your vote.",
        variant: "destructive"
      });
      console.error('Error voting on idea:', error);
      throw error;
    }
  };
  
  const addLearningItem = async (item: Omit<LearningItem, 'id' | 'userId'>) => {
    try {
      await apiRequest('POST', '/api/learning', { ...item, userId: user?.id || 1 });
      await fetchLearningItems();
      toast({
        title: "Learning Item Added",
        description: "Your learning item has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to add learning item",
        description: "There was a problem adding your learning item.",
        variant: "destructive"
      });
      console.error('Error adding learning item:', error);
      throw error;
    }
  };
  
  const updateLearningItem = async (id: number, item: Partial<LearningItem>) => {
    try {
      await apiRequest('PATCH', `/api/learning/${id}`, item);
      await fetchLearningItems();
      toast({
        title: "Learning Item Updated",
        description: "Your learning item has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update learning item",
        description: "There was a problem updating your learning item.",
        variant: "destructive"
      });
      console.error('Error updating learning item:', error);
      throw error;
    }
  };
  
  const deleteLearningItem = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/learning/${id}`);
      await fetchLearningItems();
      toast({
        title: "Learning Item Deleted",
        description: "Your learning item has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete learning item",
        description: "There was a problem deleting your learning item.",
        variant: "destructive"
      });
      console.error('Error deleting learning item:', error);
      throw error;
    }
  };
  
  const addHabit = async (habit: Omit<Habit, 'id' | 'userId'>) => {
    try {
      await apiRequest('POST', '/api/habits', { ...habit, userId: user?.id || 1 });
      await fetchHabits();
      toast({
        title: "Habit Added",
        description: "Your habit has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to add habit",
        description: "There was a problem adding your habit.",
        variant: "destructive"
      });
      console.error('Error adding habit:', error);
      throw error;
    }
  };
  
  const updateHabit = async (id: number, habit: Partial<Habit>) => {
    try {
      await apiRequest('PATCH', `/api/habits/${id}`, habit);
      await fetchHabits();
      toast({
        title: "Habit Updated",
        description: "Your habit has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update habit",
        description: "There was a problem updating your habit.",
        variant: "destructive"
      });
      console.error('Error updating habit:', error);
      throw error;
    }
  };
  
  const deleteHabit = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/habits/${id}`);
      await fetchHabits();
      toast({
        title: "Habit Deleted",
        description: "Your habit has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete habit",
        description: "There was a problem deleting your habit.",
        variant: "destructive"
      });
      console.error('Error deleting habit:', error);
      throw error;
    }
  };
  
  const toggleHabit = async (id: number) => {
    try {
      await apiRequest('POST', `/api/habits/${id}/toggle`, {});
      await fetchHabits();
    } catch (error) {
      toast({
        title: "Failed to toggle habit",
        description: "There was a problem updating your habit status.",
        variant: "destructive"
      });
      console.error('Error toggling habit:', error);
      throw error;
    }
  };
  
  const getHabitCompletions = async (habitId: number, year: number, month: number): Promise<HabitCompletion[]> => {
    try {
      const res = await fetch(`/api/habits/${habitId}/completions/${year}/${month}`);
      if (!res.ok) throw new Error('Failed to fetch habit completions');
      return await res.json();
    } catch (error) {
      console.error('Error fetching habit completions:', error);
      toast({
        title: "Failed to load habit data",
        description: "There was a problem loading your habit completion data.",
        variant: "destructive"
      });
      return [];
    }
  };
  
  const toggleHabitByDate = async (habitId: number, date: Date) => {
    try {
      await apiRequest('POST', `/api/habits/${habitId}/toggle-date`, { date });
      await fetchHabits();
    } catch (error) {
      toast({
        title: "Failed to update habit",
        description: "There was a problem updating your habit completion.",
        variant: "destructive"
      });
      console.error('Error toggling habit by date:', error);
      throw error;
    }
  };
  
  const addHealthMetric = async (metric: Omit<HealthMetric, 'id' | 'userId'>) => {
    try {
      await apiRequest('POST', '/api/health-metrics', { ...metric, userId: user?.id || 1 });
      await fetchHealthMetrics();
      toast({
        title: "Health Metric Added",
        description: "Your health metric has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to add health metric",
        description: "There was a problem adding your health metric.",
        variant: "destructive"
      });
      console.error('Error adding health metric:', error);
      throw error;
    }
  };
  
  const updateHealthMetric = async (id: number, metric: Partial<HealthMetric>) => {
    try {
      await apiRequest('PATCH', `/api/health-metrics/${id}`, metric);
      await fetchHealthMetrics();
      toast({
        title: "Health Metric Updated",
        description: "Your health metric has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update health metric",
        description: "There was a problem updating your health metric.",
        variant: "destructive"
      });
      console.error('Error updating health metric:', error);
      throw error;
    }
  };
  
  const deleteHealthMetric = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/health-metrics/${id}`);
      await fetchHealthMetrics();
      toast({
        title: "Health Metric Deleted",
        description: "Your health metric has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete health metric",
        description: "There was a problem deleting your health metric.",
        variant: "destructive"
      });
      console.error('Error deleting health metric:', error);
      throw error;
    }
  };
  
  const addDateIdea = async (dateIdea: Omit<DateIdea, 'id' | 'userId'>) => {
    try {
      await apiRequest('POST', '/api/date-ideas', { ...dateIdea, userId: user?.id || 1 });
      await fetchDateIdeas();
      toast({
        title: "Date Idea Added",
        description: "Your date idea has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to add date idea",
        description: "There was a problem adding your date idea.",
        variant: "destructive"
      });
      console.error('Error adding date idea:', error);
      throw error;
    }
  };
  
  const updateDateIdea = async (id: number, dateIdea: Partial<DateIdea>) => {
    try {
      await apiRequest('PATCH', `/api/date-ideas/${id}`, dateIdea);
      await fetchDateIdeas();
      toast({
        title: "Date Idea Updated",
        description: "Your date idea has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update date idea",
        description: "There was a problem updating your date idea.",
        variant: "destructive"
      });
      console.error('Error updating date idea:', error);
      throw error;
    }
  };
  
  const deleteDateIdea = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/date-ideas/${id}`);
      await fetchDateIdeas();
      toast({
        title: "Date Idea Deleted",
        description: "Your date idea has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete date idea",
        description: "There was a problem deleting your date idea.",
        variant: "destructive"
      });
      console.error('Error deleting date idea:', error);
      throw error;
    }
  };
  
  const addParentingTask = async (task: Omit<ParentingTask, 'id' | 'userId'>) => {
    try {
      await apiRequest('POST', '/api/parenting-tasks', { ...task, userId: user?.id || 1 });
      await fetchParentingTasks();
      toast({
        title: "Parenting Task Added",
        description: "Your parenting task has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to add parenting task",
        description: "There was a problem adding your parenting task.",
        variant: "destructive"
      });
      console.error('Error adding parenting task:', error);
      throw error;
    }
  };
  
  const updateParentingTask = async (id: number, task: Partial<ParentingTask>) => {
    try {
      await apiRequest('PATCH', `/api/parenting-tasks/${id}`, task);
      await fetchParentingTasks();
      toast({
        title: "Parenting Task Updated",
        description: "Your parenting task has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update parenting task",
        description: "There was a problem updating your parenting task.",
        variant: "destructive"
      });
      console.error('Error updating parenting task:', error);
      throw error;
    }
  };
  
  const deleteParentingTask = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/parenting-tasks/${id}`);
      await fetchParentingTasks();
      toast({
        title: "Parenting Task Deleted",
        description: "Your parenting task has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete parenting task",
        description: "There was a problem deleting your parenting task.",
        variant: "destructive"
      });
      console.error('Error deleting parenting task:', error);
      throw error;
    }
  };
  
  const toggleParentingTask = async (id: number) => {
    try {
      await apiRequest('POST', `/api/parenting-tasks/${id}/toggle`, {});
      await fetchParentingTasks();
    } catch (error) {
      toast({
        title: "Failed to toggle parenting task",
        description: "There was a problem updating your parenting task status.",
        variant: "destructive"
      });
      console.error('Error toggling parenting task:', error);
      throw error;
    }
  };
  
  const addValue = async (value: Omit<Value, 'id' | 'userId'>) => {
    try {
      await apiRequest('POST', '/api/values', { ...value, userId: user?.id || 1 });
      await fetchValues();
      toast({
        title: "Value Added",
        description: "Your value has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to add value",
        description: "There was a problem adding your value.",
        variant: "destructive"
      });
      console.error('Error adding value:', error);
      throw error;
    }
  };
  
  const updateValue = async (id: number, value: Partial<Value>) => {
    try {
      await apiRequest('PATCH', `/api/values/${id}`, value);
      await fetchValues();
      toast({
        title: "Value Updated",
        description: "Your value has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update value",
        description: "There was a problem updating your value.",
        variant: "destructive"
      });
      console.error('Error updating value:', error);
      throw error;
    }
  };
  
  const deleteValue = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/values/${id}`);
      await fetchValues();
      toast({
        title: "Value Deleted",
        description: "Your value has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete value",
        description: "There was a problem deleting your value.",
        variant: "destructive"
      });
      console.error('Error deleting value:', error);
      throw error;
    }
  };
  
  const addDream = async (dream: Omit<Dream, 'id' | 'userId'>) => {
    try {
      await apiRequest('POST', '/api/dreams', { ...dream, userId: user?.id || 1 });
      await fetchDreams();
      toast({
        title: "Dream Added",
        description: "Your dream has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to add dream",
        description: "There was a problem adding your dream.",
        variant: "destructive"
      });
      console.error('Error adding dream:', error);
      throw error;
    }
  };
  
  const updateDream = async (id: number, dream: Partial<Dream>) => {
    try {
      await apiRequest('PATCH', `/api/dreams/${id}`, dream);
      await fetchDreams();
      toast({
        title: "Dream Updated",
        description: "Your dream has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update dream",
        description: "There was a problem updating your dream.",
        variant: "destructive"
      });
      console.error('Error updating dream:', error);
      throw error;
    }
  };
  
  const deleteDream = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/dreams/${id}`);
      await fetchDreams();
      toast({
        title: "Dream Deleted",
        description: "Your dream has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete dream",
        description: "There was a problem deleting your dream.",
        variant: "destructive"
      });
      console.error('Error deleting dream:', error);
      throw error;
    }
  };
  
  // Create the context value
  const contextValue: AppContextProps = {
    user,
    projects,
    ideas,
    learningItems,
    habits,
    healthMetrics,
    dateIdeas,
    parentingTasks,
    values,
    dreams,
    priorityProject,
    
    // Projects methods
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
    setPriorityProject,
    
    // Ideas methods
    fetchIdeas,
    addIdea,
    updateIdea,
    deleteIdea,
    voteIdea,
    
    // Learning methods
    fetchLearningItems,
    addLearningItem,
    updateLearningItem,
    deleteLearningItem,
    
    // Habits methods
    fetchHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    getHabitCompletions,
    toggleHabitByDate,
    
    // Health metrics methods
    fetchHealthMetrics,
    addHealthMetric,
    updateHealthMetric,
    deleteHealthMetric,
    
    // Date ideas methods
    fetchDateIdeas,
    addDateIdea,
    updateDateIdea,
    deleteDateIdea,
    
    // Parenting tasks methods
    fetchParentingTasks,
    addParentingTask,
    updateParentingTask,
    deleteParentingTask,
    toggleParentingTask,
    
    // Values methods
    fetchValues,
    addValue,
    updateValue,
    deleteValue,
    
    // Dreams methods
    fetchDreams,
    addDream,
    updateDream,
    deleteDream,
    
    // Dashboard methods
    fetchAllData,
    isLoading
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
}