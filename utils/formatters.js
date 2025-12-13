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

/**
 * Formats a precipitation chance percentage
 * @param {number} precip - Precipitation chance (0-100)
 * @returns {string} Formatted precipitation string (e.g., "45%")
 */
export function formatPrecipitation(precip) {
  if (precip === null || precip === undefined || precip === '') {
    return '--';
  }
  const numPrecip = Number(precip);
  if (Number.isNaN(numPrecip) || !Number.isFinite(numPrecip)) {
    return '--';
  }
  const clamped = Math.min(100, Math.max(0, Math.round(numPrecip)));
  return `${clamped}%`;
}

/**
 * Formats a wind speed value with unit
 * @param {number} speed - Wind speed value
 * @returns {string} Formatted wind speed string (e.g., "10 mph")
 */
export function formatWindSpeed(speed) {
  if (speed === null || speed === undefined || speed === '') {
    return '--';
  }
  const numSpeed = Number(speed);
  if (Number.isNaN(numSpeed) || !Number.isFinite(numSpeed)) {
    return '--';
  }
  const positiveSpeed = Math.abs(numSpeed);
  return `${Math.round(positiveSpeed)} mph`;
}

/**
 * Formats a humidity percentage
 * @param {number} humidity - Humidity value (0-100)
 * @returns {string} Formatted humidity string (e.g., "72%")
 */
export function formatHumidity(humidity) {
  if (humidity === null || humidity === undefined || humidity === '') {
    return '--';
  }
  const numHumidity = Number(humidity);
  if (Number.isNaN(numHumidity) || !Number.isFinite(numHumidity)) {
    return '--';
  }
  const clamped = Math.min(100, Math.max(0, Math.round(numHumidity)));
  return `${clamped}%`;
}

/**
 * Formats a datetime string to show only the hour
 * @param {string} datetime - Datetime string (e.g., "2024-01-15 14:00")
 * @returns {string} Formatted hour string (e.g., "2 PM")
 */
export function formatHourTime(datetime) {
  if (datetime === null || datetime === undefined || datetime === '') {
    return '--';
  }

  let date;
  if (datetime instanceof Date) {
    date = datetime;
  } else if (typeof datetime === 'string') {
    // Handle WeatherAPI format: "2024-01-15 10:30"
    const isoString = datetime.replace(' ', 'T');
    date = new Date(isoString);
  } else {
    return '--';
  }

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  let hours = date.getHours();
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours} ${period}`;
}
