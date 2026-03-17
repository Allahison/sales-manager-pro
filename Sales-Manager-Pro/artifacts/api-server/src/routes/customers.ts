import { Router } from "express";
import { db, customersTable, ordersTable } from "@workspace/db";
import { eq, sum } from "drizzle-orm";

const router = Router();

function formatCustomer(c: typeof customersTable.$inferSelect, totalPurchases = 0) {
  return {
    ...c,
    totalPurchases,
    createdAt: c.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const { search } = req.query;
  const customers = await db.select().from(customersTable);
  const orders = await db.select().from(ordersTable);

  const purchaseMap: Record<number, number> = {};
  for (const order of orders) {
    if (order.customerId && order.status === "completed") {
      purchaseMap[order.customerId] = (purchaseMap[order.customerId] || 0) + parseFloat(order.totalPrice);
    }
  }

  let filtered = customers;
  if (search) {
    const s = (search as string).toLowerCase();
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(s) ||
      (c.email && c.email.toLowerCase().includes(s)) ||
      (c.phone && c.phone.includes(s as string))
    );
  }
  return res.json(filtered.map(c => formatCustomer(c, purchaseMap[c.id] || 0)));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, id));
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.customerId, id));
  const totalPurchases = orders.filter(o => o.status === "completed").reduce((sum, o) => sum + parseFloat(o.totalPrice), 0);
  
  return res.json(formatCustomer(customer, totalPurchases));
});

router.post("/", async (req, res) => {
  const { name, phone, email, address } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const [customer] = await db.insert(customersTable).values({ name, phone, email, address }).returning();
  return res.status(201).json(formatCustomer(customer));
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, phone, email, address } = req.body;
  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (email !== undefined) updateData.email = email;
  if (address !== undefined) updateData.address = address;
  const [customer] = await db.update(customersTable).set(updateData).where(eq(customersTable.id, id)).returning();
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  return res.json(formatCustomer(customer));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(customersTable).where(eq(customersTable.id, id));
  return res.json({ success: true, message: "Customer deleted" });
});

router.get("/:id/orders", async (req, res) => {
  const id = parseInt(req.params.id);
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.customerId, id));
  const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, id));
  return res.json(orders.map(o => ({
    ...o,
    customerName: customer?.name || null,
    totalPrice: parseFloat(o.totalPrice),
    createdAt: o.createdAt.toISOString(),
    itemCount: 0,
  })));
});

export default router;
