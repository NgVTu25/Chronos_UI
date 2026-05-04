import { ArrowRight, CheckCircle, XCircle, Clock, Play } from "lucide-react";
import { StatusBadge } from "../StatusBadge";

interface DAGNode {
  id: string;
  name: string;
  status: "success" | "failed" | "running" | "pending";
  duration?: string;
  dependencies: string[];
}

const mockDAG: DAGNode[] = [
  {
    id: "node-1",
    name: "Extract Data",
    status: "success",
    duration: "2m 15s",
    dependencies: [],
  },
  {
    id: "node-2",
    name: "Validate Schema",
    status: "success",
    duration: "45s",
    dependencies: ["node-1"],
  },
  {
    id: "node-3",
    name: "Transform Data",
    status: "running",
    dependencies: ["node-2"],
  },
  {
    id: "node-4",
    name: "Load to Warehouse",
    status: "pending",
    dependencies: ["node-3"],
  },
  {
    id: "node-5",
    name: "Update Analytics",
    status: "pending",
    dependencies: ["node-4"],
  },
  {
    id: "node-6",
    name: "Send Notification",
    status: "pending",
    dependencies: ["node-5"],
  },
];

const workflows = [
  {
    id: "workflow-1",
    name: "Daily ETL Pipeline",
    lastRun: "2026-04-20 14:30:00",
    status: "running",
    nodes: 6,
    completedNodes: 2,
  },
  {
    id: "workflow-2",
    name: "User Analytics Aggregation",
    lastRun: "2026-04-20 12:00:00",
    status: "success",
    nodes: 4,
    completedNodes: 4,
  },
  {
    id: "workflow-3",
    name: "Weekly Report Generation",
    lastRun: "2026-04-18 09:00:00",
    status: "failed",
    nodes: 5,
    completedNodes: 3,
  },
];

export function DAGWorkflow() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">DAG Workflows</h1>
        <p className="text-sm text-gray-500 mt-1">Directed Acyclic Graph job dependencies</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active Workflows</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">Last run: {workflow.lastRun}</p>
                </div>
                <StatusBadge status={workflow.status as any} />
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Progress: {workflow.completedNodes}/{workflow.nodes} nodes
                </div>
                <div className="flex-1 max-w-xs">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(workflow.completedNodes / workflow.nodes) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Daily ETL Pipeline</h2>
            <p className="text-sm text-gray-500 mt-1">Workflow visualization</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Play className="w-4 h-4" />
            Run Workflow
          </button>
        </div>

        <div className="space-y-4">
          {mockDAG.map((node, index) => {
            const isLast = index === mockDAG.length - 1;

            return (
              <div key={node.id}>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border-2 border-gray-300">
                    {node.status === "success" && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {node.status === "failed" && (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    {node.status === "running" && (
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                    )}
                    {node.status === "pending" && (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{node.name}</h3>
                        <StatusBadge status={node.status} />
                      </div>
                      {node.duration && (
                        <div className="text-sm text-gray-500">Duration: {node.duration}</div>
                      )}
                    </div>

                    {node.dependencies.length > 0 && (
                      <div className="mt-2 text-sm text-gray-500">
                        Depends on: {node.dependencies.join(", ")}
                      </div>
                    )}
                  </div>
                </div>

                {!isLast && (
                  <div className="flex items-center justify-center my-2">
                    <ArrowRight className="w-5 h-5 text-gray-400 rotate-90" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">About DAG Workflows</h3>
        <p className="text-sm text-blue-800">
          Directed Acyclic Graphs (DAGs) allow you to define job dependencies and execution order. Each node
          represents a job, and edges represent dependencies. Jobs are executed in topological order, ensuring
          that all dependencies are satisfied before a job starts.
        </p>
      </div>
    </div>
  );
}
