import { useState, useEffect } from "react";
import ProjectsSection from "./ProjectsSection";
import IdeasSection from "./IdeasSection";
import LearningSection from "./LearningSection";
import HealthHabitsSection from "./HealthHabitsSection";
import FamilySection from "./FamilySection";
import ValuesSection from "./ValuesSection";
import TodaySection from "./TodaySection";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import { subscribeToEvents, AppEvent } from "@/lib/events";

interface SectionVisibility {
  dashboard: boolean;
  today: boolean;
  projects: boolean;
  ideas: boolean;
  learning: boolean;
  habits: boolean;
  exercise: boolean;
  family: boolean;
  values: boolean;
}

const Dashboard = () => {
  const { isLoading, projects } = useAppContext();
  const [visibleSections, setVisibleSections] = useState<SectionVisibility>({
    dashboard: true,
    today: true,
    projects: true,
    ideas: true,
    learning: true,
    habits: true,
    exercise: true,
    family: true,
    values: true
  });
  
  // Load visibility settings from localStorage and listen for changes
  useEffect(() => {
    // Load initial settings from localStorage
    const savedSettings = localStorage.getItem('visibilitySettings');
    if (savedSettings) {
      setVisibleSections(JSON.parse(savedSettings));
    }
    
    // Subscribe to visibility settings change events
    const unsubscribe = subscribeToEvents((event: AppEvent) => {
      if (event.type === 'VISIBILITY_SETTINGS_CHANGED') {
        setVisibleSections(event.settings);
      }
    });
    
    // Cleanup subscription when component unmounts
    return () => unsubscribe();
  }, []);
  
  console.log('Dashboard component: isLoading =', isLoading);
  console.log('Dashboard component: projects =', projects);

  if (isLoading) {
    console.log('Dashboard: rendering loading state');
    return (
      <div className="p-6">
        <div className="space-y-6">
          {/* Today Section Skeleton */}
          {visibleSections.today && (
            <div>
              <Skeleton className="h-[200px] w-full rounded-xl" />
            </div>
          )}
          
          {/* Other Sections Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleSections.projects && (
              <div className="lg:col-span-2">
                <Skeleton className="h-[600px] w-full rounded-xl" />
              </div>
            )}
            {visibleSections.ideas && (
              <div>
                <Skeleton className="h-[600px] w-full rounded-xl" />
              </div>
            )}
            {visibleSections.learning && (
              <div>
                <Skeleton className="h-[450px] w-full rounded-xl" />
              </div>
            )}
            {visibleSections.habits && (
              <div>
                <Skeleton className="h-[450px] w-full rounded-xl" />
              </div>
            )}
            {visibleSections.family && (
              <div>
                <Skeleton className="h-[450px] w-full rounded-xl" />
              </div>
            )}
            {visibleSections.values && (
              <div className="lg:col-span-2">
                <Skeleton className="h-[450px] w-full rounded-xl" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Today Section - Full width at top */}
        {visibleSections.today && <TodaySection />}
        
        {/* Other dashboard sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleSections.projects && <ProjectsSection />}
          {visibleSections.ideas && <IdeasSection />}
          {visibleSections.learning && <LearningSection />}
          {visibleSections.habits && <HealthHabitsSection />}
          {visibleSections.family && <FamilySection />}
          {visibleSections.values && <ValuesSection />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
