import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { AlertCircle, ShieldAlert } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [wrongRole, setWrongRole] = useState(null); // stores the formatted role name
  const hasRun = useRef(false); // prevent double-execution

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (hasRun.current) return;
      hasRun.current = true;

      try {
        // Wait briefly for the session to be established after the OAuth redirect
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        if (!session?.user) {
          // No session yet — listen for SIGNED_IN event
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (event === "SIGNED_IN" && newSession?.user) {
              subscription.unsubscribe();
              await processSession(newSession);
            }
          });
          return;
        }

        await processSession(session);
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("An error occurred during authentication. Please try again.");
      }
    };

    const processSession = async (session) => {
      const email = session.user.email || "";

      // Verify email domain
      if (!email.endsWith("@liceo.edu.ph")) {
        await supabase.auth.signOut();
        setError("Only Liceo de Cagayan University students (@liceo.edu.ph) can sign in.");
        return;
      }

      // Check if this account belongs to a staff/admin user (exists in the 'users' table)
      const { data: userData, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle(); // maybeSingle() returns null instead of error when no rows found

      console.log("Role check:", { userData, roleError });

      if (userData && userData.role && userData.role !== 'student') {
        // This is a staff/admin account — block and sign out
        const formatRole = (role) =>
          role.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

        await supabase.auth.signOut();
        setWrongRole(formatRole(userData.role));
        return;
      }

      // It's a valid student — proceed
      navigate("/my-tickets", { replace: true });
    };

    handleAuthCallback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Wrong role error screen
  if (wrongRole) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-amber-100 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={32} className="text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Wrong Portal
            </h2>
            <p className="text-gray-600 mb-6">
              Your account is a <span className="font-semibold text-amber-700">{wrongRole}</span>. Please login through the correct channels.
            </p>
            <button
              onClick={() => navigate("/student-login")}
              className="w-full bg-maroon-800 text-white py-3 px-4 rounded-xl font-semibold hover:bg-maroon-700 transition-all duration-200"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Generic error screen
  if (error) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Authentication Error
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/student-login")}
              className="w-full bg-maroon-800 text-white py-3 px-4 rounded-xl font-semibold hover:bg-maroon-700 transition-all duration-200"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-maroon-800 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
