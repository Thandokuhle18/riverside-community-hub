import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export function Profile() {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [contact, setContact] = useState(profile?.contact_info ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!profile) return null;

  const expiresAt = new Date(profile.membership_expires_at);
  const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const expiringSoon = daysLeft <= 30 && daysLeft >= 0;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.patch("/profiles/me", { full_name: fullName, contact_info: contact });
      await refreshProfile();
      setMessage("Profile updated.");
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="px-8 py-12 max-w-md">
      <h1 className="font-display text-3xl mb-6">My profile</h1>

      <div className="bg-white/60 p-5 border border-wheat/40 rounded-[6px_18px_6px_18px] mb-8">
        <p className="text-sm text-walnut/60">Membership tier</p>
        <p className="font-display text-lg capitalize">{profile.membership_tier}</p>
        <p className="text-sm text-walnut/60 mt-3">Joined</p>
        <p>{new Date(profile.joined_at).toLocaleDateString()}</p>
        <p className="text-sm text-walnut/60 mt-3">Membership status</p>
        <p className={expiringSoon ? "text-red-700" : "text-sage"}>
          {expiringSoon ? `Expiring soon — ${daysLeft} day(s) left` : `Active until ${expiresAt.toLocaleDateString()}`}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <label className="block text-sm">
          Full name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-wheat/60 rounded-[4px_14px_4px_14px] bg-white" />
        </label>
        <label className="block text-sm">
          Contact info
          <input value={contact} onChange={(e) => setContact(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-wheat/60 rounded-[4px_14px_4px_14px] bg-white" />
        </label>
        {error && <p className="text-red-700 text-sm">{error}</p>}
        {message && <p className="text-sage text-sm">{message}</p>}
        <button type="submit" className="px-6 py-3 bg-lavender text-white rounded-[4px_16px_4px_16px]">
          Save changes
        </button>
      </form>
    </div>
  );
}