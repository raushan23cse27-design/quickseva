import { pgTable, text, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bookingsTable = pgTable("qs_bookings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  userPhone: text("user_phone").notNull(),
  providerId: text("provider_id").notNull(),
  providerName: text("provider_name").notNull(),
  shopName: text("shop_name").notNull(),
  category: text("category").notNull(),
  address: text("address").notNull(),
  userLatitude: real("user_latitude"),
  userLongitude: real("user_longitude"),
  problemDescription: text("problem_description").notNull(),
  preferredTime: text("preferred_time").notNull(),
  status: text("status", {
    enum: ["Request Sent", "Accepted", "On the Way", "Work in Progress", "Completed", "Rejected"],
  }).notNull().default("Request Sent"),
  rating: real("rating"),
  amount: integer("amount"),
  completionOtp: text("completion_otp"),
  providerLatitude: real("provider_latitude"),
  providerLongitude: real("provider_longitude"),
  locationUpdatedAt: timestamp("location_updated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ createdAt: true, updatedAt: true, status: true, rating: true, amount: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
