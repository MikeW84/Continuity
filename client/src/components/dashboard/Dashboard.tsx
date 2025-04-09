import ProjectsSection from "./ProjectsSection";
import IdeasSection from "./IdeasSection";
import LearningSection from "./LearningSection";
import HealthHabitsSection from "./HealthHabitsSection";
import FamilySection from "./FamilySection";
import ValuesSection from "./ValuesSection";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="p-6">
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
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProjectsSection />
        <IdeasSection />
        <LearningSection />
        <HealthHabitsSection />
        <FamilySection />
        <ValuesSection />
      </div>
    </div>
  );
};

export default Dashboard;
