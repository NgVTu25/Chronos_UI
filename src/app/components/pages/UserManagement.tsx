import { useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  MoreVertical,
  Mail,
  Lock,
  Unlock,
  Trash2,
  X,
  Check,
  ChevronDown,
} from "lucide-react";

type Role = "Admin" | "Operator" | "Developer";
type UserStatus = "active" | "suspended" | "pending";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
}

const mockUsers: UserRecord[] = [
  { id: "u-001", name: "Alice Nguyen", email: "alice@company.com", role: "Admin", status: "active", lastLogin: "2 minutes ago", createdAt: "2024-01-15" },
  { id: "u-002", name: "Bob Tran", email: "bob@company.com", role: "Operator", status: "active", lastLogin: "1 hour ago", createdAt: "2024-02-10" },
  { id: "u-003", name: "Carol Le", email: "carol@company.com", role: "Developer", status: "active", lastLogin: "3 hours ago", createdAt: "2024-03-05" },
  { id: "u-004", name: "David Pham", email: "david@company.com", role: "Developer", status: "active", lastLogin: "Yesterday", createdAt: "2024-03-20" },
  { id: "u-005", name: "Eva Hoang", email: "eva@company.com", role: "Operator", status: "suspended", lastLogin: "5 days ago", createdAt: "2024-04-01" },
  { id: "u-006", name: "Frank Do", email: "frank@company.com", role: "Developer", status: "pending", lastLogin: "Never", createdAt: "2026-04-30" },
];

const ROLE_PERMISSIONS: Record<Role, { label: string; permissions: string[]; denied: string[] }> = {
  Admin: {
    label: "Full system access",
    permissions: ["Create/Edit/Delete Jobs", "Manage Workers", "View Logs", "Manage Users", "Configure Alerts", "Force Remove Workers", "Access Audit Logs"],
    denied: [],
  },
  Operator: {
    label: "Operations & monitoring",
    permissions: ["Create/Edit Jobs", "Manage Workers", "View Logs", "Configure Alerts", "Pause/Resume Workers"],
    denied: ["Delete Jobs", "Manage Users", "Force Remove Workers"],
  },
  Developer: {
    label: "Job development only",
    permissions: ["Create/Edit Jobs", "View Logs (own jobs)"],
    denied: ["Delete Jobs", "Manage Workers", "Manage Users", "Configure Alerts", "Access Audit Logs"],
  },
};

const roleBadgeClass: Record<Role, string> = {
  Admin: "bg-red-100 text-red-700 border border-red-200",
  Operator: "bg-blue-100 text-blue-700 border border-blue-200",
  Developer: "bg-green-100 text-green-700 border border-green-200",
};

const roleIcon: Record<Role, React.ElementType> = {
  Admin: ShieldAlert,
  Operator: ShieldCheck,
  Developer: Shield,
};

const statusClass: Record<UserStatus, string> = {
  active: "bg-green-100 text-green-700",
  suspended: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
};

export function UserManagement() {
  const [users, setUsers] = useState<UserRecord[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "Developer" as Role });
  const [showPermMatrix, setShowPermMatrix] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ userId: string; action: string } | null>(null);

  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = q === "" || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleRoleChange = (userId: string, newRole: Role) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    setEditingRole(null);
  };

  const handleStatusToggle = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u
      )
    );
    setOpenMenu(null);
    setConfirmAction(null);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setOpenMenu(null);
    setConfirmAction(null);
  };

  const handleInvite = () => {
    const newUser: UserRecord = {
      id: `u-${Date.now()}`,
      name: inviteForm.name,
      email: inviteForm.email,
      role: inviteForm.role,
      status: "pending",
      lastLogin: "Never",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setUsers((prev) => [...prev, newUser]);
    setShowInviteModal(false);
    setInviteForm({ name: "", email: "", role: "Developer" });
  };

  const counts = {
    Admin: users.filter((u) => u.role === "Admin").length,
    Operator: users.filter((u) => u.role === "Operator").length,
    Developer: users.filter((u) => u.role === "Developer").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User & Role Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage access control with RBAC — Admin / Operator / Developer</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPermMatrix(!showPermMatrix)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Permission Matrix
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["Admin", "Operator", "Developer"] as Role[]).map((role) => {
          const Icon = roleIcon[role];
          return (
            <div key={role} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
              <div className={`p-2 rounded-lg ${role === "Admin" ? "bg-red-100" : role === "Operator" ? "bg-blue-100" : "bg-green-100"}`}>
                <Icon className={`w-5 h-5 ${role === "Admin" ? "text-red-600" : role === "Operator" ? "text-blue-600" : "text-green-600"}`} />
              </div>
              <div>
                <div className="text-sm text-gray-500">{role}s</div>
                <div className="text-2xl font-semibold text-gray-900">{counts[role]}</div>
                <div className="text-xs text-gray-400 mt-0.5">{ROLE_PERMISSIONS[role].label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permission Matrix (collapsible) */}
      {showPermMatrix && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Permission Matrix
            </h2>
            <button onClick={() => setShowPermMatrix(false)} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Permission</th>
                  {(["Admin", "Operator", "Developer"] as Role[]).map((r) => (
                    <th key={r} className="px-4 py-3 font-medium text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${roleBadgeClass[r]}`}>{r}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  "Create/Edit Jobs",
                  "Delete Jobs",
                  "Manage Workers",
                  "Force Remove Workers",
                  "View Logs",
                  "View Logs (own jobs)",
                  "Manage Users",
                  "Configure Alerts",
                  "Access Audit Logs",
                ].map((perm) => (
                  <tr key={perm} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{perm}</td>
                    {(["Admin", "Operator", "Developer"] as Role[]).map((role) => {
                      const granted =
                        ROLE_PERMISSIONS[role].permissions.includes(perm);
                      const denied = ROLE_PERMISSIONS[role].denied.includes(perm);
                      return (
                        <td key={role} className="px-4 py-3 text-center">
                          {granted ? (
                            <Check className="w-4 h-4 text-green-600 mx-auto" />
                          ) : denied ? (
                            <X className="w-4 h-4 text-red-400 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-56 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Operator">Operator</option>
          <option value="Developer">Developer</option>
        </select>
        <div className="text-sm text-gray-500">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-700">User</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Last Login</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((user) => {
              const RoleIcon = roleIcon[user.role];
              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                        {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-gray-500 text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {editingRole === user.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          defaultValue={user.role}
                          autoFocus
                          onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                          className="px-2 py-1 border border-blue-400 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Operator">Operator</option>
                          <option value="Developer">Developer</option>
                        </select>
                        <button onClick={() => setEditingRole(null)} className="p-0.5 hover:bg-gray-100 rounded">
                          <X className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingRole(user.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${roleBadgeClass[user.role]} hover:opacity-80 transition-opacity`}
                      >
                        <RoleIcon className="w-3 h-3" />
                        {user.role}
                        <ChevronDown className="w-3 h-3 opacity-60" />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusClass[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.lastLogin}</td>
                  <td className="px-4 py-3 text-gray-500">{user.createdAt}</td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      {openMenu === user.id && (
                        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => { setEditingRole(user.id); setOpenMenu(null); }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Shield className="w-4 h-4" /> Change Role
                          </button>
                          <button
                            onClick={() => { setConfirmAction({ userId: user.id, action: user.status === "active" ? "suspend" : "unsuspend" }); setOpenMenu(null); }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            {user.status === "active" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            {user.status === "active" ? "Suspend" : "Unsuspend"}
                          </button>
                          <button
                            onClick={() => setConfirmAction({ userId: user.id, action: "resend" })}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Mail className="w-4 h-4" /> Resend Invite
                          </button>
                          <div className="border-t border-gray-100 my-1" />
                          <button
                            onClick={() => { setConfirmAction({ userId: user.id, action: "delete" }); setOpenMenu(null); }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" /> Remove User
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Confirm Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-900 mb-2">
              {confirmAction.action === "delete" ? "Remove User" :
               confirmAction.action === "suspend" ? "Suspend User" :
               confirmAction.action === "unsuspend" ? "Unsuspend User" : "Resend Invite"}
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              {confirmAction.action === "delete"
                ? "This will permanently remove the user. This action cannot be undone."
                : confirmAction.action === "suspend"
                ? "The user will lose access immediately."
                : confirmAction.action === "unsuspend"
                ? "The user will regain access to the system."
                : "A new invitation email will be sent."}
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction.action === "delete") handleDeleteUser(confirmAction.userId);
                  else if (confirmAction.action === "suspend" || confirmAction.action === "unsuspend") handleStatusToggle(confirmAction.userId);
                  else setConfirmAction(null);
                }}
                className={`px-4 py-2 text-sm text-white rounded-lg ${confirmAction.action === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Invite New User
              </h2>
              <button onClick={() => setShowInviteModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jane@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as Role })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Developer">Developer — Create/Edit jobs, view own logs</option>
                  <option value="Operator">Operator — Manage workers & alerts</option>
                  <option value="Admin">Admin — Full access</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">{ROLE_PERMISSIONS[inviteForm.role].label}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={!inviteForm.name || !inviteForm.email}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
