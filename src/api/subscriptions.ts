import { Router } from 'express';
import { db } from '../lib/db';
import { subscriptions, subscriptionPlans, users } from '../lib/schema';
import { eq, desc, sql } from 'drizzle-orm';

const router = Router();

// GET /api/subscriptions - Get all subscription plans
router.get('/subscriptions', async (req, res) => {
  try {
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.status, 'active'))
      .orderBy(desc(subscriptionPlans.createdAt));

    res.json(plans);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// GET /api/subscriptions/customers - Get all customer subscriptions with customer info
router.get('/subscriptions/customers', async (_req, res) => {
  try {
    // Use raw SQL to avoid drizzle select field ordering issues seen in logs
    const result = await db.execute(sql`
      SELECT
        s.id,
        s.user_id AS "userId",
        s.plan_id AS "planId",
        COALESCE(s.plan, p.name) AS plan,
        s.start_date AS "startDate",
        s.end_date AS "endDate",
        s.status,
        s.payment_method AS "paymentMethod",
        s.payment_details AS "paymentDetails",
        s.receipt_image AS "receiptImage",
        COALESCE(s.payment_amount, p.price, 0)::numeric AS "paymentAmount",
        s.created_at AS "createdAt",
        u.name AS "customerName",
        u.phone AS "customerPhone",
        p.duration
      FROM subscriptions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN subscription_plans p ON s.plan_id = p.id
      ORDER BY s.created_at DESC;
    `);

    const rows = Array.isArray(result)
      ? result
      : Array.isArray((result as any).rows)
        ? (result as any).rows
        : [];

    console.log('subscriptions/customers result', result);
    console.log('subscriptions/customers rows', rows);

    const subscriptionsWithDays = rows.map((row: any) => {
      const start = row.startDate ? new Date(row.startDate) : new Date();
      const end = row.endDate ? new Date(row.endDate) : start;
      const now = new Date();

      const totalDaysRaw = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      const totalDays = Math.max(0, Math.ceil(Number.isFinite(totalDaysRaw) ? totalDaysRaw : 0));
      const daysUsedRaw = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      const daysUsed = Math.max(0, Math.ceil(Number.isFinite(daysUsedRaw) ? daysUsedRaw : 0));

      return {
        ...row,
        daysTotal: totalDays,
        daysUsed: Math.min(daysUsed, totalDays || daysUsed),
      };
    });

    res.json(subscriptionsWithDays);
  } catch (error) {
    console.error('Error fetching customer subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch customer subscriptions', detail: String(error) });
  }
});

// GET /api/subscriptions/:id - Get single subscription plan
router.get('/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const planId = Number.parseInt(id);

    if (Number.isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid subscription plan id' });
    }

    const subscription = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);

    if (subscription.length === 0) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    res.json(subscription[0]);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// POST /api/subscriptions - Create new subscription plan (admin only)
router.post('/subscriptions', async (req, res) => {
  try {
    const { name, description, price, duration, mealsPerDay, features } = req.body;

    if (!name || !price || !duration) {
      return res.status(400).json({ error: 'Name, price, and duration are required' });
    }

    const parsedPrice = parseFloat(price);
    const parsedDuration = parseInt(duration);
    const parsedMeals = mealsPerDay ? parseInt(mealsPerDay) : 1;

    if ([parsedPrice, parsedDuration, parsedMeals].some((n) => Number.isNaN(n))) {
      return res.status(400).json({ error: 'Price, duration, or mealsPerDay is invalid' });
    }

    const newPlan = await db.insert(subscriptionPlans).values({
      name,
      description: description || null,
      price: parsedPrice,
      duration: parsedDuration, // in days
      mealsPerDay: parsedMeals,
      features: features || null,
      status: 'active',
    }).returning();

    res.status(201).json(newPlan[0]);
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    res.status(500).json({ error: 'Failed to create subscription plan' });
  }
});

// PUT /api/subscriptions/:id - Update subscription plan (admin only)
router.put('/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, mealsPerDay, features, status } = req.body;

    if (!name || !price || !duration) {
      return res.status(400).json({ error: 'Name, price, and duration are required' });
    }

    const planId = Number.parseInt(id);
    const parsedPrice = parseFloat(price);
    const parsedDuration = parseInt(duration);
    const parsedMeals = mealsPerDay ? parseInt(mealsPerDay) : 1;

    if (Number.isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid subscription plan id' });
    }

    if ([parsedPrice, parsedDuration, parsedMeals].some((n) => Number.isNaN(n))) {
      return res.status(400).json({ error: 'Price, duration, or mealsPerDay is invalid' });
    }

    const updatedPlan = await db
      .update(subscriptionPlans)
      .set({
        name,
        description: description || null,
        price: parsedPrice,
        duration: parsedDuration,
        mealsPerDay: parsedMeals,
        features: features || null,
        status: status || 'active',
      })
      .where(eq(subscriptionPlans.id, planId))
      .returning();

    if (updatedPlan.length === 0) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    res.json(updatedPlan[0]);
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    res.status(500).json({ error: 'Failed to update subscription plan' });
  }
});

// DELETE /api/subscriptions/:id - Delete subscription plan (admin only)
router.delete('/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const planId = Number.parseInt(id);
    if (Number.isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid subscription plan id' });
    }

    // Soft delete by setting status to inactive
    const deletedPlan = await db
      .update(subscriptionPlans)
      .set({ status: 'inactive' })
      .where(eq(subscriptionPlans.id, planId))
      .returning();

    if (deletedPlan.length === 0) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    res.json({ message: 'Subscription plan deactivated successfully' });
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    res.status(500).json({ error: 'Failed to delete subscription plan' });
  }
});

// POST /api/customers/:id/subscribe - Assign subscription to customer
router.post('/customers/:id/subscribe', async (req, res) => {
  try {
    const { id } = req.params;
    const { planId, paymentMethod, paymentDetails, receiptImage, paymentAmount } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'Subscription plan is required' });
    }

    const customerId = Number.parseInt(id);
    const parsedPlanId = Number.parseInt(planId);
    const parsedPaymentAmount = paymentAmount ? Number.parseFloat(paymentAmount) : undefined;

    if (Number.isNaN(customerId) || Number.isNaN(parsedPlanId)) {
      return res.status(400).json({ error: 'Invalid customer or plan id' });
    }

    if (paymentAmount && Number.isNaN(parsedPaymentAmount)) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    // Get the subscription plan
    const plan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, parsedPlanId))
      .limit(1);

    if (plan.length === 0) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    const subscriptionPlan = plan[0];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + subscriptionPlan.duration);

    // Format dates for PostgreSQL
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const amountToStore = parsedPaymentAmount ?? Number(subscriptionPlan.price ?? 0);

    // Create subscription for customer
    const newSubscription = await db.insert(subscriptions).values({
      userId: customerId,
      planId: parsedPlanId,
      plan: subscriptionPlan.name,
      startDate: startDateStr,
      endDate: endDateStr,
      status: 'active',
      paymentMethod: paymentMethod || null,
      paymentDetails: paymentDetails || null,
      paymentAmount: amountToStore,
      receiptImage: receiptImage || null,
    }).returning();

    res.status(201).json(newSubscription[0]);
  } catch (error) {
    console.error('Error subscribing customer:', error);
    if ((error as any).code === '23505') {
      res.status(400).json({ error: 'Customer already has an active subscription' });
    } else {
      res.status(500).json({ error: 'Failed to subscribe customer' });
    }
  }
});

// PUT /api/customers/:id/subscription - Update customer's subscription
router.put('/customers/:id/subscription', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentMethod, paymentDetails, receiptImage } = req.body;

    const customerId = Number.parseInt(id);
    if (Number.isNaN(customerId)) {
      return res.status(400).json({ error: 'Invalid customer id' });
    }

    const updatedSubscription = await db
      .update(subscriptions)
      .set({
        status: status || 'active',
        paymentMethod: paymentMethod || null,
        paymentDetails: paymentDetails || null,
        receiptImage: receiptImage || null,
      })
      .where(eq(subscriptions.userId, customerId))
      .returning();

    if (updatedSubscription.length === 0) {
      return res.status(404).json({ error: 'Customer subscription not found' });
    }

    res.json(updatedSubscription[0]);
  } catch (error) {
    console.error('Error updating customer subscription:', error);
    res.status(500).json({ error: 'Failed to update customer subscription' });
  }
});

// DELETE /api/customers/:id/subscription - Remove customer's subscription
router.delete('/customers/:id/subscription', async (req, res) => {
  try {
    const { id } = req.params;

    const customerId = Number.parseInt(id);
    if (Number.isNaN(customerId)) {
      return res.status(400).json({ error: 'Invalid customer id' });
    }

    const deletedSubscription = await db
      .update(subscriptions)
      .set({ status: 'cancelled' })
      .where(eq(subscriptions.userId, customerId))
      .returning();

    if (deletedSubscription.length === 0) {
      return res.status(404).json({ error: 'Customer subscription not found' });
    }

    res.json({ message: 'Customer subscription cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling customer subscription:', error);
    res.status(500).json({ error: 'Failed to cancel customer subscription' });
  }
});

export default router;