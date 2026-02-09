import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/lib/data";
import { ThemeProvider } from "@/lib/theme-context";

import Dashboard from "@/pages/dashboard";
import ExtendedDashboard from "@/pages/extended-dashboard";
import HabitsPage from "@/pages/habits";
import TasksPage from "@/pages/tasks";
import PlannerPage from "@/pages/planner";
import FocusPage from "@/pages/focus";
import GoalsPage from "@/pages/goals";
import AnalysisPage from "@/pages/analysis";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/overview" component={ExtendedDashboard} />
      <Route path="/focus" component={FocusPage} />
      <Route path="/goals" component={GoalsPage} />
      <Route path="/habits" component={HabitsPage} />
      <Route path="/tasks" component={TasksPage} />
      <Route path="/planner" component={PlannerPage} />
      <Route path="/analysis" component={AnalysisPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppProvider>
          <Router />
          <Toaster />
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
