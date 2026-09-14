import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Campaign } from "../types";
import { LoadingState, ErrorState } from "../components/States";

export function Donate() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [amount, setAmount] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data } = await api.get("/campaigns");
      setCampaign(data[0] ?? null);
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDonate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/donations", { amount: Number(amount), campaign_id: campaign?.id ?? null, is_recurring_pledge: recurring });
      setMessage("Thank you for your donation!");
      setAmount("");
      load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!campaign) return <LoadingState />;

  const pct = Math.min(100, Math.round((campaign.current_amount / campaign.goal_amount) * 100));

  return (
    <div className="px-8 py-12 max-w-lg mx-auto text-center">
      <h1 className="font-display text-3xl mb-3">{campaign.title}</h1>
      <p className="text-walnut/70">
        R{campaign.current_amount.toLocaleString()} raised of R{campaign.goal_amount.toLocaleString()}
      </p>
      <div className="mt-4 h-4 w-full bg-wheat/30 rounded-full overflow-hidden">
        <div className="h-full bg-lavender rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-walnut/50 mt-2">{pct}% funded</p>

      <form onSubmit={handleDonate} className="mt-10 space-y-4 text-left">
        <label className="block text-sm">
          Amount (ZAR)
          <input type="number" min="1" required value={amount} onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-wheat/60 rounded-[4px_14px_4px_14px] bg-white" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          Adopt a food parcel (recurring pledge)
        </label>
        {error && <p className="text-red-700 text-sm">{error}</p>}
        {message && <p className="text-sage text-sm">{message}</p>}
        <button type="submit" className="w-full px-6 py-3 bg-lavender text-white rounded-[4px_16px_4px_16px]">
          Donate
        </button>
      </form>
    </div>
  );
}