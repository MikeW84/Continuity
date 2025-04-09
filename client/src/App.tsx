import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import DashboardPage from "@/pages/DashboardPage";
import ProjectsPage from "@/pages/ProjectsPage";
import IdeasPage from "@/pages/IdeasPage";
import LearningPage from "@/pages/LearningPage";
import HealthHabitsPage from "@/pages/HealthHabitsPage";
import FamilyPage from "@/pages/FamilyPage";
import ValuesPage from "@/pages/ValuesPage";
import { AppProvider } from "./context/AppContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/ideas" component={IdeasPage} />
      <Route path="/learning" component={LearningPage} />
      <Route path="/health-habits" component={HealthHabitsPage} />
      <Route path="/family" component={FamilyPage} />
      <Route path="/values" component={ValuesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Layout>
          <Router />
        </Layout>
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
