/**
 * Formats an ISO date/timestamp string into a locale-friendly string.
 * Returns an empty string for missing or invalid values.
 * @param {string|Date|null|undefined} value
 * @returns {string}
 */
export function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}
