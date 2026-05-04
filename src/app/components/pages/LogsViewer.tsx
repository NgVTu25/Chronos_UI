import { useState, useMemo } from "react";
import { Search, Download, Filter, RefreshCw, X, Hash, Server } from "lucide-react";

interface LogEntry {
  id: number;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  source: string;
  workerId: string;
  executionId: string;
  message: string;
}

const mockLogs: LogEntry[] = [
  { id: 1,  timestamp: "2026-04-21 14:32:15.125", level: "INFO",  source: "job-scheduler",  workerId: "scheduler",      executionId: "exec-9015", message: "Job execution started: data-sync-prod (exec-9015)" },
  { id: 2,  timestamp: "2026-04-21 14:32:16.342", level: "INFO",  source: "worker-node-05", workerId: "worker-node-05", executionId: "exec-9015", message: "Connecting to database replica at db-replica-02.internal:5432" },
  { id: 3,  timestamp: "2026-04-21 14:32:21.678", level: "WARN",  source: "worker-node-05", workerId: "worker-node-05", executionId: "exec-9015", message: "Connection attempt 1 failed: timeout after 5s" },
  { id: 4,  timestamp: "2026-04-21 14:32:26.891", level: "WARN",  source: "worker-node-05", workerId: "worker-node-05", executionId: "exec-9015", message: "Connection attempt 2 failed: timeout after 5s" },
  { id: 5,  timestamp: "2026-04-21 14:32:32.234", level: "ERROR", source: "worker-node-05", workerId: "worker-node-05", executionId: "exec-9015", message: "Connection attempt 3 failed: timeout after 5s" },
  { id: 6,  timestamp: "2026-04-21 14:32:32.567", level: "ERROR", source: "worker-node-05", workerId: "worker-node-05", executionId: "exec-9015", message: "Max connection attempts reached. Aborting job execution." },
  { id: 7,  timestamp: "2026-04-21 14:32:35.789", level: "ERROR", source: "job-scheduler",  workerId: "scheduler",      executionId: "exec-9015", message: "Job execution failed: data-sync-prod (exec-9015)" },
  { id: 8,  timestamp: "2026-04-21 14:30:00.125", level: "INFO",  source: "job-scheduler",  workerId: "scheduler",      executionId: "exec-9014", message: "Job execution started: email-campaign-sender (exec-9014)" },
  { id: 9,  timestamp: "2026-04-21 14:30:01.245", level: "INFO",  source: "worker-node-03", workerId: "worker-node-03", executionId: "exec-9014", message: "Processing email batch: 1500 recipients" },
  { id: 10, timestamp: "2026-04-21 14:30:45.567", level: "INFO",  source: "worker-node-03", workerId: "worker-node-03", executionId: "exec-9014", message: "Email batch sent successfully" },
  { id: 11, timestamp: "2026-04-21 14:30:46.123", level: "INFO",  source: "job-scheduler",  workerId: "scheduler",      executionId: "exec-9014", message: "Job execution completed: email-campaign-sender (exec-9014)" },
  { id: 12, timestamp: "2026-04-21 14:28:00.000", level: "WARN",  source: "worker-node-03", workerId: "worker-node-03", executionId: "exec-9013", message: "High CPU usage detected: 92%" },
  { id: 13, timestamp: "2026-04-21 14:25:30.456", level: "DEBUG", source: "job-scheduler",  workerId: "scheduler",      executionId: "exec-9013", message: "Scheduling next run for job: daily-backup at 2026-04-22 02:00:00" },
  { id: 14, timestamp: "2026-04-21 14:20:15.789", level: "INFO",  source: "worker-node-01", workerId: "worker-node-01", executionId: "exec-9012", message: "Heartbeat sent successfully" },
  { id: 15, timestamp: "2026-04-21 14:15:00.123", level: "ERROR", source: "worker-node-02", workerId: "worker-node-02", executionId: "exec-9012", message: "Out of memory error during analytics aggregation" },
  { id: 16, timestamp: "2026-04-21 14:14:58.001", level: "INFO",  source: "worker-node-02", workerId: "worker-node-02", executionId: "exec-9012", message: "Starting analytics aggregation job" },
  { id: 17, timestamp: "2026-04-21 14:10:00.555", level: "INFO",  source: "worker-node-01", workerId: "worker-node-01", executionId: "exec-9011", message: "Processing data-export batch chunk 1/5" },
  { id: 18, timestamp: "2026-04-21 14:10:30.777", level: "INFO",  source: "worker-node-01", workerId: "worker-node-01", executionId: "exec-9011", message: "Processing data-export batch chunk 2/5" },
  { id: 19, timestamp: "2026-04-21 14:11:00.333", level: "DEBUG", source: "worker-node-04", workerId: "worker-node-04", executionId: "exec-9010", message: "Acquired distributed lock: lock://batch-report-gen" },
  { id: 20, timestamp: "2026-04-21 14:11:45.999", level: "INFO",  source: "worker-node-04", workerId: "worker-node-04", executionId: "exec-9010", message: "Report generation complete. Output: s3://reports/2026-04-21.pdf" },
];

const EXECUTION_IDS = ["all", "exec-9015", "exec-9014", "exec-9013", "exec-9012", "exec-9011", "exec-9010"];
const WORKER_IDS = ["all", "scheduler", "worker-node-01", "worker-node-02", "worker-node-03", "worker-node-04", "worker-node-05"];

const levelColors: Record<string, string> = {
  ERROR: "text-red-400",
  WARN: "text-yellow-400",
  DEBUG: "text-purple-400",
  INFO: "text-gray-300",
};

const levelBgColors: Record<string, string> = {
  ERROR: "bg-red-900/30 border-l-2 border-red-500",
  WARN: "bg-yellow-900/20 border-l-2 border-yellow-500",
  DEBUG: "bg-purple-900/20 border-l-2 border-purple-500",
  INFO: "",
};

export function LogsViewer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [executionIdFilter, setExecutionIdFilter] = useState("all");
  const [workerIdFilter, setWorkerIdFilter] = useState("all");
  const [isLive, setIsLive] = useState(false);

  const filteredLogs = useMemo(() => {
    return mockLogs.filter((log) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        q === "" ||
        log.message.toLowerCase().includes(q) ||
        log.source.toLowerCase().includes(q) ||
        log.executionId.toLowerCase().includes(q) ||
        log.workerId.toLowerCase().includes(q);
      const matchLevel = levelFilter === "all" || log.level === levelFilter;
      const matchExec = executionIdFilter === "all" || log.executionId === executionIdFilter;
      const matchWorker = workerIdFilter === "all" || log.workerId === workerIdFilter;
      return matchSearch && matchLevel && matchExec && matchWorker;
    });
  }, [searchQuery, levelFilter, executionIdFilter, workerIdFilter]);

  const hasActiveFilters =
    searchQuery !== "" ||
    levelFilter !== "all" ||
    executionIdFilter !== "all" ||
    workerIdFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setLevelFilter("all");
    setExecutionIdFilter("all");
    setWorkerIdFilter("all");
  };

  const levelCounts = useMemo(() => {
    const counts: Record<string, number> = { INFO: 0, WARN: 0, ERROR: 0, DEBUG: 0 };
    filteredLogs.forEach((l) => counts[l.level]++);
    return counts;
  }, [filteredLogs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">System Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Trace job executions across distributed worker nodes</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isLive ? "bg-green-100 text-green-700 border border-green-300" : "bg-gray-100 text-gray-600 border border-gray-300"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></span>
            {isLive ? "Live" : "Paused"}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-56">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search message, source, execution ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 shrink-0" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="DEBUG">DEBUG</option>
            </select>
          </div>

          {/* Actions */}
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Traceability Filters Row */}
        <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <Server className="w-3 h-3" />
            Trace Filters
          </span>

          {/* Execution ID */}
          <div className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-blue-500" />
            <label className="text-xs font-medium text-gray-600">Execution ID:</label>
            <select
              value={executionIdFilter}
              onChange={(e) => setExecutionIdFilter(e.target.value)}
              className={`px-2.5 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                executionIdFilter !== "all" ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-300"
              }`}
            >
              {EXECUTION_IDS.map((id) => (
                <option key={id} value={id}>{id === "all" ? "All Executions" : id}</option>
              ))}
            </select>
          </div>

          {/* Worker ID */}
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-green-500" />
            <label className="text-xs font-medium text-gray-600">Worker ID:</label>
            <select
              value={workerIdFilter}
              onChange={(e) => setWorkerIdFilter(e.target.value)}
              className={`px-2.5 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                workerIdFilter !== "all" ? "border-green-400 bg-green-50 text-green-700" : "border-gray-300"
              }`}
            >
              {WORKER_IDS.map((id) => (
                <option key={id} value={id}>{id === "all" ? "All Workers" : id}</option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>

        {/* Summary row */}
        <div className="flex items-center gap-4 text-xs pt-1 flex-wrap">
          <span className="text-gray-500">
            Showing <span className="font-semibold text-gray-700">{filteredLogs.length}</span> of {mockLogs.length} logs
          </span>
          <div className="flex items-center gap-3">
            <span className="text-red-600 font-medium">● {levelCounts.ERROR} ERROR</span>
            <span className="text-yellow-600 font-medium">● {levelCounts.WARN} WARN</span>
            <span className="text-gray-500 font-medium">● {levelCounts.INFO} INFO</span>
            <span className="text-purple-600 font-medium">● {levelCounts.DEBUG} DEBUG</span>
          </div>
          {executionIdFilter !== "all" && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-mono">
              Trace: {executionIdFilter}
            </span>
          )}
          {workerIdFilter !== "all" && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-mono">
              Node: {workerIdFilter}
            </span>
          )}
        </div>
      </div>

      {/* Terminal */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Terminal header */}
        <div className="bg-gray-800 px-4 py-2.5 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-gray-400 text-xs font-mono flex-1 text-center">
            job-scheduler · system-logs
            {executionIdFilter !== "all" && ` · ${executionIdFilter}`}
            {workerIdFilter !== "all" && ` · ${workerIdFilter}`}
          </span>
          {isLive && <span className="text-green-400 text-xs flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>LIVE</span>}
        </div>

        <div className="bg-gray-900 p-4 font-mono text-sm overflow-x-auto max-h-[560px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-gray-500 text-center py-12">
              No logs match the current filters.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`mb-0.5 px-2 py-0.5 rounded-sm ${levelBgColors[log.level]}`}
              >
                <span className="text-gray-500 select-none">[{log.timestamp}]</span>{" "}
                <span className={`font-semibold ${levelColors[log.level]}`}>{log.level.padEnd(5)}</span>{" "}
                <span className="text-cyan-400">[{log.executionId}]</span>{" "}
                <span className="text-blue-400">[{log.workerId}]</span>{" "}
                <span className={levelColors[log.level]}>{log.message}</span>
              </div>
            ))
          )}
          {/* Cursor blink */}
          {isLive && (
            <div className="text-gray-500 mt-1">
              <span className="animate-pulse">█</span>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Traceability Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-1">Log Levels</p>
            <div className="space-y-0.5">
              <div>• <span className="font-semibold">ERROR</span> — Failed operations requiring attention</div>
              <div>• <span className="font-semibold">WARN</span> — Potential issues, degraded performance</div>
              <div>• <span className="font-semibold">INFO</span> — Normal lifecycle events</div>
              <div>• <span className="font-semibold">DEBUG</span> — Detailed internal state</div>
            </div>
          </div>
          <div>
            <p className="font-medium mb-1">Distributed Tracing</p>
            <div className="space-y-0.5">
              <div>• Filter by <span className="font-semibold">Execution ID</span> to isolate a single job run</div>
              <div>• Filter by <span className="font-semibold">Worker ID</span> to inspect a specific node</div>
              <div>• Combine both filters to trace race conditions or resource conflicts</div>
              <div>• Logs from all nodes (H, I → J) are aggregated here in real-time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
