import { describe, it, expect } from 'vitest';
import {
  formatTemperature,
  formatWindSpeed,
  formatPrecipitation,
  formatHumidity,
  formatTimestamp,
  formatHourTime,
  formatDayName,
  formatTemperatureRange,
  formatWind,
} from '../../utils/formatters.js';

describe('formatters', () => {
  describe('formatTemperature', () => {
    describe('Basic formatting', () => {
      it('should format integer temperature with Fahrenheit', () => {
        expect(formatTemperature(72)).toBe('72°F');
      });

      it('should format decimal temperature', () => {
        expect(formatTemperature(72.6)).toBe('73°F');
      });

      it('should format negative temperature', () => {
        expect(formatTemperature(-5)).toBe('-5°F');
      });

      it('should format zero temperature', () => {
        expect(formatTemperature(0)).toBe('0°F');
      });

      it('should format string number', () => {
        expect(formatTemperature('72')).toBe('72°F');
      });
    });

    describe('Options', () => {
      it('should use Celsius unit', () => {
        expect(formatTemperature(20, { unit: 'C' })).toBe('20°C');
      });

      it('should hide unit symbol', () => {
        expect(formatTemperature(72, { showUnit: false })).toBe('72°');
      });

      it('should show decimal places', () => {
        expect(formatTemperature(72.56, { decimals: 1 })).toBe('72.6°F');
      });

      it('should combine options', () => {
        expect(formatTemperature(20.5, { unit: 'C', decimals: 1, showUnit: true })).toBe('20.5°C');
      });
    });

    describe('Edge cases', () => {
      it('should return default for null', () => {
        expect(formatTemperature(null)).toBe('--');
      });

      it('should return default for undefined', () => {
        expect(formatTemperature(undefined)).toBe('--');
      });

      it('should return default for empty string', () => {
        expect(formatTemperature('')).toBe('--');
      });

      it('should return default for NaN', () => {
        expect(formatTemperature(NaN)).toBe('--');
      });

      it('should return default for Infinity', () => {
        expect(formatTemperature(Infinity)).toBe('--');
      });

      it('should return default for non-numeric string', () => {
        expect(formatTemperature('abc')).toBe('--');
      });

      it('should handle object input', () => {
        expect(formatTemperature({})).toBe('--');
      });
    });
  });

  describe('formatWindSpeed', () => {
    describe('Basic formatting', () => {
      it('should format integer wind speed', () => {
        expect(formatWindSpeed(10)).toBe('10 mph');
      });

      it('should round decimal wind speed', () => {
        expect(formatWindSpeed(10.6)).toBe('11 mph');
      });

      it('should handle zero wind speed', () => {
        expect(formatWindSpeed(0)).toBe('0 mph');
      });

      it('should handle negative values (takes absolute)', () => {
        expect(formatWindSpeed(-5)).toBe('5 mph');
      });

      it('should format string number', () => {
        expect(formatWindSpeed('15')).toBe('15 mph');
      });
    });

    describe('Options', () => {
      it('should use km/h unit', () => {
        expect(formatWindSpeed(16, { unit: 'km/h' })).toBe('16 km/h');
      });

      it('should use knots unit', () => {
        expect(formatWindSpeed(8, { unit: 'knots' })).toBe('8 knots');
      });

      it('should show decimal places', () => {
        expect(formatWindSpeed(10.56, { decimals: 1 })).toBe('10.6 mph');
      });
    });

    describe('Edge cases', () => {
      it('should return default for null', () => {
        expect(formatWindSpeed(null)).toBe('--');
      });

      it('should return default for undefined', () => {
        expect(formatWindSpeed(undefined)).toBe('--');
      });

      it('should return default for empty string', () => {
        expect(formatWindSpeed('')).toBe('--');
      });

      it('should return default for NaN', () => {
        expect(formatWindSpeed(NaN)).toBe('--');
      });

      it('should return default for Infinity', () => {
        expect(formatWindSpeed(Infinity)).toBe('--');
      });

      it('should return default for non-numeric string', () => {
        expect(formatWindSpeed('fast')).toBe('--');
      });
    });
  });

  describe('formatPrecipitation', () => {
    describe('Basic formatting', () => {
      it('should format precipitation percentage', () => {
        expect(formatPrecipitation(45)).toBe('45%');
      });

      it('should round decimal values', () => {
        expect(formatPrecipitation(45.6)).toBe('46%');
      });

      it('should handle zero precipitation', () => {
        expect(formatPrecipitation(0)).toBe('0%');
      });

      it('should handle 100% precipitation', () => {
        expect(formatPrecipitation(100)).toBe('100%');
      });

      it('should format string number', () => {
        expect(formatPrecipitation('30')).toBe('30%');
      });
    });

    describe('Clamping', () => {
      it('should clamp values above 100', () => {
        expect(formatPrecipitation(150)).toBe('100%');
      });

      it('should clamp negative values to 0', () => {
        expect(formatPrecipitation(-10)).toBe('0%');
      });
    });

    describe('Options', () => {
      it('should hide percent symbol', () => {
        expect(formatPrecipitation(45, { showSymbol: false })).toBe('45');
      });
    });

    describe('Edge cases', () => {
      it('should return default for null', () => {
        expect(formatPrecipitation(null)).toBe('--');
      });

      it('should return default for undefined', () => {
        expect(formatPrecipitation(undefined)).toBe('--');
      });

      it('should return default for empty string', () => {
        expect(formatPrecipitation('')).toBe('--');
      });

      it('should return default for NaN', () => {
        expect(formatPrecipitation(NaN)).toBe('--');
      });

      it('should return default for non-numeric string', () => {
        expect(formatPrecipitation('high')).toBe('--');
      });
    });
  });

  describe('formatHumidity', () => {
    describe('Basic formatting', () => {
      it('should format humidity percentage', () => {
        expect(formatHumidity(72)).toBe('72%');
      });

      it('should round decimal values', () => {
        expect(formatHumidity(72.4)).toBe('72%');
      });

      it('should handle zero humidity', () => {
        expect(formatHumidity(0)).toBe('0%');
      });

      it('should handle 100% humidity', () => {
        expect(formatHumidity(100)).toBe('100%');
      });

      it('should format string number', () => {
        expect(formatHumidity('65')).toBe('65%');
      });
    });

    describe('Clamping', () => {
      it('should clamp values above 100', () => {
        expect(formatHumidity(110)).toBe('100%');
      });

      it('should clamp negative values to 0', () => {
        expect(formatHumidity(-5)).toBe('0%');
      });
    });

    describe('Options', () => {
      it('should hide percent symbol', () => {
        expect(formatHumidity(72, { showSymbol: false })).toBe('72');
      });
    });

    describe('Edge cases', () => {
      it('should return default for null', () => {
        expect(formatHumidity(null)).toBe('--');
      });

      it('should return default for undefined', () => {
        expect(formatHumidity(undefined)).toBe('--');
      });

      it('should return default for empty string', () => {
        expect(formatHumidity('')).toBe('--');
      });

      it('should return default for NaN', () => {
        expect(formatHumidity(NaN)).toBe('--');
      });

      it('should return default for non-numeric string', () => {
        expect(formatHumidity('humid')).toBe('--');
      });
    });
  });

  describe('formatTimestamp', () => {
    describe('Basic formatting', () => {
      it('should format WeatherAPI timestamp string', () => {
        const result = formatTimestamp('2024-01-15 10:30');
        expect(result).toBe('Jan 15, 10:30 AM');
      });

      it('should format ISO string', () => {
        const result = formatTimestamp('2024-01-15T14:00:00');
        expect(result).toBe('Jan 15, 2:00 PM');
      });

      it('should format Date object', () => {
        const date = new Date(2024, 0, 15, 10, 30);
        const result = formatTimestamp(date);
        expect(result).toBe('Jan 15, 10:30 AM');
      });

      it('should format Unix timestamp', () => {
        const timestamp = new Date(2024, 0, 15, 10, 30).getTime();
        const result = formatTimestamp(timestamp);
        expect(result).toBe('Jan 15, 10:30 AM');
      });

      it('should handle midnight', () => {
        const result = formatTimestamp('2024-01-15 00:00');
        expect(result).toBe('Jan 15, 12:00 AM');
      });

      it('should handle noon', () => {
        const result = formatTimestamp('2024-01-15 12:00');
        expect(result).toBe('Jan 15, 12:00 PM');
      });

      it('should handle PM times', () => {
        const result = formatTimestamp('2024-01-15 23:59');
        expect(result).toBe('Jan 15, 11:59 PM');
      });
    });

    describe('Options', () => {
      it('should use 24-hour format', () => {
        const result = formatTimestamp('2024-01-15 14:30', { use24Hour: true });
        expect(result).toBe('Jan 15, 14:30');
      });

      it('should show only date', () => {
        const result = formatTimestamp('2024-01-15 10:30', { includeTime: false });
        expect(result).toBe('Jan 15');
      });

      it('should show only time', () => {
        const result = formatTimestamp('2024-01-15 10:30', { includeDate: false });
        expect(result).toBe('10:30 AM');
      });

      it('should combine options', () => {
        const result = formatTimestamp('2024-01-15 14:00', { includeDate: false, use24Hour: true });
        expect(result).toBe('14:00');
      });
    });

    describe('Edge cases', () => {
      it('should return default for null', () => {
        expect(formatTimestamp(null)).toBe('--');
      });

      it('should return default for undefined', () => {
        expect(formatTimestamp(undefined)).toBe('--');
      });

      it('should return default for empty string', () => {
        expect(formatTimestamp('')).toBe('--');
      });

      it('should return default for invalid date string', () => {
        expect(formatTimestamp('not-a-date')).toBe('--');
      });

      it('should return default for object', () => {
        expect(formatTimestamp({})).toBe('--');
      });

      it('should return default for invalid Date object', () => {
        expect(formatTimestamp(new Date('invalid'))).toBe('--');
      });
    });
  });

  describe('formatHourTime', () => {
    describe('Basic formatting', () => {
      it('should format to 12-hour time', () => {
        expect(formatHourTime('2024-01-15 14:00')).toBe('2 PM');
      });

      it('should format morning time', () => {
        expect(formatHourTime('2024-01-15 09:00')).toBe('9 AM');
      });

      it('should format midnight', () => {
        expect(formatHourTime('2024-01-15 00:00')).toBe('12 AM');
      });

      it('should format noon', () => {
        expect(formatHourTime('2024-01-15 12:00')).toBe('12 PM');
      });

      it('should format Date object', () => {
        const date = new Date(2024, 0, 15, 15, 30);
        expect(formatHourTime(date)).toBe('3 PM');
      });

      it('should format Unix timestamp', () => {
        const timestamp = new Date(2024, 0, 15, 10, 0).getTime();
        expect(formatHourTime(timestamp)).toBe('10 AM');
      });
    });

    describe('24-hour format', () => {
      it('should format in 24-hour time', () => {
        expect(formatHourTime('2024-01-15 14:30', { use24Hour: true })).toBe('14:30');
      });

      it('should format midnight in 24-hour', () => {
        expect(formatHourTime('2024-01-15 00:00', { use24Hour: true })).toBe('00:00');
      });

      it('should format morning in 24-hour', () => {
        expect(formatHourTime('2024-01-15 09:15', { use24Hour: true })).toBe('09:15');
      });
    });

    describe('Edge cases', () => {
      it('should return default for null', () => {
        expect(formatHourTime(null)).toBe('--');
      });

      it('should return default for undefined', () => {
        expect(formatHourTime(undefined)).toBe('--');
      });

      it('should return default for empty string', () => {
        expect(formatHourTime('')).toBe('--');
      });

      it('should return default for invalid date string', () => {
        expect(formatHourTime('not-a-time')).toBe('--');
      });

      it('should return default for object', () => {
        expect(formatHourTime({})).toBe('--');
      });
    });
  });

  describe('formatDayName', () => {
    // Helper to get a date for a specific day of the week
    // 0 = Sunday, 1 = Monday, etc.
    function getDateForDayOfWeek(dayOfWeek) {
      const today = new Date();
      const currentDay = today.getDay();
      const diff = dayOfWeek - currentDay;
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + diff);
      return targetDate;
    }

    // Helper to format date as YYYY-MM-DD
    function formatDateString(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    describe('Basic formatting', () => {
      it('should return "Today" for current date', () => {
        const today = new Date();
        expect(formatDayName(today)).toBe('Today');
      });

      it('should return abbreviated day name for non-today date', () => {
        // Get a date that's definitely not today (tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const result = formatDayName(tomorrow);
        expect(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).toContain(result);
        expect(result).not.toBe('Today');
      });

      it('should handle Date object', () => {
        const date = getDateForDayOfWeek(3); // Wednesday
        const result = formatDayName(date, { showToday: false });
        expect(result).toBe('Wed');
      });

      it('should handle Unix timestamp', () => {
        const date = getDateForDayOfWeek(4); // Thursday
        const result = formatDayName(date.getTime(), { showToday: false });
        expect(result).toBe('Thu');
      });

      it('should handle datetime strings', () => {
        const date = getDateForDayOfWeek(5); // Friday
        const dateStr = formatDateString(date) + ' 10:30';
        const result = formatDayName(dateStr, { showToday: false });
        expect(result).toBe('Fri');
      });
    });

    describe('Options', () => {
      it('should return full day name', () => {
        const tuesday = getDateForDayOfWeek(2);
        expect(formatDayName(tuesday, { abbreviated: false, showToday: false })).toBe('Tuesday');
      });

      it('should not show Today when disabled', () => {
        const today = new Date();
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        expect(formatDayName(today, { showToday: false })).toBe(dayNames[today.getDay()]);
      });

      it('should combine options', () => {
        const monday = getDateForDayOfWeek(1);
        expect(formatDayName(monday, { abbreviated: false, showToday: false })).toBe('Monday');
      });
    });

    describe('All days of the week', () => {
      it('should format Sunday', () => {
        const sunday = getDateForDayOfWeek(0);
        expect(formatDayName(sunday, { showToday: false })).toBe('Sun');
      });

      it('should format Monday', () => {
        const monday = getDateForDayOfWeek(1);
        expect(formatDayName(monday, { showToday: false })).toBe('Mon');
      });

      it('should format Tuesday', () => {
        const tuesday = getDateForDayOfWeek(2);
        expect(formatDayName(tuesday, { showToday: false })).toBe('Tue');
      });

      it('should format Wednesday', () => {
        const wednesday = getDateForDayOfWeek(3);
        expect(formatDayName(wednesday, { showToday: false })).toBe('Wed');
      });

      it('should format Thursday', () => {
        const thursday = getDateForDayOfWeek(4);
        expect(formatDayName(thursday, { showToday: false })).toBe('Thu');
      });

      it('should format Friday', () => {
        const friday = getDateForDayOfWeek(5);
        expect(formatDayName(friday, { showToday: false })).toBe('Fri');
      });

      it('should format Saturday', () => {
        const saturday = getDateForDayOfWeek(6);
        expect(formatDayName(saturday, { showToday: false })).toBe('Sat');
      });
    });

    describe('Edge cases', () => {
      it('should return default for null', () => {
        expect(formatDayName(null)).toBe('--');
      });

      it('should return default for undefined', () => {
        expect(formatDayName(undefined)).toBe('--');
      });

      it('should return default for empty string', () => {
        expect(formatDayName('')).toBe('--');
      });

      it('should return default for invalid date string', () => {
        expect(formatDayName('not-a-date')).toBe('--');
      });

      it('should return default for object', () => {
        expect(formatDayName({})).toBe('--');
      });
    });
  });

  describe('formatTemperatureRange', () => {
    it('should format temperature range', () => {
      expect(formatTemperatureRange(72, 55)).toBe('72°F / 55°F');
    });

    it('should pass options to formatTemperature', () => {
      expect(formatTemperatureRange(72, 55, { unit: 'C' })).toBe('72°C / 55°C');
    });

    it('should handle showUnit option', () => {
      expect(formatTemperatureRange(72, 55, { showUnit: false })).toBe('72° / 55°');
    });

    it('should handle invalid high value', () => {
      expect(formatTemperatureRange(null, 55)).toBe('-- / 55°F');
    });

    it('should handle invalid low value', () => {
      expect(formatTemperatureRange(72, null)).toBe('72°F / --');
    });

    it('should handle both invalid values', () => {
      expect(formatTemperatureRange(null, undefined)).toBe('-- / --');
    });
  });

  describe('formatWind', () => {
    it('should format wind speed with direction', () => {
      expect(formatWind(10, 'NW')).toBe('10 mph NW');
    });

    it('should format wind speed without direction', () => {
      expect(formatWind(10)).toBe('10 mph');
    });

    it('should pass options to formatWindSpeed', () => {
      expect(formatWind(16, 'SE', { unit: 'km/h' })).toBe('16 km/h SE');
    });

    it('should handle null speed', () => {
      expect(formatWind(null, 'NW')).toBe('--');
    });

    it('should handle empty direction', () => {
      expect(formatWind(10, '')).toBe('10 mph');
    });

    it('should handle null direction', () => {
      expect(formatWind(10, null)).toBe('10 mph');
    });

    it('should trim direction whitespace', () => {
      expect(formatWind(10, '  NE  ')).toBe('10 mph NE');
    });

    it('should handle whitespace-only direction', () => {
      expect(formatWind(10, '   ')).toBe('10 mph');
    });
  });
});
