import { Router } from "express";
import { db, bookingsTable, providersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

router.post("/bookings", async (req, res) => {
  try {
    const { userId, userName, userPhone, providerId, providerName, shopName, category, address, problemDescription, preferredTime } = req.body;
    if (!userId || !providerId || !address || !problemDescription)
      return res.status(400).json({ error: "Required fields missing" });

    const booking = {
      id: genId(), userId, userName, userPhone, providerId, providerName, shopName,
      category, address, problemDescription, preferredTime,
      status: "Request Sent" as const,
    };
    await db.insert(bookingsTable).values(booking);
    return res.json({ success: true, booking });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/bookings/user/:userId", async (req, res) => {
  try {
    const bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.userId, req.params.userId));
    return res.json(bookings);
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/bookings/provider/:providerId", async (req, res) => {
  try {
    const bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.providerId, req.params.providerId));
    return res.json(bookings);
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.patch("/bookings/:id/status", async (req, res) => {
  try {
    const { status, amount } = req.body;
    const updates: Record<string, unknown> = { status, updatedAt: new Date() };
    if (amount !== undefined) updates.amount = amount;

    await db.update(bookingsTable).set(updates).where(eq(bookingsTable.id, req.params.id));

    if (status === "Completed") {
      const bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.id, req.params.id));
      const booking = bookings[0];
      if (booking) {
        const providers = await db.select().from(providersTable).where(eq(providersTable.id, booking.providerId));
        const provider = providers[0];
        if (provider) {
          await db.update(providersTable).set({
            jobsDone: provider.jobsDone + 1,
            earnings: provider.earnings + (amount || 500),
          }).where(eq(providersTable.id, provider.id));
        }
      }
    }

    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.patch("/bookings/:id/rate", async (req, res) => {
  try {
    const { rating } = req.body;
    await db.update(bookingsTable).set({ rating, updatedAt: new Date() }).where(eq(bookingsTable.id, req.params.id));

    const bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.id, req.params.id));
    const booking = bookings[0];
    if (booking) {
      const providers = await db.select().from(providersTable).where(eq(providersTable.id, booking.providerId));
      const provider = providers[0];
      if (provider) {
        const newCount = provider.ratingCount + 1;
        const newRating = Math.round(((provider.rating * provider.ratingCount) + rating) / newCount * 10) / 10;
        await db.update(providersTable).set({ rating: newRating, ratingCount: newCount }).where(eq(providersTable.id, provider.id));
      }
    }

    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
