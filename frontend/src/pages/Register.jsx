import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      await register({ name, email, password });
      navigate("/dashboard");
    } catch (err) {
      console.error("Register error:", err);
      setError(
        err.response?.data?.message || "Failed to register account. Email may already be in use."
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
            Create an Account
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Join OK Driver to report road hazards and track repair status
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-md text-rose-700 text-sm">
            <p className="font-semibold">Registration Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100 text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-amber-600 hover:text-amber-700 underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
