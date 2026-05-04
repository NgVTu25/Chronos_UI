import { useParams, Link } from "react-router";
import { ArrowLeft, Play, Edit, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, User, Settings } from "lucide-react";
import { StatusBadge } from "../StatusBadge";

const executionHistory = [
  { id: "exec-9012", startTime: "2026-04-20 14:30:00", endTime: "2026-04-20 14:32:15", status: "failed", duration: "2m 15s", attempt: 3 },
  { id: "exec-9011", startTime: "2026-04-20 14:27:00", endTime: "2026-04-20 14:29:12", status: "failed", duration: "2m 12s", attempt: 2 },
  { id: "exec-9010", startTime: "2026-04-20 14:24:00", endTime: "2026-04-20 14:26:05", status: "failed", duration: "2m 05s", attempt: 1 },
  { id: "exec-9009", startTime: "2026-04-20 14:19:00", endTime: "2026-04-20 14:19:48", status: "success", duration: "48s", attempt: 1 },
  { id: "exec-9008", startTime: "2026-04-20 14:14:00", endTime: "2026-04-20 14:14:52", status: "success", duration: "52s", attempt: 1 },
];

const executionLogs = [
  { timestamp: "2026-04-20 14:30:00.125", level: "INFO", message: "Job execution started" },
  { timestamp: "2026-04-20 14:30:01.342", level: "INFO", message: "Connecting to database replica at db-replica-02.internal:5432" },
  { timestamp: "2026-04-20 14:30:05.678", level: "WARN", message: "Connection attempt 1 failed: timeout after 5s" },
  { timestamp: "2026-04-20 14:30:10.891", level: "WARN", message: "Connection attempt 2 failed: timeout after 5s" },
  { timestamp: "2026-04-20 14:30:16.234", level: "ERROR", message: "Connection attempt 3 failed: timeout after 5s" },
  { timestamp: "2026-04-20 14:30:16.567", level: "ERROR", message: "Max connection attempts reached. Aborting job execution." },
  { timestamp: "2026-04-20 14:32:15.789", level: "ERROR", message: "Job execution failed with error: Connection timeout to database replica" },
];

const statusTransitions = [
  { status: "Pending", timestamp: "2026-04-20 14:29:55", icon: Clock, color: "text-gray-600" },
  { status: "Running", timestamp: "2026-04-20 14:30:00", icon: Play, color: "text-blue-600" },
  { status: "Failed", timestamp: "2026-04-20 14:32:15", icon: XCircle, color: "text-red-600" },
];

const auditTimeline = [
  { event: "Job Created", timestamp: "2026-04-15 10:30:00", user: "admin@company.com", icon: Settings },
  { event: "Job Configuration Updated", timestamp: "2026-04-16 14:22:15", user: "admin@company.com", icon: Edit },
  { event: "Job Paused", timestamp: "2026-04-18 09:15:30", user: "ops@company.com", icon: AlertTriangle },
  { event: "Job Resumed", timestamp: "2026-04-18 11:45:00", user: "ops@company.com", icon: Play },
  { event: "Retry Policy Updated", timestamp: "2026-04-19 16:20:10", user: "admin@company.com", icon: Settings },
  { event: "Manual Execution Triggered", timestamp: "2026-04-20 08:00:00", user: "ops@company.com", icon: Play },
];

export function JobDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/jobs" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">data-sync-prod</h1>
            <StatusBadge status="failed" />
          </div>
          <p className="text-sm text-gray-500 mt-1">Job ID: {id}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Play className="w-4 h-4" />
            Run Now
          </button>
          <Link
            to={`/jobs/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Cron Schedule</div>
          <div className="text-lg font-semibold text-gray-900 mt-1 font-mono">*/5 * * * *</div>
          <div className="text-xs text-gray-500 mt-1">Every 5 minutes</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Next Scheduled Run</div>
          <div className="text-lg font-semibold text-gray-900 mt-1">2026-04-20 15:35:00</div>
          <div className="text-xs text-gray-500 mt-1">In 5 minutes</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Assigned Worker</div>
          <div className="text-lg font-semibold text-gray-900 mt-1 font-mono">worker-node-05</div>
          <div className="text-xs text-green-600 mt-1">● Active</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Execution Timeline</h2>
        <div className="space-y-4">
          {statusTransitions.map((transition, index) => {
            const Icon = transition.icon;
            const isLast = index === statusTransitions.length - 1;

            return (
              <div key={index} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-full bg-gray-100 ${transition.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {!isLast && <div className="w-0.5 h-12 bg-gray-200 my-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="font-medium text-gray-900">{transition.status}</div>
                  <div className="text-sm text-gray-500">{transition.timestamp}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Execution Logs</h2>
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          {executionLogs.map((log, index) => (
            <div
              key={index}
              className={`mb-1 ${
                log.level === "ERROR"
                  ? "text-red-400"
                  : log.level === "WARN"
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
            >
              <span className="text-gray-500">[{log.timestamp}]</span>{" "}
              <span className="font-semibold">{log.level}</span> {log.message}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Execution History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Execution ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {executionHistory.map((execution) => (
                <tr key={execution.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {execution.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {execution.startTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {execution.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {execution.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {execution.attempt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={execution.status as any} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Retry Policy</div>
            <div className="text-sm font-medium text-gray-900 mt-1">5 attempts, 3m delay</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Timeout</div>
            <div className="text-sm font-medium text-gray-900 mt-1">300 seconds</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Execution Type</div>
            <div className="text-sm font-medium text-gray-900 mt-1">HTTP Request</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Worker Queue</div>
            <div className="text-sm font-medium text-gray-900 mt-1 font-mono">default</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Timeline</h2>
        <div className="space-y-4">
          {auditTimeline.map((entry, index) => {
            const Icon = entry.icon;
            const isLast = index === auditTimeline.length - 1;

            return (
              <div key={index} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                    <Icon className="w-4 h-4" />
                  </div>
                  {!isLast && <div className="w-0.5 h-12 bg-gray-200 my-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="font-medium text-gray-900">{entry.event}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <User className="w-3 h-3" />
                    <span>{entry.user}</span>
                    <span>•</span>
                    <span>{entry.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
