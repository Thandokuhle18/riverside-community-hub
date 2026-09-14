import { Router } from "express";
import { serviceClient } from "../supabaseClient.js";

const router = Router();

router.get("/", async (_req, res) => {
  const { data, error } = await serviceClient.from("campaigns").select("*").eq("active", true);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

export default router;