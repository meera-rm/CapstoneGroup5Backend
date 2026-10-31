// Ownership checks for rows that belong to one user (notes, dictionary words).
// An admin can change anything; everyone else only rows where users_id is their own id.
// Rows with no owner (users_id NULL, e.g. seeded words) can only be changed by an admin.
function canModify(user, ownerId) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return ownerId !== null && ownerId !== undefined && Number(ownerId) === Number(user.id);
}

module.exports = { canModify };
