import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { format, addMonths, subMonths, getDaysInMonth, getDay, startOfMonth, endOfMonth } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

interface Exercise {
  id: number;
  name: string;
  date: string;
  category: string;
}

type CalendarDay = {
  day: number;
  categories: {
    Cardio: boolean;
    Strength: boolean;
    Flexibility: boolean;
  };
  hasExercises: boolean;
}

const ExerciseCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  
  // Extract just the year and month from the date (no time information)
  const year = useMemo(() => currentDate.getFullYear(), [currentDate]);
  const month = useMemo(() => currentDate.getMonth() + 1, [currentDate]); // JavaScript months are 0-indexed
  
  // Fetch exercises for the current month
  const { data: exercises = [] } = useQuery({
    queryKey: ['/api/exercises', year, month],
    refetchOnWindowFocus: true,
    select: (data: Exercise[]) => {
      // Filter exercises for the current month and year only
      return data.filter(exercise => {
        // Handle date as a string directly
        let dateStr = '';
        
        if (typeof exercise.date === 'string') {
          // If date is already a string, ensure it's in YYYY-MM-DD format
          dateStr = exercise.date.split('T')[0];
        } else {
          // Fallback for legacy date objects
          dateStr = new Date(exercise.date as any).toISOString().split('T')[0];
        }
        
        const [exerciseYear, exerciseMonth] = dateStr.split('-').map(Number);
        return exerciseYear === year && exerciseMonth === month;
      });
    }
  });

  // Generate calendar data with useMemo to prevent unnecessary recalculations
  const calendarData = useMemo(() => {
    // Generate calendar data for the month
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getDay(startOfMonth(currentDate));
    const lastDayOfMonth = getDay(endOfMonth(currentDate));
    
    // Create array of days with exercise data
    const days: CalendarDay[] = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return {
        day,
        categories: {
          Cardio: false,
          Strength: false,
          Flexibility: false
        },
        hasExercises: false
      };
    });
    
    // Fill in exercise data
    if (exercises && exercises.length > 0) {
      exercises.forEach(exercise => {
        // Handle date as a string directly
        let dateStr = '';
        
        if (typeof exercise.date === 'string') {
          // If date is already a string, ensure it's in YYYY-MM-DD format
          dateStr = exercise.date.split('T')[0];
        } else {
          // Fallback for legacy date objects
          dateStr = new Date(exercise.date as any).toISOString().split('T')[0];
        }
        
        const [yearStr, monthStr, dayStr] = dateStr.split('-');
        const dayOfMonth = parseInt(dayStr, 10);
        
        if (dayOfMonth > 0 && dayOfMonth <= days.length) {
          days[dayOfMonth - 1].hasExercises = true;
          
          // Mark the specific category
          if (exercise.category === 'Cardio') {
            days[dayOfMonth - 1].categories.Cardio = true;
          } else if (exercise.category === 'Strength') {
            days[dayOfMonth - 1].categories.Strength = true;
          } else if (exercise.category === 'Flexibility') {
            days[dayOfMonth - 1].categories.Flexibility = true;
          }
        }
      });
    }
    
    // Add empty cells for days from previous month
    const previousMonthDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const emptyDaysBefore: CalendarDay[] = Array.from({ length: previousMonthDays }, () => ({
      day: 0,
      categories: { Cardio: false, Strength: false, Flexibility: false },
      hasExercises: false
    }));
    
    // Add empty cells for days from next month
    const nextMonthDays = lastDayOfMonth === 0 ? 0 : 7 - lastDayOfMonth;
    const emptyDaysAfter: CalendarDay[] = Array.from({ length: nextMonthDays }, () => ({
      day: 0,
      categories: { Cardio: false, Strength: false, Flexibility: false },
      hasExercises: false
    }));
    
    // Return combined days
    return [...emptyDaysBefore, ...days, ...emptyDaysAfter];
  }, [currentDate, exercises]);
  
  // Update calendar days when data changes - directly from the memo, no useEffect
  // This eliminates the potential infinite update loop
  useMemo(() => {
    if (calendarData.length > 0 && JSON.stringify(calendarData) !== JSON.stringify(calendarDays)) {
      setCalendarDays(calendarData);
    }
  }, [calendarData, calendarDays]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentDate(prev => subMonths(prev, 1));
    } else {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  };

  // Function to generate the background style for a day - memoized for better performance
  const generateDayStyle = useMemo(() => {
    return (day: CalendarDay): React.CSSProperties => {
      if (!day.hasExercises) {
        return {};
      }
      
      const { Cardio, Strength, Flexibility } = day.categories;
      const activeCategories = [
        Cardio ? '#3b82f6' : null, // blue for Cardio
        Strength ? '#ef4444' : null, // red for Strength
        Flexibility ? '#10b981' : null // green for Flexibility
      ].filter(Boolean) as string[];
      
      if (activeCategories.length === 1) {
        // Single color
        return { backgroundColor: activeCategories[0] };
      } else if (activeCategories.length === 2) {
        // Two color gradient
        return { 
          background: `linear-gradient(135deg, ${activeCategories[0]} 0%, ${activeCategories[1]} 100%)`
        };
      } else if (activeCategories.length === 3) {
        // Three color gradient
        return { 
          background: `linear-gradient(135deg, ${activeCategories[0]} 0%, ${activeCategories[1]} 50%, ${activeCategories[2]} 100%)`
        };
      }
      
      return {};
    };
  }, []);

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateMonth('prev')}
          >
            <i className="ri-arrow-left-s-line"></i>
          </Button>
          <h3 className="text-lg font-medium">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateMonth('next')}
          >
            <i className="ri-arrow-right-s-line"></i>
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <div 
              key={`header-${i}`} 
              className="text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => (
            <div 
              key={`day-${i}`} 
              className={`
                aspect-square rounded-md flex items-center justify-center text-sm
                ${day.day === 0 ? 'text-gray-300' : 'text-gray-700'}
                ${day.hasExercises ? 'text-white font-medium' : ''}
              `}
              style={generateDayStyle(day)}
            >
              {day.day !== 0 ? day.day : ''}
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-between text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: '#3b82f6' }}></div>
            <span>Cardio</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: '#ef4444' }}></div>
            <span>Strength</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: '#10b981' }}></div>
            <span>Flexibility</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseCalendar;