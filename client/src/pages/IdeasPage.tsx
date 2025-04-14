import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Form schema
const ideaFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  resources: z.string().optional(),
  tags: z.string().optional(),
});

type IdeaFormValues = z.infer<typeof ideaFormSchema>;

const IdeasPage = () => {
  const { ideas, fetchIdeas, addIdea, updateIdea, deleteIdea, voteIdea, isLoading } = useAppContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const form = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaFormSchema),
    defaultValues: {
      title: "",
      description: "",
      resources: "",
      tags: "",
    },
  });

  useEffect(() => {
    fetchIdeas();

    // Check if dialog should be opened
    const shouldOpenDialog = sessionStorage.getItem('openAddDialog');
    if (shouldOpenDialog === 'true') {
      setSelectedIdea(null);
      form.reset({
        title: "",
        description: "",
        resources: "",
        tags: "",
      });
      setIsAddDialogOpen(true);
      sessionStorage.removeItem('openAddDialog');
    }
  }, [fetchIdeas, form]);

  const handleAddIdea = async (data: IdeaFormValues) => {
    // Convert comma-separated tags to array
    const tagArray = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
    
    if (selectedIdea) {
      // Update existing idea
      await updateIdea(selectedIdea, {
        title: data.title,
        description: data.description || "",
        tags: tagArray,
      });
    } else {
      // Add new idea
      await addIdea({
        title: data.title,
        description: data.description || "",
        votes: 0,
        tags: tagArray,
      });
    }
    
    setIsAddDialogOpen(false);
    form.reset();
  };

  const handleDeleteIdea = async () => {
    if (selectedIdea) {
      await deleteIdea(selectedIdea);
      setIsDeleteDialogOpen(false);
      setSelectedIdea(null);
    }
  };

  const handleVote = async (id: number, upvote: boolean) => {
    await voteIdea(id, upvote);
  };

  const openEditDialog = (idea: any) => {
    setSelectedIdea(idea.id);
    form.reset({
      title: idea.title,
      description: idea.description || "",
      resources: idea.resources || "",
      tags: idea.tags ? idea.tags.join(', ') : "",
    });
    setIsAddDialogOpen(true);
  };

  // Filter ideas based on selection
  const filteredIdeas = () => {
    if (filter === "positive") {
      return ideas.filter(idea => (idea.votes ?? 0) > 0);
    } else if (filter === "negative") {
      return ideas.filter(idea => (idea.votes ?? 0) < 0);
    } else {
      return ideas;
    }
  };

  // Sort ideas by votes (highest first)
  const sortedIdeas = filteredIdeas().sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-inter font-bold text-primary">Idea Bank</h2>
        <Button 
          className="bg-accent text-white"
          onClick={() => {
            setSelectedIdea(null);
            form.reset({
              title: "",
              description: "",
              resources: "",
              tags: "",
            });
            setIsAddDialogOpen(true);
          }}
        >
          <i className="ri-lightbulb-line mr-2"></i>
          New Idea
        </Button>
      </div>
      
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant={filter === "all" ? "default" : "outline"}
            className={filter === "all" ? "bg-primary text-white" : ""}
            onClick={() => setFilter("all")}
          >
            All Ideas
          </Button>
          <Button 
            variant={filter === "positive" ? "default" : "outline"}
            className={filter === "positive" ? "bg-success text-white" : ""}
            onClick={() => setFilter("positive")}
          >
            <i className="ri-arrow-up-s-line mr-1"></i>
            Positive Votes
          </Button>
          <Button 
            variant={filter === "negative" ? "default" : "outline"}
            className={filter === "negative" ? "bg-destructive text-white" : ""}
            onClick={() => setFilter("negative")}
          >
            <i className="ri-arrow-down-s-line mr-1"></i>
            Negative Votes
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {sortedIdeas.length} idea{sortedIdeas.length !== 1 ? "s" : ""} found
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <>
          {sortedIdeas.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <i className="ri-lightbulb-line text-4xl text-secondary mb-3"></i>
              <h3 className="text-xl font-medium mb-2">No ideas found</h3>
              <p className="text-secondary mb-4">
                {filter !== "all" 
                  ? "Try changing your filter or add new ideas" 
                  : "Start adding ideas to your idea bank"}
              </p>
              <Button 
                onClick={() => {
                  setSelectedIdea(null);
                  form.reset({
                    title: "",
                    description: "",
                    resources: "",
                    tags: "",
                  });
                  setIsAddDialogOpen(true);
                }}
              >
                <i className="ri-add-line mr-1"></i> Add Your First Idea
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedIdeas.map(idea => (
                <Card key={idea.id} className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-inter font-medium text-lg">{idea.title}</h4>
                      <div className="flex">
                        <button 
                          className="text-secondary hover:text-primary transition-colors mr-2"
                          onClick={() => openEditDialog(idea)}
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button 
                          className="text-secondary hover:text-destructive transition-colors"
                          onClick={() => {
                            setSelectedIdea(idea.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-secondary mb-4">{idea.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {idea.tags?.map((tag, index) => (
                        <span 
                          key={index} 
                          className="text-xs bg-primary bg-opacity-10 text-primary py-1 px-2 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span 
                          className={`text-lg font-medium ${
                            (idea.votes ?? 0) > 0 
                              ? "text-success" 
                              : (idea.votes ?? 0) < 0 
                                ? "text-destructive" 
                                : "text-secondary"
                          }`}
                        >
                          {(idea.votes ?? 0) > 0 ? `+${idea.votes ?? 0}` : idea.votes ?? 0}
                        </span>
                      </div>
                      
                      <div className="flex">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="rounded-r-none"
                          onClick={() => handleVote(idea.id, true)}
                        >
                          <i className="ri-arrow-up-s-line"></i>
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="rounded-l-none"
                          onClick={() => handleVote(idea.id, false)}
                        >
                          <i className="ri-arrow-down-s-line"></i>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add New Idea Card */}
              <Card className="border border-dashed border-gray-300 bg-gray-50">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                  <Button 
                    variant="ghost" 
                    className="flex flex-col items-center p-8 h-auto w-full"
                    onClick={() => {
                      setSelectedIdea(null);
                      form.reset({
                        title: "",
                        description: "",
                        resources: "",
                        tags: "",
                      });
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <i className="ri-lightbulb-line text-3xl text-secondary mb-2"></i>
                    <span className="text-secondary font-medium">Add New Idea</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
      
      {/* Add/Edit Idea Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedIdea ? "Edit Idea" : "Add New Idea"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddIdea)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idea Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter idea title" {...field} />
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
                      <Textarea placeholder="Enter idea description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="resources"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resources</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add links, books, or other resources related to this idea" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add links to websites, books, tools, or other resources that can help with this idea
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tags separated by commas" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Example: productivity, app, health
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" className="bg-accent text-white">
                  {selectedIdea ? "Update Idea" : "Add Idea"}
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
            <DialogTitle>Delete Idea</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this idea? This action cannot be undone.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteIdea}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IdeasPage;
