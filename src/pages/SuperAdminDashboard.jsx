import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  Shield,
  Users,
  FileText,
  Search,
  Filter,
  Eye,
  X,
  RefreshCw,
  UserPlus,
  Trash2,
  Edit3,
  Globe,
  Clock,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  Monitor,
  Smartphone,
} from "lucide-react";

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("accounts");
  const [users, setUsers] = useState([]);
  const [complaintSubmissions, setComplaintSubmissions] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("today");

  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
    role: "admin",
    department: "",
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const roles = [
    { value: "super_admin", label: "Super Admin" },
    { value: "admin", label: "Office Admin" },
    { value: "department", label: "Department Staff" },
  ];

  const departments = [
    { value: "academic", label: "Academic Affairs" },
    { value: "facilities", label: "Facilities Management" },
    { value: "finance", label: "Finance Office" },
    { value: "hr", label: "Human Resources" },
    { value: "security", label: "Security Office" },
    { value: "registrar", label: "Registrar" },
    { value: "student_affairs", label: "Student Affairs" },
  ];

  const dateRanges = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "all", label: "All Time" },
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab, filterDateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "accounts") {
        await fetchUsers();
      } else if (activeTab === "submissions") {
        await fetchComplaintSubmissions();
      } else if (activeTab === "audit") {
        await fetchAuditLog();
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
  };

  const fetchComplaintSubmissions = async () => {
    let query = supabase
      .from("complaint_submissions")
      .select(
        `
        *,
        complaints (
          id,
          reference_number,
          category,
          status,
          name
        )
      `
      )
      .order("created_at", { ascending: false });

    const dateFilter = getDateFilter();
    if (dateFilter) {
      query = query.gte("created_at", dateFilter);
    }

    const { data, error } = await query.limit(100);

    if (!error && data) {
      setComplaintSubmissions(data);
    }
  };

  const fetchAuditLog = async () => {
    let query = supabase
      .from("system_audit_log")
      .select("*")
      .order("created_at", { ascending: false });

    const dateFilter = getDateFilter();
    if (dateFilter) {
      query = query.gte("created_at", dateFilter);
    }

    const { data, error } = await query.limit(100);

    if (!error && data) {
      setAuditLog(data);
    }
  };

  const getDateFilter = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filterDateRange === "today") {
      return today.toISOString();
    } else if (filterDateRange === "week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return weekAgo.toISOString();
    } else if (filterDateRange === "month") {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return monthAgo.toISOString();
    }
    return null;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      if (userForm.role === "department" && !userForm.department) {
        setFormError("Please select a department for department staff");
        setFormLoading(false);
        return;
      }

      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: userForm.email,
          password: userForm.password,
          email_confirm: true,
        });

      if (authError) {
        setFormError(authError.message);
        setFormLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: userForm.email,
        role: userForm.role,
        department: userForm.role === "department" ? userForm.department : null,
      });

      if (insertError) {
        setFormError(insertError.message);
        setFormLoading(false);
        return;
      }

      await logAction("User Created", "user", authData.user.id, {
        email: userForm.email,
        role: userForm.role,
        department: userForm.department,
      });

      setShowUserModal(false);
      setUserForm({ email: "", password: "", role: "admin", department: "" });
      fetchUsers();
    } catch (err) {
      setFormError(err.message || "Failed to create user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUserRole = async (
    userId,
    newRole,
    newDepartment = null
  ) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          role: newRole,
          department: newRole === "department" ? newDepartment : null,
        })
        .eq("id", userId);

      if (!error) {
        await logAction("User Role Updated", "user", userId, {
          newRole,
          newDepartment,
        });
        fetchUsers();
      }
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail}?`)) {
      return;
    }

    try {
      const { error } = await supabase.from("users").delete().eq("id", userId);

      if (!error) {
        await logAction("User Deleted", "user", userId, { email: userEmail });
        fetchUsers();
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const logAction = async (action, targetType, targetId, details) => {
    try {
      await supabase.from("system_audit_log").insert({
        action,
        actor_id: user?.id,
        actor_email: user?.email,
        target_type: targetType,
        target_id: targetId,
        details,
      });
    } catch (err) {
      console.error("Error logging action:", err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDeviceIcon = (userAgent) => {
    if (!userAgent) return Monitor;
    const ua = userAgent.toLowerCase();
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    ) {
      return Smartphone;
    }
    return Monitor;
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const groupedSubmissions = complaintSubmissions.reduce((acc, sub) => {
    const ip = sub.ip_address;
    if (!acc[ip]) {
      acc[ip] = {
        ip_address: ip,
        submissions: [],
        user_agent: sub.user_agent,
        first_submission: sub.created_at,
        last_submission: sub.created_at,
      };
    }
    acc[ip].submissions.push(sub);
    if (new Date(sub.created_at) > new Date(acc[ip].last_submission)) {
      acc[ip].last_submission = sub.created_at;
    }
    return acc;
  }, {});

  const ipSubmissionsList = Object.values(groupedSubmissions);

  return (
    <div className="min-h-[calc(100vh-200px)] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-maroon-800 rounded-xl flex items-center justify-center">
              <Shield size={24} className="text-gold-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Super Admin Dashboard
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                System administration and monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6 overflow-x-auto">
          <div className="flex min-w-max">
            <button
              onClick={() => setActiveTab("accounts")}
              className={`flex items-center space-x-2 px-4 sm:px-6 py-4 font-medium transition-colors ${
                activeTab === "accounts"
                  ? "text-maroon-800 border-b-2 border-maroon-800 bg-maroon-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Users size={18} />
              <span>Account Management</span>
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`flex items-center space-x-2 px-4 sm:px-6 py-4 font-medium transition-colors ${
                activeTab === "submissions"
                  ? "text-maroon-800 border-b-2 border-maroon-800 bg-maroon-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Globe size={18} />
              <span>IP Submissions</span>
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`flex items-center space-x-2 px-4 sm:px-6 py-4 font-medium transition-colors ${
                activeTab === "audit"
                  ? "text-maroon-800 border-b-2 border-maroon-800 bg-maroon-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Activity size={18} />
              <span>Audit Log</span>
            </button>
          </div>
        </div>

        {/* Account Management Tab */}
        {activeTab === "accounts" && (
          <div className="space-y-6">
            {/* Filters & Actions */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by email or role..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 outline-none bg-white text-sm"
                  >
                    <option value="all">All Roles</option>
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowUserModal(true)}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-maroon-800 text-white rounded-lg hover:bg-maroon-700 transition-colors text-sm font-medium"
                  >
                    <UserPlus size={18} />
                    <span className="hidden sm:inline">Add User</span>
                  </button>
                  <button
                    onClick={fetchUsers}
                    className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="space-y-4">
              {loading ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-maroon-800 border-t-transparent mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
                  <Users size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-maroon-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users size={24} className="text-maroon-800" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {u.email}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                u.role === "super_admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : u.role === "admin"
                                  ? "bg-maroon-100 text-maroon-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {roles.find((r) => r.value === u.role)?.label ||
                                u.role}
                            </span>
                            {u.department && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                                {u.department.replace("_", " ")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleUpdateUserRole(u.id, e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                          disabled={u.id === user?.id}
                        >
                          {roles.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                        {u.id !== user?.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      Created: {formatDate(u.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* IP Submissions Tab */}
        {activeTab === "submissions" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2">
                  <Filter size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-500">Filter:</span>
                </div>
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 outline-none bg-white text-sm"
                >
                  {dateRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={fetchComplaintSubmissions}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw size={18} className="text-gray-600" />
                </button>
                <span className="text-sm text-gray-500 ml-auto">
                  {ipSubmissionsList.length} unique IP
                  {ipSubmissionsList.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* IP Submissions List */}
            <div className="space-y-4">
              {loading ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-maroon-800 border-t-transparent mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading submissions...</p>
                </div>
              ) : ipSubmissionsList.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
                  <Globe size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No submissions found for this period
                  </p>
                </div>
              ) : (
                ipSubmissionsList.map((ipData) => {
                  const DeviceIcon = getDeviceIcon(ipData.user_agent);
                  return (
                    <div
                      key={ipData.ip_address}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                    >
                      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <DeviceIcon size={20} className="text-blue-800" />
                          </div>
                          <div>
                            <p className="font-mono font-semibold text-gray-900">
                              {ipData.ip_address}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {ipData.user_agent?.substring(0, 50)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                              ipData.submissions.length > 1
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {ipData.submissions.length} submission
                            {ipData.submissions.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <div className="px-4 sm:px-6 py-4">
                        <div className="space-y-2">
                          {ipData.submissions.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <FileText size={16} className="text-gray-400" />
                                <div>
                                  <p className="font-mono text-sm text-maroon-800">
                                    {sub.complaints?.reference_number ||
                                      "Unknown"}
                                  </p>
                                  <p className="text-xs text-gray-500 capitalize">
                                    {sub.complaints?.category} -{" "}
                                    {sub.complaints?.status}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDate(sub.created_at)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2">
                  <Filter size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-500">Filter:</span>
                </div>
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 outline-none bg-white text-sm"
                >
                  {dateRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={fetchAuditLog}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw size={18} className="text-gray-600" />
                </button>
                <span className="text-sm text-gray-500 ml-auto">
                  {auditLog.length} event{auditLog.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Audit Log List */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-maroon-800 border-t-transparent mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading audit log...</p>
                </div>
              ) : auditLog.length === 0 ? (
                <div className="p-12 text-center">
                  <Activity size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No audit events found for this period
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {auditLog.map((entry) => (
                    <div
                      key={entry.id}
                      className="px-4 sm:px-6 py-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-maroon-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Activity size={16} className="text-maroon-800" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <p className="font-medium text-gray-900">
                              {entry.action}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatDate(entry.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            By: {entry.actor_email || "System"}
                          </p>
                          {entry.details && (
                            <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                              <pre className="text-xs text-gray-600 overflow-x-auto">
                                {JSON.stringify(entry.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Add New User
                </h2>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setUserForm({
                      email: "",
                      password: "",
                      role: "admin",
                      department: "",
                    });
                    setFormError("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                    <AlertCircle
                      size={18}
                      className="text-red-500 flex-shrink-0 mt-0.5"
                    />
                    <p className="text-red-700 text-sm">{formError}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm({ ...userForm, email: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 outline-none"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) =>
                      setUserForm({ ...userForm, password: e.target.value })
                    }
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 outline-none"
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) =>
                      setUserForm({ ...userForm, role: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 outline-none bg-white"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                {userForm.role === "department" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      value={userForm.department}
                      onChange={(e) =>
                        setUserForm({ ...userForm, department: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 outline-none bg-white"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-maroon-800 text-white py-3 px-4 rounded-xl font-semibold hover:bg-maroon-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {formLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      <span>Create User</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
