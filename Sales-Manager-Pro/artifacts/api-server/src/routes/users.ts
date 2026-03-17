import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";

const router = Router();

function formatUser(u: typeof usersTable.$inferSelect) {
  const { password: _pw, ...rest } = u;
  return { ...rest, createdAt: u.createdAt.toISOString() };
}

router.get("/", async (req, res) => {
  const users = await db.select().from(usersTable);
  return res.json(users.map(formatUser));
});

router.post("/", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields required" });
  }
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) return res.status(400).json({ error: "Email already in use" });

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    password: hashPassword(password),
    role,
  }).returning();
  return res.status(201).json(formatUser(user));
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, password, role } = req.body;
  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (password !== undefined) updateData.password = hashPassword(password);
  if (role !== undefined) updateData.role = role;

  const [user] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, id)).returning();
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(formatUser(user));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  return res.json({ success: true, message: "User deleted" });
});

export default router;
