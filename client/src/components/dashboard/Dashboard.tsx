import ProjectsSection from "./ProjectsSection";
import IdeasSection from "./IdeasSection";
import LearningSection from "./LearningSection";
import HealthHabitsSection from "./HealthHabitsSection";
import FamilySection from "./FamilySection";
import ValuesSection from "./ValuesSection";
import TodaySection from "./TodaySection";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { isLoading, projects } = useAppContext();
  
  console.log('Dashboard component: isLoading =', isLoading);
  console.log('Dashboard component: projects =', projects);

  if (isLoading) {
    console.log('Dashboard: rendering loading state');
    return (
      <div className="p-6">
        <div className="space-y-6">
          {/* Today Section Skeleton */}
          <div>
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
          
          {/* Other Sections Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-[600px] w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-[600px] w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-[450px] w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-[450px] w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-[450px] w-full rounded-xl" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-[450px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Today Section - Full width at top */}
        <TodaySection />
        
        {/* Other dashboard sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectsSection />
          <IdeasSection />
          <LearningSection />
          <HealthHabitsSection />
          <FamilySection />
          <ValuesSection />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
