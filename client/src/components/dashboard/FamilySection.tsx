import { useAppContext } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const FamilySection = () => {
  const { dateIdeas, parentingTasks, toggleParentingTask, isLoading } = useAppContext();

  const handleToggleParentingTask = async (id: number) => {
    await toggleParentingTask(id);
  };

  const scheduledDate = dateIdeas.find(date => date.isScheduled);
  const unscheduledDateIdeas = dateIdeas.filter(date => !date.isScheduled);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          
          <Skeleton className="h-6 w-48 mb-3" />
          <Skeleton className="h-28 w-full mb-4" />
          
          <div className="space-y-2 mb-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          <Skeleton className="h-6 w-24 mb-3" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-inter font-semibold text-primary dark:text-white">Family</h2>
          <button className="text-secondary hover:text-primary transition-colors">
            <i className="ri-more-2-fill"></i>
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="font-inter font-medium text-sm uppercase text-secondary mb-3">Date Planning with Bekah</h3>
          
          {scheduledDate ? (
            <div className="mb-4 p-4 border border-accent border-opacity-30 rounded-lg bg-accent bg-opacity-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-inter font-medium">Upcoming Date</h4>
                <span className="text-xs bg-accent bg-opacity-20 text-accent py-1 px-2 rounded">
                  {scheduledDate.date ? format(new Date(scheduledDate.date), 'MMM do') : 'Not scheduled'}
                </span>
              </div>
              <p className="text-sm text-secondary mb-3">{scheduledDate.title}</p>
              <div className="flex items-center text-xs">
                <button className="flex items-center text-primary hover:text-accent transition-colors mr-4">
                  <i className="ri-edit-line mr-1"></i> Edit
                </button>
                <button className="flex items-center text-primary hover:text-accent transition-colors">
                  <i className="ri-calendar-check-line mr-1"></i> Check Availability
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-4 bg-gray-100 rounded-lg text-center">
              <p className="text-secondary">No upcoming date scheduled.</p>
            </div>
          )}
          
          {unscheduledDateIdeas.length > 0 && (
            <div className="mb-3">
              <h4 className="font-inter font-medium text-sm mb-2">Date Ideas</h4>
              
              {unscheduledDateIdeas.map(idea => (
                <div key={idea.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm">{idea.title}</span>
                  <Button 
                    className="text-xs bg-primary text-white py-1 px-3 rounded hover:bg-opacity-90 transition-colors"
                  >
                    Schedule
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <h3 className="font-inter font-medium text-sm uppercase text-secondary mb-3">Parenting</h3>
          
          {parentingTasks.length === 0 ? (
            <div className="text-center py-3 text-secondary">
              <p>No parenting tasks yet.</p>
            </div>
          ) : (
            <div className="mb-4">
              {parentingTasks.map(task => (
                <div key={task.id} className="flex items-start mb-3">
                  <div 
                    className={`h-6 w-6 rounded-full border-2 ${
                      task.isCompleted 
                        ? "border-success bg-success bg-opacity-10 mt-0.5 mr-3 flex items-center justify-center" 
                        : "border-secondary mt-0.5 mr-3"
                    }`}
                    onClick={() => handleToggleParentingTask(task.id)}
                  >
                    {task.isCompleted && (
                      <i className="ri-check-line text-success"></i>
                    )}
                  </div>
                  <div>
                    <h4 className="font-inter font-medium text-sm">{task.title}</h4>
                    <p className="text-xs text-secondary">{task.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button className="text-accent hover:text-opacity-80 text-sm font-medium flex items-center mt-2 transition-colors">
            <i className="ri-add-line mr-1"></i> Add Family Task
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilySection;
