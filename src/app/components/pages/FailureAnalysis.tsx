import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AlertCircle, TrendingUp, Clock, Zap, Database } from "lucide-react";

const failureReasons = [
  { name: "Timeout Errors", value: 42, color: "#ef4444" },
  { name: "Lock Conflicts", value: 27, color: "#f59e0b" },
  { name: "Worker Crashes", value: 18, color: "#8b5cf6" },
  { name: "Retry Exhausted", value: 8, color: "#06b6d4" },
  { name: "Configuration Error", value: 5, color: "#ec4899" },
];

const failureTrend = [
  { date: "Apr 15", timeout: 12, lock: 8, worker: 5, retry: 2 },
  { date: "Apr 16", timeout: 15, lock: 10, worker: 4, retry: 3 },
  { date: "Apr 17", timeout: 18, lock: 12, worker: 6, retry: 2 },
  { date: "Apr 18", timeout: 22, lock: 15, worker: 7, retry: 4 },
  { date: "Apr 19", timeout: 28, lock: 18, worker: 8, retry: 3 },
  { date: "Apr 20", timeout: 35, lock: 22, worker: 10, retry: 5 },
];

const topFailingJobs = [
  { jobName: "data-sync-prod", failures: 45, primaryReason: "Timeout", lastFailed: "2026-04-20 14:32:15" },
  { jobName: "analytics-aggregator", failures: 28, primaryReason: "Worker Crash", lastFailed: "2026-04-20 12:05:21" },
  { jobName: "email-batch-sender", failures: 18, primaryReason: "Lock Conflict", lastFailed: "2026-04-20 13:18:42" },
  { jobName: "cache-invalidator", failures: 12, primaryReason: "Timeout", lastFailed: "2026-04-19 16:22:10" },
  { jobName: "webhook-delivery", failures: 9, primaryReason: "Retry Exhausted", lastFailed: "2026-04-20 11:42:33" },
];

const mttrMetrics = [
  { metric: "Mean Time to Recovery (MTTR)", value: "8.5 min", trend: "down", change: "-2.1 min" },
  { metric: "Mean Time Between Failures (MTBF)", value: "4.2 hours", trend: "up", change: "+0.8 hours" },
  { metric: "Failure Rate", value: "2.3%", trend: "down", change: "-0.5%" },
  { metric: "Recovery Success Rate", value: "94.2%", trend: "up", change: "+3.1%" },
];

export function FailureAnalysis() {
  const totalFailures = failureReasons.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Failure Analysis & Recovery</h1>
        <p className="text-sm text-gray-500 mt-1">Deep dive into failure patterns and recovery metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {mttrMetrics.map((metric) => (
          <div key={metric.metric} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-600 mb-2">{metric.metric}</div>
            <div className="text-2xl font-semibold text-gray-900">{metric.value}</div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
              <TrendingUp className={`w-4 h-4 ${metric.trend === "down" ? "rotate-180" : ""}`} />
              <span>{metric.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Failure Breakdown</h2>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={failureReasons}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {failureReasons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {failureReasons.map((reason) => (
              <div key={reason.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: reason.color }}></div>
                  <span className="text-gray-700">{reason.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{reason.value}</span>
                  <span className="text-gray-500">({((reason.value / totalFailures) * 100).toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Failure Trend (Last 6 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={failureTrend}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis key="xaxis" dataKey="date" stroke="#6b7280" />
              <YAxis key="yaxis" stroke="#6b7280" />
              <Tooltip key="tooltip" />
              <Legend key="legend" />
              <Bar key="timeout-bar" dataKey="timeout" stackId="a" fill="#ef4444" name="Timeout" />
              <Bar key="lock-bar" dataKey="lock" stackId="a" fill="#f59e0b" name="Lock" />
              <Bar key="worker-bar" dataKey="worker" stackId="a" fill="#8b5cf6" name="Worker" />
              <Bar key="retry-bar" dataKey="retry" stackId="a" fill="#06b6d4" name="Retry" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Failing Jobs</h2>
          <p className="text-sm text-gray-500 mt-1">Jobs with the highest failure count (last 7 days)</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Failure Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Primary Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Failed</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topFailingJobs.map((job, index) => (
                <tr key={job.jobName} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {job.jobName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-600">{job.failures}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                      {job.primaryReason}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.lastFailed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-semibold text-red-900">Timeout Errors</h3>
          </div>
          <p className="text-sm text-red-800">
            Database connections timing out. Consider increasing connection pool size or implementing connection retry with exponential backoff.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-yellow-600" />
            <h3 className="text-sm font-semibold text-yellow-900">Lock Conflicts</h3>
          </div>
          <p className="text-sm text-yellow-800">
            Multiple workers attempting to acquire same lock. Review job scheduling and consider implementing lock queue with priority.
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-semibold text-purple-900">Worker Crashes</h3>
          </div>
          <p className="text-sm text-purple-800">
            Workers crashing due to OOM errors. Monitor memory usage and implement circuit breaker pattern for resource-intensive jobs.
          </p>
        </div>
      </div>
    </div>
  );
}
