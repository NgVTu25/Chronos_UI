import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Activity, AlertCircle, CheckCircle, Clock, Terminal } from "lucide-react";
import { StatusBadge } from "../StatusBadge";
import { Link } from "react-router";

const jobExecutionData = [
  { time: "00:00", success: 45, failed: 3 },
  { time: "04:00", success: 52, failed: 1 },
  { time: "08:00", success: 78, failed: 5 },
  { time: "12:00", success: 91, failed: 2 },
  { time: "16:00", success: 67, failed: 4 },
  { time: "20:00", success: 54, failed: 1 },
];

const recentFailedJobs = [
  { id: "job-1287", name: "data-sync-prod", failedAt: "2026-04-20 14:32:15", error: "Connection timeout to database replica" },
  { id: "job-1245", name: "email-batch-sender", failedAt: "2026-04-20 13:18:42", error: "SMTP server unavailable" },
  { id: "job-1198", name: "analytics-aggregator", failedAt: "2026-04-20 12:05:21", error: "Out of memory error" },
];

const recentExecutions = [
  { id: "exec-9015", jobName: "daily-backup", jobId: "job-1001", startedAt: "2026-04-21 02:00:00", duration: "3m 42s", status: "success", worker: "worker-node-01" },
  { id: "exec-9014", jobName: "email-campaign-sender", jobId: "job-1002", startedAt: "2026-04-20 16:00:00", duration: "1m 15s", status: "success", worker: "worker-node-03" },
  { id: "exec-9013", jobName: "data-sync-prod", jobId: "job-1006", startedAt: "2026-04-20 15:05:00", duration: "2m 08s", status: "running", worker: "worker-node-05" },
  { id: "exec-9012", jobName: "data-sync-prod", jobId: "job-1006", startedAt: "2026-04-20 14:30:00", duration: "2m 15s", status: "failed", worker: "worker-node-05" },
  { id: "exec-9011", jobName: "cache-invalidator", jobId: "job-1004", startedAt: "2026-04-20 14:00:00", duration: "45s", status: "success", worker: "worker-node-04" },
  { id: "exec-9010", jobName: "analytics-aggregator", jobId: "job-1003", startedAt: "2026-04-20 12:05:21", duration: "1m 52s", status: "failed", worker: "worker-node-02" },
];

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor system health and job execution metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Jobs"
          value="1,247"
          change="+12%"
          trend="up"
          icon={Activity}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <MetricCard
          title="Running Jobs"
          value="42"
          change="+8"
          trend="up"
          icon={Clock}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <MetricCard
          title="Failed Jobs"
          value="7"
          change="-3"
          trend="down"
          icon={AlertCircle}
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
        <MetricCard
          title="Queued Jobs"
          value="128"
          change="+5%"
          trend="up"
          icon={CheckCircle}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-100"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Worker Nodes Active"
          value="24 / 30"
          subtitle="80% capacity"
          icon={Activity}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <MetricCard
          title="Total Retry Count"
          value="156"
          subtitle="Last 24 hours"
          icon={AlertCircle}
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
        />
        <MetricCard
          title="Pending Queue Depth"
          value="1,204"
          subtitle="Awaiting execution"
          icon={Clock}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <MetricCard
          title="Scheduler Latency"
          value="23ms"
          subtitle="Avg scheduling time"
          icon={Activity}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Executions Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={jobExecutionData}>
            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis key="xaxis" dataKey="time" stroke="#6b7280" />
            <YAxis key="yaxis" stroke="#6b7280" />
            <Tooltip key="tooltip" />
            <Line key="success-line" type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} name="Successful" />
            <Line key="failed-line" type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Failed" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Executions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Execution ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started At</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentExecutions.map((exec) => (
                <tr key={exec.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-500">
                    {exec.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link to={`/jobs/${exec.jobId}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                      {exec.jobName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {exec.startedAt}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {exec.duration}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={exec.status as any} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-500">
                    {exec.worker}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View Logs">
                      <Terminal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Failed Jobs</h2>
          <Link to="/retry-queue" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All →
          </Link>
        </div>
        <div className="space-y-3">
          {recentFailedJobs.map((job) => (
            <div key={job.id} className="flex items-start gap-4 p-4 bg-red-50 border border-red-100 rounded-lg">
              <div className="flex-shrink-0 mt-1">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link to={`/jobs/${job.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                    {job.name}
                  </Link>
                  <span className="text-xs text-gray-500">#{job.id}</span>
                </div>
                <p className="text-sm text-red-700 mt-1">{job.error}</p>
                <p className="text-xs text-gray-500 mt-1">{job.failedAt}</p>
              </div>
              <StatusBadge status="failed" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}

function MetricCard({ title, value, change, trend, subtitle, icon: Icon, iconColor, iconBg }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {change}
              </span>
              <span className="text-xs text-gray-500">vs last week</span>
            </div>
          )}
          {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
