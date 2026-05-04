import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, Briefcase, Users, RotateCw, Workflow, Search, LogOut, Bell, AlertTriangle, Terminal, Activity, XCircle, ShieldCheck, Settings } from "lucide-react";
import { useState } from "react";

const alerts = [
  { id: 1, type: "warning", message: "Worker-03 unhealthy - high CPU usage" },
  { id: 2, type: "error", message: "7 jobs in dead letter queue" },
  { id: 3, type: "warning", message: "Retry queue backlog growing" },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAlerts, setShowAlerts] = useState(false);

  const handleLogout = () => {
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "Overview", icon: LayoutDashboard },
    { path: "/jobs", label: "Jobs", icon: Briefcase },
    { path: "/workers", label: "Workers", icon: Users },
    { path: "/system-health", label: "System Health", icon: Activity },
    { path: "/failure-analysis", label: "Failure Analysis", icon: XCircle },
    { path: "/retry-queue", label: "Retry Queue", icon: RotateCw },
    { path: "/dag", label: "DAG Workflows", icon: Workflow },
    { path: "/logs", label: "System Logs", icon: Terminal },
    { path: "/users", label: "User Management", icon: ShieldCheck },
    { path: "/alert-settings", label: "Alert Settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Job Scheduler</h1>
          <p className="text-sm text-gray-500 mt-1">Distributed Task Manager</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <div>API v2.1.0</div>
            <div className="mt-1">Cluster: production-us-east</div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs, workers, or executions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowAlerts(!showAlerts)}
                  className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {alerts.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {showAlerts && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">System Alerts</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <AlertTriangle
                              className={`w-5 h-5 mt-0.5 ${
                                alert.type === "error" ? "text-red-600" : "text-yellow-600"
                              }`}
                            />
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{alert.message}</p>
                              <p className="text-xs text-gray-500 mt-1">Just now</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-200">
                      <Link to="/alert-settings" onClick={() => setShowAlerts(false)} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Configure alert rules →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-600">
                <span className="font-medium">admin@company.com</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}