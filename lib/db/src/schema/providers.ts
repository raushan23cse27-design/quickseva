import { pgTable, text, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const providersTable = pgTable("qs_providers", {
  id: text("id").primaryKey(),
  ownerName: text("owner_name").notNull(),
  shopName: text("shop_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone").notNull(),
  category: text("category").notNull(),
  subCategory: text("sub_category").notNull(),
  address: text("address").notNull(),
  pinCode: text("pin_code").notNull(),
  openingTime: text("opening_time").notNull(),
  closingTime: text("closing_time").notNull(),
  status: text("status", { enum: ["Pending", "Approved", "Rejected"] }).notNull().default("Pending"),
  rating: real("rating").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  earnings: integer("earnings").notNull().default(0),
  jobsDone: integer("jobs_done").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProviderSchema = createInsertSchema(providersTable).omit({ createdAt: true, rating: true, ratingCount: true, earnings: true, jobsDone: true, status: true });
export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type Provider = typeof providersTable.$inferSelect;
