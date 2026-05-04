import { useState } from "react";
import {
  Activity,
  Cpu,
  HardDrive,
  CheckCircle,
  XCircle,
  AlertTriangle,
  PowerOff,
  PauseCircle,
  PlayCircle,
  Trash2,
  X,
  ShieldOff,
} from "lucide-react";

type WorkerStatus = "active" | "inactive" | "degraded" | "cordoned" | "shutting_down";

interface Worker {
  id: string;
  hostname: string;
  status: WorkerStatus;
  cpuUsage: number;
  memoryUsage: number;
  activeTasks: number;
  totalTasks: number;
  lastHeartbeat: string;
  uptime: string;
}

const initialWorkers: Worker[] = [
  { id: "worker-node-01", hostname: "worker-01.prod.internal", status: "active", cpuUsage: 45, memoryUsage: 62, activeTasks: 3, totalTasks: 127, lastHeartbeat: "2 seconds ago", uptime: "14d 6h 23m" },
  { id: "worker-node-02", hostname: "worker-02.prod.internal", status: "active", cpuUsage: 78, memoryUsage: 84, activeTasks: 5, totalTasks: 215, lastHeartbeat: "1 second ago", uptime: "14d 6h 23m" },
  { id: "worker-node-03", hostname: "worker-03.prod.internal", status: "degraded", cpuUsage: 92, memoryUsage: 95, activeTasks: 8, totalTasks: 189, lastHeartbeat: "45 seconds ago", uptime: "7d 2h 15m" },
  { id: "worker-node-04", hostname: "worker-04.prod.internal", status: "active", cpuUsage: 34, memoryUsage: 51, activeTasks: 2, totalTasks: 98, lastHeartbeat: "3 seconds ago", uptime: "14d 6h 23m" },
  { id: "worker-node-05", hostname: "worker-05.prod.internal", status: "inactive", cpuUsage: 0, memoryUsage: 0, activeTasks: 0, totalTasks: 156, lastHeartbeat: "5 minutes ago", uptime: "0d 0h 0m" },
];

type ActionType = "shutdown" | "cordon" | "uncordon" | "force_remove";

interface ConfirmState {
  workerId: string;
  workerName: string;
  action: ActionType;
}

const actionMeta: Record<ActionType, { label: string; description: string; confirmLabel: string; danger: boolean }> = {
  shutdown: {
    label: "Graceful Shutdown",
    description: "The worker will finish its current tasks and then shut down. No new jobs will be assigned during this process.",
    confirmLabel: "Shutdown",
    danger: false,
  },
  cordon: {
    label: "Cordon (Pause)",
    description: "Mark this worker as unavailable. It will finish current tasks but won't accept new jobs from the queue. Use this for maintenance.",
    confirmLabel: "Cordon Worker",
    danger: false,
  },
  uncordon: {
    label: "Uncordon (Resume)",
    description: "Remove the maintenance lock and allow this worker to accept new jobs from the queue again.",
    confirmLabel: "Uncordon Worker",
    danger: false,
  },
  force_remove: {
    label: "Force Remove",
    description: "Immediately remove this worker from the registry. All active tasks will be lost and moved to the retry queue. This action CANNOT be undone.",
    confirmLabel: "Force Remove",
    danger: true,
  },
};

function StatusIcon({ status }: { status: WorkerStatus }) {
  if (status === "active") return <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>;
  if (status === "inactive") return <div className="p-2 bg-red-100 rounded-lg"><XCircle className="w-5 h-5 text-red-600" /></div>;
  if (status === "degraded") return <div className="p-2 bg-yellow-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-yellow-600" /></div>;
  if (status === "cordoned") return <div className="p-2 bg-orange-100 rounded-lg"><ShieldOff className="w-5 h-5 text-orange-600" /></div>;
  if (status === "shutting_down") return <div className="p-2 bg-purple-100 rounded-lg"><PowerOff className="w-5 h-5 text-purple-600" /></div>;
  return null;
}

function StatusBadge({ status }: { status: WorkerStatus }) {
  const map: Record<WorkerStatus, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-red-100 text-red-700",
    degraded: "bg-yellow-100 text-yellow-700",
    cordoned: "bg-orange-100 text-orange-700",
    shutting_down: "bg-purple-100 text-purple-700",
  };
  const labels: Record<WorkerStatus, string> = {
    active: "Active",
    inactive: "Inactive",
    degraded: "Degraded",
    cordoned: "Cordoned",
    shutting_down: "Shutting Down",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

export function WorkerManagement() {
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = (worker: Worker, action: ActionType) => {
    setConfirmState({ workerId: worker.id, workerName: worker.id, action });
  };

  const executeAction = () => {
    if (!confirmState) return;
    const { workerId, action } = confirmState;

    setWorkers((prev) =>
      prev
        .map((w) => {
          if (w.id !== workerId) return w;
          if (action === "shutdown") return { ...w, status: "shutting_down" as WorkerStatus };
          if (action === "cordon") return { ...w, status: "cordoned" as WorkerStatus };
          if (action === "uncordon") return { ...w, status: "active" as WorkerStatus };
          return w;
        })
        .filter((w) => !(w.id === workerId && action === "force_remove"))
    );

    const messages: Record<ActionType, string> = {
      shutdown: `Graceful shutdown initiated for ${workerId}`,
      cordon: `${workerId} cordoned — no new jobs will be assigned`,
      uncordon: `${workerId} uncordoned — now accepting jobs`,
      force_remove: `${workerId} has been removed from the registry`,
    };
    showToast(messages[action]);
    setConfirmState(null);
  };

  const activeCount = workers.filter((w) => w.status === "active").length;
  const inactiveCount = workers.filter((w) => w.status === "inactive").length;
  const degradedCount = workers.filter((w) => w.status === "degraded").length;
  const cordonedCount = workers.filter((w) => w.status === "cordoned" || w.status === "shutting_down").length;
  const activeTasks = workers.reduce((sum, w) => sum + w.activeTasks, 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-green-400" />
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Worker Management</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor and control worker node health, performance, and lifecycle</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div><div className="text-sm text-gray-600">Active</div><div className="text-2xl font-semibold text-gray-900">{activeCount}</div></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><XCircle className="w-5 h-5 text-red-600" /></div>
            <div><div className="text-sm text-gray-600">Inactive</div><div className="text-2xl font-semibold text-gray-900">{inactiveCount}</div></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-yellow-600" /></div>
            <div><div className="text-sm text-gray-600">Degraded</div><div className="text-2xl font-semibold text-gray-900">{degradedCount}</div></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><ShieldOff className="w-5 h-5 text-orange-600" /></div>
            <div><div className="text-sm text-gray-600">Cordoned</div><div className="text-2xl font-semibold text-gray-900">{cordonedCount}</div></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Activity className="w-5 h-5 text-blue-600" /></div>
            <div><div className="text-sm text-gray-600">Active Tasks</div><div className="text-2xl font-semibold text-gray-900">{activeTasks}</div></div>
          </div>
        </div>
      </div>

      {/* Worker List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Worker Nodes</h2>
          <span className="text-sm text-gray-500">{workers.length} nodes registered</span>
        </div>

        <div className="divide-y divide-gray-200">
          {workers.map((worker) => (
            <div key={worker.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="mt-1 shrink-0">
                    <StatusIcon status={worker.status} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{worker.id}</h3>
                      <StatusBadge status={worker.status} />
                    </div>
                    <p className="text-sm text-gray-500 font-mono mt-0.5 truncate">{worker.hostname}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                      <div className="text-gray-600"><span className="font-medium">Heartbeat:</span> {worker.lastHeartbeat}</div>
                      <div className="text-gray-600"><span className="font-medium">Uptime:</span> {worker.uptime}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm text-gray-600">Active Tasks</div>
                    <div className="text-xl font-semibold text-gray-900">{worker.activeTasks}</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-sm text-gray-600">Total Tasks</div>
                    <div className="text-xl font-semibold text-gray-900">{worker.totalTasks}</div>
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600"><Cpu className="w-4 h-4" />CPU Usage</div>
                    <span className="text-sm font-semibold text-gray-900">{worker.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${worker.cpuUsage > 80 ? "bg-red-500" : worker.cpuUsage > 60 ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{ width: `${worker.cpuUsage}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600"><HardDrive className="w-4 h-4" />Memory Usage</div>
                    <span className="text-sm font-semibold text-gray-900">{worker.memoryUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${worker.memoryUsage > 80 ? "bg-red-500" : worker.memoryUsage > 60 ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{ width: `${worker.memoryUsage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100 flex-wrap">
                <span className="text-xs font-medium text-gray-500 mr-1">Actions:</span>

                {/* Graceful Shutdown — only for active/degraded */}
                {(worker.status === "active" || worker.status === "degraded") && (
                  <button
                    onClick={() => handleAction(worker, "shutdown")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <PowerOff className="w-3.5 h-3.5" />
                    Graceful Shutdown
                  </button>
                )}

                {/* Cordon — for active/degraded */}
                {(worker.status === "active" || worker.status === "degraded") && (
                  <button
                    onClick={() => handleAction(worker, "cordon")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <PauseCircle className="w-3.5 h-3.5" />
                    Cordon / Pause
                  </button>
                )}

                {/* Uncordon — for cordoned */}
                {worker.status === "cordoned" && (
                  <button
                    onClick={() => handleAction(worker, "uncordon")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    Uncordon / Resume
                  </button>
                )}

                {/* Force Remove — always available */}
                <button
                  onClick={() => handleAction(worker, "force_remove")}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Force Remove
                </button>
              </div>
            </div>
          ))}

          {workers.length === 0 && (
            <div className="p-12 text-center">
              <Activity className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No worker nodes registered.</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmState && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-6 w-full max-w-md">
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-2 rounded-lg shrink-0 ${actionMeta[confirmState.action].danger ? "bg-red-100" : "bg-yellow-100"}`}>
                {confirmState.action === "force_remove"
                  ? <Trash2 className="w-5 h-5 text-red-600" />
                  : confirmState.action === "shutdown"
                  ? <PowerOff className="w-5 h-5 text-purple-600" />
                  : confirmState.action === "uncordon"
                  ? <PlayCircle className="w-5 h-5 text-green-600" />
                  : <PauseCircle className="w-5 h-5 text-orange-600" />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{actionMeta[confirmState.action].label}</h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{confirmState.workerName}</p>
              </div>
              <button onClick={() => setConfirmState(null)} className="p-1 hover:bg-gray-100 rounded ml-auto">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-5">{actionMeta[confirmState.action].description}</p>
            {confirmState.action === "force_remove" && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700 font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {confirmState.workerName}'s {workers.find(w => w.id === confirmState.workerId)?.activeTasks ?? 0} active task(s) will be moved to the retry queue.
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmState(null)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className={`px-4 py-2 text-sm text-white rounded-lg ${
                  actionMeta[confirmState.action].danger
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {actionMeta[confirmState.action].confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
