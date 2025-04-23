import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ProjectTask } from "@shared/schema";
import { Plus, Trash2 } from "lucide-react";

interface ProjectTasksDialogProps {
  projectId: number;
  projectTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectTasksDialog = ({ projectId, projectTitle, open, onOpenChange }: ProjectTasksDialogProps) => {
  const { fetchProjectTasks, addProjectTask, deleteProjectTask, toggleProjectTaskCompletion } = useAppContext();
  
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks when dialog opens
  useEffect(() => {
    if (open && projectId) {
      loadTasks();
    }
  }, [open, projectId]);

  const loadTasks = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const projectTasks = await fetchProjectTasks(projectId);
      setTasks(projectTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    try {
      await addProjectTask({
        title: newTaskTitle,
        projectId,
        isCompleted: false
      });
      
      setNewTaskTitle("");
      await loadTasks(); // Refresh the tasks
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      await toggleProjectTaskCompletion(taskId);
      await loadTasks(); // Refresh the tasks
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteProjectTask(taskId);
      await loadTasks(); // Refresh the tasks
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tasks for {projectTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          {/* Add new task form */}
          <form onSubmit={handleAddTask} className="flex items-center space-x-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1"
            />
            <Button type="submit" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </form>
          
          {/* Tasks list */}
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="py-4 text-center text-muted-foreground">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">No tasks yet. Add a task to get started.</div>
            ) : (
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={task.isCompleted || false}
                        onCheckedChange={() => handleToggleTask(task.id)}
                        id={`task-${task.id}`}
                      />
                      <label
                        htmlFor={`task-${task.id}`}
                        className={`text-sm ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {task.title}
                      </label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectTasksDialog;