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

  // console.log('ProjectsSection: raw projects =', projects);
  const priorityProject = projects.find(p => p.isPriority);
  
  // Sort projects by impact (High > Medium > Low)
  const impactOrder: Record<string, number> = { "High": 1, "Medium": 2, "Low": 3 };
  const otherProjects = projects
    .filter(p => !p.isPriority)
    .sort((a, b) => {
      // Sort by impact
      const impactA = a.impact || "Medium";
      const impactB = b.impact || "Medium";
      return impactOrder[impactA] - impactOrder[impactB];
    });
    
  // console.log('ProjectsSection: priorityProject =', priorityProject);
  // console.log('ProjectsSection: otherProjects =', otherProjects);

  return (
    <div className="lg:col-span-2">
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-inter font-semibold text-primary dark:text-white">Projects</h2>
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
              <div className="flex items-center mb-2">
                <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent" 
                    style={{ width: `${priorityProject.progress}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-xs text-secondary">{priorityProject.progress}%</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0">
                <span className="text-xs text-secondary bg-gray-100 py-1 px-2 rounded">
                  {priorityProject.dueDate ? getDueInDays(new Date(priorityProject.dueDate)) : "No due date"}
                </span>
                <span className={`text-xs py-1 px-2 rounded ${
                  priorityProject.impact === "High" 
                    ? "bg-red-100 text-red-600" 
                    : priorityProject.impact === "Medium" 
                      ? "bg-amber-100 text-amber-600" 
                      : "bg-blue-100 text-blue-600"
                }`}>
                  {priorityProject.impact} Impact
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-secondary">No priority project set. Select "Make Priority" on a project below.</p>
            </div>
          )}

          {/* Other Projects (limited to 3) */}
          {otherProjects.slice(0, 3).map(project => (
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
              <div className="flex items-center mb-2">
                <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full" 
                    style={{ 
                      width: `${project.progress}%`,
                      backgroundColor: "hsl(184, 22%, 65%)" /* Use the --success color directly */
                    }}
                  ></div>
                </div>
                <span className="ml-2 text-xs text-secondary">{project.progress}%</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0">
                <span className="text-xs text-secondary bg-muted/80 py-1 px-2 rounded font-medium">
                  {project.dueDate ? getDueInDays(new Date(project.dueDate)) : "No due date"}
                </span>
                <span className={`text-xs py-1 px-2 rounded ${
                  project.impact === "High" 
                    ? "bg-red-100 text-red-600" 
                    : project.impact === "Medium" 
                      ? "bg-amber-100 text-amber-600" 
                      : "bg-blue-100 text-blue-600"
                }`}>
                  {project.impact} Impact
                </span>
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