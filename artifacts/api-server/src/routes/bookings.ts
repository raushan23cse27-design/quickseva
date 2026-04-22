import { Router } from "express";
import { db, bookingsTable, providersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function genOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/bookings", async (req, res) => {
  try {
    const { userId, userName, userPhone, providerId, providerName, shopName, category, address, problemDescription, preferredTime, userLatitude, userLongitude } = req.body;
    if (!userId || !providerId || !address || !problemDescription)
      return res.status(400).json({ error: "Required fields missing" });

    const booking = {
      id: genId(), userId, userName, userPhone, providerId, providerName, shopName,
      category, address, problemDescription, preferredTime,
      userLatitude: userLatitude || null, userLongitude: userLongitude || null,
      status: "Request Sent" as const,
      completionOtp: genOtp(),
    };
    await db.insert(bookingsTable).values(booking);
    return res.json({ success: true, booking });
  } catch (e) {
    console.error(e);
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
    // Hide OTP from provider until they need to verify
    return res.json(bookings.map(b => ({ ...b, completionOtp: b.status === "Completed" ? b.completionOtp : null })));
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.patch("/bookings/:id/status", async (req, res) => {
  try {
    const { status, amount, otp } = req.body;

    // OTP verification required to mark as Completed
    if (status === "Completed") {
      const bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.id, req.params.id));
      const booking = bookings[0];
      if (!booking) return res.status(404).json({ error: "Booking not found" });
      if (!otp || otp !== booking.completionOtp)
        return res.status(400).json({ error: "Invalid OTP. Please ask customer for correct OTP." });
    }

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
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.patch("/bookings/:id/location", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (latitude == null || longitude == null)
      return res.status(400).json({ error: "Coordinates required" });
    await db.update(bookingsTable).set({
      providerLatitude: latitude,
      providerLongitude: longitude,
      locationUpdatedAt: new Date(),
    }).where(eq(bookingsTable.id, req.params.id));
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
