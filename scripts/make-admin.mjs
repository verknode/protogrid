/**
 * Promote a user to admin role by email.
 * Usage: node scripts/make-admin.mjs
 * Requires: DATABASE_URL and ADMIN_EMAIL env vars to be set.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const email = process.env.ADMIN_EMAIL;
if (!email) {
  console.error("Error: ADMIN_EMAIL env var is not set.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

try {
  const user = await db.user.update({
    where: { email },
    data: { role: "admin" },
    select: { id: true, email: true, name: true, role: true },
  });
  console.log("Done. User is now admin:", user);
} catch (err) {
  if (err.code === "P2025") {
    console.error(`No user found with email: ${email}`);
    console.error("Register first, then run this script.");
  } else {
    console.error("Error:", err.message);
  }
  process.exit(1);
} finally {
  await db.$disconnect();
}
