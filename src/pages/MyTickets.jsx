import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  Ticket,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  RefreshCw,
  FileText,
  Calendar,
  Tag,
  ChevronDown,
  Shield,
  AlertTriangle,
  Lock,
} from "lucide-react";

const MyTickets = () => {
  const navigate = useNavigate();
  const { user, isStudent, studentProfile, loading: authLoading } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const statusConfig = {
    submitted: {
      label: "Submitted",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: FileText,
      dotColor: "bg-blue-500",
    },
    verified: {
      label: "Verified",
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle,
      dotColor: "bg-green-500",
    },
    rejected: {
      label: "Rejected",
      color: "bg-red-100 text-red-700 border-red-200",
      icon: XCircle,
      dotColor: "bg-red-500",
    },
    in_progress: {
      label: "In Progress",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: Clock,
      dotColor: "bg-yellow-500",
    },
    resolved: {
      label: "Resolved",
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: CheckCircle,
      dotColor: "bg-emerald-500",
    },
    closed: {
      label: "Closed",
      color: "bg-gray-100 text-gray-700 border-gray-200",
      icon: Lock,
      dotColor: "bg-gray-500",
    },
    disputed: {
      label: "Disputed",
      color: "bg-amber-100 text-amber-700 border-amber-200",
      icon: AlertTriangle,
      dotColor: "bg-amber-500",
    },
  };

  const statusFilters = [
    { value: "all", label: "All Tickets" },
    { value: "submitted", label: "Submitted" },
    { value: "verified", label: "Verified" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
    { value: "disputed", label: "Disputed" },
    { value: "rejected", label: "Rejected" },
  ];

  useEffect(() => {
    if (!authLoading && (!user || !isStudent)) {
      navigate("/student-login", { replace: true });
    }
  }, [user, isStudent, authLoading, navigate]);

  // Fetch complaints - only those created while logged in (by user_id)
  const fetchMyComplaints = useCallback(async () => {
    if (!user?.id) return;
    
    // Only show loading spinner on initial load
    if (!initialLoadDone) {
      setLoading(true);
    }
    
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("user_id", user.id) // Filter by user_id, NOT email
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
      setInitialLoadDone(true);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, initialLoadDone]);

  // Initial fetch and realtime subscription
  useEffect(() => {
    if (!user?.id || !isStudent) {
      // If not authenticated or not a student, stop loading
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchMyComplaints();

    // Fallback timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 10000);

    // Set up realtime subscription for this user's complaints
    const subscription = supabase
      .channel(`user-complaints-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "complaints",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Handle realtime updates
          if (payload.eventType === "INSERT") {
            setComplaints((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setComplaints((prev) =>
              prev.map((c) => (c.id === payload.new.id ? payload.new : c))
            );
          } else if (payload.eventType === "DELETE") {
            setComplaints((prev) =>
              prev.filter((c) => c.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscription and timeout on unmount
    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, [user?.id, isStudent, fetchMyComplaints]);

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesStatus =
      filterStatus === "all" || complaint.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      complaint.reference_number
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStats = () => {
    const stats = {
      total: complaints.length,
      active: complaints.filter(
        (c) => !["closed", "rejected"].includes(c.status)
      ).length,
      resolved: complaints.filter((c) => c.status === "resolved").length,
      closed: complaints.filter((c) => c.status === "closed").length,
    };
    return stats;
  };

  const stats = getStats();

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-maroon-800 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Ticket className="text-maroon-800" />
                My Tickets
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {studentProfile?.full_name || user?.email}
              </p>
            </div>
            <button
              onClick={fetchMyComplaints}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-maroon-800 text-white rounded-lg hover:bg-maroon-700 transition-colors"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="text-blue-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.active}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.resolved}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Closed</p>
                <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Lock className="text-gray-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by reference number or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 outline-none transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 outline-none transition-all appearance-none bg-white min-w-[160px]"
              >
                {statusFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-maroon-800 border-t-transparent"></div>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {complaints.length === 0 ? "No tickets yet" : "No matching tickets"}
            </h3>
            <p className="text-gray-500 mb-6">
              {complaints.length === 0
                ? "You haven't submitted any complaints yet."
                : "Try adjusting your search or filters."}
            </p>
            {complaints.length === 0 && (
              <button
                onClick={() => navigate("/submit")}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-maroon-800 text-white rounded-lg hover:bg-maroon-700 transition-colors"
              >
                <FileText size={18} />
                <span>Submit a Complaint</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => {
              const status = statusConfig[complaint.status] || statusConfig.submitted;
              const StatusIcon = status.icon;

              return (
                <div
                  key={complaint.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left side */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm font-semibold text-maroon-800 bg-maroon-50 px-2 py-1 rounded">
                            {complaint.reference_number}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}
                          >
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                        </div>

                        <p className="text-gray-900 font-medium mb-2 line-clamp-2">
                          {complaint.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Tag size={14} />
                            <span className="capitalize">{complaint.category}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span>{formatDate(complaint.created_at)}</span>
                          </div>
                          {complaint.assigned_department && (
                            <div className="flex items-center gap-1.5">
                              <Shield size={14} />
                              <span className="capitalize">
                                {complaint.assigned_department.replace("_", " ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right side - Action */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => navigate(`/ticket/${complaint.reference_number}`)}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-maroon-800 text-white rounded-lg hover:bg-maroon-700 transition-colors text-sm font-medium"
                        >
                          <Eye size={16} />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status indicator bar */}
                  <div className={`h-1 ${status.dotColor}`}></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
