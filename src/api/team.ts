import { Router } from 'express';
import { db } from '../lib/db';
import { users } from '../lib/schema';
import { desc, eq, inArray } from 'drizzle-orm';

const router = Router();

const ALLOWED_ROLES = ['admin', 'staff'] as const;
type AllowedRole = typeof ALLOWED_ROLES[number];

const normalizeRole = (role: string | undefined): AllowedRole => {
  if (!role) return 'staff';
  const lower = role.toLowerCase();
  return (ALLOWED_ROLES as readonly string[]).includes(lower) ? (lower as AllowedRole) : 'staff';
};

// GET /api/team - list admin/staff users
router.get('/team', async (_req, res) => {
  try {
    const team = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(inArray(users.role, ['admin', 'staff']))
      .orderBy(desc(users.createdAt));

    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// POST /api/team - create a team member
router.post('/team', async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const newMember = await db
      .insert(users)
      .values({
        name,
        email: email || null,
        phone,
        role: normalizeRole(role),
      })
      .returning();

    res.status(201).json(newMember[0]);
  } catch (error: any) {
    console.error('Error creating team member:', error);
    if (error?.code === '23505') {
      res.status(400).json({ error: 'Phone already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create team member' });
    }
  }
});

// PUT /api/team/:id - update a team member (name/email/phone/role)
router.put('/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const updated = await db
      .update(users)
      .set({
        name,
        email: email || null,
        phone,
        role: normalizeRole(role),
      })
      .where(eq(users.id, Number(id)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Error updating team member:', error);
    if (error?.code === '23505') {
      res.status(400).json({ error: 'Phone already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update team member' });
    }
  }
});

// DELETE /api/team/:id - remove a team member
router.delete('/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.delete(users).where(eq(users.id, Number(id))).returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    res.json({ message: 'Team member deleted' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

export default router;
