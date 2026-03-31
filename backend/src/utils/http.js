function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function getPagination(query, defaults = { page: 1, limit: 20 }) {
  const page = toPositiveInt(query.page, defaults.page);
  const limit = toPositiveInt(query.limit, defaults.limit);
  return { page, limit, skip: (page - 1) * limit };
}

export { toPositiveInt, getPagination };
