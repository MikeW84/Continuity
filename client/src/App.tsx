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
import HabitsPage from "@/pages/HabitsPage";
import ExercisePage from "@/pages/ExercisePage";
import FamilyPage from "@/pages/FamilyPage";
import ValuesPage from "@/pages/ValuesPage";
import AuthPage from "@/pages/AuthPage";
import { AppProvider } from "./context/AppContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <Route>
            <Layout>
              <Switch>
                <ProtectedRoute path="/" component={DashboardPage} />
                <ProtectedRoute path="/projects" component={ProjectsPage} />
                <ProtectedRoute path="/ideas" component={IdeasPage} />
                <ProtectedRoute path="/learning" component={LearningPage} />
                <ProtectedRoute path="/health-habits" component={HealthHabitsPage} />
                <ProtectedRoute path="/habits" component={HabitsPage} />
                <ProtectedRoute path="/exercise" component={ExercisePage} />
                <ProtectedRoute path="/family" component={FamilyPage} />
                <ProtectedRoute path="/values" component={ValuesPage} />
                <Route component={NotFound} />
              </Switch>
            </Layout>
          </Route>
        </Switch>
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
