/**
 * Search Detector Utility Module
 *
 * Provides functions for detecting search input types and sanitizing user input
 * for weather location searches.
 *
 * @module utils/searchDetector
 */

/**
 * Search type constants
 */
export const SEARCH_TYPES = {
  ZIP_CODE: 'zip_code',
  CITY: 'city',
  REGION: 'region',
  UNKNOWN: 'unknown',
};

/**
 * Regular expression patterns for search type detection
 */
const PATTERNS = {
  // US ZIP codes: 5 digits, optionally followed by hyphen and 4 digits (ZIP+4)
  US_ZIP: /^\d{5}(-\d{4})?$/,
  // Canadian postal codes: A1A 1A1 format
  CANADIAN_POSTAL: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  // UK postcodes: various formats like SW1A 1AA, M1 1AE, etc.
  UK_POSTCODE: /^[A-Za-z]{1,2}\d[A-Za-z\d]?[ ]?\d[A-Za-z]{2}$/,
  // General numeric (for international postal codes that are purely numeric)
  NUMERIC_POSTAL: /^\d{4,6}$/,
};

/**
 * List of common US state names and abbreviations for region detection
 */
const US_STATES = [
  'alabama', 'al', 'alaska', 'ak', 'arizona', 'az', 'arkansas', 'ar',
  'california', 'ca', 'colorado', 'co', 'connecticut', 'ct', 'delaware', 'de',
  'florida', 'fl', 'georgia', 'ga', 'hawaii', 'hi', 'idaho', 'id',
  'illinois', 'il', 'indiana', 'in', 'iowa', 'ia', 'kansas', 'ks',
  'kentucky', 'ky', 'louisiana', 'la', 'maine', 'me', 'maryland', 'md',
  'massachusetts', 'ma', 'michigan', 'mi', 'minnesota', 'mn', 'mississippi', 'ms',
  'missouri', 'mo', 'montana', 'mt', 'nebraska', 'ne', 'nevada', 'nv',
  'new hampshire', 'nh', 'new jersey', 'nj', 'new mexico', 'nm', 'new york', 'ny',
  'north carolina', 'nc', 'north dakota', 'nd', 'ohio', 'oh', 'oklahoma', 'ok',
  'oregon', 'or', 'pennsylvania', 'pa', 'rhode island', 'ri', 'south carolina', 'sc',
  'south dakota', 'sd', 'tennessee', 'tn', 'texas', 'tx', 'utah', 'ut',
  'vermont', 'vt', 'virginia', 'va', 'washington', 'wa', 'west virginia', 'wv',
  'wisconsin', 'wi', 'wyoming', 'wy', 'district of columbia', 'dc',
];

/**
 * List of common country names for region detection
 */
const COUNTRIES = [
  'united states', 'usa', 'us', 'canada', 'mexico', 'united kingdom', 'uk',
  'england', 'scotland', 'wales', 'ireland', 'france', 'germany', 'italy',
  'spain', 'portugal', 'netherlands', 'belgium', 'switzerland', 'austria',
  'australia', 'new zealand', 'japan', 'china', 'india', 'brazil', 'argentina',
  'south africa', 'egypt', 'russia', 'sweden', 'norway', 'denmark', 'finland',
  'poland', 'czech republic', 'greece', 'turkey', 'south korea', 'singapore',
  'thailand', 'vietnam', 'philippines', 'indonesia', 'malaysia',
];

/**
 * Detects the type of search input provided by the user
 *
 * @param {string} input - The search input string
 * @returns {Object} Object containing the detected type and normalized input
 * @returns {string} returns.type - One of SEARCH_TYPES values
 * @returns {string} returns.value - The normalized input value
 *
 * @example
 * detectSearchType('94102');
 * // Returns: { type: 'zip_code', value: '94102' }
 *
 * @example
 * detectSearchType('New York');
 * // Returns: { type: 'city', value: 'New York' }
 *
 * @example
 * detectSearchType('California');
 * // Returns: { type: 'region', value: 'California' }
 */
export function detectSearchType(input) {
  // Handle null, undefined, or non-string input
  if (input === null || input === undefined) {
    return { type: SEARCH_TYPES.UNKNOWN, value: '' };
  }

  if (typeof input !== 'string') {
    return { type: SEARCH_TYPES.UNKNOWN, value: String(input) };
  }

  // Trim and normalize whitespace
  const trimmed = input.trim();

  // Empty string check
  if (trimmed === '') {
    return { type: SEARCH_TYPES.UNKNOWN, value: '' };
  }

  // Check for ZIP/postal code patterns
  if (isZipCode(trimmed)) {
    return { type: SEARCH_TYPES.ZIP_CODE, value: trimmed };
  }

  // Check for region (state/country)
  if (isRegion(trimmed)) {
    return { type: SEARCH_TYPES.REGION, value: trimmed };
  }

  // Default to city for text-based searches
  return { type: SEARCH_TYPES.CITY, value: trimmed };
}

/**
 * Checks if the input matches any ZIP/postal code pattern
 *
 * @param {string} input - The input to check
 * @returns {boolean} True if input matches a ZIP/postal code pattern
 */
function isZipCode(input) {
  return (
    PATTERNS.US_ZIP.test(input) ||
    PATTERNS.CANADIAN_POSTAL.test(input) ||
    PATTERNS.UK_POSTCODE.test(input) ||
    PATTERNS.NUMERIC_POSTAL.test(input)
  );
}

/**
 * Checks if the input matches a known region (state or country)
 *
 * @param {string} input - The input to check
 * @returns {boolean} True if input matches a known region
 */
function isRegion(input) {
  const normalized = input.toLowerCase();

  // Check if it's a US state
  if (US_STATES.includes(normalized)) {
    return true;
  }

  // Check if it's a country
  if (COUNTRIES.includes(normalized)) {
    return true;
  }

  return false;
}

/**
 * Sanitizes search input by removing potentially harmful characters
 * and normalizing whitespace
 *
 * @param {string} input - The raw search input
 * @returns {string} Sanitized search input
 *
 * @example
 * sanitizeSearchInput('  New   York  ');
 * // Returns: 'New York'
 *
 * @example
 * sanitizeSearchInput('San Francisco<script>');
 * // Returns: 'San Franciscoscript'
 *
 * @example
 * sanitizeSearchInput(null);
 * // Returns: ''
 */
export function sanitizeSearchInput(input) {
  // Handle null, undefined, or non-string input
  if (input === null || input === undefined) {
    return '';
  }

  if (typeof input !== 'string') {
    input = String(input);
  }

  // Remove HTML tags and potentially dangerous characters
  let sanitized = input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove special characters that could be used for injection
    .replace(/[<>'"`;\\]/g, '')
    // Normalize multiple spaces to single space
    .replace(/\s+/g, ' ')
    // Trim leading/trailing whitespace
    .trim();

  // Limit length to prevent extremely long inputs
  const MAX_LENGTH = 100;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH).trim();
  }

  return sanitized;
}

/**
 * Validates if the input is a valid search query
 *
 * @param {string} input - The search input to validate
 * @returns {Object} Validation result
 * @returns {boolean} returns.valid - Whether the input is valid
 * @returns {string} [returns.error] - Error message if invalid
 *
 * @example
 * validateSearchInput('New York');
 * // Returns: { valid: true }
 *
 * @example
 * validateSearchInput('');
 * // Returns: { valid: false, error: 'Search input is required' }
 */
export function validateSearchInput(input) {
  if (input === null || input === undefined || input === '') {
    return { valid: false, error: 'Search input is required' };
  }

  if (typeof input !== 'string') {
    return { valid: false, error: 'Search input must be a string' };
  }

  const sanitized = sanitizeSearchInput(input);

  if (sanitized.length === 0) {
    return { valid: false, error: 'Search input is required' };
  }

  if (sanitized.length < 2) {
    return { valid: false, error: 'Search input must be at least 2 characters' };
  }

  return { valid: true };
}
