import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Facilities } from "./pages/Facilities";
import { ResourceDetail } from "./pages/ResourceDetail";
import { MyBookings } from "./pages/MyBookings";
import { Profile } from "./pages/Profile";
import { Donate } from "./pages/Donate";
import { AdminDashboard } from "./pages/AdminDashboard";
import { NotFound } from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <div className="min-h-screen bg-cream text-walnut font-body">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/facilities/:id" element={<ResourceDetail />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["staff", "admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}