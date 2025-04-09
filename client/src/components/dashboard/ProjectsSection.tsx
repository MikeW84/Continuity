import { useAppContext } from "@/context/AppContext";
import { format, differenceInDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Project } from "@shared/schema";
import { navigateToAddItem } from "@/lib/navigationHelpers";

const ProjectsSection = () => {
  const { projects, setPriorityProject, isLoading } = useAppContext();
  
  const getDueInDays = (dueDate: Date | null) => {
    if (!dueDate) return "No due date";
    
    const days = differenceInDays(new Date(dueDate), new Date());
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    if (days < 0) return `Overdue by ${Math.abs(days)} days`;
    return `Due in ${days} days`;
  };
  
  const handleSetPriority = async (id: number) => {
    await setPriorityProject(id);
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          
          <Skeleton className="h-32 w-full mb-6" />
          
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const priorityProject = projects.find(p => p.isPriority);
  const otherProjects = projects.filter(p => !p.isPriority);

  return (
    <div className="lg:col-span-2">
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-inter font-semibold text-primary">Projects</h2>
            <button className="text-secondary hover:text-primary transition-colors">
              <i className="ri-more-2-fill"></i>
            </button>
          </div>
          
          {/* The One Thing Section */}
          {priorityProject ? (
            <div className="mb-6 bg-primary bg-opacity-5 p-4 rounded-lg border-l-4 border-accent">
              <div className="flex items-center mb-2">
                <div className="bg-accent text-white p-1 rounded text-xs font-inter font-medium mr-2">
                  THE ONE THING
                </div>
                <h3 className="font-inter font-medium">{priorityProject.title}</h3>
              </div>
              <p className="text-sm text-secondary mb-3">{priorityProject.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent" 
                      style={{ width: `${priorityProject.progress}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs text-secondary">{priorityProject.progress}%</span>
                </div>
                <div>
                  <span className="text-xs text-secondary bg-gray-100 py-1 px-2 rounded">
                    {priorityProject.dueDate ? getDueInDays(new Date(priorityProject.dueDate)) : "No due date"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-secondary">No priority project set. Select "Make Priority" on a project below.</p>
            </div>
          )}
          
          {/* Other Projects */}
          {otherProjects.map(project => (
            <div 
              key={project.id} 
              className="mb-4 p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-inter font-medium">{project.title}</h3>
                <button 
                  className="text-secondary hover:text-accent transition-colors text-sm"
                  onClick={() => handleSetPriority(project.id)}
                >
                  Make Priority
                </button>
              </div>
              <p className="text-sm text-secondary mb-3">{project.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-success" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs text-secondary">{project.progress}%</span>
                </div>
                <div>
                  <span className="text-xs text-secondary bg-gray-100 py-1 px-2 rounded">
                    {project.dueDate ? getDueInDays(new Date(project.dueDate)) : "No due date"}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          <button 
            className="text-accent hover:text-opacity-80 text-sm font-medium flex items-center mt-2 transition-colors"
            onClick={() => navigateToAddItem('/projects')}
          >
            <i className="ri-add-line mr-1"></i> Add New Project
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsSection;
