import { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";

// Define the HabitCompletion type here for clarity
interface HabitCompletion {
  id: number;
  habitId: number;
  year: number;
  month: number;
  day: number;
  // Additional fields that might be present in the API response
  date?: string | null;
  completed?: boolean | null;
}

interface MiniHabitCalendarProps {
  habitId: number;
  onToggleDay: (year: number, month: number, day: number) => Promise<void>;
}

const MiniHabitCalendar = ({ habitId, onToggleDay }: MiniHabitCalendarProps) => {
  const { toast } = useToast();
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
  
  // Flag to prevent multiple simultaneous API calls
  const [isSaving, setIsSaving] = useState(false);
  // Track which days are being saved (to show visual feedback for specific days)
  const [pendingDays, setPendingDays] = useState<Set<number>>(new Set());
  
  // Query key for habit completions
  const completionsQueryKey = useMemo(() => 
    [`/api/habits/${habitId}/completions/${currentYear}/${currentMonth}`],
    [habitId, currentYear, currentMonth]
  );
  
  // Get habit completions for current month - with error handling
  const { data = [], isLoading, isError } = useQuery<HabitCompletion[]>({
    queryKey: completionsQueryKey,
    enabled: !!habitId && habitId > 0,
    refetchOnWindowFocus: false,
    retry: 3,
    // Prevent fetching again for a short period to avoid flicker
    staleTime: 0, // Make sure we always have fresh data
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Log completions data for debugging
  useEffect(() => {
    console.log(`MiniCalendar for habit ${habitId}: Completions data:`, data);
  }, [data, habitId]);
  
  // Compute completed days set directly from the data
  // This eliminates the need for a separate state variable that can get out of sync
  const completedDays = useMemo(() => {
    const completedDaysSet = new Set<number>();
    
    // Make sure data is valid and is an array
    if (Array.isArray(data) && data.length > 0) {
      // Process each completion
      data.forEach(completion => {
        if (completion && 
            typeof completion.day === 'number' && 
            completion.year === currentYear && 
            completion.month === currentMonth) {
          completedDaysSet.add(completion.day);
          console.log(`Added day ${completion.day} to completed days set`);
        }
      });
    }
    
    console.log(`MiniCalendar completedDays set has ${completedDaysSet.size} days:`, 
      Array.from(completedDaysSet));
    
    return completedDaysSet;
  }, [data, currentYear, currentMonth]);
  
  // Handle clicking on a day with debouncing to prevent multiple rapid clicks
  const handleDayClick = useCallback(async (day: number) => {
    if (isSaving && pendingDays.has(day)) return; // Prevent clicking same day multiple times
    
    try {
      setIsSaving(true);
      setPendingDays(prev => {
        const newSet = new Set(prev);
        newSet.add(day);
        return newSet;
      });
      
      // Prepare optimistic update for the UI
      const newCompletedDays = new Set(completedDays);
      if (newCompletedDays.has(day)) {
        newCompletedDays.delete(day);
      } else {
        newCompletedDays.add(day);
      }
      
      // Optimistically update the cache for immediate feedback
      queryClient.setQueryData<HabitCompletion[]>(completionsQueryKey, old => {
        if (!old) return [];
        
        // Find exact match for the day we're toggling
        const existingCompletionIndex = old.findIndex(
          c => c.year === currentYear && 
               c.month === currentMonth && 
               c.day === day
        );
        
        console.log(`Day ${day} exists in cache: ${existingCompletionIndex !== -1}`);
        
        if (existingCompletionIndex !== -1) {
          // Remove the completion if it exists
          console.log(`Removing day ${day} from completions cache`);
          return [
            ...old.slice(0, existingCompletionIndex),
            ...old.slice(existingCompletionIndex + 1)
          ];
        } else {
          // Add a new completion
          console.log(`Adding day ${day} to completions cache`);
          return [...old, {
            id: Date.now(), // Temporary ID that will be replaced when we refetch
            habitId,
            year: currentYear,
            month: currentMonth,
            day,
            completed: true
          }];
        }
      });
      
      // Make the actual API call
      await onToggleDay(currentYear, currentMonth, day);
      
      // Invalidate queries to ensure everything is in sync
      await queryClient.invalidateQueries({ queryKey: completionsQueryKey });
      
      // Also invalidate habits list to update counts
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
    } catch (error) {
      console.error(`Error toggling day ${day}:`, error);
      
      // Show error to user
      toast({
        title: "Failed to update habit",
        description: "There was a problem updating your habit completion.",
        variant: "destructive",
      });
      
      // Revert the optimistic update by refetching
      await queryClient.refetchQueries({ queryKey: completionsQueryKey });
    } finally {
      // Remove this day from pending operations
      setPendingDays(prev => {
        const newSet = new Set(prev);
        newSet.delete(day);
        return newSet;
      });
      
      // Only set saving to false if no more pending days
      if (pendingDays.size <= 1) {
        setIsSaving(false);
      }
    }
  }, [currentYear, currentMonth, completedDays, onToggleDay, queryClient, completionsQueryKey, toast, isSaving, pendingDays, habitId]);
  
  if (isLoading) {
    return (
      <div className="mt-2">
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="mt-2 text-destructive text-xs">
        Error loading habit data. Try refreshing the page.
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
                ${day === currentDay && !completedDays.has(day || 0) ? 'border border-blue-500' : ''}
                ${pendingDays.has(day || 0) ? 'animate-pulse opacity-70' : ''}
                ${completedDays.has(day || 0) 
                  ? 'bg-primary text-white font-medium cursor-pointer hover:bg-primary-600' 
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