import { Router } from 'express';
import { db } from '../lib/db';
import { checkIns, users, subscriptions } from '../lib/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

const router = Router();

// Get check-ins for a specific date range
router.get('/checkins', async (req, res) => {
  try {
    const { startDate, endDate, userId, subscriptionId } = req.query;

    let whereConditions = [];

    if (startDate && endDate) {
      // Use ISO date strings to avoid postgres-js Date binding issues
      const start = (startDate as string).split('T')[0];
      const end = (endDate as string).split('T')[0];
      whereConditions.push(gte(checkIns.checkInDate, start));
      whereConditions.push(lte(checkIns.checkInDate, end));
    }

    if (userId) {
      whereConditions.push(eq(checkIns.userId, parseInt(userId as string)));
    }

    if (subscriptionId) {
      whereConditions.push(eq(checkIns.subscriptionId, parseInt(subscriptionId as string)));
    }

    const checkInRecords = await db
      .select({
        id: checkIns.id,
        subscriptionId: checkIns.subscriptionId,
        userId: checkIns.userId,
        checkInDate: checkIns.checkInDate,
        mealsPickedUp: checkIns.mealsPickedUp,
        attendanceStatus: checkIns.attendanceStatus,
        notes: checkIns.notes,
        createdAt: checkIns.createdAt,
        updatedAt: checkIns.updatedAt,
        customerName: users.name,
        // nameAr column doesn't exist in schema; return empty string to avoid undefined select mapping
        customerNameAr: sql<string>`''`,
        customerPhone: users.phone,
      })
      .from(checkIns)
      .leftJoin(users, eq(checkIns.userId, users.id))
      .leftJoin(subscriptions, eq(checkIns.subscriptionId, subscriptions.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(checkIns.checkInDate), desc(checkIns.createdAt));

    res.json(checkInRecords);
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    res.status(500).json({ error: 'Failed to fetch check-ins' });
  }
});

// Get check-ins for today
router.get('/checkins/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const todayCheckIns = await db
      .select({
        id: checkIns.id,
        subscriptionId: checkIns.subscriptionId,
        userId: checkIns.userId,
        checkInDate: checkIns.checkInDate,
        mealsPickedUp: checkIns.mealsPickedUp,
        attendanceStatus: checkIns.attendanceStatus,
        notes: checkIns.notes,
        createdAt: checkIns.createdAt,
        updatedAt: checkIns.updatedAt,
        customerName: users.name,
        // nameAr column doesn't exist in schema; return empty string to avoid undefined select mapping
        customerNameAr: sql<string>`''`,
        customerPhone: users.phone,
      })
      .from(checkIns)
      .leftJoin(users, eq(checkIns.userId, users.id))
      .where(and(
        gte(checkIns.checkInDate, todayStr),
        lte(checkIns.checkInDate, tomorrowStr)
      ))
      .orderBy(desc(checkIns.createdAt));

    res.json(todayCheckIns);
  } catch (error) {
    console.error('Error fetching today\'s check-ins:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s check-ins' });
  }
});

// Create a new check-in
router.post('/checkins', async (req, res) => {
  try {
    const { subscriptionId, userId, checkInDate, mealsPickedUp, attendanceStatus, notes } = req.body;

    if (!subscriptionId || !userId || !checkInDate) {
      return res.status(400).json({ error: 'subscriptionId, userId, and checkInDate are required' });
    }

    // Check if subscription exists and is active
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1);

    if (subscription.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    if (subscription[0].status !== 'active') {
      return res.status(400).json({ error: 'Subscription is not active' });
    }

    const checkInDateStr = (typeof checkInDate === 'string' ? checkInDate : new Date(checkInDate).toISOString()).split('T')[0];

    // Check if check-in already exists for this date and subscription
    const existingCheckIn = await db
      .select()
      .from(checkIns)
      .where(and(
        eq(checkIns.subscriptionId, subscriptionId),
        eq(checkIns.checkInDate, checkInDateStr)
      ))
      .limit(1);

    if (existingCheckIn.length > 0) {
      return res.status(409).json({ error: 'Check-in already exists for this date' });
    }

    const newCheckIn = await db
      .insert(checkIns)
      .values({
        subscriptionId,
        userId,
        checkInDate: checkInDateStr,
        mealsPickedUp: mealsPickedUp || 0,
        attendanceStatus: attendanceStatus || 'present',
        notes,
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json(newCheckIn[0]);
  } catch (error) {
    console.error('Error creating check-in:', error);
    res.status(500).json({ error: 'Failed to create check-in' });
  }
});

// Update a check-in
router.put('/checkins/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { mealsPickedUp, attendanceStatus, notes } = req.body;

    const updatedCheckIn = await db
      .update(checkIns)
      .set({
        mealsPickedUp,
        attendanceStatus,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(checkIns.id, parseInt(id)))
      .returning();

    if (updatedCheckIn.length === 0) {
      return res.status(404).json({ error: 'Check-in not found' });
    }

    res.json(updatedCheckIn[0]);
  } catch (error) {
    console.error('Error updating check-in:', error);
    res.status(500).json({ error: 'Failed to update check-in' });
  }
});

// Delete a check-in
router.delete('/checkins/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCheckIn = await db
      .delete(checkIns)
      .where(eq(checkIns.id, parseInt(id)))
      .returning();

    if (deletedCheckIn.length === 0) {
      return res.status(404).json({ error: 'Check-in not found' });
    }

    res.json({ message: 'Check-in deleted successfully' });
  } catch (error) {
    console.error('Error deleting check-in:', error);
    res.status(500).json({ error: 'Failed to delete check-in' });
  }
});

// Get check-in summary for a subscription
router.get('/checkins/subscription/:subscriptionId/summary', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { startDate, endDate } = req.query;

    let dateFilter = [];
    if (startDate && endDate) {
      dateFilter.push(gte(checkIns.checkInDate, new Date(startDate as string)));
      dateFilter.push(lte(checkIns.checkInDate, new Date(endDate as string)));
    }

    const checkInSummary = await db
      .select({
        totalCheckIns: sql<number>`count(*)`,
        totalMeals: sql<number>`sum(${checkIns.mealsPickedUp})`,
        presentDays: sql<number>`count(case when ${checkIns.attendanceStatus} = 'present' then 1 end)`,
        absentDays: sql<number>`count(case when ${checkIns.attendanceStatus} = 'absent' then 1 end)`,
        pausedDays: sql<number>`count(case when ${checkIns.attendanceStatus} = 'paused' then 1 end)`,
      })
      .from(checkIns)
      .where(and(
        eq(checkIns.subscriptionId, parseInt(subscriptionId)),
        ...(dateFilter.length > 0 ? dateFilter : [])
      ));

    res.json(checkInSummary[0]);
  } catch (error) {
    console.error('Error fetching check-in summary:', error);
    res.status(500).json({ error: 'Failed to fetch check-in summary' });
  }
});

export default router;