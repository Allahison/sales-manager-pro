import dotenv from "dotenv";
import path from "node:path";
import { db, settingsTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { hashPassword } from "../routes/auth";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env"),
  override: true,
  quiet: true,
});

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to seed the database.");
  }

  // If data was inserted manually (or restored), SERIAL sequences can get out of sync.
  // This makes inserts fail with duplicate key on the primary key. Repair it upfront.
  await db.execute(sql`
    SELECT setval(
      pg_get_serial_sequence('users', 'id'),
      COALESCE((SELECT MAX(id) FROM "users"), 0) + 1,
      false
    )
  `);

  const adminEmail = "admin@store.com";
  const staffEmail = "john@store.com";

  const [existingAdmin] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, adminEmail));

  if (!existingAdmin) {
    await db.insert(usersTable).values({
      name: "Admin",
      email: adminEmail,
      password: hashPassword("admin123"),
      role: "admin",
    });
    console.log(`✅ Created admin user: ${adminEmail}`);
  } else {
    console.log(`ℹ️ Admin user already exists: ${adminEmail}`);
  }

  const [existingStaff] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, staffEmail));

  if (!existingStaff) {
    await db.insert(usersTable).values({
      name: "John (Staff)",
      email: staffEmail,
      password: hashPassword("sales123"),
      role: "salesman",
    });
    console.log(`✅ Created staff user: ${staffEmail}`);
  } else {
    console.log(`ℹ️ Staff user already exists: ${staffEmail}`);
  }

  const [settings] = await db.select({ id: settingsTable.id }).from(settingsTable).limit(1);
  if (!settings) {
    await db.insert(settingsTable).values({
      storeName: "My Store",
      currency: "USD",
      taxPercentage: "0",
      lowStockThreshold: 10,
      theme: "midnight",
    });
    console.log("✅ Created default store settings");
  } else {
    console.log("ℹ️ Store settings already exist");
  }
}

seed()
  .then(() => {
    console.log("🎉 Seed completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed failed");
    console.error(err);
    process.exit(1);
  });

