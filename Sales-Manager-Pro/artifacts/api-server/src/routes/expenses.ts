import { Router } from "express";
import { db, expensesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function formatExpense(e: typeof expensesTable.$inferSelect) {
  return {
    ...e,
    amount: parseFloat(e.amount),
    createdAt: e.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const { startDate, endDate } = req.query;
  const expenses = await db.select().from(expensesTable);
  let filtered = expenses;
  if (startDate) filtered = filtered.filter(e => e.date >= (startDate as string));
  if (endDate) filtered = filtered.filter(e => e.date <= (endDate as string));
  return res.json(filtered.map(formatExpense));
});

router.post("/", async (req, res) => {
  const { title, amount, category, date } = req.body;
  if (!title || !amount || !date) return res.status(400).json({ error: "Title, amount and date required" });
  const [expense] = await db.insert(expensesTable).values({
    title,
    amount: String(amount),
    category: category || "Other",
    date,
  }).returning();
  return res.status(201).json(formatExpense(expense));
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, amount, category, date } = req.body;
  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (amount !== undefined) updateData.amount = String(amount);
  if (category !== undefined) updateData.category = category;
  if (date !== undefined) updateData.date = date;
  const [expense] = await db.update(expensesTable).set(updateData).where(eq(expensesTable.id, id)).returning();
  if (!expense) return res.status(404).json({ error: "Expense not found" });
  return res.json(formatExpense(expense));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(expensesTable).where(eq(expensesTable.id, id));
  return res.json({ success: true, message: "Expense deleted" });
});

export default router;
