import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Form schema
const learningItemFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  progress: z.number().min(0).max(100).default(0),
  isCurrentlyLearning: z.boolean().default(false),
});

type LearningItemFormValues = z.infer<typeof learningItemFormSchema>;

const LearningPage = () => {
  const { learningItems, fetchLearningItems, addLearningItem, updateLearningItem, deleteLearningItem, isLoading } = useAppContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<LearningItemFormValues>({
    resolver: zodResolver(learningItemFormSchema),
    defaultValues: {
      title: "",
      category: "",
      progress: 0,
      isCurrentlyLearning: false,
    },
  });

  useEffect(() => {
    fetchLearningItems();
  }, [fetchLearningItems]);

  const currentlyLearning = learningItems.filter(item => item.isCurrentlyLearning);
  const learningQueue = learningItems.filter(item => !item.isCurrentlyLearning);

  const handleAddLearningItem = async (data: LearningItemFormValues) => {
    if (selectedItem) {
      // Update existing learning item
      await updateLearningItem(selectedItem, data);
    } else {
      // Add new learning item
      await addLearningItem(data);
    }
    
    setIsAddDialogOpen(false);
    form.reset();
  };

  const handleDeleteLearningItem = async () => {
    if (selectedItem) {
      await deleteLearningItem(selectedItem);
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    }
  };

  const openEditDialog = (item: any) => {
    setSelectedItem(item.id);
    form.reset({
      title: item.title,
      category: item.category || "",
      progress: item.progress,
      isCurrentlyLearning: item.isCurrentlyLearning,
    });
    setIsAddDialogOpen(true);
  };

  const handleToggleStatus = async (id: number, isCurrentlyLearning: boolean) => {
    await updateLearningItem(id, { isCurrentlyLearning });
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-inter font-bold text-primary">Learning Tracker</h2>
        <Button 
          className="bg-accent text-white"
          onClick={() => {
            setSelectedItem(null);
            form.reset({
              title: "",
              category: "",
              progress: 0,
              isCurrentlyLearning: false,
            });
            setIsAddDialogOpen(true);
          }}
        >
          <i className="ri-book-open-line mr-2"></i>
          New Learning Topic
        </Button>
      </div>
      
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="current">Currently Learning ({currentlyLearning.length})</TabsTrigger>
          <TabsTrigger value="queue">Learning Queue ({learningQueue.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <>
              {currentlyLearning.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <i className="ri-book-open-line text-4xl text-secondary mb-3"></i>
                  <h3 className="text-xl font-medium mb-2">Not learning anything yet</h3>
                  <p className="text-secondary mb-4">Start learning something from your queue or add a new topic</p>
                  <Button 
                    onClick={() => {
                      setSelectedItem(null);
                      form.reset({
                        title: "",
                        category: "",
                        progress: 0,
                        isCurrentlyLearning: true,
                      });
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <i className="ri-add-line mr-1"></i> Start Learning Something
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentlyLearning.map(item => (
                    <Card key={item.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <i className={item.category?.toLowerCase().includes('language') ? "ri-translate-2 text-accent mr-2" : "ri-book-open-line text-accent mr-2"}></i>
                              <span className="text-xs text-secondary">{item.category}</span>
                            </div>
                            <CardTitle className="mt-1">{item.title}</CardTitle>
                          </div>
                          <div className="flex">
                            <button 
                              className="text-secondary hover:text-primary transition-colors mr-2"
                              onClick={() => openEditDialog(item)}
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button 
                              className="text-secondary hover:text-destructive transition-colors"
                              onClick={() => {
                                setSelectedItem(item.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="mt-4 space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Progress</span>
                              <span className="text-sm font-medium">{item.progress}%</span>
                            </div>
                            <Progress value={item.progress} className="h-2" />
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleToggleStatus(item.id, false)}
                            >
                              Move to Queue
                            </Button>
                            
                            <Button 
                              className="bg-primary"
                              size="sm"
                              onClick={() => openEditDialog(item)}
                            >
                              Update Progress
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="queue">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <>
              {learningQueue.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <i className="ri-list-check-line text-4xl text-secondary mb-3"></i>
                  <h3 className="text-xl font-medium mb-2">Your learning queue is empty</h3>
                  <p className="text-secondary mb-4">Add topics you're interested in learning in the future</p>
                  <Button 
                    onClick={() => {
                      setSelectedItem(null);
                      form.reset({
                        title: "",
                        category: "",
                        progress: 0,
                        isCurrentlyLearning: false,
                      });
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <i className="ri-add-line mr-1"></i> Add Topic to Learning Queue
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {learningQueue.map(item => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{item.title}</h4>
                            <div className="flex items-center mt-1">
                              <i className={item.category?.toLowerCase().includes('language') ? "ri-translate-2 text-secondary text-xs mr-1" : "ri-book-open-line text-secondary text-xs mr-1"}></i>
                              <span className="text-xs text-secondary">{item.category}</span>
                            </div>
                          </div>
                          
                          <div className="flex">
                            <Button 
                              size="sm" 
                              className="bg-primary mr-2"
                              onClick={() => handleToggleStatus(item.id, true)}
                            >
                              Start
                            </Button>
                            <button 
                              className="text-secondary hover:text-primary transition-colors mr-2"
                              onClick={() => openEditDialog(item)}
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button 
                              className="text-secondary hover:text-destructive transition-colors"
                              onClick={() => {
                                setSelectedItem(item.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Add New Learning Item Card */}
                  <Card className="border border-dashed border-gray-300 bg-gray-50">
                    <CardContent className="p-4 flex items-center justify-center h-full">
                      <Button 
                        variant="ghost" 
                        className="flex flex-col items-center p-4 h-auto w-full"
                        onClick={() => {
                          setSelectedItem(null);
                          form.reset({
                            title: "",
                            category: "",
                            progress: 0,
                            isCurrentlyLearning: false,
                          });
                          setIsAddDialogOpen(true);
                        }}
                      >
                        <i className="ri-add-line text-2xl text-secondary mb-1"></i>
                        <span className="text-secondary text-sm">Add to Queue</span>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Learning Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Edit Learning Topic" : "Add New Learning Topic"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddLearningItem)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter topic title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category (e.g. Programming, Language)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isCurrentlyLearning"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Currently Learning</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Mark if you're actively learning this topic
                      </p>
                    </div>
                    <FormControl>
                      <Switch 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {form.watch("isCurrentlyLearning") && (
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
              )}
              
              <DialogFooter>
                <Button type="submit" className="bg-accent text-white">
                  {selectedItem ? "Update Topic" : "Add Topic"}
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
            <DialogTitle>Delete Learning Topic</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this learning topic? This action cannot be undone.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteLearningItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LearningPage;
