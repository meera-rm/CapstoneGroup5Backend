var express = require('express');
var users = express.Router();

const { getPagination, buildMeta } = require('../utils/pagination');
const { authenticate, authorize } = require('../middleware/auth');
const{ ROLES } = require('../utils/roles');
const {

  getUsersPage,
  allUsers,
  oneUser,
  deleteUser,
  upDateUser,
  
} = require('../queries/users');


// Every route below needs a logged-in user
users.use(authenticate);


// Helpers
const parseId = (raw) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};
const isSelf = (req, id) => Number(req.user.id) === id;
const isStaff = (req) => ['teacher', 'admin'].includes(req.user.role);
 
// ---------- GET /users ----------
users.get('/', authorize('teacher', 'admin'), async (req, res) => {
  try {
    if (!req.query.page) return res.json({ users: await allUsers() });
 
    const { page, limit, offset } = getPagination(req.query, 20);
    const { users: rows, total } = await getUsersPage(limit, offset);
    res.json({ users: rows, pagination: buildMeta(page, limit, total) });
  } catch (error) {
    console.error('list users error:', error);
    res.status(500).json({ status: 'error', message: 'Could not load users' });
  }
});



// ---------- GET /users/:id ----------
users.get('/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ status: 'error', message: 'Invalid user id' });
 
    // Students can only see themselves
    if (!isSelf(req, id) && !isStaff(req)) {
      return res.status(403).json({ status: 'error', message: 'You do not have permission to do this' });
    }
 
    const user = await oneUser(id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.json({ user });
  } catch (error) {
    console.error('get user error:', error);
    res.status(500).json({ status: 'error', message: 'Could not load user' });
  }
});



// ---------- PUT /users/:id ----------
users.put('/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ status: 'error', message: 'Invalid user id' });
 
    const isAdmin = req.user.role === 'admin';
    if (!isSelf(req, id) && !isAdmin) {
      return res.status(403).json({ status: 'error', message: 'You can only edit your own account' });
    }
 
    // Only pick fields we allow — ignore anything else in the body (like user_password)
    const { user_name, user_avatar, user_email, user_role } = req.body;
 
    if (user_role !== undefined) {
      if (!isAdmin) {
        return res.status(403).json({ status: 'error', message: 'Only admins can change roles' });
      }
      if (!ROLES.includes(user_role)) {
        return res.status(400).json({ status: 'error', message: `Role must be one of: ${ROLES.join(', ')}` });
      }
      if (isSelf(req, id) && user_role !== 'admin') {
        return res.status(400).json({ status: 'error', message: "You can't remove your own admin role" });
      }
    }
 
    const updated = await upDateUser({ user_name, user_avatar, user_email, user_role }, id);
    if (!updated) return res.status(404).json({ status: 'error', message: 'User not found' });
 
    // Note: the user's current JWT still has their old name/role until it refreshes.
    res.json({ user: updated });
  } catch (error) {
  
    if (error.code === '23505') { // Postgres: "unique value already exists"
      return res.status(409).json({ status: 'error', message: 'That email is already in use' });
    }
    console.error('update user error:', error);
    res.status(500).json({ status: 'error', message: 'Could not update user' });

  }
});





// ---------- DELETE /users/:id ----------
users.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ status: 'error', message: 'Invalid user id' });
 
    if (isSelf(req, id)) {
      return res.status(400).json({ status: 'error', message: "You can't delete your own account here" });
    }
 
    const deleted = await deleteUser(id);
    if (!deleted) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.json({ user: deleted });
  } catch (error) {
    console.error('delete user error:', error);
    res.status(500).json({ status: 'error', message: 'Could not delete user' });
  }
});
 
module.exports = users;