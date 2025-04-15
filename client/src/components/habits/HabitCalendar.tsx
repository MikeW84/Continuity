import { useState, useEffect } from 'react';
import { useAppContext, HabitCompletion } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

interface HabitCalendarProps {
  habitId: number;
  habitName: string;
  targetDays: number | null;
}

const HabitCalendar = ({ habitId, habitName, targetDays }: HabitCalendarProps) => {
  const { getHabitCompletions, toggleHabitByDate } = useAppContext();
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
      // Create a new Date object based on the clicked date
      // and add one day to compensate for timezone issues
      const adjustedDate = new Date(date);
      adjustedDate.setDate(adjustedDate.getDate() + 1);
      
      // Format as YYYY-MM-DD string
      const year = adjustedDate.getFullYear();
      const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
      const day = String(adjustedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      console.log("Calendar day clicked:", date.toISOString());
      console.log("Adjusted date string:", dateString);
      
      // Create a date at noon to avoid any timezone issues
      const fixedDate = new Date(`${dateString}T12:00:00Z`);
      
      await toggleHabitByDate(habitId, fixedDate);
      // After toggling, refetch the completions to update the UI
      const data = await getHabitCompletions(
        habitId, 
        currentMonth.getFullYear(), 
        currentMonth.getMonth() + 1
      );
      setCompletions(data);
    } catch (error) {
      console.error('Error toggling habit completion:', error);
    }
  };

  // Check if a day is completed
  const isDayCompleted = (day: Date) => {
    return completions.some(completion => {
      // Use the same date adjustment logic as when toggling
      // Create a new adjusted date by adding 1 day to handle timezone
      const adjustedDate = new Date(day);
      adjustedDate.setDate(adjustedDate.getDate() + 1);
      
      // Format as YYYY-MM-DD string
      const dayYear = adjustedDate.getFullYear();
      const dayMonth = String(adjustedDate.getMonth() + 1).padStart(2, '0');
      const dayDay = String(adjustedDate.getDate()).padStart(2, '0');
      const dayString = `${dayYear}-${dayMonth}-${dayDay}`;
      
      // Extract date part from completion date 
      const completionDate = new Date(completion.date);
      // Use local date components for the server-stored dates
      const compYear = completionDate.getFullYear();
      const compMonth = String(completionDate.getMonth() + 1).padStart(2, '0');
      const compDate = String(completionDate.getDate()).padStart(2, '0');
      const compString = `${compYear}-${compMonth}-${compDate}`;
      
      return completion.completed && (dayString === compString);
    });
  };

  // Calculate progress for the month
  const completedDaysCount = completions.filter(c => c.completed).length;
  const progressPercentage = targetDays ? Math.min(100, (completedDaysCount / targetDays) * 100) : 0;

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