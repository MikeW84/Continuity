import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";

// Date idea form schema
const dateIdeaFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().optional(),
  isScheduled: z.boolean().default(false),
});

type DateIdeaFormValues = z.infer<typeof dateIdeaFormSchema>;

// Parenting task form schema
const parentingTaskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  isCompleted: z.boolean().default(false),
});

type ParentingTaskFormValues = z.infer<typeof parentingTaskFormSchema>;

const FamilyPage = () => {
  const { 
    dateIdeas, 
    parentingTasks, 
    fetchDateIdeas, 
    fetchParentingTasks, 
    addDateIdea, 
    updateDateIdea, 
    deleteDateIdea, 
    addParentingTask, 
    updateParentingTask, 
    deleteParentingTask, 
    toggleParentingTask, 
    isLoading 
  } = useAppContext();
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'date' | 'task'>('date');
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const dateForm = useForm<DateIdeaFormValues>({
    resolver: zodResolver(dateIdeaFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      isScheduled: false,
    },
  });

  const taskForm = useForm<ParentingTaskFormValues>({
    resolver: zodResolver(parentingTaskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      isCompleted: false,
    },
  });

  useEffect(() => {
    fetchDateIdeas();
    fetchParentingTasks();
  }, [fetchDateIdeas, fetchParentingTasks]);

  const scheduledDate = dateIdeas.find(date => date.isScheduled);
  const unscheduledDateIdeas = dateIdeas.filter(date => !date.isScheduled);

  const handleAddDateIdea = async (data: DateIdeaFormValues) => {
    // If this is a scheduled date and there's already a scheduled date, unschedule the old one
    if (data.isScheduled && scheduledDate && (!selectedDate || selectedDate !== scheduledDate.id)) {
      await updateDateIdea(scheduledDate.id, { isScheduled: false });
    }

    if (selectedDate) {
      // Update existing date idea
      await updateDateIdea(selectedDate, {
        ...data,
        date: data.date ? new Date(data.date) : null,
      });
    } else {
      // Add new date idea
      await addDateIdea({
        ...data,
        date: data.date ? new Date(data.date) : null,
      });
    }
    
    setIsDateDialogOpen(false);
    dateForm.reset();
  };

  const handleAddParentingTask = async (data: ParentingTaskFormValues) => {
    if (selectedTask) {
      // Update existing parenting task
      await updateParentingTask(selectedTask, data);
    } else {
      // Add new parenting task
      await addParentingTask(data);
    }
    
    setIsTaskDialogOpen(false);
    taskForm.reset();
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    if (deleteType === 'date') {
      await deleteDateIdea(selectedItem);
    } else {
      await deleteParentingTask(selectedItem);
    }
    
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const handleToggleTask = async (id: number) => {
    await toggleParentingTask(id);
  };

  const openEditDateDialog = (date: any) => {
    setSelectedDate(date.id);
    dateForm.reset({
      title: date.title,
      description: date.description || "",
      date: date.date ? format(new Date(date.date), 'yyyy-MM-dd') : undefined,
      isScheduled: date.isScheduled,
    });
    setIsDateDialogOpen(true);
  };

  const openEditTaskDialog = (task: any) => {
    setSelectedTask(task.id);
    taskForm.reset({
      title: task.title,
      description: task.description || "",
      isCompleted: task.isCompleted,
    });
    setIsTaskDialogOpen(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-inter font-bold text-primary">Family</h2>
        <div className="flex gap-2">
          <Button 
            className="bg-accent text-white"
            onClick={() => {
              setSelectedDate(null);
              dateForm.reset({
                title: "",
                description: "",
                date: "",
                isScheduled: false,
              });
              setIsDateDialogOpen(true);
            }}
          >
            <i className="ri-calendar-heart-line mr-2"></i>
            New Date Idea
          </Button>
          <Button 
            className="bg-success text-white"
            onClick={() => {
              setSelectedTask(null);
              taskForm.reset({
                title: "",
                description: "",
                isCompleted: false,
              });
              setIsTaskDialogOpen(true);
            }}
          >
            <i className="ri-parent-line mr-2"></i>
            New Parenting Task
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="dates" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="dates">Date Planning</TabsTrigger>
          <TabsTrigger value="parenting">Parenting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dates">
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-4">Date with Bekah</h3>
            
            {isLoading ? (
              <div className="h-48 bg-gray-100 animate-pulse rounded-lg mb-6"></div>
            ) : (
              <>
                {scheduledDate ? (
                  <Card className="mb-6 border-accent border">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-inter font-medium text-lg">Upcoming Date</h4>
                        <div className="flex items-center">
                          <span className="text-sm bg-accent bg-opacity-20 text-accent py-1 px-2 rounded mr-4">
                            {scheduledDate.date ? format(new Date(scheduledDate.date), 'MMMM do') : 'Not scheduled'}
                          </span>
                          <div className="flex">
                            <button 
                              className="text-secondary hover:text-primary transition-colors mr-2"
                              onClick={() => openEditDateDialog(scheduledDate)}
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button 
                              className="text-secondary hover:text-destructive transition-colors"
                              onClick={() => {
                                setDeleteType('date');
                                setSelectedItem(scheduledDate.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <p className="text-secondary mb-4">{scheduledDate.title}</p>
                      {scheduledDate.description && (
                        <p className="text-sm text-muted-foreground mb-4">{scheduledDate.description}</p>
                      )}
                      <div className="flex items-center text-sm">
                        <Button variant="outline" size="sm" className="mr-2" onClick={() => openEditDateDialog(scheduledDate)}>
                          <i className="ri-edit-line mr-1"></i> Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <i className="ri-calendar-check-line mr-1"></i> Check Availability
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="mb-6">
                    <CardContent className="p-6 text-center">
                      <i className="ri-calendar-heart-line text-3xl text-secondary mb-2"></i>
                      <h4 className="text-lg font-medium mb-2">No upcoming date scheduled</h4>
                      <p className="text-secondary mb-4">Schedule a date or select one from your date ideas</p>
                      <Button 
                        onClick={() => {
                          setSelectedDate(null);
                          dateForm.reset({
                            title: "",
                            description: "",
                            date: "",
                            isScheduled: true,
                          });
                          setIsDateDialogOpen(true);
                        }}
                      >
                        <i className="ri-calendar-2-line mr-1"></i> Schedule a Date
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
            
            <h3 className="text-lg font-medium mb-4">Date Ideas</h3>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : (
              <>
                {unscheduledDateIdeas.length === 0 ? (
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <p className="text-secondary mb-4">No date ideas yet. Add some ideas for future dates!</p>
                      <Button 
                        onClick={() => {
                          setSelectedDate(null);
                          dateForm.reset({
                            title: "",
                            description: "",
                            date: "",
                            isScheduled: false,
                          });
                          setIsDateDialogOpen(true);
                        }}
                      >
                        <i className="ri-add-line mr-1"></i> Add Date Idea
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unscheduledDateIdeas.map(idea => (
                      <Card key={idea.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-base">{idea.title}</h4>
                            <div className="flex">
                              <button 
                                className="text-secondary hover:text-primary transition-colors mr-2"
                                onClick={() => openEditDateDialog(idea)}
                              >
                                <i className="ri-edit-line"></i>
                              </button>
                              <button 
                                className="text-secondary hover:text-destructive transition-colors"
                                onClick={() => {
                                  setDeleteType('date');
                                  setSelectedItem(idea.id);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </div>
                          </div>
                          
                          {idea.description && (
                            <p className="text-sm text-secondary mt-1 mb-3">{idea.description}</p>
                          )}
                          
                          <Button 
                            size="sm" 
                            className="mt-2"
                            onClick={() => {
                              openEditDateDialog({
                                ...idea,
                                isScheduled: true,
                              });
                            }}
                          >
                            Schedule
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {/* Add New Date Idea Card */}
                    <Card className="border border-dashed border-gray-300 bg-gray-50">
                      <CardContent className="p-4 flex items-center justify-center h-full">
                        <Button 
                          variant="ghost" 
                          className="flex flex-col items-center p-4 h-auto w-full"
                          onClick={() => {
                            setSelectedDate(null);
                            dateForm.reset({
                              title: "",
                              description: "",
                              date: "",
                              isScheduled: false,
                            });
                            setIsDateDialogOpen(true);
                          }}
                        >
                          <i className="ri-add-line text-2xl text-secondary mb-1"></i>
                          <span className="text-secondary text-sm">Add Date Idea</span>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="parenting">
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-4">Parenting Tasks</h3>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : (
              <>
                {parentingTasks.length === 0 ? (
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <i className="ri-parent-line text-3xl text-secondary mb-2"></i>
                      <h4 className="text-lg font-medium mb-2">No parenting tasks yet</h4>
                      <p className="text-secondary mb-4">Add important tasks related to parenting</p>
                      <Button 
                        onClick={() => {
                          setSelectedTask(null);
                          taskForm.reset({
                            title: "",
                            description: "",
                            isCompleted: false,
                          });
                          setIsTaskDialogOpen(true);
                        }}
                      >
                        <i className="ri-add-line mr-1"></i> Add Parenting Task
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {parentingTasks.map(task => (
                      <Card key={task.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start">
                            <div 
                              className={`h-6 w-6 rounded-full border-2 mt-0.5 mr-3 flex-shrink-0 ${
                                task.isCompleted 
                                  ? "border-success bg-success bg-opacity-10 flex items-center justify-center" 
                                  : "border-secondary"
                              }`}
                              onClick={() => handleToggleTask(task.id)}
                            >
                              {task.isCompleted && (
                                <i className="ri-check-line text-success"></i>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h4 className="font-medium">{task.title}</h4>
                                <div className="flex">
                                  <button 
                                    className="text-secondary hover:text-primary transition-colors mr-2"
                                    onClick={() => openEditTaskDialog(task)}
                                  >
                                    <i className="ri-edit-line"></i>
                                  </button>
                                  <button 
                                    className="text-secondary hover:text-destructive transition-colors"
                                    onClick={() => {
                                      setDeleteType('task');
                                      setSelectedItem(task.id);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                </div>
                              </div>
                              {task.description && (
                                <p className="text-sm text-secondary mt-1">{task.description}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {/* Add New Parenting Task Card */}
                    <Card className="border border-dashed border-gray-300 bg-gray-50">
                      <CardContent className="p-4 flex items-center justify-center h-full">
                        <Button 
                          variant="ghost" 
                          className="flex flex-col items-center p-4 h-auto w-full"
                          onClick={() => {
                            setSelectedTask(null);
                            taskForm.reset({
                              title: "",
                              description: "",
                              isCompleted: false,
                            });
                            setIsTaskDialogOpen(true);
                          }}
                        >
                          <i className="ri-add-line text-2xl text-secondary mb-1"></i>
                          <span className="text-secondary text-sm">Add Parenting Task</span>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Date Idea Dialog */}
      <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDate ? "Edit Date Idea" : "Add New Date Idea"}</DialogTitle>
          </DialogHeader>
          
          <Form {...dateForm}>
            <form onSubmit={dateForm.handleSubmit(handleAddDateIdea)} className="space-y-4">
              <FormField
                control={dateForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Title/Activity</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter date activity" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={dateForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter details about the date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={dateForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={dateForm.control}
                name="isScheduled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {scheduledDate && (!selectedDate || selectedDate !== scheduledDate.id) ? 
                          "Make this the scheduled date (will replace current scheduled date)" : 
                          "Set as scheduled upcoming date"
                        }
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" className="bg-accent text-white">
                  {selectedDate ? "Update Date Idea" : "Add Date Idea"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add/Edit Parenting Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask ? "Edit Parenting Task" : "Add New Parenting Task"}</DialogTitle>
          </DialogHeader>
          
          <Form {...taskForm}>
            <form onSubmit={taskForm.handleSubmit(handleAddParentingTask)} className="space-y-4">
              <FormField
                control={taskForm.control}
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
                control={taskForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter task details" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={taskForm.control}
                name="isCompleted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Task completed</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" className="bg-accent text-white">
                  {selectedTask ? "Update Task" : "Add Task"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteType === 'date' ? 'Date Idea' : 'Parenting Task'}</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this {deleteType === 'date' ? 'date idea' : 'parenting task'}? This action cannot be undone.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FamilyPage;
