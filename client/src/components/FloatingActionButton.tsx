import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const FloatingActionButton = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <>
      <div className="fixed right-6 bottom-6 z-20">
        <button 
          className="h-14 w-14 rounded-full bg-accent text-white shadow-lg flex items-center justify-center hover:bg-opacity-90 transition-all"
          onClick={() => setIsMenuOpen(true)}
        >
          <i className="ri-add-line text-2xl"></i>
        </button>
      </div>
      
      <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Add</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button variant="outline" className="flex justify-start items-center h-14">
              <i className="ri-task-line text-lg mr-2"></i>
              Project
            </Button>
            <Button variant="outline" className="flex justify-start items-center h-14">
              <i className="ri-lightbulb-line text-lg mr-2"></i>
              Idea
            </Button>
            <Button variant="outline" className="flex justify-start items-center h-14">
              <i className="ri-book-open-line text-lg mr-2"></i>
              Learning Item
            </Button>
            <Button variant="outline" className="flex justify-start items-center h-14">
              <i className="ri-heart-pulse-line text-lg mr-2"></i>
              Habit
            </Button>
            <Button variant="outline" className="flex justify-start items-center h-14">
              <i className="ri-calendar-heart-line text-lg mr-2"></i>
              Date Idea
            </Button>
            <Button variant="outline" className="flex justify-start items-center h-14">
              <i className="ri-user-heart-line text-lg mr-2"></i>
              Parenting Task
            </Button>
            <Button variant="outline" className="flex justify-start items-center h-14">
              <i className="ri-compass-3-line text-lg mr-2"></i>
              Core Value
            </Button>
            <Button variant="outline" className="flex justify-start items-center h-14">
              <i className="ri-star-line text-lg mr-2"></i>
              Future Dream
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingActionButton;
