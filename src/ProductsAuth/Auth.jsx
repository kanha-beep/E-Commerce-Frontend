import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../../api.js";
import {
  AccentButton,
  InlineAlert,
  Panel,
  SecondaryButton,
  TextInput,
} from "../components/ui.jsx";

export default function Auth({ setIsLoggedIn, setUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
  }, [isLogin]);

  const handleChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await api.post(endpoint, payload);
      setAuthToken(res.data.token);
      setUser(res.data.user);
      setIsLoggedIn(true);

      const redirectUrl = location.state?.url || location.state?.reviewUrl || "/";
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      setAuthToken("");
      setIsLoggedIn(false);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          `${isLogin ? "Login" : "Registration"} failed`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-180px)] place-items-center">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.25),_transparent_28%),linear-gradient(135deg,_#0f172a,_#1e293b_58%,_#111827)] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
          <div className="max-w-xl">
            <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">
              Account access
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight">
              Sign in to shop, review, and sell with a better storefront.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              We’ve moved this experience to a cleaner Tailwind-based layout with a more premium browsing flow, better product presentation, and a stronger base for the next set of innovations.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <InfoTile label="Cart ready" value="Persistent session" />
            <InfoTile label="Reviews" value="Write and edit feedback" />
            <InfoTile label="Seller mode" value="List products fast" />
          </div>
        </section>

        <Panel className="self-center">
          <div className="mb-6 flex rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                isLogin ? "bg-white text-slate-950 shadow" : "text-slate-500"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                !isLogin ? "bg-white text-slate-950 shadow" : "text-slate-500"
              }`}
            >
              Sign up
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-black text-slate-950">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {isLogin
                ? "Continue where you left off."
                : "Set up an account to start shopping and selling."}
            </p>
          </div>

          {error ? <InlineAlert>{error}</InlineAlert> : null}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {!isLogin ? (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Username</label>
                <TextInput
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required={!isLogin}
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <TextInput
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <TextInput
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                minLength={6}
                required
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <AccentButton type="submit" disabled={loading} className="flex-1">
                {loading
                  ? isLogin
                    ? "Logging in..."
                    : "Creating account..."
                  : isLogin
                    ? "Login"
                    : "Sign up"}
              </AccentButton>
              <SecondaryButton
                type="button"
                onClick={() => setIsLogin((current) => !current)}
                className="flex-1"
              >
                {isLogin ? "Need an account?" : "Already registered?"}
              </SecondaryButton>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
    </div>
  );
}
