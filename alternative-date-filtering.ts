// Alternative date filtering approach if the current fix doesn't work
// Replace the buildSaleMatch function with this version:

const buildSaleMatchAlternative = (filters: BaseSaleFilters = {}) => {
  const { from, to, status, checkoutId, userId, customerId } = filters;
  const match: Record<string, unknown> = { deletedAt: null };
  const statuses = status?.length ? status : [SaleStatus.COMPLETED];
  match.status = statuses.length === 1 ? statuses[0] : { $in: statuses };

  const fromDate = parseDate(from);
  const toDate = parseDate(to);

  if (fromDate || toDate) {
    const range: Record<string, unknown> = {};
    if (fromDate) {
      // Use ISODate format for MongoDB
      range.$gte = { $date: fromDate.toISOString() };
    }
    if (toDate) {
      // Use ISODate format for MongoDB  
      range.$lte = { $date: endOfDay(toDate).toISOString() };
    }
    match.createdAt = range;
  }

  if (checkoutId) {
    match.checkoutId = toObjectId(checkoutId);
  }
  if (userId) {
    match.userId = toObjectId(userId);
  }
  if (customerId) {
    match.customerId = toObjectId(customerId);
  }

  return match;
};

// Or even simpler, use MongoDB's native Date constructor:
const buildSaleMatchSimple = (filters: BaseSaleFilters = {}) => {
  const { from, to, status, checkoutId, userId, customerId } = filters;
  const match: Record<string, unknown> = { deletedAt: null };
  const statuses = status?.length ? status : [SaleStatus.COMPLETED];
  match.status = statuses.length === 1 ? statuses[0] : { $in: statuses };

  const fromDate = parseDate(from);
  const toDate = parseDate(to);

  if (fromDate || toDate) {
    const range: Record<string, unknown> = {};
    if (fromDate) {
      // Use raw date - let MongoDB handle it
      range.$gte = fromDate;
    }
    if (toDate) {
      // Use raw date - let MongoDB handle it
      range.$lte = endOfDay(toDate);
    }
    match.createdAt = range;
  }

  if (checkoutId) {
    // Try without $oid wrapper
    match.checkoutId = checkoutId;
  }
  if (userId) {
    // Try without $oid wrapper
    match.userId = userId;
  }
  if (customerId) {
    // Try without $oid wrapper
    match.customerId = customerId;
  }

  return match;
};