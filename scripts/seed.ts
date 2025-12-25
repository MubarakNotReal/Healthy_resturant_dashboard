import 'dotenv/config';
import { addDays } from 'date-fns';
import { eq, and } from 'drizzle-orm';
import { db, client } from '../src/lib/db';
import { subscriptions, subscriptionPlans, users } from '../src/lib/schema';

async function ensureUser(params: {
  name: string;
  email: string | null;
  phone: string;
  address?: string | null;
  role: 'admin' | 'staff';
}) {
  const existing = await db.select().from(users).where(eq(users.phone, params.phone)).limit(1);
  if (existing.length) return existing[0];

  const [created] = await db
    .insert(users)
    .values({
      name: params.name,
      email: params.email,
      phone: params.phone,
      address: params.address ?? null,
      role: params.role,
    })
    .returning();

  return created;
}

async function ensurePlan() {
  const planName = 'Railroad Hobby Test Plan';
  const existing = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.name, planName))
    .limit(1);

  if (existing.length) return existing[0];

  const [created] = await db
    .insert(subscriptionPlans)
    .values({
      name: planName,
      description: '30-day test plan with 2 meals per day',
      price: 99,
      duration: 30,
      mealsPerDay: 2,
      features: 'Test-only seeded plan',
      status: 'active',
    })
    .returning();

  return created;
}

async function ensureSubscription(userId: number, planId: number, planName: string) {
  const existing = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.planId, planId)))
    .limit(1);

  if (existing.length) return existing[0];

  const start = new Date();
  const end = addDays(start, 30);

  const [created] = await db
    .insert(subscriptions)
    .values({
      userId,
      planId,
      plan: planName,
      startDate: start,
      endDate: end,
      status: 'active',
      paymentMethod: 'seeded',
      paymentAmount: 99,
      paymentDetails: 'Seed data for testing',
    })
    .returning();

  return created;
}

async function main() {
  console.log('Seeding database with admin, staff, and test plan...');

  const admin = await ensureUser({
    name: 'Admin Tester',
    email: 'admin@nourish.test',
    phone: '0000000001',
    address: 'Seeded admin account',
    role: 'admin',
  });

  const staff = await ensureUser({
    name: 'Staff Tester',
    email: 'staff@nourish.test',
    phone: '0000000002',
    address: 'Seeded staff account',
    role: 'staff',
  });

  const plan = await ensurePlan();
  await ensureSubscription(staff.id, plan.id, plan.name);

  console.log('Seed complete.');
  console.log({ admin, staff, plan });
}

main()
  .catch((error) => {
    console.error('Failed to seed database:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end({ timeout: 5 });
  });
