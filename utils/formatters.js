/**
 * Formatters Utility Module
 *
 * Provides functions for formatting weather data for display in the UI.
 * All formatters handle edge cases gracefully and return consistent outputs.
 *
 * @module utils/formatters
 */

/**
 * Default values for when input is invalid
 */
const DEFAULTS = {
  TEMPERATURE: '--',
  WIND_SPEED: '--',
  PRECIPITATION: '--',
  HUMIDITY: '--',
  TIMESTAMP: '--',
  TIME: '--',
  DAY: '--',
};

/**
 * Formats a temperature value with unit symbol
 *
 * @param {number|string} temp - Temperature value
 * @param {Object} [options] - Formatting options
 * @param {string} [options.unit='F'] - Temperature unit ('F' for Fahrenheit, 'C' for Celsius)
 * @param {boolean} [options.showUnit=true] - Whether to show the unit symbol
 * @param {number} [options.decimals=0] - Number of decimal places
 * @returns {string} Formatted temperature string
 *
 * @example
 * formatTemperature(72);
 * // Returns: '72°F'
 *
 * @example
 * formatTemperature(72, { unit: 'C', showUnit: false });
 * // Returns: '72°'
 *
 * @example
 * formatTemperature(null);
 * // Returns: '--'
 */
export function formatTemperature(temp, options = {}) {
  const { unit = 'F', showUnit = true, decimals = 0 } = options;

  // Handle null, undefined, NaN, or non-numeric values
  if (temp === null || temp === undefined || temp === '') {
    return DEFAULTS.TEMPERATURE;
  }

  const numTemp = Number(temp);

  if (Number.isNaN(numTemp) || !Number.isFinite(numTemp)) {
    return DEFAULTS.TEMPERATURE;
  }

  const rounded = numTemp.toFixed(decimals);
  const unitSymbol = showUnit ? unit.toUpperCase() : '';

  return `${rounded}°${unitSymbol}`;
}

/**
 * Formats a wind speed value with unit
 *
 * @param {number|string} speed - Wind speed value
 * @param {Object} [options] - Formatting options
 * @param {string} [options.unit='mph'] - Speed unit ('mph', 'km/h', 'knots')
 * @param {number} [options.decimals=0] - Number of decimal places
 * @returns {string} Formatted wind speed string
 *
 * @example
 * formatWindSpeed(10.5);
 * // Returns: '11 mph'
 *
 * @example
 * formatWindSpeed(10.5, { unit: 'km/h', decimals: 1 });
 * // Returns: '10.5 km/h'
 *
 * @example
 * formatWindSpeed(null);
 * // Returns: '--'
 */
export function formatWindSpeed(speed, options = {}) {
  const { unit = 'mph', decimals = 0 } = options;

  // Handle null, undefined, NaN, or non-numeric values
  if (speed === null || speed === undefined || speed === '') {
    return DEFAULTS.WIND_SPEED;
  }

  const numSpeed = Number(speed);

  if (Number.isNaN(numSpeed) || !Number.isFinite(numSpeed)) {
    return DEFAULTS.WIND_SPEED;
  }

  // Wind speed should not be negative
  const positiveSpeed = Math.abs(numSpeed);
  const rounded = positiveSpeed.toFixed(decimals);

  return `${rounded} ${unit}`;
}

/**
 * Formats a precipitation chance percentage
 *
 * @param {number|string} precip - Precipitation chance (0-100)
 * @param {Object} [options] - Formatting options
 * @param {boolean} [options.showSymbol=true] - Whether to show the % symbol
 * @returns {string} Formatted precipitation string
 *
 * @example
 * formatPrecipitation(45);
 * // Returns: '45%'
 *
 * @example
 * formatPrecipitation(45, { showSymbol: false });
 * // Returns: '45'
 *
 * @example
 * formatPrecipitation(null);
 * // Returns: '--'
 */
export function formatPrecipitation(precip, options = {}) {
  const { showSymbol = true } = options;

  // Handle null, undefined, NaN, or non-numeric values
  if (precip === null || precip === undefined || precip === '') {
    return DEFAULTS.PRECIPITATION;
  }

  const numPrecip = Number(precip);

  if (Number.isNaN(numPrecip) || !Number.isFinite(numPrecip)) {
    return DEFAULTS.PRECIPITATION;
  }

  // Clamp value between 0 and 100
  const clamped = Math.min(100, Math.max(0, Math.round(numPrecip)));

  return showSymbol ? `${clamped}%` : `${clamped}`;
}

/**
 * Formats a humidity percentage
 *
 * @param {number|string} humidity - Humidity value (0-100)
 * @param {Object} [options] - Formatting options
 * @param {boolean} [options.showSymbol=true] - Whether to show the % symbol
 * @returns {string} Formatted humidity string
 *
 * @example
 * formatHumidity(72);
 * // Returns: '72%'
 *
 * @example
 * formatHumidity(72, { showSymbol: false });
 * // Returns: '72'
 *
 * @example
 * formatHumidity(null);
 * // Returns: '--'
 */
export function formatHumidity(humidity, options = {}) {
  const { showSymbol = true } = options;

  // Handle null, undefined, NaN, or non-numeric values
  if (humidity === null || humidity === undefined || humidity === '') {
    return DEFAULTS.HUMIDITY;
  }

  const numHumidity = Number(humidity);

  if (Number.isNaN(numHumidity) || !Number.isFinite(numHumidity)) {
    return DEFAULTS.HUMIDITY;
  }

  // Clamp value between 0 and 100
  const clamped = Math.min(100, Math.max(0, Math.round(numHumidity)));

  return showSymbol ? `${clamped}%` : `${clamped}`;
}

/**
 * Formats a timestamp into a human-readable date/time string
 *
 * @param {string|Date|number} timestamp - Timestamp to format
 * @param {Object} [options] - Formatting options
 * @param {boolean} [options.includeDate=true] - Whether to include the date
 * @param {boolean} [options.includeTime=true] - Whether to include the time
 * @param {boolean} [options.use24Hour=false] - Whether to use 24-hour format
 * @returns {string} Formatted timestamp string
 *
 * @example
 * formatTimestamp('2024-01-15 10:30');
 * // Returns: 'Jan 15, 10:30 AM'
 *
 * @example
 * formatTimestamp('2024-01-15 14:00', { use24Hour: true });
 * // Returns: 'Jan 15, 14:00'
 *
 * @example
 * formatTimestamp(null);
 * // Returns: '--'
 */
export function formatTimestamp(timestamp, options = {}) {
  const { includeDate = true, includeTime = true, use24Hour = false } = options;

  // Handle null, undefined, or empty values
  if (timestamp === null || timestamp === undefined || timestamp === '') {
    return DEFAULTS.TIMESTAMP;
  }

  let date;

  // Handle different input types
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'string') {
    // Handle WeatherAPI format: "2024-01-15 10:30"
    // Replace space with T for ISO compatibility
    const isoString = timestamp.replace(' ', 'T');
    date = new Date(isoString);
  } else {
    return DEFAULTS.TIMESTAMP;
  }

  // Check for invalid date
  if (Number.isNaN(date.getTime())) {
    return DEFAULTS.TIMESTAMP;
  }

  const parts = [];

  if (includeDate) {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    parts.push(`${month} ${day}`);
  }

  if (includeTime) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (use24Hour) {
      parts.push(`${hours.toString().padStart(2, '0')}:${minutes}`);
    } else {
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      parts.push(`${hours}:${minutes} ${period}`);
    }
  }

  return parts.join(', ');
}

/**
 * Formats a datetime string to show only the hour
 *
 * @param {string|Date|number} datetime - Datetime to format
 * @param {Object} [options] - Formatting options
 * @param {boolean} [options.use24Hour=false] - Whether to use 24-hour format
 * @returns {string} Formatted hour string
 *
 * @example
 * formatHourTime('2024-01-15 14:00');
 * // Returns: '2 PM'
 *
 * @example
 * formatHourTime('2024-01-15 14:00', { use24Hour: true });
 * // Returns: '14:00'
 *
 * @example
 * formatHourTime(null);
 * // Returns: '--'
 */
export function formatHourTime(datetime, options = {}) {
  const { use24Hour = false } = options;

  // Handle null, undefined, or empty values
  if (datetime === null || datetime === undefined || datetime === '') {
    return DEFAULTS.TIME;
  }

  let date;

  // Handle different input types
  if (datetime instanceof Date) {
    date = datetime;
  } else if (typeof datetime === 'number') {
    date = new Date(datetime);
  } else if (typeof datetime === 'string') {
    // Handle WeatherAPI format: "2024-01-15 10:30"
    const isoString = datetime.replace(' ', 'T');
    date = new Date(isoString);
  } else {
    return DEFAULTS.TIME;
  }

  // Check for invalid date
  if (Number.isNaN(date.getTime())) {
    return DEFAULTS.TIME;
  }

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');

  if (use24Hour) {
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours} ${period}`;
}

/**
 * Formats a datetime string to show the day name
 *
 * @param {string|Date|number} datetime - Datetime to format
 * @param {Object} [options] - Formatting options
 * @param {boolean} [options.abbreviated=true] - Whether to use abbreviated day name
 * @param {boolean} [options.showToday=true] - Whether to show "Today" for current day
 * @returns {string} Formatted day name
 *
 * @example
 * formatDayName('2024-01-15'); // If today is Jan 15
 * // Returns: 'Today'
 *
 * @example
 * formatDayName('2024-01-16');
 * // Returns: 'Tue'
 *
 * @example
 * formatDayName('2024-01-16', { abbreviated: false });
 * // Returns: 'Tuesday'
 *
 * @example
 * formatDayName(null);
 * // Returns: '--'
 */
export function formatDayName(datetime, options = {}) {
  const { abbreviated = true, showToday = true } = options;

  // Handle null, undefined, or empty values
  if (datetime === null || datetime === undefined || datetime === '') {
    return DEFAULTS.DAY;
  }

  let date;

  // Handle different input types
  if (datetime instanceof Date) {
    date = datetime;
  } else if (typeof datetime === 'number') {
    date = new Date(datetime);
  } else if (typeof datetime === 'string') {
    // Handle date-only format: "2024-01-15"
    // or full datetime format: "2024-01-15 10:30"
    const isoString = datetime.replace(' ', 'T');
    date = new Date(isoString);
  } else {
    return DEFAULTS.DAY;
  }

  // Check for invalid date
  if (Number.isNaN(date.getTime())) {
    return DEFAULTS.DAY;
  }

  // Check if it's today
  if (showToday) {
    const today = new Date();
    if (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    ) {
      return 'Today';
    }
  }

  const dayNamesLong = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday',
  ];
  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const dayIndex = date.getDay();
  return abbreviated ? dayNamesShort[dayIndex] : dayNamesLong[dayIndex];
}

/**
 * Formats a temperature range (high/low)
 *
 * @param {number|string} high - High temperature
 * @param {number|string} low - Low temperature
 * @param {Object} [options] - Formatting options (passed to formatTemperature)
 * @returns {string} Formatted temperature range
 *
 * @example
 * formatTemperatureRange(72, 55);
 * // Returns: '72°F / 55°F'
 *
 * @example
 * formatTemperatureRange(72, 55, { showUnit: false });
 * // Returns: '72° / 55°'
 */
export function formatTemperatureRange(high, low, options = {}) {
  const formattedHigh = formatTemperature(high, options);
  const formattedLow = formatTemperature(low, options);

  return `${formattedHigh} / ${formattedLow}`;
}

/**
 * Formats wind information with direction
 *
 * @param {number|string} speed - Wind speed
 * @param {string} [direction] - Wind direction (e.g., 'NW', 'SSE')
 * @param {Object} [options] - Formatting options (passed to formatWindSpeed)
 * @returns {string} Formatted wind string
 *
 * @example
 * formatWind(10, 'NW');
 * // Returns: '10 mph NW'
 *
 * @example
 * formatWind(10);
 * // Returns: '10 mph'
 */
export function formatWind(speed, direction, options = {}) {
  const formattedSpeed = formatWindSpeed(speed, options);

  if (formattedSpeed === DEFAULTS.WIND_SPEED) {
    return formattedSpeed;
  }

  if (direction && typeof direction === 'string' && direction.trim()) {
    return `${formattedSpeed} ${direction.trim()}`;
  }

  return formattedSpeed;
}
