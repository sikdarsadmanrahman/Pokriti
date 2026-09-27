import Admin from "../models/Admin.js";

/**
 * Creates the SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD account automatically on startup,
 * but ONLY if the Admin collection is completely empty. This means:
 *  - a fresh database always gets a working login without a manual `npm run seed` step
 *  - it will never overwrite or reset a password you've already changed via the app
 */
export async function ensureSeedAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@example.com")
    .toLowerCase()
    .trim();
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe!12345";

  if (await Admin.exists({})) return; // an admin already exists somewhere — don't touch it

  await Admin.create({
    name: "Store Admin",
    email,
    passwordHash: await Admin.hashPassword(password),
    role: "admin",
  });
  console.log(
    `Seed admin auto-created: ${email} (change the password after logging in)`,
  );
}
