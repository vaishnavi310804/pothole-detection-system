import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email, password });
      
      if (res?.user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-black text-2xl mb-3 shadow-sm">
            OK
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to OK Driver
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Access your pothole reporting & road safety portal
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-md text-rose-700 text-sm">
            <p className="font-semibold">Authentication Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100 text-xs text-slate-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-bold text-amber-600 hover:text-amber-700 underline"
          >
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
