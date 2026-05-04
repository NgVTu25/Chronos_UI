import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, HelpCircle, Plus, Trash2, Code, List, AlertCircle } from "lucide-react";
import { useState } from "react";

type PayloadMode = "raw" | "builder";

interface KVPair {
  id: string;
  key: string;
  value: string;
  type: "string" | "number" | "boolean";
}

function kvToJson(pairs: KVPair[]): string {
  const obj: Record<string, any> = {};
  pairs.forEach((p) => {
    if (!p.key) return;
    if (p.type === "number") obj[p.key] = Number(p.value);
    else if (p.type === "boolean") obj[p.key] = p.value === "true";
    else obj[p.key] = p.value;
  });
  return JSON.stringify(obj, null, 2);
}

function jsonToKv(json: string): KVPair[] {
  try {
    const obj = JSON.parse(json);
    if (typeof obj !== "object" || Array.isArray(obj)) return [];
    return Object.entries(obj).map(([key, val], i) => ({
      id: `kv-${i}`,
      key,
      value: String(val),
      type: typeof val === "number" ? "number" : typeof val === "boolean" ? "boolean" : "string",
    }));
  } catch {
    return [];
  }
}

export function JobForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    jobName: isEditing ? "data-sync-prod" : "",
    cronSchedule: isEditing ? "*/5 * * * *" : "",
    executionType: "http",
    retryAttempts: isEditing ? "5" : "3",
    retryDelay: isEditing ? "3" : "5",
    timeout: isEditing ? "300" : "60",
    workerQueue: "default",
    payload: isEditing
      ? JSON.stringify({ url: "https://api.example.com/sync", method: "POST", retries: 3, dryRun: false }, null, 2)
      : "{}",
  });

  const [showCronHelper, setShowCronHelper] = useState(false);
  const [payloadMode, setPayloadMode] = useState<PayloadMode>("builder");
  const [kvPairs, setKvPairs] = useState<KVPair[]>(() => jsonToKv(formData.payload));
  const [jsonError, setJsonError] = useState<string | null>(null);

  const syncRawToKv = (raw: string) => {
    try {
      JSON.parse(raw);
      setJsonError(null);
      setKvPairs(jsonToKv(raw));
    } catch {
      setJsonError("Invalid JSON syntax");
    }
  };

  const syncKvToRaw = (pairs: KVPair[]) => {
    const json = kvToJson(pairs);
    setFormData((prev) => ({ ...prev, payload: json }));
  };

  const handleModeSwitch = (mode: PayloadMode) => {
    if (mode === "builder") {
      const pairs = jsonToKv(formData.payload);
      setKvPairs(pairs);
      setJsonError(null);
    } else {
      setFormData((prev) => ({ ...prev, payload: kvToJson(kvPairs) }));
    }
    setPayloadMode(mode);
  };

  const addKvPair = () => {
    const newPairs = [...kvPairs, { id: `kv-${Date.now()}`, key: "", value: "", type: "string" as const }];
    setKvPairs(newPairs);
    syncKvToRaw(newPairs);
  };

  const updateKvPair = (id: string, field: keyof KVPair, val: string) => {
    const updated = kvPairs.map((p) => (p.id === id ? { ...p, [field]: val } : p));
    setKvPairs(updated);
    syncKvToRaw(updated);
  };

  const removeKvPair = (id: string) => {
    const updated = kvPairs.filter((p) => p.id !== id);
    setKvPairs(updated);
    syncKvToRaw(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jsonError) return;
    navigate("/jobs");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link to="/jobs" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditing ? "Edit Job" : "Create New Job"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditing ? `Editing job #${id}` : "Configure a new scheduled job"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Name</label>
            <input
              type="text"
              value={formData.jobName}
              onChange={(e) => setFormData({ ...formData, jobName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., daily-backup"
              required
            />
          </div>

          {/* Cron Schedule */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Cron Schedule</label>
              <button
                type="button"
                onClick={() => setShowCronHelper(!showCronHelper)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <HelpCircle className="w-4 h-4" />
                Cron Helper
              </button>
            </div>
            <input
              type="text"
              value={formData.cronSchedule}
              onChange={(e) => setFormData({ ...formData, cronSchedule: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="* * * * *"
              required
            />
            {showCronHelper && (
              <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Cron Expression Guide</h4>
                <div className="text-sm text-gray-700 space-y-1 font-mono">
                  <div>* * * * * → minute hour day month weekday</div>
                  <div className="mt-2 space-y-1 font-sans">
                    <div>• <code>*/5 * * * *</code> → Every 5 minutes</div>
                    <div>• <code>0 * * * *</code> → Every hour</div>
                    <div>• <code>0 0 * * *</code> → Daily at midnight</div>
                    <div>• <code>0 9 * * 1</code> → Every Monday at 9am</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Execution Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Execution Type</label>
            <select
              value={formData.executionType}
              onChange={(e) => setFormData({ ...formData, executionType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="http">HTTP Request</option>
              <option value="script">Shell Script</option>
              <option value="python">Python Script</option>
              <option value="docker">Docker Container</option>
            </select>
          </div>

          {/* Worker Queue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Worker Queue</label>
            <select
              value={formData.workerQueue}
              onChange={(e) => setFormData({ ...formData, workerQueue: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">default</option>
              <option value="high-priority">high-priority</option>
              <option value="low-priority">low-priority</option>
              <option value="analytics">analytics</option>
              <option value="notifications">notifications</option>
            </select>
          </div>

          {/* Retry Attempts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Retry Attempts</label>
            <input
              type="number"
              value={formData.retryAttempts}
              onChange={(e) => setFormData({ ...formData, retryAttempts: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0" max="10"
            />
          </div>

          {/* Retry Delay */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Retry Delay (minutes)</label>
            <input
              type="number"
              value={formData.retryDelay}
              onChange={(e) => setFormData({ ...formData, retryDelay: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1" max="60"
            />
          </div>

          {/* Timeout */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeout (seconds)</label>
            <input
              type="number"
              value={formData.timeout}
              onChange={(e) => setFormData({ ...formData, timeout: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="10" max="3600"
            />
          </div>

          {/* ── Payload Section ── */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Input Payload
              </label>
              {/* Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleModeSwitch("builder")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    payloadMode === "builder"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  Key-Value Builder
                </button>
                <button
                  type="button"
                  onClick={() => handleModeSwitch("raw")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    payloadMode === "raw"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  Raw JSON
                </button>
              </div>
            </div>

            {/* Key-Value Builder Mode */}
            {payloadMode === "builder" && (
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                {/* Header row */}
                <div className="bg-gray-50 border-b border-gray-200 grid grid-cols-12 gap-0 text-xs font-medium text-gray-600">
                  <div className="col-span-4 px-3 py-2">Key</div>
                  <div className="col-span-4 px-3 py-2 border-l border-gray-200">Value</div>
                  <div className="col-span-3 px-3 py-2 border-l border-gray-200">Type</div>
                  <div className="col-span-1 px-3 py-2 border-l border-gray-200"></div>
                </div>

                {/* KV Rows */}
                {kvPairs.length === 0 && (
                  <div className="py-6 text-center text-sm text-gray-500">
                    No fields yet.{" "}
                    <button type="button" onClick={addKvPair} className="text-blue-600 hover:underline">
                      Add your first field
                    </button>
                  </div>
                )}
                {kvPairs.map((pair) => (
                  <div key={pair.id} className="grid grid-cols-12 gap-0 border-b border-gray-100 group hover:bg-blue-50/30 transition-colors">
                    <div className="col-span-4 px-2 py-2">
                      <input
                        type="text"
                        value={pair.key}
                        onChange={(e) => updateKvPair(pair.id, "key", e.target.value)}
                        placeholder="key"
                        className="w-full px-2 py-1 text-sm font-mono border border-transparent rounded focus:outline-none focus:border-blue-400 focus:bg-white bg-transparent"
                      />
                    </div>
                    <div className="col-span-4 px-2 py-2 border-l border-gray-100">
                      {pair.type === "boolean" ? (
                        <select
                          value={pair.value}
                          onChange={(e) => updateKvPair(pair.id, "value", e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-transparent rounded focus:outline-none focus:border-blue-400 focus:bg-white bg-transparent"
                        >
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      ) : (
                        <input
                          type={pair.type === "number" ? "number" : "text"}
                          value={pair.value}
                          onChange={(e) => updateKvPair(pair.id, "value", e.target.value)}
                          placeholder="value"
                          className="w-full px-2 py-1 text-sm font-mono border border-transparent rounded focus:outline-none focus:border-blue-400 focus:bg-white bg-transparent"
                        />
                      )}
                    </div>
                    <div className="col-span-3 px-2 py-2 border-l border-gray-100">
                      <select
                        value={pair.type}
                        onChange={(e) => updateKvPair(pair.id, "type", e.target.value)}
                        className="w-full px-1 py-1 text-sm border border-transparent rounded focus:outline-none focus:border-blue-400 focus:bg-white bg-transparent"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                      </select>
                    </div>
                    <div className="col-span-1 px-2 py-2 border-l border-gray-100 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeKvPair(pair.id)}
                        className="p-1 text-gray-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Row Button */}
                <div className="p-2">
                  <button
                    type="button"
                    onClick={addKvPair}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-full justify-center border border-dashed border-blue-300 hover:border-blue-400"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Field
                  </button>
                </div>

                {/* Preview */}
                {kvPairs.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-900 p-3">
                    <div className="text-xs text-gray-400 mb-1">JSON Preview</div>
                    <pre className="text-xs text-green-400 font-mono overflow-x-auto">{kvToJson(kvPairs)}</pre>
                  </div>
                )}
              </div>
            )}

            {/* Raw JSON Mode */}
            {payloadMode === "raw" && (
              <div>
                <textarea
                  value={formData.payload}
                  onChange={(e) => {
                    setFormData({ ...formData, payload: e.target.value });
                    syncRawToKv(e.target.value);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm ${
                    jsonError
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  rows={10}
                  placeholder='{"key": "value"}'
                />
                {jsonError && (
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {jsonError}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Switch to Key-Value Builder for a visual editor. Raw JSON is synced automatically.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEditing ? "Update Job" : "Create Job"}
          </button>
          <Link to="/jobs" className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
