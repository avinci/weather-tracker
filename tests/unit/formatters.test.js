/**
 * Unit tests for shared formatters utilities
 */

import { describe, it, expect } from 'vitest';
import {
  isToday,
  formatDayName,
  formatDate,
  formatTemperature,
  getIconUrl,
  PLACEHOLDER_ICON,
} from '../../utils/formatters.js';

describe('formatters', () => {
  describe('isToday', () => {
    it('should return true for today\'s date', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      expect(isToday(yesterdayStr)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      expect(isToday(tomorrowStr)).toBe(false);
    });

    it('should return false for a date in the past', () => {
      expect(isToday('2020-01-01')).toBe(false);
    });
  });

  describe('formatDayName', () => {
    it('should return full day name for Monday', () => {
      expect(formatDayName('2024-01-15')).toBe('Monday');
    });

    it('should return full day name for Sunday', () => {
      expect(formatDayName('2024-01-21')).toBe('Sunday');
    });

    it('should return full day name for Wednesday', () => {
      expect(formatDayName('2024-01-17')).toBe('Wednesday');
    });

    it('should handle dates near month boundaries', () => {
      expect(formatDayName('2024-01-31')).toBe('Wednesday');
      expect(formatDayName('2024-02-01')).toBe('Thursday');
    });
  });

  describe('formatDate', () => {
    it('should format date as "Mon DD"', () => {
      expect(formatDate('2024-01-15')).toBe('Jan 15');
    });

    it('should format December date correctly', () => {
      expect(formatDate('2024-12-25')).toBe('Dec 25');
    });

    it('should handle single digit days', () => {
      expect(formatDate('2024-01-05')).toBe('Jan 5');
    });

    it('should handle end of month', () => {
      expect(formatDate('2024-01-31')).toBe('Jan 31');
    });

    it('should handle leap year date', () => {
      expect(formatDate('2024-02-29')).toBe('Feb 29');
    });
  });

  describe('formatTemperature', () => {
    it('should format whole number temperature', () => {
      expect(formatTemperature(72)).toBe('72°');
    });

    it('should round decimal temperatures up', () => {
      expect(formatTemperature(72.7)).toBe('73°');
    });

    it('should round decimal temperatures down', () => {
      expect(formatTemperature(72.3)).toBe('72°');
    });

    it('should handle zero temperature', () => {
      expect(formatTemperature(0)).toBe('0°');
    });

    it('should handle negative temperatures', () => {
      expect(formatTemperature(-5)).toBe('-5°');
    });

    it('should return placeholder for null', () => {
      expect(formatTemperature(null)).toBe('--°');
    });

    it('should return placeholder for undefined', () => {
      expect(formatTemperature(undefined)).toBe('--°');
    });
  });

  describe('getIconUrl', () => {
    it('should convert protocol-relative URL to HTTPS', () => {
      expect(getIconUrl('//cdn.weatherapi.com/weather/64x64/day/116.png'))
        .toBe('https://cdn.weatherapi.com/weather/64x64/day/116.png');
    });

    it('should preserve HTTPS URLs', () => {
      expect(getIconUrl('https://cdn.weatherapi.com/weather/64x64/day/116.png'))
        .toBe('https://cdn.weatherapi.com/weather/64x64/day/116.png');
    });

    it('should preserve HTTP URLs', () => {
      expect(getIconUrl('http://example.com/icon.png'))
        .toBe('http://example.com/icon.png');
    });

    it('should return empty string for null', () => {
      expect(getIconUrl(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(getIconUrl(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(getIconUrl('')).toBe('');
    });
  });

  describe('PLACEHOLDER_ICON', () => {
    it('should be a valid data URL', () => {
      expect(PLACEHOLDER_ICON).toMatch(/^data:image\/svg\+xml,/);
    });

    it('should contain SVG content', () => {
      expect(PLACEHOLDER_ICON).toContain('%3Csvg');
    });
  });
});
