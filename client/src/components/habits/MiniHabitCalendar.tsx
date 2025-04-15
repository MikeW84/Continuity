import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HabitCompletion } from "@shared/schema";
import { Skeleton } from "../ui/skeleton";

interface MiniHabitCalendarProps {
  habitId: number;
  onToggleDay: (year: number, month: number, day: number) => Promise<void>;
}

const MiniHabitCalendar = ({ habitId, onToggleDay }: MiniHabitCalendarProps) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // JavaScript months are 0-11
  
  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  
  // Get current day
  const currentDay = today.getDate();
  
  // Create an array of days from 1 to days in month
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Get habit completions for current month
  const { data: completions = [], isLoading } = useQuery<HabitCompletion[]>({
    queryKey: [`/api/habits/${habitId}/completions/${currentYear}/${currentMonth}`],
  });
  
  // Set of completed days
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  
  // Update completed days when completions data changes
  useEffect(() => {
    const completedDaysSet = new Set<number>();
    completions.forEach(completion => {
      completedDaysSet.add(completion.day);
    });
    setCompletedDays(completedDaysSet);
  }, [completions]);
  
  // Handle clicking on a day
  const handleDayClick = async (day: number) => {
    await onToggleDay(currentYear, currentMonth, day);
  };
  
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