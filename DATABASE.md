# Database Schema & Migrations

This project uses [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations and schema management.

## Schema Overview

The database consists of 7 main tables:

### Tables

1. **users** - Customer information
2. **menus** - Meal offerings with pricing
3. **subscriptions** - User subscription plans
4. **orders** - Purchase records
5. **check_ins** - Meal check-in logs
6. **messages** - User-to-user communications
7. **notifications** - System alerts

### Relationships

- Users can have multiple subscriptions, orders, check-ins, messages, and notifications
- Menus can have multiple orders
- Orders link users to menus
- Messages link users (from/to)
- All other tables reference users appropriately

## Available Scripts

```bash
# Generate migration files from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Push schema changes directly to database (for development)
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## Making Schema Changes

1. **Edit the schema** in `src/lib/schema.ts`
2. **Generate migration**: `npm run db:generate`
3. **Apply to database**: `npm run db:migrate` (production) or `npm run db:push` (development)

## Type Safety

Drizzle provides full TypeScript types for all database operations:

```typescript
import { db } from '@/lib/db';
import { users, menus } from '@/lib/schema';

// Type-safe queries
const allUsers = await db.select().from(users);
const userWithId = await db.select().from(users).where(eq(users.id, 1));

// Type-safe inserts
await db.insert(users).values({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890'
});
```

## Environment Variables

Make sure your `.env` file contains:

```
DATABASE_URL=postgresql://username:password@localhost:5432/nourish_hub
PORT=3001
VITE_API_BASE=http://localhost:3001/api
```

## Seed data (admin + staff)

After running migrations, populate the database with test accounts and a sample plan:

```bash
npm run seed
```

Seeded records:

- Admin: admin@nourish.test / phone 0000000001 (role `admin`)
- Staff: staff@nourish.test / phone 0000000002 (role `staff`)
- Plan: "Railroad Hobby Test Plan" (30 days, 2 meals/day) assigned to the staff user

## Drizzle Studio

To explore your database visually:

```bash
npm run db:studio
```

This opens a web interface at `http://localhost:4999` where you can view and edit data.