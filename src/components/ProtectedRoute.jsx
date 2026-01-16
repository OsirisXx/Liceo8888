import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userRole, isStudent, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-maroon-800 border-t-transparent"></div>
      </div>
    );
  }

  // For student routes
  if (allowedRoles?.includes("student")) {
    if (!user) {
      return <Navigate to="/student-login" state={{ from: location }} replace />;
    }
    if (!isStudent) {
      return <Navigate to="/" replace />;
    }
    return children;
  }

  // For admin/department routes
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-maroon-800 border-t-transparent"></div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
