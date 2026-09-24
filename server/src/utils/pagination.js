/** Converts ?page=&limit= into MongoDB skip/limit, with a hard cap on limit. */
export function getPagination(query, { defaultLimit = 12, maxLimit = 50 } = {}) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), maxLimit);
  return { page, limit, skip: (page - 1) * limit };
}

export function paginationMeta({ page, limit, total }) {
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  return { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}
