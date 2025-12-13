import { describe, it, expect } from 'vitest';
import {
  detectSearchType,
  sanitizeSearchInput,
  validateSearchInput,
  SEARCH_TYPES,
} from '../../utils/searchDetector.js';

describe('searchDetector', () => {
  describe('detectSearchType', () => {
    describe('ZIP code detection', () => {
      it('should detect US 5-digit zip codes', () => {
        const result = detectSearchType('94102');
        expect(result.type).toBe(SEARCH_TYPES.ZIP_CODE);
        expect(result.value).toBe('94102');
      });

      it('should detect US ZIP+4 codes', () => {
        const result = detectSearchType('94102-1234');
        expect(result.type).toBe(SEARCH_TYPES.ZIP_CODE);
        expect(result.value).toBe('94102-1234');
      });

      it('should detect 4-digit postal codes', () => {
        const result = detectSearchType('1234');
        expect(result.type).toBe(SEARCH_TYPES.ZIP_CODE);
        expect(result.value).toBe('1234');
      });

      it('should detect 6-digit postal codes', () => {
        const result = detectSearchType('123456');
        expect(result.type).toBe(SEARCH_TYPES.ZIP_CODE);
        expect(result.value).toBe('123456');
      });

      it('should detect Canadian postal codes', () => {
        const result = detectSearchType('M5V 3L9');
        expect(result.type).toBe(SEARCH_TYPES.ZIP_CODE);
        expect(result.value).toBe('M5V 3L9');
      });

      it('should detect Canadian postal codes without space', () => {
        const result = detectSearchType('M5V3L9');
        expect(result.type).toBe(SEARCH_TYPES.ZIP_CODE);
        expect(result.value).toBe('M5V3L9');
      });

      it('should detect UK postcodes', () => {
        const result = detectSearchType('SW1A 1AA');
        expect(result.type).toBe(SEARCH_TYPES.ZIP_CODE);
        expect(result.value).toBe('SW1A 1AA');
      });

      it('should detect UK postcodes without space', () => {
        const result = detectSearchType('M11AE');
        expect(result.type).toBe(SEARCH_TYPES.ZIP_CODE);
        expect(result.value).toBe('M11AE');
      });
    });

    describe('City detection', () => {
      it('should detect city names', () => {
        const result = detectSearchType('Los Angeles');
        expect(result.type).toBe(SEARCH_TYPES.CITY);
        expect(result.value).toBe('Los Angeles');
      });

      it('should detect single-word city names', () => {
        const result = detectSearchType('London');
        expect(result.type).toBe(SEARCH_TYPES.CITY);
        expect(result.value).toBe('London');
      });

      it('should detect city names with special characters', () => {
        const result = detectSearchType('San José');
        expect(result.type).toBe(SEARCH_TYPES.CITY);
        expect(result.value).toBe('San José');
      });

      it('should detect multi-word city names', () => {
        const result = detectSearchType('Salt Lake City');
        expect(result.type).toBe(SEARCH_TYPES.CITY);
        expect(result.value).toBe('Salt Lake City');
      });

      it('should trim whitespace from city names', () => {
        const result = detectSearchType('  San Francisco  ');
        expect(result.type).toBe(SEARCH_TYPES.CITY);
        expect(result.value).toBe('San Francisco');
      });
    });

    describe('Region detection', () => {
      it('should detect US state names', () => {
        const result = detectSearchType('California');
        expect(result.type).toBe(SEARCH_TYPES.REGION);
        expect(result.value).toBe('California');
      });

      it('should detect US state abbreviations', () => {
        const result = detectSearchType('CA');
        expect(result.type).toBe(SEARCH_TYPES.REGION);
        expect(result.value).toBe('CA');
      });

      it('should detect multi-word state names', () => {
        const result = detectSearchType('New York');
        // Note: "New York" is both a city and a state - it should be detected as a region
        expect(result.type).toBe(SEARCH_TYPES.REGION);
        expect(result.value).toBe('New York');
      });

      it('should detect country names', () => {
        const result = detectSearchType('France');
        expect(result.type).toBe(SEARCH_TYPES.REGION);
        expect(result.value).toBe('France');
      });

      it('should detect country codes', () => {
        const result = detectSearchType('UK');
        expect(result.type).toBe(SEARCH_TYPES.REGION);
        expect(result.value).toBe('UK');
      });

      it('should be case-insensitive for regions', () => {
        const result = detectSearchType('CALIFORNIA');
        expect(result.type).toBe(SEARCH_TYPES.REGION);
        expect(result.value).toBe('CALIFORNIA');
      });

      it('should detect lowercase state abbreviations', () => {
        const result = detectSearchType('tx');
        expect(result.type).toBe(SEARCH_TYPES.REGION);
        expect(result.value).toBe('tx');
      });
    });

    describe('Edge cases', () => {
      it('should return unknown for null input', () => {
        const result = detectSearchType(null);
        expect(result.type).toBe(SEARCH_TYPES.UNKNOWN);
        expect(result.value).toBe('');
      });

      it('should return unknown for undefined input', () => {
        const result = detectSearchType(undefined);
        expect(result.type).toBe(SEARCH_TYPES.UNKNOWN);
        expect(result.value).toBe('');
      });

      it('should return unknown for empty string', () => {
        const result = detectSearchType('');
        expect(result.type).toBe(SEARCH_TYPES.UNKNOWN);
        expect(result.value).toBe('');
      });

      it('should return unknown for whitespace-only string', () => {
        const result = detectSearchType('   ');
        expect(result.type).toBe(SEARCH_TYPES.UNKNOWN);
        expect(result.value).toBe('');
      });

      it('should convert numbers to string', () => {
        const result = detectSearchType(94102);
        expect(result.type).toBe(SEARCH_TYPES.UNKNOWN);
        expect(result.value).toBe('94102');
      });

      it('should handle object input', () => {
        const result = detectSearchType({});
        expect(result.type).toBe(SEARCH_TYPES.UNKNOWN);
        expect(result.value).toBe('[object Object]');
      });

      it('should handle array input', () => {
        const result = detectSearchType([]);
        expect(result.type).toBe(SEARCH_TYPES.UNKNOWN);
        expect(result.value).toBe('');
      });
    });
  });

  describe('sanitizeSearchInput', () => {
    describe('Basic sanitization', () => {
      it('should trim whitespace', () => {
        expect(sanitizeSearchInput('  New York  ')).toBe('New York');
      });

      it('should normalize multiple spaces', () => {
        expect(sanitizeSearchInput('New    York')).toBe('New York');
      });

      it('should preserve single spaces', () => {
        expect(sanitizeSearchInput('San Francisco')).toBe('San Francisco');
      });
    });

    describe('HTML tag removal', () => {
      it('should remove HTML tags', () => {
        expect(sanitizeSearchInput('<script>alert("xss")</script>')).toBe('alert(xss)');
      });

      it('should remove HTML tags from city name', () => {
        expect(sanitizeSearchInput('San<br>Francisco')).toBe('SanFrancisco');
      });

      it('should remove multiple HTML tags', () => {
        expect(sanitizeSearchInput('<b>New</b> <i>York</i>')).toBe('New York');
      });
    });

    describe('Special character removal', () => {
      it('should remove angle brackets', () => {
        expect(sanitizeSearchInput('New < York')).toBe('New York');
      });

      it('should remove quotes', () => {
        expect(sanitizeSearchInput('"New York"')).toBe('New York');
      });

      it('should remove single quotes', () => {
        expect(sanitizeSearchInput("'New York'")).toBe('New York');
      });

      it('should remove semicolons', () => {
        expect(sanitizeSearchInput('New York;')).toBe('New York');
      });

      it('should remove backticks', () => {
        expect(sanitizeSearchInput('`New York`')).toBe('New York');
      });

      it('should remove backslashes', () => {
        expect(sanitizeSearchInput('New\\York')).toBe('NewYork');
      });
    });

    describe('Length limiting', () => {
      it('should limit input to 100 characters', () => {
        const longInput = 'a'.repeat(150);
        const result = sanitizeSearchInput(longInput);
        expect(result.length).toBeLessThanOrEqual(100);
      });

      it('should not truncate short inputs', () => {
        expect(sanitizeSearchInput('New York')).toBe('New York');
      });
    });

    describe('Edge cases', () => {
      it('should return empty string for null', () => {
        expect(sanitizeSearchInput(null)).toBe('');
      });

      it('should return empty string for undefined', () => {
        expect(sanitizeSearchInput(undefined)).toBe('');
      });

      it('should convert numbers to string', () => {
        expect(sanitizeSearchInput(94102)).toBe('94102');
      });

      it('should handle boolean values', () => {
        expect(sanitizeSearchInput(true)).toBe('true');
        expect(sanitizeSearchInput(false)).toBe('false');
      });

      it('should handle object values', () => {
        expect(sanitizeSearchInput({})).toBe('[object Object]');
      });

      it('should handle array values', () => {
        expect(sanitizeSearchInput(['New York'])).toBe('New York');
      });

      it('should return empty string for empty input', () => {
        expect(sanitizeSearchInput('')).toBe('');
      });
    });
  });

  describe('validateSearchInput', () => {
    describe('Valid inputs', () => {
      it('should accept valid city name', () => {
        const result = validateSearchInput('New York');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should accept valid zip code', () => {
        const result = validateSearchInput('94102');
        expect(result.valid).toBe(true);
      });

      it('should accept 2-character input', () => {
        const result = validateSearchInput('NY');
        expect(result.valid).toBe(true);
      });
    });

    describe('Invalid inputs', () => {
      it('should reject null input', () => {
        const result = validateSearchInput(null);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Search input is required');
      });

      it('should reject undefined input', () => {
        const result = validateSearchInput(undefined);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Search input is required');
      });

      it('should reject empty string', () => {
        const result = validateSearchInput('');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Search input is required');
      });

      it('should reject whitespace-only input', () => {
        const result = validateSearchInput('   ');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Search input is required');
      });

      it('should reject single character input', () => {
        const result = validateSearchInput('A');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Search input must be at least 2 characters');
      });

      it('should reject non-string input', () => {
        const result = validateSearchInput(123);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Search input must be a string');
      });

      it('should reject object input', () => {
        const result = validateSearchInput({});
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Search input must be a string');
      });

      it('should reject input that becomes empty after sanitization', () => {
        const result = validateSearchInput('<>');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Search input is required');
      });

      it('should reject input that becomes single char after sanitization', () => {
        const result = validateSearchInput('A<>');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Search input must be at least 2 characters');
      });
    });
  });

  describe('SEARCH_TYPES constants', () => {
    it('should export ZIP_CODE type', () => {
      expect(SEARCH_TYPES.ZIP_CODE).toBe('zip_code');
    });

    it('should export CITY type', () => {
      expect(SEARCH_TYPES.CITY).toBe('city');
    });

    it('should export REGION type', () => {
      expect(SEARCH_TYPES.REGION).toBe('region');
    });

    it('should export UNKNOWN type', () => {
      expect(SEARCH_TYPES.UNKNOWN).toBe('unknown');
    });
  });
});
