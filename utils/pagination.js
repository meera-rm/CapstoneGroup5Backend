// Reads ?page=&limit= from the query string, validates them, and computes the offset.
const MAX_LIMIT = 50;

function getPagination(query, defaultLimit = 10) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), MAX_LIMIT);
  const offset = (page - 1) * limit;
  return { page, limit, offset};
}

function buildMeta(page, limit, total) {
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  return { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}

module.exports = { getPagination, buildMeta };