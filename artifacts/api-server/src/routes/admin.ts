import { Router } from "express";
import { db, providersTable, usersTable, bookingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/admin/providers", async (req, res) => {
  try {
    const providers = await db.select().from(providersTable);
    return res.json(providers.map(({ password: _, ...p }) => p));
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/admin/users", async (req, res) => {
  try {
    const users = await db.select().from(usersTable);
    return res.json(users.map(({ password: _, ...u }) => u));
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/admin/bookings", async (req, res) => {
  try {
    const bookings = await db.select().from(bookingsTable);
    return res.json(bookings);
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.patch("/admin/providers/:id/approve", async (req, res) => {
  try {
    await db.update(providersTable).set({ status: "Approved" }).where(eq(providersTable.id, req.params.id));
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.patch("/admin/providers/:id/reject", async (req, res) => {
  try {
    await db.update(providersTable).set({ status: "Rejected" }).where(eq(providersTable.id, req.params.id));
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
