export function discountedPrice(price, discountPercent = 0) {
  const discount = Math.max(0, Math.min(100, Number(discountPercent || 0)));
  return Math.round(Number(price) * (1 - discount / 100));
}
export function estimateWaitMins(items, activeOrderCount = 0) {
  const longestItem = Math.max(
    ...items.map((item) => Number(item.prepTimeMins || 0) + Math.max(0, Number(item.quantity || 1) - 1) * 3),
    5
  );
  const queueBuffer = Math.min(Number(activeOrderCount || 0) * 2, 12);
  return Math.max(5, longestItem + queueBuffer);
}
export function minutesBetween(start, end = new Date()) {
  return Math.max(0, Math.round((new Date(end) - new Date(start)) / 60000));
}
