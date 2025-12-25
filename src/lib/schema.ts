import { pgTable, serial, varchar, text, decimal, integer, date, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  address: text('address'),
  role: varchar('role', { length: 50 }).default('staff').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Menus table
export const menus = pgTable('menus', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Subscription Plans table (templates created by admin)
export const subscriptionPlans = pgTable('subscription_plans', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  duration: integer('duration').notNull(), // in days
  mealsPerDay: integer('meals_per_day').default(1).notNull(),
  features: text('features'), // JSON string of features
  status: varchar('status', { length: 50 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Subscriptions table (customer subscriptions)
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  planId: integer('plan_id').references(() => subscriptionPlans.id),
  plan: varchar('plan', { length: 100 }).notNull(), // Plan name for display
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  paymentMethod: varchar('payment_method', { length: 100 }),
  paymentDetails: text('payment_details'),
  paymentAmount: decimal('payment_amount', { precision: 10, scale: 2 }),
  receiptImage: text('receipt_image'), // URL or base64
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  menuId: integer('menu_id').references(() => menus.id).notNull(),
  quantity: integer('quantity').notNull(),
  orderDate: timestamp('order_date').defaultNow().notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
});

// Check-ins table
export const checkIns = pgTable('check_ins', {
  id: serial('id').primaryKey(),
  subscriptionId: integer('subscription_id').references(() => subscriptions.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  checkInDate: date('check_in_date').notNull(),
  mealsPickedUp: integer('meals_picked_up').default(0).notNull(),
  attendanceStatus: varchar('attendance_status', { length: 20 }).default('present').notNull(), // 'present', 'absent', 'paused'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  fromUserId: integer('from_user_id').references(() => users.id).notNull(),
  toUserId: integer('to_user_id').references(() => users.id).notNull(),
  message: text('message').notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message'),
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
  orders: many(orders),
  checkIns: many(checkIns),
  sentMessages: many(messages, { relationName: 'fromUser' }),
  receivedMessages: many(messages, { relationName: 'toUser' }),
  notifications: many(notifications),
}));

export const menusRelations = relations(menus, ({ many }) => ({
  orders: many(orders),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  checkIns: many(checkIns),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  menu: one(menus, {
    fields: [orders.menuId],
    references: [menus.id],
  }),
}));

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  user: one(users, {
    fields: [checkIns.userId],
    references: [users.id],
  }),
  subscription: one(subscriptions, {
    fields: [checkIns.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  fromUser: one(users, {
    fields: [messages.fromUserId],
    references: [users.id],
    relationName: 'fromUser',
  }),
  toUser: one(users, {
    fields: [messages.toUserId],
    references: [users.id],
    relationName: 'toUser',
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Menu = typeof menus.$inferSelect;
export type NewMenu = typeof menus.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type CheckIn = typeof checkIns.$inferSelect;
export type NewCheckIn = typeof checkIns.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;