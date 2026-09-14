import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between px-8 py-6">
      <Link to="/" className="font-display text-xl text-walnut">
        Riverside <span className="text-lavender">Community Hub</span>
      </Link>
      <div className="flex items-center gap-6 text-sm text-walnut/80">
        <Link to="/facilities" className="hover:text-lavender">Facilities</Link>
        <Link to="/donate" className="hover:text-lavender">Donate</Link>
        {session && <Link to="/bookings" className="hover:text-lavender">My bookings</Link>}
        {session && <Link to="/profile" className="hover:text-lavender">Profile</Link>}
        {profile && (profile.role === "staff" || profile.role === "admin") && (
          <Link to="/admin" className="hover:text-lavender">Admin</Link>
        )}
        {session ? (
          <button
            onClick={async () => { await signOut(); navigate("/"); }}
            className="px-4 py-2 rounded-[4px_14px_4px_14px] bg-walnut text-cream"
          >
            Sign out
          </button>
        ) : (
          <Link to="/login" className="px-4 py-2 rounded-[4px_14px_4px_14px] bg-walnut text-cream">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}