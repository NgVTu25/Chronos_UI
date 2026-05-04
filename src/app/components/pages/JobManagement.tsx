import { Link } from "react-router";
import { Plus, Play, Pause, Edit, Trash2, Filter, RotateCw, Square, Terminal } from "lucide-react";
import { StatusBadge, JobStatus } from "../StatusBadge";
import { useState } from "react";

interface Job {
  id: string;
  name: string;
  cronExpression: string;
  nextRun: string;
  status: JobStatus;
  retryPolicy: string;
  assignedWorker: string;
}

const mockJobs: Job[] = [
  {
    id: "job-1001",
    name: "daily-backup",
    cronExpression: "0 2 * * *",
    nextRun: "2026-04-21 02:00:00",
    status: "success",
    retryPolicy: "3 attempts, 5m delay",
    assignedWorker: "worker-node-01",
  },
  {
    id: "job-1002",
    name: "email-campaign-sender",
    cronExpression: "0 */4 * * *",
    nextRun: "2026-04-20 16:00:00",
    status: "running",
    retryPolicy: "5 attempts, 2m delay",
    assignedWorker: "worker-node-03",
  },
  {
    id: "job-1003",
    name: "analytics-aggregator",
    cronExpression: "*/15 * * * *",
    nextRun: "2026-04-20 15:15:00",
    status: "failed",
    retryPolicy: "3 attempts, 1m delay",
    assignedWorker: "worker-node-02",
  },
  {
    id: "job-1004",
    name: "cache-invalidator",
    cronExpression: "0 * * * *",
    nextRun: "2026-04-20 16:00:00",
    status: "queued",
    retryPolicy: "2 attempts, 30s delay",
    assignedWorker: "worker-node-04",
  },
  {
    id: "job-1005",
    name: "report-generator",
    cronExpression: "0 9 * * 1",
    nextRun: "2026-04-21 09:00:00",
    status: "paused",
    retryPolicy: "3 attempts, 10m delay",
    assignedWorker: "worker-node-01",
  },
  {
    id: "job-1006",
    name: "data-sync-prod",
    cronExpression: "*/5 * * * *",
    nextRun: "2026-04-20 15:10:00",
    status: "running",
    retryPolicy: "5 attempts, 3m delay",
    assignedWorker: "worker-node-05",
  },
];

export function JobManagement() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredJobs = statusFilter === "all"
    ? mockJobs
    : mockJobs.filter(job => job.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Job Management</h1>
          <p className="text-sm text-gray-500 mt-1">Schedule, monitor, and manage distributed jobs</p>
        </div>
        <Link
          to="/jobs/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Job
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Jobs</option>
            <option value="running">Running</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="queued">Queued</option>
            <option value="paused">Paused</option>
          </select>
          <div className="ml-auto text-sm text-gray-500">
            Showing {filteredJobs.length} of {mockJobs.length} jobs
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cron Expression
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Retry Policy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Worker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {job.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/jobs/${job.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                      {job.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                      {job.cronExpression}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.nextRun}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.retryPolicy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {job.assignedWorker}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1">
                      {job.status === "running" ? (
                        <button
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Kill Job"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Run Now"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {job.status === "paused" ? (
                        <button
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Resume"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                          title="Pause"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      {job.status === "failed" && (
                        <button
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="Retry Failed"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                      )}
                      <Link
                        to={`/jobs/${job.id}`}
                        className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        title="View Logs"
                      >
                        <Terminal className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/jobs/${job.id}/edit`}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
