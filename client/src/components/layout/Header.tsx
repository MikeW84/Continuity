import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header = ({ title, subtitle }: HeaderProps) => {
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
      case "today":
        return "Today's Tasks";
      case "habits":
        return "Habits";
      case "exercise":
        return "Exercise";
      case "health-habits":
        return "Health & Habits"; // Legacy - keeping for backward compatibility
      case "family":
        return "Family";
      case "values":
        return "Values & Dreams";
      case "settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  }
  
  const getPageSubtitle = () => {
    if (subtitle) return subtitle;
    
    switch (title) {
      case "dashboard":
        return "Build and Keep Momentum";
      case "projects":
        return "Prioritize and focus";
      case "ideas":
        return "Capture and revisit good ideas";
      case "learning":
        return "Learn things that will make a difference";
      case "today":
        return "Decide, commit and accomplish.";
      case "habits":
        return "Be consistent and make progress";
      case "exercise":
        return "Track your fitness and progress";
      case "health-habits":
        return "Make good choices every day"; // Legacy - keeping for backward compatibility
      case "family":
        return "Stay Connected with those who matter the most";
      case "values":
        return "Begin with the end in mind";
      case "settings":
        return "Customize your experience";
      default:
        return "Build and Keep Momentum";
    }
  }

  return (
    <header className="bg-white dark:bg-[#1A1A1A] sticky top-0 z-5 p-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
      <div>
        <h1 className="text-2xl font-inter font-bold text-primary dark:text-white">{getPageTitle()}</h1>
        <p className="text-sm text-secondary dark:text-gray-300 mt-1">{getPageSubtitle()}</p>
      </div>
      
      <div className="flex items-center">
        <Button 
          variant="outline"
          onClick={() => {
            localStorage.removeItem("isAuthenticated");
            navigate("/auth");
          }}
        >
          <i className="ri-logout-box-line mr-1"></i>
          <span className="hidden md:inline">Logout</span>
        </Button>
      </div>
      

    </header>
  );
};

export default Header;
