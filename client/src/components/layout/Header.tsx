import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header = ({ title, subtitle }: HeaderProps) => {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [, navigate] = useLocation();
  
  const getPageTitle = () => {
    switch (title) {
      case "dashboard":
        return "Dashboard";
      case "projects":
        return "Projects";
      case "ideas":
        return "Ideas";
      case "learning":
        return "Learning";
      case "health-habits":
        return "Health & Habits";
      case "family":
        return "Family";
      case "values":
        return "Values & Dreams";
      default:
        return "Dashboard";
    }
  }
  
  const getPageSubtitle = () => {
    if (subtitle) return subtitle;
    
    switch (title) {
      case "dashboard":
        return "Your life at a glance";
      case "projects":
        return "Manage your important initiatives";
      case "ideas":
        return "Capture and vote on your ideas";
      case "learning":
        return "Track current and future learning";
      case "health-habits":
        return "Monitor your health and daily habits";
      case "family":
        return "Family planning and parenting";
      case "values":
        return "Align your actions with your values";
      default:
        return "Your life at a glance";
    }
  }

  return (
    <header className="bg-white sticky top-0 z-5 p-6 flex items-center justify-between border-b border-gray-200">
      <div>
        <h1 className="text-2xl font-inter font-bold text-primary">{getPageTitle()}</h1>
        <p className="text-sm text-secondary mt-1">{getPageSubtitle()}</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <i className="ri-notification-3-line text-secondary text-xl"></i>
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <i className="ri-search-line text-secondary text-xl"></i>
        </button>
        <Button 
          className="hidden md:flex items-center bg-accent hover:bg-opacity-90 text-white" 
          onClick={() => setIsAddMenuOpen(true)}
        >
          <i className="ri-add-line mr-1"></i>
          New Item
        </Button>
        <Button 
          className="md:hidden p-2 rounded-full bg-accent text-white h-10 w-10 px-0"
          onClick={() => setIsAddMenuOpen(true)}
        >
          <i className="ri-add-line"></i>
        </Button>
      </div>
      
      <Dialog open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button 
              variant="outline" 
              className="flex justify-start items-center h-14"
              onClick={() => {
                setIsAddMenuOpen(false);
                sessionStorage.setItem('openAddDialog', 'true');
                navigate('/projects');
              }}
            >
              <i className="ri-task-line text-lg mr-2"></i>
              Project
            </Button>
            <Button 
              variant="outline" 
              className="flex justify-start items-center h-14"
              onClick={() => {
                setIsAddMenuOpen(false);
                sessionStorage.setItem('openAddDialog', 'true');
                navigate('/ideas');
              }}
            >
              <i className="ri-lightbulb-line text-lg mr-2"></i>
              Idea
            </Button>
            <Button 
              variant="outline" 
              className="flex justify-start items-center h-14"
              onClick={() => {
                setIsAddMenuOpen(false);
                sessionStorage.setItem('openAddDialog', 'true');
                navigate('/learning');
              }}
            >
              <i className="ri-book-open-line text-lg mr-2"></i>
              Learning Item
            </Button>
            <Button 
              variant="outline" 
              className="flex justify-start items-center h-14"
              onClick={() => {
                setIsAddMenuOpen(false);
                sessionStorage.setItem('openAddDialog', 'true');
                sessionStorage.setItem('addItemType', 'habit');
                navigate('/health-habits');
              }}
            >
              <i className="ri-heart-pulse-line text-lg mr-2"></i>
              Habit
            </Button>
            <Button 
              variant="outline" 
              className="flex justify-start items-center h-14"
              onClick={() => {
                setIsAddMenuOpen(false);
                sessionStorage.setItem('openAddDialog', 'true');
                sessionStorage.setItem('addItemType', 'dateIdea');
                navigate('/family');
              }}
            >
              <i className="ri-calendar-heart-line text-lg mr-2"></i>
              Date Idea
            </Button>
            <Button 
              variant="outline" 
              className="flex justify-start items-center h-14"
              onClick={() => {
                setIsAddMenuOpen(false);
                sessionStorage.setItem('openAddDialog', 'true');
                sessionStorage.setItem('addItemType', 'parentingTask');
                navigate('/family');
              }}
            >
              <i className="ri-user-heart-line text-lg mr-2"></i>
              Parenting Task
            </Button>
            <Button 
              variant="outline" 
              className="flex justify-start items-center h-14"
              onClick={() => {
                setIsAddMenuOpen(false);
                sessionStorage.setItem('openAddDialog', 'true');
                sessionStorage.setItem('addItemType', 'value');
                navigate('/values');
              }}
            >
              <i className="ri-compass-3-line text-lg mr-2"></i>
              Core Value
            </Button>
            <Button 
              variant="outline" 
              className="flex justify-start items-center h-14"
              onClick={() => {
                setIsAddMenuOpen(false);
                sessionStorage.setItem('openAddDialog', 'true');
                sessionStorage.setItem('addItemType', 'dream');
                navigate('/values');
              }}
            >
              <i className="ri-star-line text-lg mr-2"></i>
              Future Dream
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
