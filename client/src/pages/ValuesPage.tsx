import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Value form schema
const valueFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  alignmentScore: z.number().min(0).max(100).default(0),
});

type ValueFormValues = z.infer<typeof valueFormSchema>;

// Dream form schema
const dreamFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.string().optional(),
  timeframe: z.string().default("long-term"),
});

type DreamFormValues = z.infer<typeof dreamFormSchema>;

const ValuesPage = () => {
  const { values, dreams, fetchValues, fetchDreams, addValue, updateValue, deleteValue, addDream, updateDream, deleteDream, isLoading } = useAppContext();
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
  const [isDreamDialogOpen, setIsDreamDialogOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [selectedDream, setSelectedDream] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'value' | 'dream'>('value');
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const valueForm = useForm<ValueFormValues>({
    resolver: zodResolver(valueFormSchema),
    defaultValues: {
      title: "",
      description: "",
      alignmentScore: 0,
    },
  });

  const dreamForm = useForm<DreamFormValues>({
    resolver: zodResolver(dreamFormSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      timeframe: "long-term",
    },
  });

  useEffect(() => {
    fetchValues();
    fetchDreams();
  }, [fetchValues, fetchDreams]);

  const handleAddValue = async (data: ValueFormValues) => {
    if (selectedValue) {
      // Update existing value
      await updateValue(selectedValue, data);
    } else {
      // Add new value
      await addValue(data);
    }
    
    setIsValueDialogOpen(false);
    valueForm.reset();
  };

  const handleAddDream = async (data: DreamFormValues) => {
    // Convert comma-separated tags to array
    const tagArray = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
    
    if (selectedDream) {
      // Update existing dream
      await updateDream(selectedDream, {
        ...data,
        tags: tagArray,
      });
    } else {
      // Add new dream
      await addDream({
        ...data,
        tags: tagArray,
      });
    }
    
    setIsDreamDialogOpen(false);
    dreamForm.reset();
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    if (deleteType === 'value') {
      await deleteValue(selectedItem);
    } else {
      await deleteDream(selectedItem);
    }
    
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const openEditValueDialog = (value: any) => {
    setSelectedValue(value.id);
    valueForm.reset({
      title: value.title,
      description: value.description || "",
      alignmentScore: value.alignmentScore || 0,
    });
    setIsValueDialogOpen(true);
  };

  const openEditDreamDialog = (dream: any) => {
    setSelectedDream(dream.id);
    dreamForm.reset({
      title: dream.title,
      description: dream.description || "",
      tags: dream.tags ? dream.tags.join(', ') : "",
      timeframe: dream.timeframe || "long-term",
    });
    setIsDreamDialogOpen(true);
  };

  const timeframeOptions = [
    { value: "short-term", label: "Short Term (< 1 year)" },
    { value: "medium-term", label: "Medium Term (1-3 years)" },
    { value: "long-term", label: "Long Term (3+ years)" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-inter font-bold text-primary">Values & Dreams</h2>
        <div className="flex gap-2">
          <Button 
            className="bg-primary text-white"
            onClick={() => {
              setSelectedValue(null);
              valueForm.reset({
                title: "",
                description: "",
                alignmentScore: 0,
              });
              setIsValueDialogOpen(true);
            }}
          >
            <i className="ri-compass-3-line mr-2"></i>
            New Core Value
          </Button>
          <Button 
            className="bg-accent text-white"
            onClick={() => {
              setSelectedDream(null);
              dreamForm.reset({
                title: "",
                description: "",
                tags: "",
                timeframe: "long-term",
              });
              setIsDreamDialogOpen(true);
            }}
          >
            <i className="ri-star-line mr-2"></i>
            New Future Dream
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="values" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="values">Core Values</TabsTrigger>
          <TabsTrigger value="dreams">Future Dreams</TabsTrigger>
        </TabsList>
        
        <TabsContent value="values">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <>
              {values.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <i className="ri-compass-3-line text-4xl text-secondary mb-3"></i>
                  <h3 className="text-xl font-medium mb-2">No core values defined yet</h3>
                  <p className="text-secondary mb-4">Define your core values to guide your decisions and align your projects</p>
                  <Button 
                    onClick={() => {
                      setSelectedValue(null);
                      valueForm.reset({
                        title: "",
                        description: "",
                        alignmentScore: 0,
                      });
                      setIsValueDialogOpen(true);
                    }}
                  >
                    <i className="ri-add-line mr-1"></i> Add Your First Core Value
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {values.map(value => (
                    <Card key={value.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-inter font-medium text-lg">{value.title}</h3>
                          <div className="flex">
                            <button 
                              className="text-secondary hover:text-primary transition-colors mr-2"
                              onClick={() => openEditValueDialog(value)}
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button 
                              className="text-secondary hover:text-destructive transition-colors"
                              onClick={() => {
                                setDeleteType('value');
                                setSelectedItem(value.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-secondary mb-4">{value.description}</p>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-primary font-medium">Project Alignment:</span>
                            <span className="text-sm text-secondary">{value.alignmentScore}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-success rounded-full"
                              style={{ width: `${value.alignmentScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Add New Value Card */}
                  <Card className="border border-dashed border-gray-300 bg-gray-50">
                    <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                      <Button 
                        variant="ghost" 
                        className="flex flex-col items-center p-8 h-auto w-full"
                        onClick={() => {
                          setSelectedValue(null);
                          valueForm.reset({
                            title: "",
                            description: "",
                            alignmentScore: 0,
                          });
                          setIsValueDialogOpen(true);
                        }}
                      >
                        <i className="ri-add-line text-3xl text-secondary mb-2"></i>
                        <span className="text-secondary font-medium">Add New Core Value</span>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="dreams">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <>
              {dreams.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <i className="ri-star-line text-4xl text-secondary mb-3"></i>
                  <h3 className="text-xl font-medium mb-2">No future dreams captured yet</h3>
                  <p className="text-secondary mb-4">Capture your dreams and aspirations for the future</p>
                  <Button 
                    onClick={() => {
                      setSelectedDream(null);
                      dreamForm.reset({
                        title: "",
                        description: "",
                        tags: "",
                        timeframe: "long-term",
                      });
                      setIsDreamDialogOpen(true);
                    }}
                  >
                    <i className="ri-add-line mr-1"></i> Add Your First Dream
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dreams.map(dream => (
                    <Card key={dream.id} className="border border-accent border-opacity-30 relative">
                      <div className="absolute top-0 right-0 w-4 h-4 bg-accent rounded-bl-lg rounded-tr-lg"></div>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-inter font-medium text-lg">{dream.title}</h3>
                          <div className="flex">
                            <button 
                              className="text-secondary hover:text-primary transition-colors mr-2"
                              onClick={() => openEditDreamDialog(dream)}
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button 
                              className="text-secondary hover:text-destructive transition-colors"
                              onClick={() => {
                                setDeleteType('dream');
                                setSelectedItem(dream.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-secondary mb-4">{dream.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          {dream.timeframe && (
                            <span className="text-xs bg-primary bg-opacity-10 text-primary py-1 px-2 rounded-md">
                              {dream.timeframe}
                            </span>
                          )}
                          {dream.tags?.map((tag, index) => (
                            <span key={index} className="text-xs bg-primary bg-opacity-10 text-primary py-1 px-2 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Add New Dream Card */}
                  <Card className="border border-dashed border-gray-300 bg-gray-50">
                    <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                      <Button 
                        variant="ghost" 
                        className="flex flex-col items-center p-8 h-auto w-full"
                        onClick={() => {
                          setSelectedDream(null);
                          dreamForm.reset({
                            title: "",
                            description: "",
                            tags: "",
                            timeframe: "long-term",
                          });
                          setIsDreamDialogOpen(true);
                        }}
                      >
                        <i className="ri-add-line text-3xl text-secondary mb-2"></i>
                        <span className="text-secondary font-medium">Add New Future Dream</span>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Value Dialog */}
      <Dialog open={isValueDialogOpen} onOpenChange={setIsValueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedValue ? "Edit Core Value" : "Add New Core Value"}</DialogTitle>
          </DialogHeader>
          
          <Form {...valueForm}>
            <form onSubmit={valueForm.handleSubmit(handleAddValue)} className="space-y-4">
              <FormField
                control={valueForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter value title (e.g. Family Connection)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={valueForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what this value means to you" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={valueForm.control}
                name="alignmentScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Alignment ({field.value}%)</FormLabel>
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
                    <p className="text-xs text-muted-foreground mt-1">
                      How well your current projects align with this value
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" className="bg-accent text-white">
                  {selectedValue ? "Update Value" : "Add Value"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add/Edit Dream Dialog */}
      <Dialog open={isDreamDialogOpen} onOpenChange={setIsDreamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDream ? "Edit Future Dream" : "Add New Future Dream"}</DialogTitle>
          </DialogHeader>
          
          <Form {...dreamForm}>
            <form onSubmit={dreamForm.handleSubmit(handleAddDream)} className="space-y-4">
              <FormField
                control={dreamForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dream Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter dream title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={dreamForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your dream in detail" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={dreamForm.control}
                name="timeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeframe</FormLabel>
                    <FormControl>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        {...field}
                      >
                        {timeframeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={dreamForm.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tags separated by commas" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Example: 5-year plan, family, career
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" className="bg-accent text-white">
                  {selectedDream ? "Update Dream" : "Add Dream"}
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
            <DialogTitle>Delete {deleteType === 'value' ? 'Core Value' : 'Future Dream'}</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this {deleteType === 'value' ? 'core value' : 'future dream'}? This action cannot be undone.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ValuesPage;
