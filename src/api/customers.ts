import { Router } from 'express';
import { db } from '../lib/db';
import { users, subscriptions, subscriptionPlans } from '../lib/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// GET /api/customers - Get all customers with subscription info
router.get('/customers', async (req, res) => {
  try {
    const customers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        address: users.address,
        role: users.role,
        createdAt: users.createdAt,
        // Subscription info
        subscriptionId: subscriptions.id,
        plan: subscriptions.plan,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        subscriptionStatus: subscriptions.status,
        mealsPerDay: subscriptionPlans.mealsPerDay,
      })
      .from(users)
      .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(users.role, 'staff')) // Only get customers, not admin users
      .orderBy(desc(users.createdAt));

    // Group by user and calculate derived fields
    const customerMap = new Map();

    customers.forEach((row) => {
      const customerId = row.id;
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          address: row.address,
          role: row.role,
          createdAt: row.createdAt,
          subscriptions: [],
        });
      }

      if (row.subscriptionId) {
        const customer = customerMap.get(customerId);
        const startDate = new Date(row.startDate!);
        const endDate = new Date(row.endDate!);
        const today = new Date();
        const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        customer.subscriptions.push({
          id: row.subscriptionId,
          plan: row.plan,
          startDate: row.startDate,
          endDate: row.endDate,
          status: row.subscriptionStatus,
          daysRemaining: Math.max(0, daysRemaining),
          mealsPerDay: row.mealsPerDay,
        });
      }
    });

    // Convert to array and add derived fields
    const result = Array.from(customerMap.values()).map((customer) => {
      const activeSubscription = customer.subscriptions.find(s => s.status === 'active');
      return {
        ...customer,
        plan: activeSubscription?.plan || 'No Plan',
        daysRemaining: activeSubscription?.daysRemaining || 0,
        status: activeSubscription ? 'active' : 'inactive',
        mealsPerDay: activeSubscription?.mealsPerDay || 1,
        totalPickups: 0, // TODO: Calculate from check_ins table
        joinDate: customer.createdAt.toISOString().split('T')[0],
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// POST /api/customers - Create a new customer
router.post('/customers', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone number are required' });
    }

    const newCustomer = await db.insert(users).values({
      name,
      email,
      phone: phone || null,
      address: address || null,
      role: 'staff', // Customers are staff role
    }).returning();

    res.status(201).json(newCustomer[0]);
  } catch (error) {
    console.error('Error creating customer:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Phone number already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create customer' });
    }
  }
});

// PUT /api/customers/:id - Update a customer
router.put('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone number are required' });
    }

    const updatedCustomer = await db
      .update(users)
      .set({
        name,
        email,
        phone: phone || null,
        address: address || null,
      })
      .where(eq(users.id, parseInt(id)))
      .returning();

    if (updatedCustomer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(updatedCustomer[0]);
  } catch (error) {
    console.error('Error updating customer:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update customer' });
    }
  }
});

// DELETE /api/customers/:id - Delete a customer
router.delete('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First delete related subscriptions
    await db.delete(subscriptions).where(eq(subscriptions.userId, parseInt(id)));

    // Then delete the user
    const deletedCustomer = await db
      .delete(users)
      .where(eq(users.id, parseInt(id)))
      .returning();

    if (deletedCustomer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router;