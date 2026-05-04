import { Activity, Clock, AlertTriangle, CheckCircle, Zap, Lock, Crown } from "lucide-react";

const queueMetrics = [
  { name: "Pending Queue", count: 1204, color: "text-blue-600", bgColor: "bg-blue-100" },
  { name: "Retry Queue", count: 34, color: "text-yellow-600", bgColor: "bg-yellow-100" },
  { name: "Dead Letter Queue", count: 7, color: "text-red-600", bgColor: "bg-red-100" },
];

const schedulerNodes = [
  { id: "scheduler-1", hostname: "scheduler-01.prod.internal", role: "Leader", status: "healthy", uptime: "14d 6h", lastHeartbeat: "1s ago" },
  { id: "scheduler-2", hostname: "scheduler-02.prod.internal", role: "Follower", status: "healthy", uptime: "14d 6h", lastHeartbeat: "2s ago" },
  { id: "scheduler-3", hostname: "scheduler-03.prod.internal", role: "Follower", status: "healthy", uptime: "7d 2h", lastHeartbeat: "1s ago" },
];

const distributedLocks = [
  { jobId: "job-1002", jobName: "email-campaign-sender", owner: "worker-node-03", ttl: 45, contention: "Low", acquiredAt: "2026-04-21 14:30:15" },
  { jobId: "job-1006", jobName: "data-sync-prod", owner: "worker-node-05", ttl: 25, contention: "Medium", acquiredAt: "2026-04-21 14:32:00" },
  { jobId: "job-1001", jobName: "daily-backup", owner: "worker-node-01", ttl: 180, contention: "Low", acquiredAt: "2026-04-21 02:00:05" },
];

export function SystemHealth() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">System Observability</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor scheduler health and distributed system metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {queueMetrics.map((queue) => (
          <div key={queue.name} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{queue.name}</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{queue.count.toLocaleString()}</p>
              </div>
              <div className={`p-3 rounded-lg ${queue.bgColor}`}>
                <Activity className={`w-6 h-6 ${queue.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduler Latency</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">23ms</p>
              <p className="text-xs text-green-600 mt-1">● Within SLA (50ms)</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Missed Schedules</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">3</p>
              <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduling Drift</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">+1.2s</p>
              <p className="text-xs text-green-600 mt-1">● Acceptable range</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-purple-50">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Leader Election Status</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Distributed scheduler cluster coordination</p>
        </div>

        <div className="divide-y divide-gray-200">
          {schedulerNodes.map((node) => (
            <div key={node.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${node.role === "Leader" ? "bg-purple-100" : "bg-gray-100"}`}>
                    {node.role === "Leader" ? (
                      <Crown className="w-6 h-6 text-purple-600" />
                    ) : (
                      <Activity className="w-6 h-6 text-gray-600" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{node.id}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          node.role === "Leader"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {node.role}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600">{node.status}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 font-mono mt-1">{node.hostname}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Uptime: {node.uptime}</span>
                      <span>Last heartbeat: {node.lastHeartbeat}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Distributed Lock Monitoring</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Active job execution locks across the cluster</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lock Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lock TTL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contention</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acquired At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {distributedLocks.map((lock) => (
                <tr key={lock.jobId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {lock.jobId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {lock.jobName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                    {lock.owner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[100px] bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            lock.ttl > 60 ? "bg-green-500" : lock.ttl > 30 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min((lock.ttl / 180) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{lock.ttl}s</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        lock.contention === "Low"
                          ? "bg-green-100 text-green-700"
                          : lock.contention === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {lock.contention}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lock.acquiredAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Distributed System Metrics</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <div>• <span className="font-semibold">Leader Election:</span> Ensures only one scheduler assigns jobs at a time</div>
          <div>• <span className="font-semibold">Distributed Locks:</span> Prevents multiple workers from executing the same job</div>
          <div>• <span className="font-semibold">Lock TTL:</span> Time-to-live ensures locks are released if worker crashes</div>
          <div>• <span className="font-semibold">Contention:</span> Measures how many workers compete for the same lock</div>
        </div>
      </div>
    </div>
  );
}
