import { Router } from "express";
import { db, settingsTable } from "@workspace/db";

const router = Router();

function formatSettings(s: typeof settingsTable.$inferSelect) {
  return {
    ...s,
    taxPercentage: parseFloat(s.taxPercentage),
    updatedAt: s.updatedAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  let [settings] = await db.select().from(settingsTable);
  if (!settings) {
    [settings] = await db.insert(settingsTable).values({
      storeName: "My Store",
      currency: "USD",
      taxPercentage: "0",
      lowStockThreshold: 10,
    }).returning();
  }
  return res.json(formatSettings(settings));
});

router.put("/", async (req, res) => {
  const { storeName, currency, taxPercentage, invoiceFooter, address, phone, email, lowStockThreshold, theme } = req.body;
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (storeName !== undefined) updateData.storeName = storeName;
  if (currency !== undefined) updateData.currency = currency;
  if (taxPercentage !== undefined) updateData.taxPercentage = String(taxPercentage);
  if (invoiceFooter !== undefined) updateData.invoiceFooter = invoiceFooter;
  if (address !== undefined) updateData.address = address;
  if (phone !== undefined) updateData.phone = phone;
  if (email !== undefined) updateData.email = email;
  if (lowStockThreshold !== undefined) updateData.lowStockThreshold = lowStockThreshold;
  if (theme !== undefined) updateData.theme = theme;

  let [settings] = await db.select().from(settingsTable);
  if (!settings) {
    [settings] = await db.insert(settingsTable).values({
      storeName: storeName || "My Store",
      currency: currency || "USD",
      taxPercentage: String(taxPercentage || 0),
      lowStockThreshold: lowStockThreshold || 10,
    }).returning();
  } else {
    [settings] = await db.update(settingsTable).set(updateData).returning();
  }
  return res.json(formatSettings(settings));
});

export default router;
