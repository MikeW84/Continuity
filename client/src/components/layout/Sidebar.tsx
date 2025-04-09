import { Link, useLocation } from "wouter";
import { useAppContext } from "@/context/AppContext";

const Sidebar = () => {
  const [location] = useLocation();
  const { user } = useAppContext();
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: "ri-dashboard-line" },
    { path: "/projects", label: "Projects", icon: "ri-task-line" },
    { path: "/ideas", label: "Ideas", icon: "ri-lightbulb-line" },
    { path: "/learning", label: "Learning", icon: "ri-book-open-line" },
    { path: "/health-habits", label: "Health & Habits", icon: "ri-heart-pulse-line" },
    { path: "/family", label: "Family", icon: "ri-user-heart-line" },
    { path: "/values", label: "Values & Dreams", icon: "ri-compass-3-line" },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 bg-primary text-white flex flex-col z-10">
      <div className="p-4 md:p-6 flex items-center justify-center md:justify-start">
        <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center md:mr-3">
          <span className="font-inter font-bold text-primary">LM</span>
        </div>
        <h1 className="hidden md:block font-inter font-bold text-xl">Life Manager</h1>
      </div>
      
      <nav className="mt-8 flex-1">
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className="mb-2">
              <Link href={item.path}>
                <a className={`flex items-center p-4 text-white ${
                  location === item.path 
                    ? "bg-secondary bg-opacity-30 border-l-4 border-accent" 
                    : "hover:bg-secondary hover:bg-opacity-20 transition-colors"
                }`}>
                  <i className={`${item.icon} text-xl md:mr-3`}></i>
                  <span className="hidden md:block">{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 md:p-6">
        <div className="hidden md:flex items-center">
          <div className="h-8 w-8 rounded-full bg-accent mr-2">
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white">
              {user?.displayName?.charAt(0) || "U"}
            </div>
          </div>
          <span className="text-sm font-medium">{user?.displayName || "User"}</span>
        </div>
        <button className="md:hidden mx-auto flex items-center justify-center h-10 w-10 rounded hover:bg-secondary transition-colors">
          <i className="ri-user-line text-xl"></i>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
