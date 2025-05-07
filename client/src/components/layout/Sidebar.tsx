import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAppContext } from "@/context/AppContext";
import { subscribeToEvents, AppEvent, SectionVisibility } from "@/lib/events";

const Sidebar = () => {
  const [location] = useLocation();
  const { user } = useAppContext();
  const [visibleSections, setVisibleSections] = useState<SectionVisibility>({
    dashboard: true,
    today: true,
    projects: true,
    ideas: true,
    learning: true,
    habits: true,
    exercise: true,
    family: true,
    values: true
  });
  
  // Load visibility settings from localStorage and listen for settings changes
  useEffect(() => {
    // Load initial settings from localStorage
    const savedSettings = localStorage.getItem('visibilitySettings');
    if (savedSettings) {
      setVisibleSections(JSON.parse(savedSettings));
    }
    
    // Subscribe to visibility settings change events
    const unsubscribe = subscribeToEvents((event: AppEvent) => {
      if (event.type === 'VISIBILITY_SETTINGS_CHANGED') {
        setVisibleSections(event.settings as SectionVisibility);
      }
    });
    
    // Cleanup subscription when component unmounts
    return () => unsubscribe();
  }, []);
  
  // Define all navigation items
  const allNavItems = [
    { path: "/", label: "Dashboard", icon: "ri-dashboard-line", key: "dashboard" },
    { path: "/today", label: "Today", icon: "ri-calendar-todo-line", key: "today" },
    { path: "/projects", label: "Projects", icon: "ri-task-line", key: "projects" },
    { path: "/ideas", label: "Ideas", icon: "ri-lightbulb-line", key: "ideas" },
    { path: "/learning", label: "Learning", icon: "ri-book-open-line", key: "learning" },
    { path: "/habits", label: "Habits", icon: "ri-calendar-check-line", key: "habits" },
    { path: "/exercise", label: "Exercise", icon: "ri-run-line", key: "exercise" },
    { path: "/family", label: "Family", icon: "ri-user-heart-line", key: "family" },
    { path: "/values", label: "Values & Dreams", icon: "ri-compass-3-line", key: "values" },
    { path: "/settings", label: "Settings", icon: "ri-settings-line", key: "settings" },
  ];
  
  // Filter out sections that should be hidden
  const navItems = allNavItems.filter(item => {
    // Settings is always visible, can't be turned off
    if (item.key === "settings") return true;
    return visibleSections[item.key as keyof typeof visibleSections];
  });

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 bg-primary text-white flex flex-col z-10">
      <div className="p-4 md:p-6 flex items-center justify-center md:justify-start">
        <div className="h-10 w-10 flex items-center justify-center md:mr-3 text-white">
          <i className="ri-arrow-right-line text-2xl"></i>
        </div>
        <h1 className="hidden md:block font-inter font-bold text-xl">Continuity</h1>
      </div>
      
      <nav className="mt-8 flex-1">
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className="mb-2">
              <Link href={item.path}>
                <div className={`flex items-center p-4 text-white ${
                  location === item.path 
                    ? "bg-secondary bg-opacity-30 border-l-4 border-accent" 
                    : "hover:bg-secondary hover:bg-opacity-20 transition-colors"
                }`}>
                  <i className={`${item.icon} text-xl md:mr-3`}></i>
                  <span className="hidden md:block">{item.label}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      
    </aside>
  );
};

export default Sidebar;
