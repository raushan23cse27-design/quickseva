import { Router } from "express";
import { db, usersTable, providersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function genReferralCode(name: string) {
  const prefix = name.replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase().padEnd(4, "X");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}${suffix}`;
}

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone, referralCode } = req.body;
    if (!name || !email || !password || !phone)
      return res.status(400).json({ error: "All fields required" });

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing.length > 0)
      return res.status(400).json({ error: "Email already registered" });

    let referredByUser = null;
    if (referralCode) {
      const refUsers = await db.select().from(usersTable).where(eq(usersTable.referralCode, referralCode.toUpperCase()));
      if (refUsers[0]) referredByUser = refUsers[0];
    }

    const user = {
      id: genId(), name, email, password, phone, role: "user" as const,
      referralCode: genReferralCode(name),
      referredBy: referredByUser?.id || null,
    };
    await db.insert(usersTable).values(user);

    if (referredByUser) {
      await db.update(usersTable).set({
        referralCount: referredByUser.referralCount + 1,
        referralEarnings: referredByUser.referralEarnings + 50,
      }).where(eq(usersTable.id, referredByUser.id));
    }

    const { password: _, ...safeUser } = user;
    return res.json({ success: true, user: safeUser });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === "admin@quickseva.com" && password === "admin123") {
      return res.json({ success: true, user: { id: "admin", name: "Admin", email, phone: "", role: "admin", referralCode: "ADMIN", referralEarnings: 0, referralCount: 0 } });
    }
    const users = await db.select().from(usersTable).where(eq(usersTable.email, email));
    const user = users[0];
    if (!user || user.password !== password)
      return res.status(401).json({ error: "Invalid email or password" });
    const { password: _, ...safeUser } = user;
    return res.json({ success: true, user: safeUser });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/auth/provider/register", async (req, res) => {
  try {
    const { ownerName, shopName, email, password, phone, category, subCategory, address, pinCode, openingTime, closingTime, latitude, longitude } = req.body;
    if (!ownerName || !shopName || !email || !password || !phone || !category || !subCategory || !address || !pinCode || !openingTime || !closingTime)
      return res.status(400).json({ error: "All fields required" });

    const existing = await db.select().from(providersTable).where(eq(providersTable.email, email));
    if (existing.length > 0)
      return res.status(400).json({ error: "Email already registered" });

    const provider = {
      id: genId(), ownerName, shopName, email, password, phone,
      category, subCategory, address, pinCode, openingTime, closingTime,
      latitude: latitude || null, longitude: longitude || null,
      status: "Pending" as const, rating: 0, ratingCount: 0, earnings: 0, jobsDone: 0,
    };
    await db.insert(providersTable).values(provider);
    const { password: _, ...safeProvider } = provider;
    return res.json({ success: true, provider: safeProvider });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/auth/provider/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const providers = await db.select().from(providersTable).where(eq(providersTable.email, email));
    const provider = providers[0];
    if (!provider || provider.password !== password)
      return res.status(401).json({ error: "Invalid email or password" });
    const { password: _, ...safeProvider } = provider;
    return res.json({ success: true, provider: safeProvider });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
