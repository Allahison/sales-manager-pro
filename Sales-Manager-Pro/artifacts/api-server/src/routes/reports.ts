import { Router } from "express";
import { db, ordersTable, orderItemsTable, productsTable, customersTable, expensesTable, settingsTable } from "@workspace/db";
import { eq, and, gte, lte } from "drizzle-orm";

const router = Router();

router.get("/dashboard", async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const allOrders = await db.select().from(ordersTable);
  const allProducts = await db.select().from(productsTable);
  const allCustomers = await db.select().from(customersTable);
  const allItems = await db.select().from(orderItemsTable);
  const [settings] = await db.select().from(settingsTable);
  const lowStockThreshold = settings?.lowStockThreshold ?? 10;

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const completedOrders = allOrders.filter(o => o.status === "completed");
  const todayOrders = completedOrders.filter(o => o.createdAt >= today);
  const monthOrders = completedOrders.filter(o => o.createdAt >= monthStart);

  const todaySales = todayOrders.reduce((s, o) => s + parseFloat(o.totalPrice), 0);
  const monthSales = monthOrders.reduce((s, o) => s + parseFloat(o.totalPrice), 0);

  const lowStockProducts = allProducts.filter(p => p.stock <= lowStockThreshold);

  const customerMap: Record<number, string> = {};
  for (const c of allCustomers) customerMap[c.id] = c.name;

  const itemCountMap: Record<number, number> = {};
  for (const item of allItems) {
    itemCountMap[item.orderId] = (itemCountMap[item.orderId] || 0) + item.quantity;
  }

  const recentOrders = completedOrders.slice(-10).reverse().map(o => ({
    ...o,
    customerName: o.customerId ? customerMap[o.customerId] || null : null,
    totalPrice: parseFloat(o.totalPrice),
    createdAt: o.createdAt.toISOString(),
    itemCount: itemCountMap[o.id] || 0,
  }));

  const salesChart: Array<{ label: string; value: number; orders: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    const dayOrders = completedOrders.filter(o => o.createdAt >= date && o.createdAt < nextDate);
    salesChart.push({
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      value: dayOrders.reduce((s, o) => s + parseFloat(o.totalPrice), 0),
      orders: dayOrders.length,
    });
  }

  return res.json({
    todaySales,
    todayOrders: todayOrders.length,
    totalProducts: allProducts.length,
    totalCustomers: allCustomers.length,
    lowStockCount: lowStockProducts.length,
    monthSales,
    monthOrders: monthOrders.length,
    recentOrders,
    salesChart,
    lowStockProducts: lowStockProducts.slice(0, 5).map(p => ({
      ...p,
      price: parseFloat(p.price),
      purchasePrice: parseFloat(p.purchasePrice),
      createdAt: p.createdAt.toISOString(),
    })),
  });
});

router.get("/sales", async (req, res) => {
  const { period, startDate, endDate } = req.query;
  const allOrders = await db.select().from(ordersTable);
  const completedOrders = allOrders.filter(o => o.status === "completed");

  let filtered = completedOrders;
  if (startDate) filtered = filtered.filter(o => o.createdAt >= new Date(startDate as string));
  if (endDate) filtered = filtered.filter(o => o.createdAt <= new Date((endDate as string) + "T23:59:59"));

  const totalSales = filtered.reduce((s, o) => s + parseFloat(o.totalPrice), 0);
  const totalOrders = filtered.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  const grouped: Record<string, { value: number; orders: number }> = {};
  for (const order of filtered) {
    let key: string;
    if (period === "monthly") {
      key = order.createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } else {
      key = order.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    if (!grouped[key]) grouped[key] = { value: 0, orders: 0 };
    grouped[key].value += parseFloat(order.totalPrice);
    grouped[key].orders += 1;
  }

  const data = Object.entries(grouped).map(([label, v]) => ({ label, value: v.value, orders: v.orders }));
  return res.json({ totalSales, totalOrders, averageOrderValue, data });
});

router.get("/top-products", async (req, res) => {
  const { limit, startDate, endDate } = req.query;
  const maxLimit = parseInt(limit as string) || 10;

  const allOrders = await db.select().from(ordersTable);
  const allItems = await db.select().from(orderItemsTable);
  const allProducts = await db.select().from(productsTable);

  const completedOrderIds = new Set(
    allOrders.filter(o => {
      if (o.status !== "completed") return false;
      if (startDate && o.createdAt < new Date(startDate as string)) return false;
      if (endDate && o.createdAt > new Date((endDate as string) + "T23:59:59")) return false;
      return true;
    }).map(o => o.id)
  );

  const productMap: Record<number, typeof allProducts[0]> = {};
  for (const p of allProducts) productMap[p.id] = p;

  const stats: Record<number, { totalSold: number; totalRevenue: number }> = {};
  for (const item of allItems) {
    if (!completedOrderIds.has(item.orderId)) continue;
    if (!stats[item.productId]) stats[item.productId] = { totalSold: 0, totalRevenue: 0 };
    stats[item.productId].totalSold += item.quantity;
    stats[item.productId].totalRevenue += parseFloat(item.price) * item.quantity;
  }

  const result = Object.entries(stats)
    .map(([id, s]) => ({
      id: parseInt(id),
      name: productMap[parseInt(id)]?.name || "Unknown",
      category: productMap[parseInt(id)]?.category || "",
      ...s,
    }))
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, maxLimit);

  return res.json(result);
});

router.get("/profit", async (req, res) => {
  const { startDate, endDate } = req.query;

  const allOrders = await db.select().from(ordersTable);
  const allItems = await db.select().from(orderItemsTable);
  const allProducts = await db.select().from(productsTable);
  const allExpenses = await db.select().from(expensesTable);

  let filteredOrders = allOrders.filter(o => o.status === "completed");
  let filteredExpenses = allExpenses;

  if (startDate) {
    filteredOrders = filteredOrders.filter(o => o.createdAt >= new Date(startDate as string));
    filteredExpenses = filteredExpenses.filter(e => e.date >= (startDate as string));
  }
  if (endDate) {
    filteredOrders = filteredOrders.filter(o => o.createdAt <= new Date((endDate as string) + "T23:59:59"));
    filteredExpenses = filteredExpenses.filter(e => e.date <= (endDate as string));
  }

  const filteredOrderIds = new Set(filteredOrders.map(o => o.id));
  const productMap: Record<number, typeof allProducts[0]> = {};
  for (const p of allProducts) productMap[p.id] = p;

  let totalRevenue = 0;
  let totalCost = 0;
  for (const order of filteredOrders) {
    totalRevenue += parseFloat(order.totalPrice);
  }
  for (const item of allItems) {
    if (!filteredOrderIds.has(item.orderId)) continue;
    const product = productMap[item.productId];
    if (product) {
      totalCost += parseFloat(product.purchasePrice) * item.quantity;
    }
  }

  const totalExpenses = filteredExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  const grossProfit = totalRevenue - totalCost;
  const netProfit = grossProfit - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return res.json({ totalRevenue, totalCost, totalExpenses, grossProfit, netProfit, profitMargin });
});

export default router;
