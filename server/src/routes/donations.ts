import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { serviceClient, createUserClient } from "../supabaseClient.js";

const router = Router();
const PAGE_SIZE = 20;

router.post("/", async (req, res) => {
  const { amount, campaign_id, is_recurring_pledge } = req.body;
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: "A positive donation amount is required." });
  }
  let donor_id: string | null = null;
  let client = serviceClient;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const token = header.slice(7);
    const { data } = await serviceClient.auth.getUser(token);
    if (data.user) {
      donor_id = data.user.id;
      client = createUserClient(token) as typeof serviceClient;
    }
  }
  const { data, error } = await client
    .from("donations")
    .insert({ amount, campaign_id: campaign_id ?? null, is_recurring_pledge: !!is_recurring_pledge, donor_id })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ data });
});

router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error, count } = await req.supabase!
    .from("donations")
    .select("*, profiles(full_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, count, page, pageSize: PAGE_SIZE });
});

router.get("/export", requireAuth, requireRole("admin"), async (req, res) => {
  const { data, error } = await req.supabase!
    .from("donations")
    .select("id, amount, campaign_id, is_recurring_pledge, created_at, donor_id")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  const header = "id,amount,campaign_id,is_recurring_pledge,created_at,donor_id\n";
  const rows = (data ?? [])
    .map((d) => [d.id, d.amount, d.campaign_id ?? "", d.is_recurring_pledge, d.created_at, d.donor_id ?? "anonymous"].join(","))
    .join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=donations.csv");
  res.send(header + rows);
});

export default router;