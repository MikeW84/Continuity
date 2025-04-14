import { useEffect } from "react";
import { Route, useLocation } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType;
};

export const ProtectedRoute = ({ path, component: Component }: ProtectedRouteProps) => {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      setLocation("/auth");
    }
  }, [setLocation]);
  
  // Use Route's children pattern to avoid component prop type issues
  return (
    <Route path={path}>
      {() => <Component />}
    </Route>
  );
};