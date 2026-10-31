// Every role the app knows about
const ROLES = ['student', 'teacher', 'parent', 'admin'];

// Roles a person can pick for themselves when signing up.
// 'admin' is deliberately missing: admins are promoted by another admin.
const SELF_SIGNUP_ROLES = ['student', 'teacher', 'parent'];

module.exports = { ROLES, SELF_SIGNUP_ROLES };