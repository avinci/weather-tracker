/**
 * Shared date and formatting utilities for weather components.
 * @module utils/formatters
 */

/**
 * Checks if a date string represents today
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {boolean} True if date is today
 */
export function isToday(dateStr) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  return dateStr === todayStr;
}

/**
 * Formats a date string to day name (e.g., "Monday")
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string} Formatted day name
 */
export function formatDayName(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Formats a date string to readable date (e.g., "Jan 15")
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string} Formatted date
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Formats temperature with degree symbol
 * @param {number} temp - Temperature value
 * @returns {string} Formatted temperature (e.g., "72°")
 */
export function formatTemperature(temp) {
  if (temp === null || temp === undefined) {
    return '--°';
  }
  return `${Math.round(temp)}°`;
}

/**
 * Ensures icon URL uses HTTPS protocol
 * @param {string} iconUrl - Icon URL from API
 * @returns {string} HTTPS URL or empty string if invalid
 */
export function getIconUrl(iconUrl) {
  if (!iconUrl) {
    return '';
  }
  // Ensure HTTPS protocol for protocol-relative URLs
  if (iconUrl.startsWith('//')) {
    return `https:${iconUrl}`;
  }
  return iconUrl;
}

/**
 * Default placeholder icon for failed image loads
 */
export const PLACEHOLDER_ICON = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239CA3AF"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"%3E%3C/path%3E%3C/svg%3E';
