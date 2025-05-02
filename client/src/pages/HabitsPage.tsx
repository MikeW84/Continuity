import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
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
import HabitCalendar from "@/components/habits/HabitCalendar";

// Schema for habit form validation
const habitFormSchema = z.object({
  title: z.string().min(1, "Habit title is required"),
  completedDays: z.number().min(0),
  targetDays: z.number().min(1, "Target days must be at least 1"),
  isCompletedToday: z.boolean().default(false),
});

type HabitFormValues = z.infer<typeof habitFormSchema>;

const HabitsPage = () => {
  const {
    habits,
    fetchHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    isLoading,
  } = useAppContext();

  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

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

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    try {
      await deleteHabit(selectedItem);
      // Refresh habits data
      await fetchHabits();
      
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error(`Error deleting habit:`, error);
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

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
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
      </div>

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
                  Habit Tracking
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

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsHabitDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedHabit ? "Save Changes" : "Add Habit"}
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
          <p>Are you sure you want to delete this habit?</p>
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

export default HabitsPage;