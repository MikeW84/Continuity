import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import HabitCalendar from "@/components/habits/HabitCalendar";
import ExerciseCalendar from "@/components/exercises/ExerciseCalendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Habit form schema
const habitFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  completedDays: z.number().min(0).default(0),
  targetDays: z.number().min(1).default(30),
  isCompletedToday: z.boolean().default(false),
});

type HabitFormValues = z.infer<typeof habitFormSchema>;

// Exercise form schema
const exerciseFormSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  date: z.string().min(1, "Date is required"),
  category: z.enum(["Cardio", "Strength", "Flexibility"]),
  // Optional fields based on category
  time: z.number().nullable().default(null), // Total seconds
  timeMinutes: z.number().nullable().default(null), // For UI only
  timeSeconds: z.number().nullable().default(null), // For UI only
  distance: z.number().nullable().default(null),
  heartRate: z.number().nullable().default(null),
  weight: z.number().nullable().default(null),
  reps: z.number().nullable().default(null),
  sets: z.number().nullable().default(null),
  duration: z.number().nullable().default(null),
  musclesWorked: z.string().nullable().default(null),
});

type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;

const HealthHabitsPage = () => {
  const {
    habits,
    exercises,
    fetchHabits,
    fetchExercises,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    addExercise,
    updateExercise,
    deleteExercise,
    isLoading,
  } = useAppContext();

  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<number | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"habit" | "exercise">("habit");
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

  // Create today's date with noon time to avoid timezone issues
  const getNoonDate = () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Set to noon
    return today.toISOString().split("T")[0];
  };

  const exerciseForm = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: {
      name: "",
      date: getNoonDate(),
      category: "Cardio",
      time: null,
      timeMinutes: null,
      timeSeconds: null,
      distance: null,
      heartRate: null,
      weight: null,
      reps: null,
      sets: null,
      duration: null,
      musclesWorked: null,
    },
  });

  useEffect(() => {
    fetchHabits();
    fetchExercises();
  }, [fetchHabits, fetchExercises]);

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

  const handleAddExercise = async (data: ExerciseFormValues) => {
    try {
      // Pass the date string directly to the server
      // The server will handle the conversion to a Date object

      if (selectedExercise) {
        // Update existing exercise
        await updateExercise(selectedExercise, {
          name: data.name,
          date: data.date, // Send date as string in YYYY-MM-DD format
          category: data.category,
          time: data.time,
          distance: data.distance,
          heartRate: data.heartRate,
          weight: data.weight,
          reps: data.reps,
          sets: data.sets,
          duration: data.duration,
          musclesWorked: data.musclesWorked,
        });
      } else {
        // Add new exercise
        await addExercise({
          name: data.name,
          date: data.date, // Send date as string in YYYY-MM-DD format
          category: data.category,
          time: data.time,
          distance: data.distance,
          heartRate: data.heartRate,
          weight: data.weight,
          reps: data.reps,
          sets: data.sets,
          duration: data.duration,
          musclesWorked: data.musclesWorked,
        });
      }

      setIsExerciseDialogOpen(false);
      exerciseForm.reset();

      // Invalidate exercise queries to update the calendar
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

      // Invalidate both general exercises and calendar-specific query
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/exercises", year, month],
      });

      // Make sure to fetch the latest data
      await fetchExercises();
    } catch (error) {
      console.error("Error saving exercise:", error);
      // Keep the dialog open so user can try again
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    try {
      if (deleteType === "habit") {
        await deleteHabit(selectedItem);
        // Refresh habits data
        await fetchHabits();
      } else {
        await deleteExercise(selectedItem);

        // Invalidate exercise queries to update the calendar
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;

        queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
        queryClient.invalidateQueries({
          queryKey: ["/api/exercises", year, month],
        });

        // Refresh exercises data
        await fetchExercises();
      }

      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error(`Error deleting ${deleteType}:`, error);
      // Keep the dialog open so user can try again or cancel
    }
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

  const openEditExerciseDialog = (exercise: any) => {
    setSelectedExercise(exercise.id);

    // Format date from database (could be string already or date object)
    let formattedDate = "";
    if (typeof exercise.date === "string") {
      // If it's already a string - ensure it's in YYYY-MM-DD format
      formattedDate = exercise.date.split("T")[0]; // Remove any time component
    } else {
      // If it's a date object, convert to YYYY-MM-DD
      formattedDate = new Date(exercise.date).toISOString().split("T")[0];
    }

    exerciseForm.reset({
      name: exercise.name,
      date: formattedDate,
      category: exercise.category || "Cardio",
      time: exercise.time || null,
      distance: exercise.distance || null,
      heartRate: exercise.heartRate || null,
      weight: exercise.weight || null,
      reps: exercise.reps || null,
      sets: exercise.sets || null,
      duration: exercise.duration || null,
      musclesWorked: exercise.musclesWorked || null,
    });
    setIsExerciseDialogOpen(true);
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
        <div className="flex gap-2">
          <Button
            className="bg-accent text-white"
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
              setSelectedExercise(null);
              exerciseForm.reset({
                name: "",
                date: getNoonDate(),
                category: "Cardio",
                time: null,
                distance: null,
                heartRate: null,
                weight: null,
                reps: null,
                sets: null,
                duration: null,
                musclesWorked: null,
              });
              setIsExerciseDialogOpen(true);
            }}
          >
            <i className="ri-run-line mr-2"></i>
            New Exercise
          </Button>
        </div>
      </div>

      <Tabs defaultValue="habits" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="habits">Daily Habits</TabsTrigger>
          <TabsTrigger value="exercises">Exercise Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="habits">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-gray-100 animate-pulse rounded-lg"
                ></div>
              ))}
            </div>
          ) : (
            <>
              {habits.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <i className="ri-calendar-check-line text-4xl text-secondary mb-3"></i>
                  <h3 className="text-xl font-medium mb-2">
                    No habits tracked yet
                  </h3>
                  <p className="text-secondary mb-4">
                    Start building healthy habits by adding your first daily
                    habit
                  </p>
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
                    <h3 className="text-xl font-semibold mb-4">
                      Monthly Tracking
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {habits.map((habit) => (
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
                                setDeleteType("habit");
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
                          <span className="text-secondary font-medium">
                            Add New Habit
                          </span>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="exercises">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-100 animate-pulse rounded-lg"
                ></div>
              ))}
            </div>
          ) : (
            <>
              {exercises.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <i className="ri-run-line text-4xl text-secondary mb-3"></i>
                  <h3 className="text-xl font-medium mb-2">
                    No exercises tracked yet
                  </h3>
                  <p className="text-secondary mb-4">
                    Start tracking your physical activities to monitor your
                    fitness journey
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedExercise(null);
                      exerciseForm.reset({
                        name: "",
                        date: getNoonDate(),
                        category: "Cardio",
                        time: null,
                        distance: null,
                        heartRate: null,
                        weight: null,
                        reps: null,
                        sets: null,
                        duration: null,
                        musclesWorked: null,
                      });
                      setIsExerciseDialogOpen(true);
                    }}
                  >
                    <i className="ri-add-line mr-1"></i> Add Your First Exercise
                  </Button>
                </div>
              ) : (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Exercise Tracking
                  </h3>

                  {/* Exercise Calendar */}
                  <div className="mb-8">
                    <div className="mb-4">
                      <h4 className="text-lg font-medium mb-3">
                        Monthly Overview
                      </h4>
                      <p className="text-sm text-secondary mb-4">
                        Track your exercises by day with color coding for each
                        type. Days with multiple exercise types show gradients.
                      </p>

                      <div className="max-w-lg mx-auto">
                        <ExerciseCalendar />
                      </div>
                    </div>
                  </div>

                  <h4 className="text-lg font-medium mb-3">Exercise History</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...exercises]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((exercise) => (
                      <Card
                        key={exercise.id}
                        className={
                          exercise.category === "Cardio"
                            ? "border-blue-300 border-2"
                            : exercise.category === "Strength"
                              ? "border-red-300 border-2"
                              : "border-green-300 border-2"
                        }
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                                  exercise.category === "Cardio"
                                    ? "bg-blue-100 text-blue-600"
                                    : exercise.category === "Strength"
                                      ? "bg-red-100 text-red-600"
                                      : "bg-green-100 text-green-600"
                                }`}
                              >
                                <i
                                  className={`ri-${
                                    exercise.category === "Cardio"
                                      ? "heart-pulse"
                                      : exercise.category === "Strength"
                                        ? "shield-star"
                                        : "walk"
                                  }-line text-lg`}
                                ></i>
                              </div>
                              <div>
                                <h3 className="font-inter font-medium">
                                  {exercise.name}
                                </h3>
                                <p className="text-sm text-secondary">
                                  {typeof exercise.date === "string"
                                    ? new Date(
                                        exercise.date + "T12:00:00",
                                      ).toLocaleDateString()
                                    : new Date(
                                        exercise.date as unknown as string,
                                      ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex">
                              <button
                                className="text-secondary hover:text-primary transition-colors mr-2"
                                onClick={() => openEditExerciseDialog(exercise)}
                              >
                                <i className="ri-edit-line"></i>
                              </button>
                              <button
                                className="text-secondary hover:text-destructive transition-colors"
                                onClick={() => {
                                  setDeleteType("exercise");
                                  setSelectedItem(exercise.id);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </div>
                          </div>

                          <div className="border-t pt-3 mt-2">
                            {exercise.category === "Cardio" && (
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                {exercise.time && (
                                  <div>
                                    <span className="text-secondary">
                                      Time:
                                    </span>{" "}
                                    {exercise.time} min
                                  </div>
                                )}
                                {exercise.distance && (
                                  <div>
                                    <span className="text-secondary">
                                      Distance:
                                    </span>{" "}
                                    {exercise.distance} mi
                                  </div>
                                )}
                                {exercise.heartRate && (
                                  <div>
                                    <span className="text-secondary">HR:</span>{" "}
                                    {exercise.heartRate} bpm
                                  </div>
                                )}
                              </div>
                            )}
                            {exercise.category === "Strength" && (
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                {exercise.weight && (
                                  <div>
                                    <span className="text-secondary">
                                      Weight:
                                    </span>{" "}
                                    {exercise.weight} kg
                                  </div>
                                )}
                                {exercise.reps && (
                                  <div>
                                    <span className="text-secondary">
                                      Reps:
                                    </span>{" "}
                                    {exercise.reps}
                                  </div>
                                )}
                                {exercise.sets && (
                                  <div>
                                    <span className="text-secondary">
                                      Sets:
                                    </span>{" "}
                                    {exercise.sets}
                                  </div>
                                )}
                              </div>
                            )}
                            {exercise.category === "Flexibility" && (
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {exercise.duration && (
                                  <div>
                                    <span className="text-secondary">
                                      Duration:
                                    </span>{" "}
                                    {exercise.duration} min
                                  </div>
                                )}
                                {exercise.musclesWorked && (
                                  <div>
                                    <span className="text-secondary">
                                      Muscles:
                                    </span>{" "}
                                    {exercise.musclesWorked}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Add New Exercise Card */}
                    <Card className="border border-dashed border-gray-300 bg-gray-50">
                      <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                        <Button
                          variant="ghost"
                          className="flex flex-col items-center p-8 h-auto w-full"
                          onClick={() => {
                            setSelectedExercise(null);
                            exerciseForm.reset({
                              name: "",
                              date: getNoonDate(),
                              category: "Cardio",
                              time: null,
                              distance: null,
                              heartRate: null,
                              weight: null,
                              reps: null,
                              sets: null,
                              duration: null,
                              musclesWorked: null,
                            });
                            setIsExerciseDialogOpen(true);
                          }}
                        >
                          <i className="ri-add-line text-3xl text-secondary mb-2"></i>
                          <span className="text-secondary font-medium">
                            Add New Exercise
                          </span>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
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
            <DialogTitle>
              {selectedHabit ? "Edit Habit" : "Add New Habit"}
            </DialogTitle>
          </DialogHeader>

          <Form {...habitForm}>
            <form
              onSubmit={habitForm.handleSubmit(handleAddHabit)}
              className="space-y-4"
            >
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
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
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
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
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

      {/* Add/Edit Exercise Dialog */}
      <Dialog
        open={isExerciseDialogOpen}
        onOpenChange={setIsExerciseDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedExercise ? "Edit Exercise" : "Add New Exercise"}
            </DialogTitle>
          </DialogHeader>

          <Form {...exerciseForm}>
            <form
              onSubmit={exerciseForm.handleSubmit(handleAddExercise)}
              className="space-y-4"
            >
              <FormField
                control={exerciseForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exercise Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter exercise name (e.g. Morning Run, Bench Press)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={exerciseForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={exerciseForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // Reset category-specific fields when category changes
                          if (e.target.value === "Cardio") {
                            exerciseForm.setValue("weight", null);
                            exerciseForm.setValue("reps", null);
                            exerciseForm.setValue("sets", null);
                            exerciseForm.setValue("duration", null);
                            exerciseForm.setValue("musclesWorked", null);
                          } else if (e.target.value === "Strength") {
                            exerciseForm.setValue("time", null);
                            exerciseForm.setValue("distance", null);
                            exerciseForm.setValue("heartRate", null);
                            exerciseForm.setValue("duration", null);
                            exerciseForm.setValue("musclesWorked", null);
                          } else if (e.target.value === "Flexibility") {
                            exerciseForm.setValue("time", null);
                            exerciseForm.setValue("distance", null);
                            exerciseForm.setValue("heartRate", null);
                            exerciseForm.setValue("weight", null);
                            exerciseForm.setValue("reps", null);
                            exerciseForm.setValue("sets", null);
                          }
                        }}
                      >
                        <option value="Cardio">Cardio</option>
                        <option value="Strength">Strength</option>
                        <option value="Flexibility">Flexibility</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cardio Fields */}
              {exerciseForm.watch("category") === "Cardio" && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <FormLabel>Time</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <FormField
                          control={exerciseForm.control}
                          name="timeMinutes"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-xs">Minutes</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...field}
                                  value={field.value ?? ""}
                                  onChange={(e) => {
                                    const minValue = e.target.value ? Number(e.target.value) : 0;
                                    field.onChange(minValue);
                                    
                                    // Convert minutes and seconds to total seconds
                                    const seconds = exerciseForm.getValues("timeSeconds") || 0;
                                    const totalSeconds = (minValue * 60) + seconds;
                                    exerciseForm.setValue("time", totalSeconds);
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div>
                        <FormField
                          control={exerciseForm.control}
                          name="timeSeconds"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-xs">Seconds</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  max="59"
                                  {...field}
                                  value={field.value ?? ""}
                                  onChange={(e) => {
                                    const secValue = e.target.value ? Number(e.target.value) : 0;
                                    field.onChange(secValue);
                                    
                                    // Convert minutes and seconds to total seconds
                                    const minutes = exerciseForm.getValues("timeMinutes") || 0;
                                    const totalSeconds = (minutes * 60) + secValue;
                                    exerciseForm.setValue("time", totalSeconds);
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="h-4">
                      {exerciseForm.formState.errors.time && (
                        <p className="text-xs font-medium text-destructive">
                          {exerciseForm.formState.errors.time.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <FormField
                    control={exerciseForm.control}
                    name="distance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distance (mi)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={exerciseForm.control}
                    name="heartRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Average HR (bpm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Strength Fields */}
              {exerciseForm.watch("category") === "Strength" && (
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={exerciseForm.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={exerciseForm.control}
                    name="reps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reps</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={exerciseForm.control}
                    name="sets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sets</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Flexibility Fields */}
              {exerciseForm.watch("category") === "Flexibility" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={exerciseForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={exerciseForm.control}
                    name="musclesWorked"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Muscles Worked</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Hamstrings, Lower back"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <DialogFooter>
                <Button type="submit" className="bg-accent text-white">
                  {selectedExercise ? "Update Exercise" : "Add Exercise"}
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
          <p>
            Are you sure you want to delete this {deleteType}? This cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
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
