import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { PlusIcon, CheckIcon, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// Task type definition
type TodayTask = {
  id: number;
  title: string;
  date: string;
  isCompleted: boolean;
  isPriority: boolean;
  position: number;
  notes: string | null;
  userId: number;
};

// Form schema for creating/editing tasks
const taskFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  notes: z.string().nullable().optional(),
  isPriority: z.boolean().default(false),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export default function TodayPage() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TodayTask | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  // Query for all today's tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/today-tasks", today],
    queryFn: async () => {
      const response = await fetch(`/api/today-tasks?date=${today}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      return response.json();
    },
  });

  // Separate priority and regular tasks
  const priorityTasks = tasks
    .filter((task: TodayTask) => task.isPriority)
    .sort((a: TodayTask, b: TodayTask) => a.position - b.position);

  const regularTasks = tasks
    .filter((task: TodayTask) => !task.isPriority)
    .sort((a: TodayTask, b: TodayTask) => a.position - b.position);

  // Form setup
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      notes: "",
      isPriority: false,
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isAddTaskOpen) {
      form.reset({
        title: "",
        notes: "",
        isPriority: false,
      });
    }
  }, [isAddTaskOpen, form]);

  // Set form values when editing a task
  useEffect(() => {
    if (editingTask) {
      form.reset({
        title: editingTask.title,
        notes: editingTask.notes || "",
        isPriority: editingTask.isPriority,
      });
    }
  }, [editingTask, form]);

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const response = await apiRequest("/api/today-tasks", {
        method: "POST",
        data,
      });
      return response;
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
      const response = await apiRequest(`/api/today-tasks/${id}`, {
        method: "PATCH",
        data,
      });
      return response;
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
      const response = await apiRequest(`/api/today-tasks/${id}/toggle`, {
        method: "POST",
      });
      return response;
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
      const response = await apiRequest(`/api/today-tasks/${id}/priority`, {
        method: "POST",
        data: { isPriority },
      });
      return response;
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
      const response = await apiRequest(`/api/today-tasks/${id}`, {
        method: "DELETE",
      });
      return response;
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
      const response = await apiRequest("/api/today-tasks/reorder", {
        method: "POST",
        data: { taskIds },
      });
      return response;
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
  const handleDragEnd = (result: any) => {
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
                        priorityTasks.map((task, index) => (
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
                                    {task.notes && (
                                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                        {task.notes}
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
                        regularTasks.map((task, index) => (
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
                                    {task.notes && (
                                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                        {task.notes}
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
                          <p>No other tasks for today.</p>
                          <p className="text-sm">
                            Add a regular task to see it here.
                          </p>
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
      <Dialog
        open={isAddTaskOpen || editingTask !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddTaskOpen(false);
            setEditingTask(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Edit Task" : "Add New Task"}
            </DialogTitle>
            <DialogDescription>
              {editingTask
                ? "Update your task details below."
                : "Enter the details of your new task."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 pt-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
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
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional details"
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
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={
                          priorityTasks.length >= MAX_PRIORITY_TASKS &&
                          !editingTask?.isPriority &&
                          field.value
                        }
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Mark as priority (Top {MAX_PRIORITY_TASKS} tasks)
                      </FormLabel>
                      {priorityTasks.length >= MAX_PRIORITY_TASKS &&
                        !editingTask?.isPriority &&
                        field.value && (
                          <p className="text-sm text-destructive">
                            You can only have {MAX_PRIORITY_TASKS} priority tasks
                          </p>
                        )}
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddTaskOpen(false);
                    setEditingTask(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createTaskMutation.isPending || updateTaskMutation.isPending
                  }
                >
                  {createTaskMutation.isPending || updateTaskMutation.isPending ? (
                    "Saving..."
                  ) : editingTask ? (
                    "Update Task"
                  ) : (
                    "Add Task"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}