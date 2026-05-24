import { Router } from "express";
import { db, providersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/providers", async (req, res) => {
  try {
    const { pinCode, category } = req.query as Record<string, string>;
    let all = await db.select().from(providersTable).where(eq(providersTable.status, "Approved"));
    if (pinCode) all = all.filter(p => p.pinCode === pinCode);
    if (category) all = all.filter(p => p.category === category);
    return res.json(all.map(({ password: _, ...p }) => p));
  } catch (e) {
    req.log.error(e, "GET /providers failed");
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/providers/:id", async (req, res) => {
  try {
    const providers = await db.select().from(providersTable).where(eq(providersTable.id, req.params.id));
    if (!providers[0]) return res.status(404).json({ error: "Not found" });
    const { password: _, ...p } = providers[0];
    return res.json(p);
  } catch (e) {
    req.log.error(e, "GET /providers/:id failed");
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
