import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/reports", requireAuth, requireRole("staff", "admin"), async (req, res) => {
  const supabase = req.supabase!;
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [bookingsThisMonth, totalDonations, activeMembers] = await Promise.all([
    supabase.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
    supabase.from("donations").select("amount"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("membership_expires_at", new Date().toISOString()),
  ]);

  if (bookingsThisMonth.error) return res.status(500).json({ error: bookingsThisMonth.error.message });
  if (totalDonations.error) return res.status(500).json({ error: totalDonations.error.message });
  if (activeMembers.error) return res.status(500).json({ error: activeMembers.error.message });

  const totalDonationAmount = (totalDonations.data ?? []).reduce((sum, d) => sum + Number(d.amount), 0);

  res.json({
    data: {
      bookingsThisMonth: bookingsThisMonth.count ?? 0,
      totalDonations: totalDonationAmount,
      activeMembers: activeMembers.count ?? 0,
    },
  });
});

export default router;