import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setDone(true);
  }

  if (done) {
    return (
      <div className="max-w-sm mx-auto px-8 py-16 text-center">
        <h1 className="font-display text-2xl mb-3">Check your inbox</h1>
        <p className="text-walnut/70">We've sent a verification link to {email}. Confirm it, then sign in.</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-8 py-16">
      <h1 className="font-display text-3xl mb-6">Become a member</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)}
          className="w-full px-4 py-3 border border-wheat/60 rounded-[4px_14px_4px_14px] bg-white" />
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-wheat/60 rounded-[4px_14px_4px_14px] bg-white" />
        <input type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-wheat/60 rounded-[4px_14px_4px_14px] bg-white" />
        {error && <p className="text-red-700 text-sm">{error}</p>}
        <button disabled={loading} type="submit"
          className="w-full px-6 py-3 bg-lavender text-white rounded-[4px_16px_4px_16px] disabled:opacity-60">
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-sm text-walnut/70">
        Already a member? <Link to="/login" className="text-lavender">Sign in</Link>
      </p>
    </div>
  );
}