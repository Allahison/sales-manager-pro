import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, ilike, or, lte } from "drizzle-orm";

const router = Router();

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    ...p,
    price: parseFloat(p.price),
    purchasePrice: parseFloat(p.purchasePrice),
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const { search, category, lowStock } = req.query;
  let query = db.select().from(productsTable);

  const results = await db.select().from(productsTable);
  let filtered = results;

  if (search) {
    const s = (search as string).toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(s) || (p.barcode && p.barcode.includes(s as string))
    );
  }
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  if (lowStock === "true") {
    const [settings] = await db.select().from((await import("@workspace/db")).settingsTable);
    const threshold = settings?.lowStockThreshold ?? 10;
    filtered = filtered.filter(p => p.stock <= threshold);
  }

  return res.json(filtered.map(formatProduct));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) return res.status(404).json({ error: "Product not found" });
  return res.json(formatProduct(product));
});

router.post("/", async (req, res) => {
  const { name, category, price, purchasePrice, stock, barcode, image } = req.body;
  if (!name || !category || price === undefined || purchasePrice === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const [product] = await db.insert(productsTable).values({
    name,
    category,
    price: String(price),
    purchasePrice: String(purchasePrice),
    stock: stock ?? 0,
    barcode: barcode || null,
    image: image || null,
  }).returning();
  return res.status(201).json(formatProduct(product));
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, category, price, purchasePrice, stock, barcode, image } = req.body;
  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (category !== undefined) updateData.category = category;
  if (price !== undefined) updateData.price = String(price);
  if (purchasePrice !== undefined) updateData.purchasePrice = String(purchasePrice);
  if (stock !== undefined) updateData.stock = stock;
  if (barcode !== undefined) updateData.barcode = barcode;
  if (image !== undefined) updateData.image = image;

  const [product] = await db.update(productsTable).set(updateData).where(eq(productsTable.id, id)).returning();
  if (!product) return res.status(404).json({ error: "Product not found" });
  return res.json(formatProduct(product));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(productsTable).where(eq(productsTable.id, id));
  return res.json({ success: true, message: "Product deleted" });
});

router.patch("/:id/stock", async (req, res) => {
  const id = parseInt(req.params.id);
  const { stock, adjustment } = req.body;
  
  const [current] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!current) return res.status(404).json({ error: "Product not found" });

  let newStock = current.stock;
  if (stock !== undefined) newStock = stock;
  else if (adjustment !== undefined) newStock = Math.max(0, current.stock + adjustment);

  const [product] = await db.update(productsTable).set({ stock: newStock }).where(eq(productsTable.id, id)).returning();
  return res.json(formatProduct(product));
});

export default router;
