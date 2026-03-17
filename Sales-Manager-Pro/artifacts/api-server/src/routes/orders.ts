import { Router } from "express";
import { db, ordersTable, orderItemsTable, productsTable, customersTable } from "@workspace/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";

const router = Router();

function formatOrder(order: typeof ordersTable.$inferSelect, customerName: string | null, itemCount: number) {
  return {
    ...order,
    customerName,
    totalPrice: parseFloat(order.totalPrice),
    discount: order.discount ? parseFloat(order.discount) : 0,
    createdAt: order.createdAt.toISOString(),
    itemCount,
  };
}

router.get("/", async (req, res) => {
  const { startDate, endDate, customerId } = req.query;
  const orders = await db.select().from(ordersTable);
  const customers = await db.select().from(customersTable);
  const items = await db.select().from(orderItemsTable);

  const customerMap: Record<number, string> = {};
  for (const c of customers) customerMap[c.id] = c.name;

  const itemCountMap: Record<number, number> = {};
  for (const item of items) {
    itemCountMap[item.orderId] = (itemCountMap[item.orderId] || 0) + item.quantity;
  }

  let filtered = orders;
  if (startDate) filtered = filtered.filter(o => o.createdAt >= new Date(startDate as string));
  if (endDate) filtered = filtered.filter(o => o.createdAt <= new Date(endDate as string + "T23:59:59"));
  if (customerId) filtered = filtered.filter(o => o.customerId === parseInt(customerId as string));

  return res.json(filtered.map(o => formatOrder(o, customerMap[o.customerId!] || null, itemCountMap[o.id] || 0)));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) return res.status(404).json({ error: "Order not found" });

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));
  const customer = order.customerId
    ? (await db.select().from(customersTable).where(eq(customersTable.id, order.customerId)))[0]
    : null;

  return res.json({
    ...order,
    customerName: customer?.name || null,
    totalPrice: parseFloat(order.totalPrice),
    createdAt: order.createdAt.toISOString(),
    items: items.map(item => ({
      ...item,
      price: parseFloat(item.price),
      subtotal: parseFloat(item.price) * item.quantity,
    })),
  });
});

router.post("/", async (req, res) => {
  const { customerId, paymentMethod, items, discount } = req.body;
  if (!paymentMethod || !items?.length) {
    return res.status(400).json({ error: "Payment method and items required" });
  }

  let totalPrice = 0;
  for (const item of items) {
    totalPrice += item.price * item.quantity;
  }
  const discountAmount = discount || 0;
  const finalTotal = totalPrice - discountAmount;

  const [order] = await db.insert(ordersTable).values({
    customerId: customerId || null,
    totalPrice: String(finalTotal),
    discount: String(discountAmount),
    paymentMethod,
    status: "completed",
  }).returning();

  for (const item of items) {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    await db.insert(orderItemsTable).values({
      orderId: order.id,
      productId: item.productId,
      productName: product?.name || "Unknown Product",
      quantity: item.quantity,
      price: String(item.price),
    });
    if (product) {
      await db.update(productsTable)
        .set({ stock: Math.max(0, product.stock - item.quantity) })
        .where(eq(productsTable.id, item.productId));
    }
  }

  if (customerId) {
    await db.select().from(customersTable).where(eq(customersTable.id, customerId));
  }

  return res.status(201).json({
    ...order,
    totalPrice: parseFloat(order.totalPrice),
    createdAt: order.createdAt.toISOString(),
    items,
  });
});

router.post("/:id/refund", async (req, res) => {
  const id = parseInt(req.params.id);
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.status === "refunded") return res.status(400).json({ error: "Order already refunded" });

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));
  for (const item of items) {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    if (product) {
      await db.update(productsTable)
        .set({ stock: product.stock + item.quantity })
        .where(eq(productsTable.id, item.productId));
    }
  }

  await db.update(ordersTable).set({ status: "refunded" }).where(eq(ordersTable.id, id));
  return res.json({ success: true, message: "Order refunded successfully" });
});

export default router;
