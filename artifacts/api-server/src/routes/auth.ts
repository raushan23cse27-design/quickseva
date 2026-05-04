import { Router } from "express";
import { db, usersTable, providersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const otpStore = new Map<string, { otp: string; expires: number }>();

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function genReferralCode(name: string) {
  const prefix = name.replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase().padEnd(4, "X");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}${suffix}`;
}

function genOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/auth/request-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const users = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!users[0]) return res.status(404).json({ error: "No account found with this email" });

    const otp = genOtp();
    otpStore.set(email.toLowerCase(), { otp, expires: Date.now() + 5 * 60 * 1000 });

    req.log.info({ email, otp }, "OTP generated");

    return res.json({ success: true, otp, message: "OTP generated (shown here since email is not configured)" });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });

    const record = otpStore.get(email.toLowerCase());
    if (!record) return res.status(400).json({ error: "OTP not requested or expired. Request a new one." });
    if (Date.now() > record.expires) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ error: "OTP expired. Request a new one." });
    }
    if (record.otp !== otp.trim()) return res.status(400).json({ error: "Incorrect OTP. Try again." });

    otpStore.delete(email.toLowerCase());

    const users = await db.select().from(usersTable).where(eq(usersTable.email, email));
    const user = users[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    const { password: _, ...safeUser } = user;
    return res.json({ success: true, user: safeUser });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

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
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
