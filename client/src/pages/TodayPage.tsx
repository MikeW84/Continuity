import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { PlusIcon, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

// Define the task type based on the actual database columns
interface Task {
  id: number;
  title: string;
  notes: string | null;
  isPriority: boolean;
  isCompleted: boolean;
  position: number;
  date: string;
  userId: number;
}

// Schema for task form validation
const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  isPriority: z.boolean().default(false),
  notes: z.string().optional().nullable(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const TodayPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form setup
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      isPriority: false,
      notes: "",
    },
  });

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/today-tasks"],
    queryFn: async () => {
      const response = await fetch("/api/today-tasks");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      return response.json();
    },
  });

  // Separate tasks into priority and regular
  const priorityTasks = tasks.filter((task: Task) => task.isPriority)
    .sort((a: Task, b: Task) => a.position - b.position);
    
  const regularTasks = tasks.filter((task: Task) => !task.isPriority)
    .sort((a: Task, b: Task) => a.position - b.position);

  // Reset form when opening dialog
  const handleAddTaskClick = () => {
    form.reset({
      title: "",
      isPriority: false,
      notes: "",
    });
    setIsAddTaskOpen(true);
  };

  // Set form values when editing a task
  useEffect(() => {
    if (editingTask) {
      form.reset({
        title: editingTask.title,
        isPriority: editingTask.isPriority,
        notes: editingTask.notes || "",
      });
    }
  }, [editingTask, form]);

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const response = await fetch("/api/today-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create task");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/today-tasks"] });
      setIsAddTaskOpen(false);
      toast({
        title: "Task Created",
        description: "Your task has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error creating your task.",
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<TaskFormValues>;
    }) => {
      const response = await fetch(`/api/today-tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/today-tasks"] });
      setEditingTask(null);
      toast({
        title: "Task Updated",
        description: "Your task has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error updating your task.",
        variant: "destructive",
      });
    },
  });

  // Toggle task completion mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/today-tasks/${id}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to toggle task completion");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/today-tasks"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error updating the task completion status.",
        variant: "destructive",
      });
    },
  });

  // Toggle task priority mutation
  const togglePriorityMutation = useMutation({
    mutationFn: async ({
      id,
      isPriority,
    }: {
      id: number;
      isPriority: boolean;
    }) => {
      const response = await fetch(`/api/today-tasks/${id}/priority`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPriority }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update task priority");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/today-tasks"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error updating the task priority.",
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/today-tasks/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/today-tasks"] });
      toast({
        title: "Task Deleted",
        description: "Your task has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error deleting the task.",
        variant: "destructive",
      });
    },
  });

  // Reorder tasks mutation
  const reorderTasksMutation = useMutation({
    mutationFn: async (taskIds: number[]) => {
      const response = await fetch("/api/today-tasks/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskIds }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to reorder tasks");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/today-tasks"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error reordering the tasks.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: TaskFormValues) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data });
    } else {
      createTaskMutation.mutate(data);
    }
  };

  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // If dropped in the same list
    if (source.droppableId === destination.droppableId) {
      const listType = source.droppableId;
      const sourceIndex = source.index;
      const destIndex = destination.index;
      
      if (sourceIndex === destIndex) return;
      
      // Determine which list to update
      const list = listType === "priority-tasks" ? [...priorityTasks] : [...regularTasks];
      
      // Remove the task from the source and insert at destination
      const [removed] = list.splice(sourceIndex, 1);
      list.splice(destIndex, 0, removed);
      
      // Extract IDs in the new order
      const newOrder = list.map(task => task.id);
      
      // Update positions in the database
      reorderTasksMutation.mutate(newOrder);
    } else {
      // Moving between lists - this changes priority status
      const taskId = parseInt(draggableId.split('-')[1]);
      const movingToPriority = destination.droppableId === "priority-tasks";
      
      // Toggle priority status
      togglePriorityMutation.mutate({
        id: taskId,
        isPriority: movingToPriority
      });
    }
  };

  // The max number of priority tasks (Top 3)
  const MAX_PRIORITY_TASKS = 3;

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Today</h1>
        <Button onClick={() => setIsAddTaskOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <p>Loading tasks...</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 gap-6">
            {/* Top Priority Tasks Section */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Top {MAX_PRIORITY_TASKS} Priority Tasks</CardTitle>
                  <Badge variant="outline" className="bg-primary/10">
                    {priorityTasks.length}/{MAX_PRIORITY_TASKS}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Droppable droppableId="priority-tasks">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {priorityTasks.length > 0 ? (
                        priorityTasks.map((task: Task, index: number) => (
                          <Draggable
                            key={`task-${task.id}`}
                            draggableId={`task-${task.id}`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex items-center justify-between p-3 rounded-md border ${
                                  task.isCompleted
                                    ? "bg-muted/50 text-muted-foreground"
                                    : "bg-card"
                                }`}
                              >
                                <div className="flex items-center">
                                  <Checkbox
                                    checked={task.isCompleted}
                                    onCheckedChange={() =>
                                      toggleTaskMutation.mutate(task.id)
                                    }
                                    className="mr-3"
                                  />
                                  <div>
                                    <p
                                      className={`font-medium ${
                                        task.isCompleted ? "line-through" : ""
                                      }`}
                                    >
                                      {task.title}
                                    </p>
                                    {task.description && (
                                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingTask(task)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      togglePriorityMutation.mutate({
                                        id: task.id,
                                        isPriority: false,
                                      })
                                    }
                                  >
                                    <ArrowDownIcon className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      deleteTaskMutation.mutate(task.id)
                                    }
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <p>No priority tasks for today.</p>
                          <p className="text-sm">
                            Add a task and mark it as priority to see it here.
                          </p>
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>

            {/* Regular Tasks Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Other Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <Droppable droppableId="regular-tasks">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {regularTasks.length > 0 ? (
                        regularTasks.map((task: Task, index: number) => (
                          <Draggable
                            key={`task-${task.id}`}
                            draggableId={`task-${task.id}`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex items-center justify-between p-3 rounded-md border ${
                                  task.isCompleted
                                    ? "bg-muted/50 text-muted-foreground"
                                    : "bg-card"
                                }`}
                              >
                                <div className="flex items-center">
                                  <Checkbox
                                    checked={task.isCompleted}
                                    onCheckedChange={() =>
                                      toggleTaskMutation.mutate(task.id)
                                    }
                                    className="mr-3"
                                  />
                                  <div>
                                    <p
                                      className={`font-medium ${
                                        task.isCompleted ? "line-through" : ""
                                      }`}
                                    >
                                      {task.title}
                                    </p>
                                    {task.description && (
                                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingTask(task)}
                                  >
                                    Edit
                                  </Button>
                                  {priorityTasks.length < MAX_PRIORITY_TASKS && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        togglePriorityMutation.mutate({
                                          id: task.id,
                                          isPriority: true,
                                        })
                                      }
                                    >
                                      <ArrowUpIcon className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      deleteTaskMutation.mutate(task.id)
                                    }
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <p>No tasks for today.</p>
                          <p className="text-sm">Add a task to get started.</p>
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>
        </DragDropContext>
      )}

      {/* Add/Edit Task Dialog */}
      <Dialog open={isAddTaskOpen || editingTask !== null} onOpenChange={(open) => {
        if (!open) {
          setIsAddTaskOpen(false);
          setEditingTask(null);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Edit Task" : "Add New Task"}
            </DialogTitle>
            <DialogDescription>
              {editingTask
                ? "Update the details of your task."
                : "Add a new task for today."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-2"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter task title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add notes or details about this task"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPriority"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Priority Task</FormLabel>
                      <FormDescription>
                        Mark as one of your top 3 priorities for today.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={
                          !editingTask?.isPriority &&
                          priorityTasks.length >= MAX_PRIORITY_TASKS
                        }
                      />
                    </FormControl>
                    {!editingTask?.isPriority &&
                      priorityTasks.length >= MAX_PRIORITY_TASKS && (
                        <FormMessage>
                          You already have {MAX_PRIORITY_TASKS} priority tasks.
                        </FormMessage>
                      )}
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  {editingTask ? "Update Task" : "Add Task"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TodayPage;