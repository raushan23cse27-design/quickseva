import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

export async function runMigrations() {
  try {
    logger.info("Running startup schema migrations...");

    await db.execute(sql`
      ALTER TABLE qs_providers
        ADD COLUMN IF NOT EXISTS latitude REAL,
        ADD COLUMN IF NOT EXISTS longitude REAL;
    `);

    await db.execute(sql`
      ALTER TABLE qs_users
        ADD COLUMN IF NOT EXISTS referral_code TEXT,
        ADD COLUMN IF NOT EXISTS referred_by TEXT,
        ADD COLUMN IF NOT EXISTS referral_earnings INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0;
    `);

    await db.execute(sql`
      ALTER TABLE qs_bookings
        ADD COLUMN IF NOT EXISTS user_latitude REAL,
        ADD COLUMN IF NOT EXISTS user_longitude REAL,
        ADD COLUMN IF NOT EXISTS completion_otp TEXT,
        ADD COLUMN IF NOT EXISTS provider_latitude REAL,
        ADD COLUMN IF NOT EXISTS provider_longitude REAL,
        ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP;
    `);

    await db.execute(sql`
      UPDATE qs_users SET referral_code = CONCAT(
        UPPER(SUBSTRING(REGEXP_REPLACE(name, '[^A-Za-z]', '', 'g'), 1, 4)),
        UPPER(SUBSTRING(MD5(id), 1, 4))
      ) WHERE referral_code IS NULL;
    `);

    logger.info("Schema migrations completed successfully");
  } catch (err) {
    logger.warn({ err }, "Migration warning (columns may already exist)");
  }
}
