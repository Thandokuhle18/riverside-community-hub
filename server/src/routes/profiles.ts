import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
const PAGE_SIZE = 20;

router.get("/me", requireAuth, async (req, res) => {
  res.json({ data: req.profile });
});

router.patch("/me", requireAuth, async (req, res) => {
  const { full_name, contact_info } = req.body;
  const updates: Record<string, unknown> = {};
  if (typeof full_name === "string" && full_name.trim()) updates.full_name = full_name.trim();
  if (typeof contact_info === "string") updates.contact_info = contact_info;
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "Nothing to update." });
  }
  const { data, error } = await req.supabase!.from("profiles").update(updates).eq("id", req.user!.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

router.get("/", requireAuth, requireRole("staff", "admin"), async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const search = (req.query.search as string) || "";
  const tier = req.query.tier as string | undefined;

  let query = req.supabase!.from("profiles").select("*", { count: "exact" }).order("full_name").range(from, to);
  if (search) query = query.ilike("full_name", `%${search}%`);
  if (tier) query = query.eq("membership_tier", tier);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, count, page, pageSize: PAGE_SIZE });
});

router.patch("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { role, membership_tier, membership_expires_at } = req.body;
  const updates: Record<string, unknown> = {};
  if (role && ["member", "staff", "admin"].includes(role)) updates.role = role;
  if (membership_tier && ["free", "standard", "family"].includes(membership_tier)) updates.membership_tier = membership_tier;
  if (membership_expires_at) updates.membership_expires_at = membership_expires_at;
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "Nothing valid to update." });
  }
  const { data, error } = await req.supabase!.from("profiles").update(updates).eq("id", req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

export default router;