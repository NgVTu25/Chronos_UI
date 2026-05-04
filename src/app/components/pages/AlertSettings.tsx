import { useState } from "react";
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  Mail,
  MessageSquare,
  Webhook,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Clock,
  Layers,
  Cpu,
  HeartPulse,
} from "lucide-react";

type Severity = "critical" | "warning" | "info";
type Channel = "email" | "slack" | "webhook" | "pagerduty";
type RuleCategory = "queue" | "worker" | "job" | "heartbeat";

interface AlertRule {
  id: string;
  name: string;
  category: RuleCategory;
  condition: string;
  threshold: number;
  unit: string;
  severity: Severity;
  channels: Channel[];
  enabled: boolean;
  lastTriggered?: string;
}

const defaultRules: AlertRule[] = [
  {
    id: "rule-001",
    name: "Dead Letter Queue Overflow",
    category: "queue",
    condition: "dlq_depth >",
    threshold: 10,
    unit: "jobs",
    severity: "critical",
    channels: ["email", "slack"],
    enabled: true,
    lastTriggered: "2026-04-21 14:32:35",
  },
  {
    id: "rule-002",
    name: "Retry Queue Backlog",
    category: "queue",
    condition: "retry_queue_depth >",
    threshold: 50,
    unit: "jobs",
    severity: "warning",
    channels: ["slack"],
    enabled: true,
    lastTriggered: "2026-04-20 09:14:22",
  },
  {
    id: "rule-003",
    name: "Worker Heartbeat Timeout",
    category: "heartbeat",
    condition: "heartbeat_silence >",
    threshold: 30,
    unit: "seconds",
    severity: "critical",
    channels: ["email", "pagerduty"],
    enabled: true,
    lastTriggered: "2026-04-19 22:01:11",
  },
  {
    id: "rule-004",
    name: "Worker CPU Critical",
    category: "worker",
    condition: "worker_cpu >",
    threshold: 90,
    unit: "%",
    severity: "warning",
    channels: ["slack"],
    enabled: true,
  },
  {
    id: "rule-005",
    name: "Worker Memory Critical",
    category: "worker",
    condition: "worker_memory >",
    threshold: 95,
    unit: "%",
    severity: "critical",
    channels: ["email", "pagerduty"],
    enabled: false,
  },
  {
    id: "rule-006",
    name: "Job Failure Rate High",
    category: "job",
    condition: "failure_rate >",
    threshold: 20,
    unit: "%",
    severity: "warning",
    channels: ["email"],
    enabled: true,
  },
  {
    id: "rule-007",
    name: "Job Execution Timeout",
    category: "job",
    condition: "execution_time >",
    threshold: 600,
    unit: "seconds",
    severity: "info",
    channels: ["slack"],
    enabled: false,
  },
];

const severityConfig: Record<Severity, { label: string; class: string; dotClass: string }> = {
  critical: { label: "Critical", class: "bg-red-100 text-red-700 border border-red-200", dotClass: "bg-red-500" },
  warning: { label: "Warning", class: "bg-yellow-100 text-yellow-700 border border-yellow-200", dotClass: "bg-yellow-500" },
  info: { label: "Info", class: "bg-blue-100 text-blue-700 border border-blue-200", dotClass: "bg-blue-500" },
};

const categoryConfig: Record<RuleCategory, { label: string; icon: React.ElementType; iconClass: string; bgClass: string }> = {
  queue: { label: "Queue", icon: Layers, iconClass: "text-purple-600", bgClass: "bg-purple-100" },
  worker: { label: "Worker", icon: Cpu, iconClass: "text-blue-600", bgClass: "bg-blue-100" },
  job: { label: "Job", icon: AlertTriangle, iconClass: "text-yellow-600", bgClass: "bg-yellow-100" },
  heartbeat: { label: "Heartbeat", icon: HeartPulse, iconClass: "text-red-600", bgClass: "bg-red-100" },
};

const channelIcons: Record<Channel, { icon: React.ElementType; label: string; color: string }> = {
  email: { icon: Mail, label: "Email", color: "text-gray-600" },
  slack: { icon: MessageSquare, label: "Slack", color: "text-purple-600" },
  webhook: { icon: Webhook, label: "Webhook", color: "text-orange-600" },
  pagerduty: { icon: Bell, label: "PagerDuty", color: "text-green-600" },
};

const ALL_CHANNELS: Channel[] = ["email", "slack", "webhook", "pagerduty"];

const emptyRule: Omit<AlertRule, "id"> = {
  name: "",
  category: "job",
  condition: "failure_rate >",
  threshold: 10,
  unit: "%",
  severity: "warning",
  channels: ["email"],
  enabled: true,
};

export function AlertSettings() {
  const [rules, setRules] = useState<AlertRule[]>(defaultRules);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRule, setNewRule] = useState<Omit<AlertRule, "id">>(emptyRule);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = rules.filter((r) => categoryFilter === "all" || r.category === categoryFilter);

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const saveEdit = () => {
    if (!editingRule) return;
    setRules((prev) => prev.map((r) => (r.id === editingRule.id ? editingRule : r)));
    setEditingRule(null);
  };

  const addRule = () => {
    const rule: AlertRule = { ...newRule, id: `rule-${Date.now()}` };
    setRules((prev) => [...prev, rule]);
    setShowAddModal(false);
    setNewRule(emptyRule);
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    setDeleteConfirm(null);
  };

  const toggleChannel = (
    channels: Channel[],
    ch: Channel,
    setter: (fn: (prev: any) => any) => void,
    field: "channels"
  ) => {
    const next = channels.includes(ch) ? channels.filter((c) => c !== ch) : [...channels, ch];
    setter((prev: any) => ({ ...prev, [field]: next }));
  };

  const enabledCount = rules.filter((r) => r.enabled).length;

  const RuleForm = ({
    data,
    onChange,
    onSave,
    onCancel,
    title,
  }: {
    data: Omit<AlertRule, "id">;
    onChange: (d: Omit<AlertRule, "id">) => void;
    onSave: () => void;
    onCancel: () => void;
    title: string;
  }) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Dead Letter Queue Overflow"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={data.category}
                onChange={(e) => onChange({ ...data, category: e.target.value as RuleCategory })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="job">Job</option>
                <option value="queue">Queue</option>
                <option value="worker">Worker</option>
                <option value="heartbeat">Heartbeat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={data.severity}
                onChange={(e) => onChange({ ...data, severity: e.target.value as Severity })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={data.condition}
                onChange={(e) => onChange({ ...data, condition: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="dlq_depth >"
              />
              <input
                type="number"
                value={data.threshold}
                onChange={(e) => onChange({ ...data, threshold: Number(e.target.value) })}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={data.unit}
                onChange={(e) => onChange({ ...data, unit: e.target.value })}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="jobs"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notification Channels</label>
            <div className="flex gap-3 flex-wrap">
              {ALL_CHANNELS.map((ch) => {
                const { icon: Icon, label, color } = channelIcons[ch];
                const active = data.channels.includes(ch);
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => {
                      const next = active ? data.channels.filter((c) => c !== ch) : [...data.channels, ch];
                      onChange({ ...data, channels: next });
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      active ? "bg-blue-50 border-blue-400 text-blue-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? "" : color}`} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-200">
          <button onClick={onCancel} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!data.name}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Rule
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Alert Rules Configuration</h1>
          <p className="text-sm text-gray-500 mt-1">Define when and how the system sends notifications</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["all", "queue", "worker", "heartbeat", "job"] as const).slice(0, 4).map((cat, i) => {
          if (cat === "all") return (
            <div key="all" className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg"><Bell className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <div className="text-sm text-gray-600">Total Rules</div>
                  <div className="text-2xl font-semibold text-gray-900">{rules.length}</div>
                  <div className="text-xs text-gray-500">{enabledCount} active</div>
                </div>
              </div>
            </div>
          );
          const cfg = categoryConfig[cat as RuleCategory];
          const Icon = cfg.icon;
          const count = rules.filter((r) => r.category === cat).length;
          return (
            <div key={cat} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${cfg.bgClass}`}><Icon className={`w-5 h-5 ${cfg.iconClass}`} /></div>
                <div>
                  <div className="text-sm text-gray-600">{cfg.label} Rules</div>
                  <div className="text-2xl font-semibold text-gray-900">{count}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-gray-700">Filter by category:</span>
        {["all", "job", "queue", "worker", "heartbeat"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              categoryFilter === cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat === "all" ? "All" : categoryConfig[cat as RuleCategory].label}
          </button>
        ))}
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {filtered.map((rule) => {
          const sev = severityConfig[rule.severity];
          const cat = categoryConfig[rule.category];
          const CatIcon = cat.icon;
          return (
            <div key={rule.id} className={`bg-white rounded-lg border border-gray-200 p-5 transition-all ${!rule.enabled ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${cat.bgClass}`}>
                    <CatIcon className={`w-5 h-5 ${cat.iconClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">{rule.name}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${sev.class}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sev.dotClass}`}></span>
                        {sev.label}
                      </span>
                      {!rule.enabled && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">Disabled</span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-gray-600 font-mono">
                      IF <span className="text-blue-700">{rule.condition}</span>{" "}
                      <span className="font-semibold">{rule.threshold}</span>{" "}
                      <span className="text-gray-500">{rule.unit}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {rule.channels.map((ch) => {
                          const { icon: ChIcon, label, color } = channelIcons[ch];
                          return (
                            <span key={ch} className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                              <ChIcon className={`w-3 h-3 ${color}`} />
                              {label}
                            </span>
                          );
                        })}
                      </div>
                      {rule.lastTriggered && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last: {rule.lastTriggered}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className="text-gray-400 hover:text-gray-700 transition-colors"
                    title={rule.enabled ? "Disable rule" : "Enable rule"}
                  >
                    {rule.enabled
                      ? <ToggleRight className="w-7 h-7 text-blue-600" />
                      : <ToggleLeft className="w-7 h-7" />}
                  </button>
                  <button
                    onClick={() => setEditingRule({ ...rule })}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(rule.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No alert rules in this category.</p>
            <button onClick={() => setShowAddModal(true)} className="mt-3 text-sm text-blue-600 hover:underline">
              Add your first rule →
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingRule && (
        <RuleForm
          data={editingRule}
          onChange={(d) => setEditingRule({ ...editingRule, ...d })}
          onSave={saveEdit}
          onCancel={() => setEditingRule(null)}
          title="Edit Alert Rule"
        />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <RuleForm
          data={newRule}
          onChange={setNewRule}
          onSave={addRule}
          onCancel={() => { setShowAddModal(false); setNewRule(emptyRule); }}
          title="Add Alert Rule"
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Delete Alert Rule</h3>
            <p className="text-sm text-gray-600 mb-5">This rule will be permanently removed. Alerts will no longer be sent for this condition.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
              <button onClick={() => deleteRule(deleteConfirm)} className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
