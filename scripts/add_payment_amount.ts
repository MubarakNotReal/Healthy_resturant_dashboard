import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  await db.execute(sql.raw("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_amount numeric(10,2);"));
  console.log("payment_amount column ensured");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
