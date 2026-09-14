import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";

export function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: UserRole[] }) {
  const { session, profile, loading } = useAuth();

  if (loading) return <div className="p-8 text-center text-walnut">Loading…</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (roles && (!profile || !roles.includes(profile.role))) return <Navigate to="/" replace />;
  return <>{children}</>;
}