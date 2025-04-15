import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import HabitCalendar from "@/components/habits/HabitCalendar";

// Habit form schema
const habitFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  completedDays: z.number().min(0).default(0),
  targetDays: z.number().min(1).default(30),
  isCompletedToday: z.boolean().default(false),
});

type HabitFormValues = z.infer<typeof habitFormSchema>;

// Health metric form schema
const healthMetricFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Value is required"),
  change: z.string().nullable().default(null),
  icon: z.string().default("heart-pulse"),
});

type HealthMetricFormValues = z.infer<typeof healthMetricFormSchema>;

const HealthHabitsPage = () => {
  const { 
    habits, 
    healthMetrics, 
    fetchHabits, 
    fetchHealthMetrics, 
    addHabit, 
    updateHabit, 
    deleteHabit, 
    toggleHabit,
    addHealthMetric,
    updateHealthMetric,
    deleteHealthMetric,
    isLoading 
  } = useAppContext();
  
  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);
  const [isMetricDialogOpen, setIsMetricDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<number | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'habit' | 'metric'>('habit');
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const habitForm = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      title: "",
      completedDays: 0,
      targetDays: 30,
      isCompletedToday: false,
    },
  });

  const metricForm = useForm<HealthMetricFormValues>({
    resolver: zodResolver(healthMetricFormSchema),
    defaultValues: {
      name: "",
      value: "",
      change: null,
      icon: "heart-pulse",
    },
  });

  useEffect(() => {
    fetchHabits();
    fetchHealthMetrics();
  }, [fetchHabits, fetchHealthMetrics]);

  const handleAddHabit = async (data: HabitFormValues) => {
    if (selectedHabit) {
      // Update existing habit
      await updateHabit(selectedHabit, {
        title: data.title,
        completedDays: data.completedDays,
        targetDays: data.targetDays,
        isCompletedToday: data.isCompletedToday,
      });
    } else {
      // Add new habit
      await addHabit({
        title: data.title,
        completedDays: data.completedDays,
        targetDays: data.targetDays,
        isCompletedToday: data.isCompletedToday,
      });
    }
    
    setIsHabitDialogOpen(false);
    habitForm.reset();
  };

  const handleAddHealthMetric = async (data: HealthMetricFormValues) => {
    if (selectedMetric) {
      // Update existing health metric
      await updateHealthMetric(selectedMetric, {
        name: data.name,
        value: data.value,
        change: data.change,
        icon: data.icon,
      });
    } else {
      // Add new health metric
      await addHealthMetric({
        name: data.name,
        value: data.value,
        change: data.change,
        icon: data.icon,
      });
    }
    
    setIsMetricDialogOpen(false);
    metricForm.reset();
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    if (deleteType === 'habit') {
      await deleteHabit(selectedItem);
    } else {
      await deleteHealthMetric(selectedItem);
    }
    
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const handleToggleHabit = async (id: number) => {
    await toggleHabit(id);
  };

  const openEditHabitDialog = (habit: any) => {
    setSelectedHabit(habit.id);
    habitForm.reset({
      title: habit.title,
      completedDays: habit.completedDays || 0,
      targetDays: habit.targetDays || 30,
      isCompletedToday: habit.isCompletedToday || false,
    });
    setIsHabitDialogOpen(true);
  };

  const openEditMetricDialog = (metric: any) => {
    setSelectedMetric(metric.id);
    metricForm.reset({
      name: metric.name,
      value: metric.value,
      change: metric.change || null,
      icon: metric.icon || "heart-pulse",
    });
    setIsMetricDialogOpen(true);
  };

  // Common icons for health metrics
  const iconOptions = [
    { value: "heart-pulse", label: "Heart Rate" },
    { value: "footprint", label: "Steps" },
    { value: "scales", label: "Weight" },
    { value: "moon", label: "Sleep" },
    { value: "drop", label: "Water" },
    { value: "run", label: "Exercise" },
    { value: "mental-health", label: "Mental Health" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-inter font-bold text-primary">Health & Habits</h2>
        <div className="flex gap-2">
          <Button 
            className="bg-success text-white"
            onClick={() => {
              setSelectedHabit(null);
              habitForm.reset({
                title: "",
                completedDays: 0,
                targetDays: 30,
                isCompletedToday: false,
              });
              setIsHabitDialogOpen(true);
            }}
          >
            <i className="ri-calendar-check-line mr-2"></i>
            New Habit
          </Button>
          <Button 
            className="bg-accent text-white"
            onClick={() => {
              setSelectedMetric(null);
              metricForm.reset({
                name: "",
                value: "",
                change: null,
                icon: "heart-pulse",
              });
              setIsMetricDialogOpen(true);
            }}
          >
            <i className="ri-heart-pulse-line mr-2"></i>
            New Health Metric
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="habits" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="habits">Daily Habits</TabsTrigger>
          <TabsTrigger value="metrics">Health Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="habits">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <>
              {habits.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <i className="ri-calendar-check-line text-4xl text-secondary mb-3"></i>
                  <h3 className="text-xl font-medium mb-2">No habits tracked yet</h3>
                  <p className="text-secondary mb-4">Start building healthy habits by adding your first daily habit</p>
                  <Button 
                    onClick={() => {
                      setSelectedHabit(null);
                      habitForm.reset({
                        title: "",
                        completedDays: 0,
                        targetDays: 30,
                        isCompletedToday: false,
                      });
                      setIsHabitDialogOpen(true);
                    }}
                  >
                    <i className="ri-add-line mr-1"></i> Add Your First Habit
                  </Button>
                </div>
              ) : (
                <>
                  {/* Monthly Calendar View */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Monthly Tracking</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {habits.map(habit => (
                        <div key={`calendar-${habit.id}`} className="relative">
                          <div className="absolute top-2 right-2 z-10 flex gap-2">
                            <button 
                              className="text-secondary hover:text-primary transition-colors"
                              onClick={() => openEditHabitDialog(habit)}
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button 
                              className="text-secondary hover:text-destructive transition-colors"
                              onClick={() => {
                                setDeleteType('habit');
                                setSelectedItem(habit.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                          <HabitCalendar 
                            habitId={habit.id} 
                            habitName={habit.title}
                            targetDays={habit.targetDays}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Add New Habit Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    
                    {/* Add New Habit Card */}
                    <Card className="border border-dashed border-gray-300 bg-gray-50">
                      <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                        <Button 
                          variant="ghost" 
                          className="flex flex-col items-center p-8 h-auto w-full"
                          onClick={() => {
                            setSelectedHabit(null);
                            habitForm.reset({
                              title: "",
                              completedDays: 0,
                              targetDays: 30,
                              isCompletedToday: false,
                            });
                            setIsHabitDialogOpen(true);
                          }}
                        >
                          <i className="ri-add-line text-3xl text-secondary mb-2"></i>
                          <span className="text-secondary font-medium">Add New Habit</span>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="metrics">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <>
              {healthMetrics.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <i className="ri-heart-pulse-line text-4xl text-secondary mb-3"></i>
                  <h3 className="text-xl font-medium mb-2">No health metrics tracked yet</h3>
                  <p className="text-secondary mb-4">Track important health indicators to monitor your wellbeing</p>
                  <Button 
                    onClick={() => {
                      setSelectedMetric(null);
                      metricForm.reset({
                        name: "",
                        value: "",
                        change: null,
                        icon: "heart-pulse",
                      });
                      setIsMetricDialogOpen(true);
                    }}
                  >
                    <i className="ri-add-line mr-1"></i> Add Your First Health Metric
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {healthMetrics.map(metric => (
                    <Card key={metric.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-accent bg-opacity-10 flex items-center justify-center mr-3">
                              <i className={`ri-${metric.icon}-line text-accent text-lg`}></i>
                            </div>
                            <h3 className="font-inter font-medium">{metric.name}</h3>
                          </div>
                          <div className="flex">
                            <button 
                              className="text-secondary hover:text-primary transition-colors mr-2"
                              onClick={() => openEditMetricDialog(metric)}
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button 
                              className="text-secondary hover:text-destructive transition-colors"
                              onClick={() => {
                                setDeleteType('metric');
                                setSelectedItem(metric.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-inter font-semibold">{metric.value}</span>
                          {metric.change && (
                            <span className="text-xs text-success bg-success bg-opacity-10 py-1 px-2 rounded">
                              {metric.change}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Add New Health Metric Card */}
                  <Card className="border border-dashed border-gray-300 bg-gray-50">
                    <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                      <Button 
                        variant="ghost" 
                        className="flex flex-col items-center p-8 h-auto w-full"
                        onClick={() => {
                          setSelectedMetric(null);
                          metricForm.reset({
                            name: "",
                            value: "",
                            change: null,
                            icon: "heart-pulse",
                          });
                          setIsMetricDialogOpen(true);
                        }}
                      >
                        <i className="ri-add-line text-3xl text-secondary mb-2"></i>
                        <span className="text-secondary font-medium">Add New Health Metric</span>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Habit Dialog */}
      <Dialog open={isHabitDialogOpen} onOpenChange={setIsHabitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedHabit ? "Edit Habit" : "Add New Habit"}</DialogTitle>
          </DialogHeader>
          
          <Form {...habitForm}>
            <form onSubmit={habitForm.handleSubmit(handleAddHabit)} className="space-y-4">
              <FormField
                control={habitForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habit Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter habit title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={habitForm.control}
                  name="completedDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completed Days</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={habitForm.control}
                  name="targetDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Days</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={habitForm.control}
                name="isCompletedToday"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 text-accent rounded border-gray-300 focus:ring-accent"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Completed Today</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" className="bg-accent text-white">
                  {selectedHabit ? "Update Habit" : "Add Habit"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add/Edit Health Metric Dialog */}
      <Dialog open={isMetricDialogOpen} onOpenChange={setIsMetricDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMetric ? "Edit Health Metric" : "Add New Health Metric"}</DialogTitle>
          </DialogHeader>
          
          <Form {...metricForm}>
            <form onSubmit={metricForm.handleSubmit(handleAddHealthMetric)} className="space-y-4">
              <FormField
                control={metricForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metric Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter metric name (e.g. Sleep, Steps)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={metricForm.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Value</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter value (e.g. 7.5, 10,000)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={metricForm.control}
                name="change"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Change/Trend (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. +10%, -0.5, etc." 
                        {...field} 
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={metricForm.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        {...field}
                      >
                        {iconOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" className="bg-accent text-white">
                  {selectedMetric ? "Update Metric" : "Add Metric"}
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
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this {deleteType}? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthHabitsPage;