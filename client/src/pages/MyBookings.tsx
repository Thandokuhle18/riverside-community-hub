import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { LoadingState, ErrorState, EmptyState } from "../components/States";

interface BookingRow {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  resources: { name: string; type: string };
}

const statusColors: Record<string, string> = {
  pending: "bg-wheat/30 text-walnut",
  approved: "bg-sage/30 text-walnut",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-walnut/10 text-walnut/60",
};

export function MyBookings() {
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data } = await api.get("/bookings/mine");
      setBookings(data);
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function cancel(id: string) {
    try {
      await api.patch(`/bookings/${id}/cancel`, {});
      load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!bookings) return <LoadingState />;

  return (
    <div className="px-8 py-12 max-w-2xl">
      <h1 className="font-display text-3xl mb-8">My bookings</h1>
      {bookings.length === 0 ? (
        <EmptyState message="You haven't requested any bookings yet." />
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id} className="bg-white/60 p-4 border border-wheat/40 rounded-[6px_18px_6px_18px] flex justify-between items-center">
              <div>
                <p className="font-medium">{b.resources.name}</p>
                <p className="text-sm text-walnut/60">
                  {new Date(b.start_time).toLocaleString()} – {new Date(b.end_time).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[b.status]}`}>{b.status}</span>
                {(b.status === "pending" || b.status === "approved") && (
                  <button onClick={() => cancel(b.id)} className="text-xs text-red-700 underline">Cancel</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}