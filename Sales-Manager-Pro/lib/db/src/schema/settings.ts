import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  storeName: text("store_name").notNull().default("My Store"),
  currency: text("currency").notNull().default("USD"),
  taxPercentage: numeric("tax_percentage", { precision: 5, scale: 2 }).notNull().default("0"),
  invoiceFooter: text("invoice_footer").default("Thank you for your business!"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(10),
  theme: text("theme").notNull().default("midnight"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true, updatedAt: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
