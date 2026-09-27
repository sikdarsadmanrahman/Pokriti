import { Leaf, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../api/adminApi.js";
import { setCredentials } from "../../app/authSlice.js";

function getLoginErrorMessage(error) {
  const status = error?.status;

  if (status === 400 || status === 401) {
    return "Invalid email or password.";
  }

  if (status === 0) {
    return "Cannot reach the server. Please check your connection and try again.";
  }

  return "Unable to sign in right now. Please try again later.";
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await login({ email, password }).unwrap();
      dispatch(setCredentials(data));
      navigate(location.state?.from?.pathname || "/admin", { replace: true });
    } catch (err) {
      setError(getLoginErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center">
          <Leaf className="mb-2 text-brand-600" size={32} />
          <h1 className="font-display text-xl font-bold text-stone-900">
            Admin Login
          </h1>
          <p className="text-sm text-stone-500">Sign in to manage your store</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="input pl-10"
              />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="input pl-10"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
