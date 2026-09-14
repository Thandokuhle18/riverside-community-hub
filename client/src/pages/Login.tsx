import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    navigate("/");
  }

  return (
    <div className="max-w-sm mx-auto px-8 py-16">
      <h1 className="font-display text-3xl mb-6">Sign in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-wheat/60 rounded-[4px_14px_4px_14px] bg-white" />
        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-wheat/60 rounded-[4px_14px_4px_14px] bg-white" />
        {error && <p className="text-red-700 text-sm">{error}</p>}
        <button disabled={loading} type="submit"
          className="w-full px-6 py-3 bg-lavender text-white rounded-[4px_16px_4px_16px] disabled:opacity-60">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-walnut/70">
        No account yet? <Link to="/signup" className="text-lavender">Sign up</Link>
      </p>
    </div>
  );
}