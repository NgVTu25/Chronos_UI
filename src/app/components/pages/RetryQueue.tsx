import { RotateCw, AlertCircle, Trash2, Play } from "lucide-react";
import { Link } from "react-router";
import { StatusBadge } from "../StatusBadge";

interface FailedJob {
  id: string;
  jobName: string;
  failedAt: string;
  retryAttempt: number;
  maxRetries: number;
  nextRetry: string | null;
  error: string;
  queue: "retry" | "dead-letter";
}

const mockFailedJobs: FailedJob[] = [
  {
    id: "job-1287",
    jobName: "data-sync-prod",
    failedAt: "2026-04-20 14:32:15",
    retryAttempt: 3,
    maxRetries: 5,
    nextRetry: "2026-04-20 14:35:15",
    error: "Connection timeout to database replica",
    queue: "retry",
  },
  {
    id: "job-1245",
    jobName: "email-batch-sender",
    failedAt: "2026-04-20 13:18:42",
    retryAttempt: 2,
    maxRetries: 5,
    nextRetry: "2026-04-20 15:18:42",
    error: "SMTP server unavailable",
    queue: "retry",
  },
  {
    id: "job-1198",
    jobName: "analytics-aggregator",
    failedAt: "2026-04-20 12:05:21",
    retryAttempt: 5,
    maxRetries: 5,
    nextRetry: null,
    error: "Out of memory error",
    queue: "dead-letter",
  },
  {
    id: "job-1156",
    jobName: "webhook-delivery",
    failedAt: "2026-04-20 11:42:33",
    retryAttempt: 1,
    maxRetries: 3,
    nextRetry: "2026-04-20 14:42:33",
    error: "HTTP 503 Service Unavailable",
    queue: "retry",
  },
  {
    id: "job-1089",
    jobName: "report-generator",
    failedAt: "2026-04-20 09:15:28",
    retryAttempt: 3,
    maxRetries: 3,
    nextRetry: null,
    error: "Template rendering failed: missing variable 'total_revenue'",
    queue: "dead-letter",
  },
];

export function RetryQueue() {
  const retryQueueJobs = mockFailedJobs.filter((job) => job.queue === "retry");
  const deadLetterJobs = mockFailedJobs.filter((job) => job.queue === "dead-letter");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Retry Queue & Dead Letter Queue</h1>
        <p className="text-sm text-gray-500 mt-1">Manage failed jobs and retry attempts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <RotateCw className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Jobs in Retry Queue</div>
              <div className="text-2xl font-semibold text-gray-900">{retryQueueJobs.length}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Jobs in Dead Letter Queue</div>
              <div className="text-2xl font-semibold text-gray-900">{deadLetterJobs.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-yellow-50">
          <div className="flex items-center gap-2">
            <RotateCw className="w-5 h-5 text-yellow-600" />
            <h2 className="text-lg font-semibold text-gray-900">Retry Queue</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Jobs waiting for automatic retry</p>
        </div>

        {retryQueueJobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No jobs in retry queue</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {retryQueueJobs.map((job) => (
              <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {job.jobName}
                      </Link>
                      <span className="text-sm text-gray-500">#{job.id}</span>
                      <div className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                        Retry {job.retryAttempt}/{job.maxRetries}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm mb-3">
                      <div className="text-gray-600">
                        <span className="font-medium">Failed at:</span> {job.failedAt}
                      </div>
                      {job.nextRetry && (
                        <div className="text-gray-600">
                          <span className="font-medium">Next retry:</span> {job.nextRetry}
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700">{job.error}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      title="Retry Now"
                    >
                      <Play className="w-4 h-4" />
                      Retry Now
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from Queue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-red-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Dead Letter Queue</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Jobs that exceeded maximum retry attempts</p>
        </div>

        {deadLetterJobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No jobs in dead letter queue</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {deadLetterJobs.map((job) => (
              <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {job.jobName}
                      </Link>
                      <span className="text-sm text-gray-500">#{job.id}</span>
                      <StatusBadge status="failed" />
                      <div className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                        Max retries exceeded
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm mb-3">
                      <div className="text-gray-600">
                        <span className="font-medium">Failed at:</span> {job.failedAt}
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">Attempts:</span> {job.retryAttempt}/{job.maxRetries}
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700">{job.error}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      title="Manual Retry"
                    >
                      <RotateCw className="w-4 h-4" />
                      Manual Retry
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
