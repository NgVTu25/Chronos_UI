import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { DashboardOverview } from "./components/pages/DashboardOverview";
import { JobManagement } from "./components/pages/JobManagement";
import { JobForm } from "./components/pages/JobForm";
import { JobDetail } from "./components/pages/JobDetail";
import { WorkerManagement } from "./components/pages/WorkerManagement";
import { RetryQueue } from "./components/pages/RetryQueue";
import { DAGWorkflow } from "./components/pages/DAGWorkflow";
import { Login } from "./components/pages/Login";
import { Register } from "./components/pages/Register";
import { LogsViewer } from "./components/pages/LogsViewer";
import { SystemHealth } from "./components/pages/SystemHealth";
import { FailureAnalysis } from "./components/pages/FailureAnalysis";
import { UserManagement } from "./components/pages/UserManagement";
import { AlertSettings } from "./components/pages/AlertSettings";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: DashboardOverview },
      { path: "jobs", Component: JobManagement },
      { path: "jobs/new", Component: JobForm },
      { path: "jobs/:id/edit", Component: JobForm },
      { path: "jobs/:id", Component: JobDetail },
      { path: "workers", Component: WorkerManagement },
      { path: "retry-queue", Component: RetryQueue },
      { path: "dag", Component: DAGWorkflow },
      { path: "logs", Component: LogsViewer },
      { path: "system-health", Component: SystemHealth },
      { path: "failure-analysis", Component: FailureAnalysis },
      { path: "users", Component: UserManagement },
      { path: "alert-settings", Component: AlertSettings },
    ],
  },
]);