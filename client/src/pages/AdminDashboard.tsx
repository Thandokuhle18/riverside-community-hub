import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";
import { LoadingState, ErrorState, EmptyState } from "../components/States";

type Tab = "pending" | "members" | "donations" | "reports";

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("pending");

  return (
    <div className="px-8 py-12">
      <h1 className="font-display text-3xl mb-8">Admin dashboard</h1>
      <div className="flex gap-4 mb-8 border-b border-wheat/40">
        {(["pending", "members", "donations", "reports"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 px-1 capitalize text-sm ${tab === t ? "border-b-2 border-lavender text-walnut" : "text-walnut/50"}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === "pending" && <PendingBookings />}
      {tab === "members" && <MemberDirectory />}
      {tab === "donations" && <DonationsList />}
      {tab === "reports" && <Reports />}
    </div>
  );
}

function PendingBookings() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data } = await api.get("/bookings/pending?page=1");
      setRows(data);
    } catch (e: any) { setError(e.message); }
  }

  useEffect(() => { load(); }, []);

  async function act(id: string, status: "approved" | "rejected") {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      load();
    } catch (e: any) { setError(e.message); }
  }

  if (error) return <ErrorState message={error} />;
  if (!rows) return <LoadingState />;
  if (rows.length === 0) return <EmptyState message="No pending booking requests." />;

  return (
    <ul className="space-y-3 max-w-2xl">
      {rows.map((b) => (
        <li key={b.id} className="bg-white/60 p-4 border border-wheat/40 rounded-[6px_18px_6px_18px] flex justify-between items-center">
          <div>
            <p className="font-medium">{b.resources.name} — {b.profiles.full_name}</p>
            <p className="text-sm text-walnut/60">
              {new Date(b.start_time).toLocaleString()} – {new Date(b.end_time).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => act(b.id, "approved")} className="text-xs px-3 py-1 bg-sage text-white rounded-full">Approve</button>
            <button onClick={() => act(b.id, "rejected")} className="text-xs px-3 py-1 bg-red-400 text-white rounded-full">Reject</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function MemberDirectory() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data } = await api.get(`/profiles?search=${encodeURIComponent(search)}&page=1`);
      setRows(data);
    } catch (e: any) { setError(e.message); }
  }

  useEffect(() => { load(); }, [search]);

  if (error) return <ErrorState message={error} />;

  return (
    <div className="max-w-2xl">
      <input placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-3 border border-wheat/60 rounded-[4px_14px_4px_14px] bg-white" />
      {!rows ? <LoadingState /> : rows.length === 0 ? <EmptyState message="No members found." /> : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-walnut/50 border-b border-wheat/40">
              <th className="py-2">Name</th><th>Role</th><th>Tier</th><th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-b border-wheat/20">
                <td className="py-2">{m.full_name}</td>
                <td className="capitalize">{m.role}</td>
                <td className="capitalize">{m.membership_tier}</td>
                <td>{new Date(m.joined_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function DonationsList() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/donations?page=1").then((res) => setRows(res.data)).catch((e) => setError(e.message));
  }, []);

  async function exportCsv() {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/donations/export`, {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "donations.csv";
    a.click();
  }

  if (error) return <ErrorState message={error} />;
  if (!rows) return <LoadingState />;

  return (
    <div className="max-w-2xl">
      <button onClick={exportCsv} className="mb-4 px-4 py-2 text-sm bg-walnut text-cream rounded-[4px_14px_4px_14px]">
        Export CSV
      </button>
      {rows.length === 0 ? <EmptyState message="No donations yet." /> : (
        <ul className="space-y-2 text-sm">
          {rows.map((d) => (
            <li key={d.id} className="flex justify-between border-b border-wheat/20 py-2">
              <span>{d.profiles?.full_name ?? "Anonymous"}</span>
              <span>R{Number(d.amount).toLocaleString()}</span>
              <span className="text-walnut/50">{new Date(d.created_at).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Reports() {
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/reports").then((res) => setData(res.data)).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!data) return <LoadingState />;

  return (
    <div className="grid sm:grid-cols-3 gap-5 max-w-2xl">
      <div className="bg-white/60 p-6 border border-wheat/40 rounded-[6px_18px_6px_18px]">
        <p className="text-sm text-walnut/60">Bookings this month</p>
        <p className="font-display text-3xl mt-2">{data.bookingsThisMonth}</p>
      </div>
      <div className="bg-white/60 p-6 border border-wheat/40 rounded-[6px_18px_6px_18px]">
        <p className="text-sm text-walnut/60">Total donations</p>
        <p className="font-display text-3xl mt-2">R{data.totalDonations.toLocaleString()}</p>
      </div>
      <div className="bg-white/60 p-6 border border-wheat/40 rounded-[6px_18px_6px_18px]">
        <p className="text-sm text-walnut/60">Active members</p>
        <p className="font-display text-3xl mt-2">{data.activeMembers}</p>
      </div>
    </div>
  );
}