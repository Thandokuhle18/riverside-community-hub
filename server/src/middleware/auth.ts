import { Request, Response, NextFunction } from "express";
import { serviceClient, createUserClient } from "../supabaseClient.js";
import { Profile, UserRole } from "../types.js";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email?: string };
      profile?: Profile;
      supabase?: ReturnType<typeof createUserClient>;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token." });
  }
  const token = header.slice(7);
  const { data, error } = await serviceClient.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid or expired session." });
  }
  req.user = { id: data.user.id, email: data.user.email ?? undefined };
  req.supabase = createUserClient(token);

  const { data: profile, error: profileError } = await req.supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    return res.status(403).json({ error: "No member profile found for this account." });
  }
  req.profile = profile as Profile;
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.profile || !roles.includes(req.profile.role)) {
      return res.status(403).json({ error: "You do not have permission to do this." });
    }
    next();
  };
}