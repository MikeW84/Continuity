import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import { ProjectTask } from "@shared/schema";

interface ProjectTasksSummaryProps {
  projectId: number;
  onManageTasks: () => void;
  isDarkBackground?: boolean; // Indicates if this component is rendered on a dark background
}

const ProjectTasksSummary = ({ projectId, onManageTasks, isDarkBackground = false }: ProjectTasksSummaryProps) => {
  const { fetchProjectTasks } = useAppContext();
  
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const loadTasks = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(false);
    
    try {
      const projectTasks = await fetchProjectTasks(projectId);
      setTasks(projectTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate task stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (isLoading) {
    return (
      <div className="mt-2 text-xs text-muted-foreground">
        Loading tasks...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-2 text-xs text-destructive">
        Error loading tasks. 
        <Button 
          variant="link" 
          size="sm" 
          className={`p-0 h-auto text-xs ${isDarkBackground ? "text-white" : "text-primary"}`} 
          onClick={loadTasks}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (totalTasks === 0) {
    return (
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">No tasks</span>
        <Button 
          variant={isDarkBackground ? "secondary" : "outline"}
          size="sm" 
          className={`h-7 text-xs ${isDarkBackground ? "text-white" : "text-primary"}`}
          onClick={onManageTasks}
        >
          <ClipboardList className={`h-3 w-3 mr-1 ${isDarkBackground ? "text-white" : "text-primary"}`} />
          Add Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between">
        <div className="text-xs">
          <span className="font-medium">{completedTasks}/{totalTasks} Tasks Completed</span>
        </div>
        <Button 
          variant={isDarkBackground ? "secondary" : "outline"}
          size="sm" 
          className={`h-7 text-xs ${isDarkBackground ? "text-white" : "text-primary"}`}
          onClick={onManageTasks}
        >
          <ClipboardList className={`h-3 w-3 mr-1 ${isDarkBackground ? "text-white" : "text-primary"}`} />
          Manage
        </Button>
      </div>
    </div>
  );
};

export default ProjectTasksSummary;