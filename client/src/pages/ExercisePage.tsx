import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ExerciseCalendar from "@/components/exercises/ExerciseCalendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema for exercise form validation
const exerciseFormSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  date: z.string().min(1, "Date is required"),
  category: z.enum(["Cardio", "Strength", "Flexibility"]),
  time: z.number().nullable(),
  timeMinutes: z.number().nullable(),
  timeSeconds: z.number().nullable(),
  distance: z.number().nullable(),
  heartRate: z.number().nullable(),
  weight: z.number().nullable(),
  reps: z.number().nullable(),
  sets: z.number().nullable(),
  duration: z.number().nullable(),
  musclesWorked: z.string().nullable(),
});

type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;

const ExercisePage = () => {
  const {
    exercises,
    fetchExercises,
    addExercise,
    updateExercise,
    deleteExercise,
    isLoading,
  } = useAppContext();

  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

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
    fetchExercises();
  }, [fetchExercises]);

  const handleAddExercise = async (data: ExerciseFormValues) => {
    try {
      // Calculate total seconds from minutes and seconds if they exist
      let timeValue = data.time;
      if (data.timeMinutes !== null || data.timeSeconds !== null) {
        const minutes = data.timeMinutes || 0;
        const seconds = data.timeSeconds || 0;
        timeValue = (minutes * 60) + seconds;
      }

      if (selectedExercise) {
        // Update existing exercise
        await updateExercise(selectedExercise, {
          name: data.name,
          date: data.date, // Send date as string in YYYY-MM-DD format
          category: data.category,
          time: timeValue,
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
          time: timeValue,
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

      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error(`Error deleting exercise:`, error);
      // Keep the dialog open so user can try again or cancel
    }
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

    // Calculate minutes and seconds from total time (in seconds)
    let timeMinutes = null;
    let timeSeconds = null;
    
    if (exercise.time !== null && exercise.time !== undefined) {
      timeMinutes = Math.floor(exercise.time / 60);
      timeSeconds = exercise.time % 60;
    }

    exerciseForm.reset({
      name: exercise.name,
      date: formattedDate,
      category: exercise.category || "Cardio",
      time: exercise.time || null,
      timeMinutes: timeMinutes,
      timeSeconds: timeSeconds,
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

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <Button
          className="bg-accent text-white"
          onClick={() => {
            setSelectedExercise(null);
            exerciseForm.reset({
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
            });
            setIsExerciseDialogOpen(true);
          }}
        >
          <i className="ri-run-line mr-2"></i>
          New Exercise
        </Button>
      </div>

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
                    timeMinutes: null,
                    timeSeconds: null,
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
                Exercise Overview
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
                                {Math.floor(exercise.time / 60)}:{String(exercise.time % 60).padStart(2, '0')}
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
                          timeMinutes: null,
                          timeSeconds: null,
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

      {/* Add/Edit Exercise Dialog */}
      <Dialog open={isExerciseDialogOpen} onOpenChange={setIsExerciseDialogOpen}>
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
                      <Input placeholder="Enter exercise name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cardio">Cardio</SelectItem>
                          <SelectItem value="Strength">Strength</SelectItem>
                          <SelectItem value="Flexibility">
                            Flexibility
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {exerciseForm.watch("category") === "Cardio" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={exerciseForm.control}
                      name="timeMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minutes</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                              value={field.value === null ? "" : field.value}
                              onChange={(e) => {
                                const val = e.target.value
                                  ? parseInt(e.target.value)
                                  : null;
                                field.onChange(val);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={exerciseForm.control}
                      name="timeSeconds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seconds</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="59"
                              placeholder="0"
                              {...field}
                              value={field.value === null ? "" : field.value}
                              onChange={(e) => {
                                const val = e.target.value
                                  ? parseInt(e.target.value)
                                  : null;
                                field.onChange(val);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={exerciseForm.control}
                      name="distance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Distance (mi)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.0"
                              {...field}
                              value={field.value === null ? "" : field.value}
                              onChange={(e) => {
                                const val = e.target.value
                                  ? parseFloat(e.target.value)
                                  : null;
                                field.onChange(val);
                              }}
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
                          <FormLabel>Heart Rate (bpm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="0"
                              {...field}
                              value={field.value === null ? "" : field.value}
                              onChange={(e) => {
                                const val = e.target.value
                                  ? parseInt(e.target.value)
                                  : null;
                                field.onChange(val);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

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
                            step="0.5"
                            min="0"
                            placeholder="0.0"
                            {...field}
                            value={field.value === null ? "" : field.value}
                            onChange={(e) => {
                              const val = e.target.value
                                ? parseFloat(e.target.value)
                                : null;
                              field.onChange(val);
                            }}
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
                            step="1"
                            placeholder="0"
                            {...field}
                            value={field.value === null ? "" : field.value}
                            onChange={(e) => {
                              const val = e.target.value
                                ? parseInt(e.target.value)
                                : null;
                              field.onChange(val);
                            }}
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
                            step="1"
                            placeholder="0"
                            {...field}
                            value={field.value === null ? "" : field.value}
                            onChange={(e) => {
                              const val = e.target.value
                                ? parseInt(e.target.value)
                                : null;
                              field.onChange(val);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {exerciseForm.watch("category") === "Flexibility" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={exerciseForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (min)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            {...field}
                            value={field.value === null ? "" : field.value}
                            onChange={(e) => {
                              const val = e.target.value
                                ? parseInt(e.target.value)
                                : null;
                              field.onChange(val);
                            }}
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
                            placeholder="e.g., Hamstrings, Lower Back"
                            {...field}
                            value={field.value === null ? "" : field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsExerciseDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedExercise ? "Save Changes" : "Add Exercise"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this exercise?</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteItem}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExercisePage;