import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Pencil, AlertCircle, PlusCircle } from 'lucide-react';

// Temp user ID for development
const TEMP_USER_ID = 1;

interface Quote {
  id: number;
  text: string;
  author: string | null;
  source: string | null;
  userId: number;
}

interface QuoteFormData {
  text: string;
  author: string;
  source: string;
}

// Helper function to make API requests
async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  // For DELETE requests that might not return content
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

const QuotesManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for the quote being edited
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [formData, setFormData] = useState<QuoteFormData>({
    text: '',
    author: '',
    source: '',
  });
  
  // Fetch quotes
  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['/api/quotes'],
    queryFn: () => apiCall<Quote[]>('/api/quotes'),
  });
  
  // Create quote mutation
  const createQuoteMutation = useMutation({
    mutationFn: (quoteData: QuoteFormData) => 
      apiCall('/api/quotes', {
        method: 'POST',
        body: JSON.stringify({ ...quoteData, userId: TEMP_USER_ID }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      toast({
        title: 'Quote Added',
        description: 'Your quote has been successfully added.',
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add quote. Please try again.',
        variant: 'destructive',
      });
      console.error('Error adding quote:', error);
    }
  });
  
  // Update quote mutation
  const updateQuoteMutation = useMutation({
    mutationFn: (data: { id: number; quote: QuoteFormData }) => 
      apiCall(`/api/quotes/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data.quote),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      toast({
        title: 'Quote Updated',
        description: 'Your quote has been successfully updated.',
      });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update quote. Please try again.',
        variant: 'destructive',
      });
      console.error('Error updating quote:', error);
    }
  });
  
  // Delete quote mutation
  const deleteQuoteMutation = useMutation({
    mutationFn: (id: number) => 
      apiCall(`/api/quotes/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      toast({
        title: 'Quote Deleted',
        description: 'The quote has been successfully deleted.',
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete quote. Please try again.',
        variant: 'destructive',
      });
      console.error('Error deleting quote:', error);
    }
  });
  
  const resetForm = () => {
    setFormData({
      text: '',
      author: '',
      source: '',
    });
    setCurrentQuote(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleAddQuote = () => {
    // Basic validation
    if (!formData.text.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Quote text is required.',
        variant: 'destructive',
      });
      return;
    }
    
    createQuoteMutation.mutate(formData);
  };
  
  const handleEditQuote = () => {
    // Basic validation
    if (!formData.text.trim() || !currentQuote) {
      toast({
        title: 'Missing Information',
        description: 'Quote text is required.',
        variant: 'destructive',
      });
      return;
    }
    
    updateQuoteMutation.mutate({
      id: currentQuote.id,
      quote: formData,
    });
  };
  
  const handleDeleteQuote = () => {
    if (currentQuote) {
      deleteQuoteMutation.mutate(currentQuote.id);
    }
  };
  
  const openEditDialog = (quote: Quote) => {
    setCurrentQuote(quote);
    setFormData({
      text: quote.text,
      author: quote.author || '',
      source: quote.source || '',
    });
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (quote: Quote) => {
    setCurrentQuote(quote);
    setIsDeleteDialogOpen(true);
  };
  
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Motivational Quotes</CardTitle>
        <CardDescription>
          Manage your favorite quotes to display on your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No quotes added yet</p>
            <p className="text-sm text-muted-foreground">
              Add some motivational quotes to display throughout the application
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div key={quote.id} className="p-4 border rounded-lg">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <p className="text-lg font-medium italic">"{quote.text}"</p>
                    {quote.author && (
                      <p className="text-sm text-muted-foreground mt-1">
                        — {quote.author}
                        {quote.source && ` (${quote.source})`}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(quote)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(quote)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-start">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Quote
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Motivational Quote</DialogTitle>
              <DialogDescription>
                Add a new quote to inspire you during your day
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="text">Quote Text*</Label>
                <Textarea
                  id="text"
                  name="text"
                  placeholder="Enter the quote text"
                  value={formData.text}
                  onChange={handleInputChange}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  name="author"
                  placeholder="Who said this quote? (Optional)"
                  value={formData.author}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  name="source"
                  placeholder="Book, speech, etc. (Optional)"
                  value={formData.source}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddQuote} 
                disabled={createQuoteMutation.isPending}
              >
                {createQuoteMutation.isPending ? "Adding..." : "Add Quote"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Quote</DialogTitle>
              <DialogDescription>
                Update your motivational quote
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-text">Quote Text*</Label>
                <Textarea
                  id="edit-text"
                  name="text"
                  placeholder="Enter the quote text"
                  value={formData.text}
                  onChange={handleInputChange}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-author">Author</Label>
                <Input
                  id="edit-author"
                  name="author"
                  placeholder="Who said this quote? (Optional)"
                  value={formData.author}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-source">Source</Label>
                <Input
                  id="edit-source"
                  name="source"
                  placeholder="Book, speech, etc. (Optional)"
                  value={formData.source}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditQuote} 
                disabled={updateQuoteMutation.isPending}
              >
                {updateQuoteMutation.isPending ? "Updating..." : "Update Quote"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this quote? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteQuote} 
                className="bg-destructive text-destructive-foreground"
              >
                {deleteQuoteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default QuotesManager;