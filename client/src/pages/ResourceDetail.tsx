import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Resource } from "../types";
import { LoadingState, ErrorState } from "../components/States";

interface Busy { start_time: string; end_time: string; status: string; }

export function ResourceDetail() {
  const { id } = useParams();
  const { session } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [busy, setBusy] = useState<Busy[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [{ data: resources }, { data: availability }] = await Promise.all([
        api.get("/resources"),
        api.get(`/resources/${id}/availability`),
      ]);
      setResource(resources.find((r: Resource) => r.id === id) ?? null);
      setBusy(availability);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/bookings", { resource_id: id, start_time: start, end_time: end });
      setMessage("Booking request sent. Staff will review it.");
      setStart("");
      setEnd("");
      load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (loading) return <LoadingState />;
  if (!resource) return <ErrorState message="This facility could not be found." />;

  return (
    <div className="px-8 py-12 max-w-2xl">
      <span className="text-xs text-sage font-semibold uppercase">{resource.type}</span>
      <h1 className="font-display text-3xl mt-2">{resource.name}</h1>
      <p className="mt-3 text-walnut/70">{resource.description}</p>

      <h2 className="font-display text-xl mt-10 mb-3">Upcoming bookings</h2>
      {busy.length === 0 ? (
        <p className="text-walnut/50 text-sm">No bookings on the calendar yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {busy.map((b, i) => (
            <li key={i} className="flex justify-between border-b border-wheat/30 py-2">
              <span>{new Date(b.start_time).toLocaleString()} – {new Date(b.end_time).toLocaleString()}</span>
              <span className="text-walnut/50 capitalize">{b.status}</span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="font-display text-xl mt-10 mb-3">Request a booking</h2>
      {session ? (
        <form onSubmit={handleBook} className="space-y-4">
          <label className="block text-sm">
            Start
            <input type="datetime-local" required value={start} onChange={(e) => setStart(e.target.value)}
              className="mt-1 w-full px-4 py-3 border border-wheat/60 rounded-[4px_14px_4px_14px] bg-white" />
          </label>
          <label className="block text-sm">
            End
            <input type="datetime-local" required value={end} onChange={(e) => setEnd(e.target.value)}
              className="mt-1 w-full px-4 py-3 border border-wheat/60 rounded-[4px_14px_4px_14px] bg-white" />
          </label>
          {error && <ErrorState message={error} />}
          {message && <p className="text-sage text-sm">{message}</p>}
          <button type="submit" className="px-6 py-3 bg-lavender text-white rounded-[4px_16px_4px_16px]">
            Send request
          </button>
        </form>
      ) : (
        <p className="text-walnut/70 text-sm">Sign in as a member to request a booking.</p>
      )}
    </div>
  );
}