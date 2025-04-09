import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInDays } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Form schema
const projectFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  dueDate: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

const ProjectsPage = () => {
  const { projects, fetchProjects, addProject, updateProject, deleteProject, setPriorityProject, isLoading } = useAppContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      progress: 0,
      dueDate: "",
    },
  });

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const priorityProject = projects.find(p => p.isPriority);
  const otherProjects = projects.filter(p => !p.isPriority);

  const handleAddProject = async (data: ProjectFormValues) => {
    await addProject({
      title: data.title,
      description: data.description || "",
      progress: data.progress,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      isPriority: false,
    });
    setIsAddDialogOpen(false);
    form.reset();
  };

  const handleDeleteProject = async () => {
    if (selectedProject) {
      await deleteProject(selectedProject);
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
    }
  };

  const handleSetPriority = async (id: number) => {
    await setPriorityProject(id);
  };

  const getDueInDays = (dueDate: Date | null) => {
    if (!dueDate) return "No due date";
    
    const days = differenceInDays(new Date(dueDate), new Date());
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    if (days < 0) return `Overdue by ${Math.abs(days)} days`;
    return `Due in ${days} days`;
  };

  const openEditDialog = (project: any) => {
    setSelectedProject(project.id);
    form.reset({
      title: project.title,
      description: project.description || "",
      progress: project.progress,
      dueDate: project.dueDate ? format(new Date(project.dueDate), 'yyyy-MM-dd') : undefined,
    });
    setIsAddDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-inter font-bold text-primary">Project Management</h2>
        <Button 
          className="bg-accent text-white"
          onClick={() => {
            setSelectedProject(null);
            form.reset({
              title: "",
              description: "",
              progress: 0,
              dueDate: "",
            });
            setIsAddDialogOpen(true);
          }}
        >
          <i className="ri-add-line mr-2"></i>
          New Project
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority Project Card */}
        <Card className="bg-primary bg-opacity-5 border-l-4 border-accent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-accent text-white p-1 rounded text-xs font-inter font-medium mr-2">
                  PRIORITY
                </div>
                <h3 className="font-inter font-semibold text-lg">The One Thing</h3>
              </div>
              {priorityProject && (
                <div className="flex">
                  <button 
                    className="text-secondary hover:text-primary transition-colors mr-2"
                    onClick={() => openEditDialog(priorityProject)}
                  >
                    <i className="ri-edit-line"></i>
                  </button>
                  <button 
                    className="text-secondary hover:text-destructive transition-colors"
                    onClick={() => {
                      setSelectedProject(priorityProject.id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              )}
            </div>
            
            {priorityProject ? (
              <>
                <h4 className="font-inter font-medium text-xl mb-2">{priorityProject.title}</h4>
                <p className="text-secondary mb-4">{priorityProject.description}</p>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-secondary">Progress</span>
                  <span className="text-sm font-medium">{priorityProject.progress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-accent"
                    style={{ width: `${priorityProject.progress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm bg-gray-100 py-1 px-2 rounded text-secondary">
                    {priorityProject.dueDate ? getDueInDays(new Date(priorityProject.dueDate)) : "No due date"}
                  </span>
                  
                  <Button
                    variant="outline"
                    className="text-sm"
                    onClick={() => openEditDialog(priorityProject)}
                  >
                    Update Progress
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-secondary mb-4">No priority project set</p>
                <p className="text-sm text-muted-foreground">Set a project as priority using the "Make Priority" button</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Other Projects */}
        {otherProjects.map(project => (
          <Card key={project.id} className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-inter font-medium text-lg">{project.title}</h4>
                <div className="flex">
                  <button 
                    className="text-secondary hover:text-accent transition-colors mr-3"
                    onClick={() => handleSetPriority(project.id)}
                  >
                    <i className="ri-star-line mr-1"></i>
                    Priority
                  </button>
                  <button 
                    className="text-secondary hover:text-primary transition-colors mr-2"
                    onClick={() => openEditDialog(project)}
                  >
                    <i className="ri-edit-line"></i>
                  </button>
                  <button 
                    className="text-secondary hover:text-destructive transition-colors"
                    onClick={() => {
                      setSelectedProject(project.id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
              
              <p className="text-secondary mb-4">{project.description}</p>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-secondary">Progress</span>
                <span className="text-sm font-medium">{project.progress}%</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-success"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              
              <div className="text-sm text-secondary">
                {project.dueDate ? getDueInDays(new Date(project.dueDate)) : "No due date"}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Add New Project Card */}
        <Card className="border border-dashed border-gray-300 bg-gray-50">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full">
            <Button 
              variant="ghost" 
              className="flex flex-col items-center p-8 h-auto w-full"
              onClick={() => {
                setSelectedProject(null);
                form.reset({
                  title: "",
                  description: "",
                  progress: 0,
                  dueDate: "",
                });
                setIsAddDialogOpen(true);
              }}
            >
              <i className="ri-add-line text-3xl text-secondary mb-2"></i>
              <span className="text-secondary font-medium">Add New Project</span>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Add/Edit Project Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProject ? "Edit Project" : "Add New Project"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddProject)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter project description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress ({field.value}%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" className="bg-accent text-white">
                  {selectedProject ? "Update Project" : "Add Project"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this project? This action cannot be undone.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteProject}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsPage;
