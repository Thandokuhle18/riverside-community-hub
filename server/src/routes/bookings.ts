import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
const PAGE_SIZE = 20;

router.post("/", requireAuth, async (req, res) => {
  const { resource_id, start_time, end_time } = req.body;
  if (!resource_id || !start_time || !end_time) {
    return res.status(400).json({ error: "resource_id, start_time and end_time are required." });
  }
  if (new Date(end_time) <= new Date(start_time)) {
    return res.status(400).json({ error: "end_time must be after start_time." });
  }
  const { data, error } = await req.supabase!
    .from("bookings")
    .insert({ resource_id, start_time, end_time, member_id: req.user!.id })
    .select()
    .single();
  if (error) {
    if (error.code === "23P01") {
      return res.status(409).json({ error: "That resource is already booked for the selected time." });
    }
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json({ data });
});

router.get("/mine", requireAuth, async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error, count } = await req.supabase!
    .from("bookings")
    .select("*, resources(name, type)", { count: "exact" })
    .eq("member_id", req.user!.id)
    .order("start_time", { ascending: false })
    .range(from, to);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, count, page, pageSize: PAGE_SIZE });
});

router.patch("/:id/cancel", requireAuth, async (req, res) => {
  const { data, error } = await req.supabase!
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", req.params.id)
    .eq("member_id", req.user!.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Booking not found." });
  res.json({ data });
});

router.get("/pending", requireAuth, requireRole("staff", "admin"), async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error, count } = await req.supabase!
    .from("bookings")
    .select("*, resources(name, type), profiles(full_name)", { count: "exact" })
    .eq("status", "pending")
    .order("start_time")
    .range(from, to);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, count, page, pageSize: PAGE_SIZE });
});

router.patch("/:id/status", requireAuth, requireRole("staff", "admin"), async (req, res) => {
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "status must be 'approved' or 'rejected'." });
  }
  const { data, error } = await req.supabase!
    .from("bookings")
    .update({ status })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

export default router;