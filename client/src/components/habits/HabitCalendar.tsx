import { useState, useEffect } from 'react';
import { useAppContext, HabitCompletion } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths } from 'date-fns';

interface HabitCalendarProps {
  habitId: number;
  habitName: string;
  targetDays: number | null;
}

const HabitCalendar = ({ habitId, habitName, targetDays }: HabitCalendarProps) => {
  const { getHabitCompletions, toggleHabitDay } = useAppContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get the days of the current month
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  // Fetch habit completions for the current month when month changes
  useEffect(() => {
    const fetchCompletions = async () => {
      setIsLoading(true);
      try {
        const data = await getHabitCompletions(
          habitId, 
          currentMonth.getFullYear(), 
          currentMonth.getMonth() + 1
        );
        setCompletions(data);
      } catch (error) {
        console.error('Error fetching habit completions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletions();
  }, [habitId, currentMonth, getHabitCompletions]);

  // Move to previous month
  const prevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  // Move to next month
  const nextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  // Toggle completion for a specific date
  const handleToggleDay = async (date: Date) => {
    if (!isSameMonth(date, currentMonth)) return;

    try {
      // Extract simple year, month, day integers to pass to backend
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1; // 1-based month
      const day = parseInt(format(date, 'd')); // Get day number from date

      console.log(`Toggling habit day: ${year}-${month}-${day} for habitId: ${habitId}`);

      // We'll skip optimistic updates to avoid race conditions
      // Instead, just call the API and wait for the result
      await toggleHabitDay(habitId, year, month, day);

      // Use a small delay to ensure the backend has processed the request
      // This helps prevent race conditions with multiple rapid clicks
      setTimeout(async () => {
        try {
          // After toggling, refetch the completions to ensure data consistency
          const data = await getHabitCompletions(
            habitId,
            year,
            month
          );
          setCompletions(data);
        } catch (err) {
          console.error('Error refreshing habit completions after toggle:', err);
        }
      }, 100);
    } catch (error) {
      console.error('Error toggling habit completion:', error);

      // On error, refetch to ensure the UI reflects the correct state
      try {
        const data = await getHabitCompletions(
          habitId, 
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1
        );
        setCompletions(data);
      } catch (err) {
        console.error('Error refreshing habit completions after error:', err);
      }
    }
  };

  // Check if a day is completed
  const isDayCompleted = (date: Date) => {
    // Simply check if the day number is in the completions
    const dayNum = parseInt(format(date, 'd'));

    return completions.some(completion => {
      return completion.year === currentMonth.getFullYear() && 
             completion.month === currentMonth.getMonth() + 1 && 
             completion.day === dayNum;
    });
  };

  // Calculate progress for the month
  const completedDaysCount = completions.length;
  const progressPercentage = targetDays ? Math.min(100, (completedDaysCount / targetDays) * 100) : 0;

  // Organize days into weeks based on actual month start
  const getWeeks = () => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const startDay = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const totalDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const totalSlots = Math.ceil((startDay + totalDays) / 7) * 7;
    const calendarDays: (number | null)[] = Array(totalSlots).fill(null);

    // Fill in the actual days
    for (let i = 0; i < totalDays; i++) {
      calendarDays[i + startDay] = i + 1;
    }

    // Group into weeks
    const weeks: (number | null)[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return weeks;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{habitName} Calendar</CardTitle>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevMonth}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{format(currentMonth, 'MMMM yyyy')}</span>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextMonth}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-1">
                {targetDays && `Goal: ${completedDaysCount}/${targetDays} days`}
              </div>
              {targetDays && (
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-xs font-medium text-muted-foreground py-1">
                  {day}
                </div>
              ))}
              {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="h-9" />
              ))}
              {days.map((day, i) => {
                const isCompleted = isDayCompleted(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <Button
                    key={i}
                    variant={isCompleted ? "default" : "outline"}
                    className={`h-9 w-full text-xs ${!isCurrentMonth ? 'invisible' : ''}`}
                    onClick={() => handleToggleDay(day)}
                  >
                    {format(day, 'd')}
                  </Button>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HabitCalendar;