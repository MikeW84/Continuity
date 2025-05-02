import { useAppContext } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import MiniHabitCalendar from "../habits/MiniHabitCalendar";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const HealthHabitsSection = () => {
  const { habits, exercises, toggleHabit, toggleHabitDay, isLoading } = useAppContext();
  const [expandedHabit, setExpandedHabit] = useState<number | null>(null);
  const { toast } = useToast();

  const handleToggleHabit = async (id: number) => {
    await toggleHabit(id);
  };

  const handleToggleHabitDay = async (habitId: number, year: number, month: number, day: number) => {
    await toggleHabitDay(habitId, year, month, day);
  };

  // Toggle habit expansion with safety check for deleted habits
  const toggleExpandHabit = (habitId: number) => {
    // Close if it's already open
    if (expandedHabit === habitId) {
      setExpandedHabit(null);
      return;
    }
    
    // Verify that the habit still exists before expanding
    const habitExists = habits.some(h => h.id === habitId);
    if (habitExists) {
      // Close any previously expanded habit and open the new one
      setExpandedHabit(habitId);
      
      // Optional: scroll to ensure the expanded habit is visible
      // Set timeout to wait for render
      setTimeout(() => {
        const habitElement = document.getElementById(`habit-${habitId}`);
        if (habitElement) {
          habitElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    } else {
      // If habit no longer exists, reset expanded state and show a message
      setExpandedHabit(null);
      toast({
        title: "Habit not found",
        description: "This habit may have been deleted.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          
          <Skeleton className="h-6 w-32 mb-3" />
          <div className="space-y-3 mb-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          
          <Skeleton className="h-6 w-32 mb-3" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-inter font-semibold text-primary">Health & Habits</h2>
          <button className="text-secondary hover:text-primary transition-colors">
            <i className="ri-more-2-fill"></i>
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="font-inter font-medium text-sm uppercase text-secondary mb-3">Daily Habits</h3>
          
          {habits.length === 0 ? (
            <div className="text-center py-3 text-secondary">
              <p>No habits tracked yet. Add your first habit!</p>
            </div>
          ) : (
            habits.map(habit => (
              <div key={habit.id} id={`habit-${habit.id}`} className="mb-4">
                <div className="flex items-center mb-1">
                  <button 
                    className={`h-6 w-6 rounded-full border-2 ${
                      habit.isCompletedToday 
                        ? "border-success mr-3 flex items-center justify-center bg-success bg-opacity-10" 
                        : "border-secondary mr-3 flex items-center justify-center"
                    }`}
                    onClick={() => handleToggleHabit(habit.id)}
                  >
                    {habit.isCompletedToday && (
                      <i className="ri-check-line text-success"></i>
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span 
                        className="font-inter font-medium text-sm cursor-pointer hover:text-primary"
                        onClick={() => toggleExpandHabit(habit.id)}
                      >
                        {habit.title} {expandedHabit === habit.id ? 
                          <i className="ri-arrow-up-s-line inline-block ml-1"></i> : 
                          <i className="ri-arrow-down-s-line inline-block ml-1"></i>
                        }
                      </span>
                      <span className={`text-xs ${(habit.completedDays || 0) / (habit.targetDays || 20) > 0.5 ? "text-success" : "text-secondary"}`}>
                        {habit.completedDays || 0}/{habit.targetDays || 20} days
                      </span>
                    </div>
                    <div className="h-1 w-full bg-gray-200 rounded-full mt-1">
                      <div 
                        className={`h-full ${(habit.completedDays || 0) / (habit.targetDays || 20) > 0.5 ? "bg-success" : "bg-secondary"} rounded-full`} 
                        style={{ width: `${((habit.completedDays || 0) / (habit.targetDays || 20)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {expandedHabit === habit.id && (
                  <div className="ml-9">
                    <MiniHabitCalendar 
                      habitId={habit.id} 
                      onToggleDay={(year, month, day) => handleToggleHabitDay(habit.id, year, month, day)}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        <div>
          <h3 className="font-inter font-medium text-sm uppercase text-secondary mb-3">Exercise Tracker</h3>
          
          {exercises.length === 0 ? (
            <div className="text-center py-3 text-secondary">
              <p>No exercises tracked yet. Add your first exercise!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 mb-4">
              {exercises.map(exercise => {
                // Define category-specific icons and colors
                const categoryInfo = {
                  'Cardio': { icon: 'heart-pulse', color: 'text-blue-500', bgColor: 'bg-blue-100' },
                  'Strength': { icon: 'dumbbell', color: 'text-red-500', bgColor: 'bg-red-100' },
                  'Flexibility': { icon: 'mental-health', color: 'text-green-500', bgColor: 'bg-green-100' },
                }[exercise.category] || { icon: 'heart-pulse', color: 'text-primary', bgColor: 'bg-primary-100' };
                
                // Format date
                const exerciseDate = new Date(exercise.date);
                const formattedDate = exerciseDate.toLocaleDateString(undefined, { 
                  month: 'short', 
                  day: 'numeric' 
                });
                
                return (
                  <div key={exercise.id} className={`p-3 rounded-lg flex items-center ${categoryInfo.bgColor} bg-opacity-30`}>
                    <div className={`h-10 w-10 rounded-full ${categoryInfo.bgColor} flex items-center justify-center mr-3`}>
                      <i className={`ri-${categoryInfo.icon}-line ${categoryInfo.color}`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-inter font-medium">{exercise.name}</span>
                        <span className="text-xs text-secondary">{formattedDate}</span>
                      </div>
                      <div className="text-xs text-secondary">
                        {exercise.category === 'Cardio' && (
                          <span>{exercise.time} min • {exercise.distance ? `${exercise.distance}m` : 'No distance'}</span>
                        )}
                        {exercise.category === 'Strength' && (
                          <span>{exercise.sets || 0} sets • {exercise.reps || 0} reps • {exercise.weight ? `${exercise.weight}kg` : 'No weight'}</span>
                        )}
                        {exercise.category === 'Flexibility' && (
                          <span>{exercise.duration} min • {exercise.musclesWorked || 'General stretching'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <button className="text-accent hover:text-opacity-80 text-sm font-medium flex items-center mt-2 transition-colors">
            <i className="ri-add-line mr-1"></i> Add Exercise
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthHabitsSection;
