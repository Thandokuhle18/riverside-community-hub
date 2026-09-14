export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return <p className="text-center py-10 text-walnut/60">{label}</p>;
}

export function ErrorState({ message }: { message: string }) {
  return <p className="text-center py-10 text-red-700">{message}</p>;
}

export function EmptyState({ message }: { message: string }) {
  return <p className="text-center py-10 text-walnut/50">{message}</p>;
}