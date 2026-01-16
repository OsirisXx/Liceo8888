import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { AlertCircle } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        if (session?.user) {
          const email = session.user.email || "";
          
          // Verify email domain
          if (!email.endsWith("@liceo.edu.ph")) {
            // Sign out the user if not a Liceo email
            await supabase.auth.signOut();
            setError("Only Liceo de Cagayan University students (@liceo.edu.ph) can sign in.");
            return;
          }

          // Redirect to my-tickets page
          navigate("/my-tickets", { replace: true });
        } else {
          // No session, redirect to login
          navigate("/student-login", { replace: true });
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("An error occurred during authentication. Please try again.");
      }
    };

    handleAuthCallback();
  }, [navigate]);

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
