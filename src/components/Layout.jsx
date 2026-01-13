import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Home,
  Search,
  LogOut,
  Shield,
  Building2,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

const Layout = ({ children }) => {
  const { user, userRole, userDepartment, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const publicLinks = user
    ? []
    : [
        { path: "/", label: "Home", icon: Home },
        { path: "/track", label: "Track Status", icon: Search },
      ];

  const superAdminLinks = [
    { path: "/super-admin", label: "Super Admin", icon: Shield },
  ];

  const adminLinks = [
    { path: "/admin", label: "Admin Dashboard", icon: Shield },
  ];

  const departmentLinks = [
    { path: "/department", label: "Department Dashboard", icon: Building2 },
  ];

  const fetchNotifications = async () => {
    if (!user || !userRole) return;

    try {
      let notifs = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (userRole === "super_admin") {
        const { data: auditData } = await supabase
          .from("system_audit_log")
          .select("*")
          .gte("created_at", today.toISOString())
          .order("created_at", { ascending: false })
          .limit(10);

        if (auditData) {
          notifs = auditData.map((a) => ({
            id: a.id,
            type: "audit",
            title: a.action,
            message: a.actor_email || "System",
            time: a.created_at,
            read: false,
          }));
        }
      } else if (userRole === "admin") {
        const { data: pendingComplaints } = await supabase
          .from("complaints")
          .select("id, reference_number, category, created_at")
          .eq("status", "submitted")
          .order("created_at", { ascending: false })
          .limit(10);

        if (pendingComplaints) {
          notifs = pendingComplaints.map((c) => ({
            id: c.id,
            type: "complaint",
            title: "New Complaint",
            message: `${c.reference_number} - ${c.category}`,
            time: c.created_at,
            read: false,
          }));
        }
      } else if (userRole === "department" && userDepartment) {
        const { data: assignedComplaints } = await supabase
          .from("complaints")
          .select("id, reference_number, category, created_at, status")
          .eq("assigned_department", userDepartment)
          .in("status", ["verified", "in_progress"])
          .order("created_at", { ascending: false })
          .limit(10);

        if (assignedComplaints) {
          notifs = assignedComplaints.map((c) => ({
            id: c.id,
            type: "assigned",
            title: c.status === "verified" ? "New Assignment" : "In Progress",
            message: `${c.reference_number} - ${c.category}`,
            time: c.created_at,
            read: false,
          }));
        }
      }

      setNotifications(notifs);
      setUnreadCount(notifs.length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    if (user && userRole) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, userRole, userDepartment]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-maroon-800 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - always on left */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-maroon-800 font-bold text-sm sm:text-lg">
                  L
                </span>
              </div>
              <div>
                <h1 className="text-sm sm:text-lg font-bold">Liceo 8888</h1>
                <p className="text-[10px] sm:text-xs text-gold-300">
                  Complaint Management System
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {publicLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive(path)
                      ? "bg-gold-500 text-maroon-800 font-semibold"
                      : "hover:bg-maroon-700 text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}

              {user &&
                userRole === "super_admin" &&
                superAdminLinks.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive(path)
                        ? "bg-gold-500 text-maroon-800 font-semibold"
                        : "hover:bg-maroon-700 text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                ))}

              {user &&
                userRole === "admin" &&
                adminLinks.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive(path)
                        ? "bg-gold-500 text-maroon-800 font-semibold"
                        : "hover:bg-maroon-700 text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                ))}

              {user &&
                userRole === "department" &&
                departmentLinks.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive(path)
                        ? "bg-gold-500 text-maroon-800 font-semibold"
                        : "hover:bg-maroon-700 text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                ))}

              {user && (
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg hover:bg-maroon-700 transition-all duration-200"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 text-maroon-800 text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">
                          Notifications
                        </h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500">
                            <Bell
                              size={24}
                              className="mx-auto mb-2 text-gray-300"
                            />
                            <p className="text-sm">No notifications</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                            >
                              <p className="font-medium text-gray-900 text-sm">
                                {notif.title}
                              </p>
                              <p className="text-gray-600 text-xs truncate">
                                {notif.message}
                              </p>
                              <p className="text-gray-400 text-xs mt-1">
                                {formatNotificationTime(notif.time)}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {user && (
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-maroon-700 transition-all duration-200"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={(e) => {
                e.currentTarget.blur();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="md:hidden p-2 rounded-lg hover:bg-maroon-700 transition-colors focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Overlay */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Menu panel */}
            <div className="md:hidden fixed top-16 left-0 right-0 bg-maroon-900 border-t border-maroon-700 z-50 shadow-xl animate-slide-down">
              <nav className="px-4 py-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
                {publicLinks.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(path)
                        ? "bg-gold-500 text-maroon-800 font-semibold"
                        : "hover:bg-maroon-700 text-white"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </Link>
                ))}

                {user &&
                  userRole === "super_admin" &&
                  superAdminLinks.map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive(path)
                          ? "bg-gold-500 text-maroon-800 font-semibold"
                          : "hover:bg-maroon-700 text-white"
                      }`}
                    >
                      <Icon size={20} />
                      <span>{label}</span>
                    </Link>
                  ))}

                {user &&
                  userRole === "admin" &&
                  adminLinks.map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive(path)
                          ? "bg-gold-500 text-maroon-800 font-semibold"
                          : "hover:bg-maroon-700 text-white"
                      }`}
                    >
                      <Icon size={20} />
                      <span>{label}</span>
                    </Link>
                  ))}

                {user &&
                  userRole === "department" &&
                  departmentLinks.map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive(path)
                          ? "bg-gold-500 text-maroon-800 font-semibold"
                          : "hover:bg-maroon-700 text-white"
                      }`}
                    >
                      <Icon size={20} />
                      <span>{label}</span>
                    </Link>
                  ))}

                {user && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-maroon-700 transition-all duration-200 w-full text-left"
                  >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                  </button>
                )}
              </nav>
            </div>
          </>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-maroon-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center">
                <span className="text-maroon-800 font-bold text-sm">L</span>
              </div>
              <div>
                <p className="font-semibold">Liceo de Cagayan University</p>
                <p className="text-sm text-gray-400">
                  Complaint Management System
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} Liceo 8888. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
