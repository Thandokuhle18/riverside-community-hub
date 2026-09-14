import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { serviceClient } from "../supabaseClient.js";

const router = Router();

router.get("/", async (_req, res) => {
  const { data, error } = await serviceClient.from("resources").select("*").order("name");
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

router.get("/:id/availability", async (req, res) => {
  const { data, error } = await serviceClient
    .from("bookings")
    .select("start_time, end_time, status")
    .eq("resource_id", req.params.id)
    .in("status", ["pending", "approved"])
    .gte("end_time", new Date().toISOString())
    .order("start_time");
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

router.post("/", requireAuth, requireRole("staff", "admin"), async (req, res) => {
  const { name, type, capacity, description } = req.body;
  if (!name || !["room", "equipment"].includes(type)) {
    return res.status(400).json({ error: "name and a valid type ('room' or 'equipment') are required." });
  }
  const { data, error } = await req.supabase!
    .from("resources")
    .insert({ name, type, capacity: capacity ?? null, description: description ?? null })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ data });
});

export default router;