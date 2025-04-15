import { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";

// Define the HabitCompletion type here for clarity
interface HabitCompletion {
  id: number;
  habitId: number;
  year: number;
  month: number;
  day: number;
}

interface MiniHabitCalendarProps {
  habitId: number;
  onToggleDay: (year: number, month: number, day: number) => Promise<void>;
}

const MiniHabitCalendar = ({ habitId, onToggleDay }: MiniHabitCalendarProps) => {
  const queryClient = useQueryClient();
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // JavaScript months are 0-11
  
  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  
  // Get current day
  const currentDay = today.getDate();
  
  // Create an array of days from 1 to days in month
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Query key for habit completions - use array for proper caching
  const completionsQueryKey = useMemo(() => 
    [`/api/habits/${habitId}/completions/${currentYear}/${currentMonth}`],
    [habitId, currentYear, currentMonth]
  );
  
  // Get habit completions for current month
  const { data = [], isLoading } = useQuery<HabitCompletion[]>({
    queryKey: completionsQueryKey,
    enabled: !!habitId && habitId > 0,
    refetchOnWindowFocus: false,
    retry: 2,
  });
  
  // Set of completed days
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  
  // Update completed days when completions data changes
  useEffect(() => {
    if (!data || !Array.isArray(data)) return;
    
    const completedDaysSet = new Set<number>();
    for (const completion of data) {
      if (completion && typeof completion.day === 'number') {
        completedDaysSet.add(completion.day);
      }
    }
    setCompletedDays(completedDaysSet);
  }, [data]);
  
  // Handle clicking on a day - using useCallback to prevent excessive re-renders
  const handleDayClick = useCallback(async (day: number) => {
    try {
      // Add optimistic update to improve UI responsiveness
      // Clone the current completedDays set
      const newCompletedDays = new Set(completedDays);
      
      // Toggle day in our local state immediately for better UX
      if (newCompletedDays.has(day)) {
        newCompletedDays.delete(day);
      } else {
        newCompletedDays.add(day);
      }
      
      // Update state with optimistic result
      setCompletedDays(newCompletedDays);
      
      // Make API call
      await onToggleDay(currentYear, currentMonth, day);
      
      // Manually invalidate the query to refresh data after API call succeeds
      queryClient.invalidateQueries({ queryKey: completionsQueryKey });
    } catch (error) {
      console.error(`Error toggling day ${day}:`, error);
      // If the API call fails, revert our optimistic update
      queryClient.invalidateQueries({ queryKey: completionsQueryKey });
    }
  }, [currentYear, currentMonth, completedDays, onToggleDay, queryClient, completionsQueryKey]);
  
  if (isLoading) {
    return (
      <div className="mt-2">
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }
  
  // Organize days into weeks (starting on Sunday)
  const getWeeks = () => {
    const startDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const totalSlots = Math.ceil((startDay + daysInMonth) / 7) * 7;
    const calendarDays: (number | null)[] = Array(totalSlots).fill(null);
    
    for (let i = 0; i < daysInMonth; i++) {
      calendarDays[i + startDay] = i + 1;
    }
    
    const weeks: (number | null)[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }
    
    return weeks;
  };
  
  const weeks = getWeeks();
  
  return (
    <div className="mt-2 text-center">
      <div className="grid grid-cols-7 gap-0.5 text-[10px] text-secondary mb-1">
        <div>S</div>
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {weeks.map((week, weekIndex) => (
          week.map((day, dayIndex) => (
            <div 
              key={`${weekIndex}-${dayIndex}`}
              className={`
                h-6 w-6 flex items-center justify-center rounded-full text-xs 
                ${!day ? 'invisible' : ''}
                ${day === currentDay ? 'border border-blue-500' : ''}
                ${completedDays.has(day || 0) 
                  ? 'bg-success bg-opacity-20 text-success font-medium cursor-pointer hover:bg-opacity-30' 
                  : day 
                    ? 'hover:bg-primary hover:bg-opacity-10 cursor-pointer' 
                    : ''
                }
              `}
              onClick={() => day && handleDayClick(day)}
            >
              {day}
            </div>
          ))
        ))}
      </div>
    </div>
  );
};

export default MiniHabitCalendar;