import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

const TodaySection = () => {
  const queryClient = useQueryClient();
  
  // Query for today's tasks
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/today-tasks"],
    queryFn: async () => {
      const response = await fetch("/api/today-tasks");
      
      if (!response.ok) {
        throw new Error("Failed to fetch today's tasks");
      }
      
      return response.json();
    },
  });
  
  // Get top 3 priority tasks and non-priority tasks
  const priorityTasks = tasks
    .filter((task) => task.isPriority)
    .sort((a, b) => a.position - b.position)
    .slice(0, 3);
  
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
  });

  if (isLoading) {
    return (
      <Card className="col-span-3 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold flex justify-between items-center">
            <span>Today's Focus</span>
            <Badge variant="outline" className="bg-primary/10">
              Loading...
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading today's tasks...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-3 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex justify-between items-center">
          <span>Today's Focus</span>
          <Badge variant="outline" className="bg-primary/10">
            {priorityTasks.length}/3 Priority Tasks
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {priorityTasks.length > 0 ? (
            priorityTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-md border ${
                  task.isCompleted
                    ? "bg-muted/50 text-muted-foreground"
                    : "bg-card"
                }`}
              >
                <div className="flex items-center">
                  <Checkbox
                    checked={task.isCompleted}
                    onCheckedChange={() => toggleTaskMutation.mutate(task.id)}
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
                      <p className="text-sm text-muted-foreground truncate max-w-[400px]">
                        {task.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-3 text-muted-foreground">
              <p>No priority tasks for today.</p>
              <p className="text-sm mt-1">
                Add tasks from the Today page.
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-end">
          <Link href="/today">
            <Button className="mt-2">
              <PlusIcon className="mr-2 h-4 w-4" /> Manage Today's Tasks
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaySection;