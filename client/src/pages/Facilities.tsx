import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Resource } from "../types";
import { LoadingState, ErrorState, EmptyState } from "../components/States";

export function Facilities() {
  const [resources, setResources] = useState<Resource[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/resources").then((res) => setResources(res.data)).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="px-8 py-12">
      <h1 className="font-display text-3xl mb-8">Facilities & equipment</h1>
      {error && <ErrorState message={error} />}
      {!error && !resources && <LoadingState />}
      {resources && resources.length === 0 && <EmptyState message="No facilities are listed yet." />}
      {resources && resources.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((r) => (
            <Link key={r.id} to={`/facilities/${r.id}`}
              className="block bg-white/60 p-6 border border-wheat/40 rounded-[6px_18px_6px_18px] hover:border-lavender">
              <span className="text-xs text-sage font-semibold uppercase">{r.type}</span>
              <h2 className="font-display text-lg mt-2">{r.name}</h2>
              {r.capacity && <p className="text-sm text-walnut/60 mt-1">Capacity: {r.capacity}</p>}
              <p className="text-sm text-walnut/70 mt-2">{r.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}