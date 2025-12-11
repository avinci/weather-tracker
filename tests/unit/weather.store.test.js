/**
 * Unit tests for Weather Store
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useWeatherStore } from '../../stores/weather.js';
import * as weatherApi from '../../services/weatherApi.js';

// Mock the weatherApi module
vi.mock('../../services/weatherApi.js', () => ({
  getCurrentWeather: vi.fn(),
  getHourlyForecast: vi.fn(),
  getDailyForecast: vi.fn(),
  WeatherApiError: class WeatherApiError extends Error {
    constructor(message, type) {
      super(message);
      this.name = 'WeatherApiError';
      this.type = type;
    }
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

global.localStorage = localStorageMock;

describe('Weather Store', () => {
  let store;

  // Mock weather data
  const mockCurrentWeather = {
    current: {
      temperature: 65,
      feelsLike: 63,
      condition: 'Partly cloudy',
      conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
      humidity: 72,
      windSpeed: 10,
      windDirection: 'W',
      lastUpdated: '2024-01-15 10:30',
    },
    location: {
      city: 'San Francisco',
      region: 'California',
      country: 'United States of America',
      timezone: 'America/Los_Angeles',
      localtime: '2024-01-15 10:30',
    },
  };

  const mockHourlyForecast = {
    hourly: [
      {
        time: '2024-01-15 11:00',
        temperature: 66,
        condition: 'Sunny',
        conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
        precipitationChance: 10,
        windSpeed: 12,
        humidity: 70,
      },
      {
        time: '2024-01-15 12:00',
        temperature: 68,
        condition: 'Sunny',
        conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
        precipitationChance: 5,
        windSpeed: 11,
        humidity: 68,
      },
    ],
    location: mockCurrentWeather.location,
  };

  const mockDailyForecast = {
    daily: [
      {
        date: '2024-01-15',
        highTemp: 72,
        lowTemp: 58,
        condition: 'Partly cloudy',
        conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
        precipitationChance: 20,
      },
      {
        date: '2024-01-16',
        highTemp: 70,
        lowTemp: 56,
        condition: 'Sunny',
        conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
        precipitationChance: 10,
      },
    ],
    location: mockCurrentWeather.location,
  };

  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia());
    store = useWeatherStore();

    // Clear all mocks
    vi.clearAllMocks();
    localStorageMock.clear();

    // Reset API mocks to default successful responses
    weatherApi.getCurrentWeather.mockResolvedValue(mockCurrentWeather);
    weatherApi.getHourlyForecast.mockResolvedValue(mockHourlyForecast);
    weatherApi.getDailyForecast.mockResolvedValue(mockDailyForecast);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(store.currentWeather).toBeNull();
      expect(store.hourlyForecast).toEqual([]);
      expect(store.dailyForecast).toEqual([]);
      expect(store.location).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.lastUpdated).toBeNull();
    });
  });

  describe('fetchWeatherData', () => {
    it('should fetch and update all weather data successfully', async () => {
      await store.fetchWeatherData('San Francisco');

      expect(store.currentWeather).toEqual(mockCurrentWeather.current);
      expect(store.hourlyForecast).toEqual(mockHourlyForecast.hourly);
      expect(store.dailyForecast).toEqual(mockDailyForecast.daily);
      expect(store.location).toEqual(mockCurrentWeather.location);
      expect(store.lastUpdated).toBeDefined();
      expect(store.lastUpdated).toBeGreaterThan(0);
      expect(store.error).toBeNull();
    });

    it('should set loading state correctly during fetch', async () => {
      const fetchPromise = store.fetchWeatherData('San Francisco');

      // Loading should be true immediately
      expect(store.isLoading).toBe(true);

      await fetchPromise;

      // Loading should be false after completion
      expect(store.isLoading).toBe(false);
    });

    it('should clear error state on successful fetch', async () => {
      // Set an error first
      store.error = 'Previous error';

      await store.fetchWeatherData('San Francisco');

      expect(store.error).toBeNull();
    });

    it('should save location to localStorage on successful fetch', async () => {
      await store.fetchWeatherData('San Francisco');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'weather_last_location',
        'San Francisco'
      );
    });

    it('should handle WeatherApiError and set user-friendly error message', async () => {
      const error = new weatherApi.WeatherApiError(
        "We couldn't find that location.",
        'not_found'
      );
      weatherApi.getCurrentWeather.mockRejectedValue(error);
      weatherApi.getHourlyForecast.mockRejectedValue(error);
      weatherApi.getDailyForecast.mockRejectedValue(error);

      await store.fetchWeatherData('InvalidLocation');

      expect(store.error).toBe("We couldn't find that location.");
      expect(store.isLoading).toBe(false);
    });

    it('should handle generic errors with fallback message', async () => {
      const error = new Error('Network failure');
      weatherApi.getCurrentWeather.mockRejectedValue(error);
      weatherApi.getHourlyForecast.mockRejectedValue(error);
      weatherApi.getDailyForecast.mockRejectedValue(error);

      await store.fetchWeatherData('San Francisco');

      expect(store.error).toBe('Something went wrong. Please try again.');
      expect(store.isLoading).toBe(false);
    });

    it('should set loading to false even if fetch fails', async () => {
      weatherApi.getCurrentWeather.mockRejectedValue(new Error('API Error'));
      weatherApi.getHourlyForecast.mockRejectedValue(new Error('API Error'));
      weatherApi.getDailyForecast.mockRejectedValue(new Error('API Error'));

      await store.fetchWeatherData('San Francisco');

      expect(store.isLoading).toBe(false);
    });

    it('should call all API methods with correct location', async () => {
      await store.fetchWeatherData('New York');

      expect(weatherApi.getCurrentWeather).toHaveBeenCalledWith('New York');
      expect(weatherApi.getHourlyForecast).toHaveBeenCalledWith('New York');
      expect(weatherApi.getDailyForecast).toHaveBeenCalledWith('New York');
    });
  });

  describe('refreshWeather', () => {
    it('should refresh weather using current location', async () => {
      // Set up initial state with location
      store.location = { city: 'San Francisco' };

      await store.refreshWeather();

      expect(weatherApi.getCurrentWeather).toHaveBeenCalledWith('San Francisco');
    });

    it('should use default location if no current location set', async () => {
      // No location set
      store.location = null;

      await store.refreshWeather();

      expect(weatherApi.getCurrentWeather).toHaveBeenCalledWith('San Francisco');
    });

    it('should update lastUpdated timestamp', async () => {
      store.location = { city: 'New York' };
      const beforeTime = Date.now();

      await store.refreshWeather();

      expect(store.lastUpdated).toBeGreaterThanOrEqual(beforeTime);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      store.error = 'Some error message';

      store.clearError();

      expect(store.error).toBeNull();
    });

    it('should not affect other state properties', () => {
      store.error = 'Some error';
      store.currentWeather = mockCurrentWeather.current;
      store.isLoading = true;

      store.clearError();

      expect(store.error).toBeNull();
      expect(store.currentWeather).toEqual(mockCurrentWeather.current);
      expect(store.isLoading).toBe(true);
    });
  });

  describe('initializeStore', () => {
    it('should fetch weather for default location if no saved location', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      await store.initializeStore();

      expect(weatherApi.getCurrentWeather).toHaveBeenCalledWith('San Francisco');
    });

    it('should fetch weather for saved location if available', async () => {
      localStorageMock.getItem.mockReturnValue('New York');

      await store.initializeStore();

      expect(weatherApi.getCurrentWeather).toHaveBeenCalledWith('New York');
    });

    it('should update all state after initialization', async () => {
      await store.initializeStore();

      expect(store.currentWeather).toEqual(mockCurrentWeather.current);
      expect(store.location).toEqual(mockCurrentWeather.location);
      expect(store.lastUpdated).toBeDefined();
    });
  });

  describe('localStorage persistence', () => {
    it('should save location to localStorage', () => {
      store.saveLastLocation('Chicago');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'weather_last_location',
        'Chicago'
      );
    });

    it('should load location from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('Boston');

      const result = store.loadLastLocation();

      expect(result).toBe('Boston');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('weather_last_location');
    });

    it('should handle localStorage errors gracefully when saving', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // Should not throw
      expect(() => store.saveLastLocation('Denver')).not.toThrow();
    });

    it('should handle localStorage errors gracefully when loading', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage unavailable');
      });

      const result = store.loadLastLocation();

      expect(result).toBeNull();
    });
  });

  describe('formattedLastUpdated getter', () => {
    it('should return "Never" if lastUpdated is null', () => {
      store.lastUpdated = null;

      expect(store.formattedLastUpdated).toBe('Never');
    });

    it('should return "Just now" for updates within 30 seconds', () => {
      store.lastUpdated = Date.now() - 15000; // 15 seconds ago

      expect(store.formattedLastUpdated).toBe('Just now');
    });

    it('should return seconds for updates within 60 seconds', () => {
      store.lastUpdated = Date.now() - 45000; // 45 seconds ago

      expect(store.formattedLastUpdated).toBe('45 seconds ago');
    });

    it('should return "1 minute ago" for updates around 1 minute', () => {
      store.lastUpdated = Date.now() - 75000; // 75 seconds ago

      expect(store.formattedLastUpdated).toBe('1 minute ago');
    });

    it('should return minutes for updates within an hour', () => {
      store.lastUpdated = Date.now() - 1800000; // 30 minutes ago

      expect(store.formattedLastUpdated).toBe('30 minutes ago');
    });

    it('should return "1 hour ago" for updates around 1 hour', () => {
      store.lastUpdated = Date.now() - 3900000; // 65 minutes ago

      expect(store.formattedLastUpdated).toBe('1 hour ago');
    });

    it('should return hours for updates within 24 hours', () => {
      store.lastUpdated = Date.now() - 7200000; // 2 hours ago

      expect(store.formattedLastUpdated).toBe('2 hours ago');
    });

    it('should return "1 day ago" for updates around 24 hours', () => {
      store.lastUpdated = Date.now() - 90000000; // ~25 hours ago

      expect(store.formattedLastUpdated).toBe('1 day ago');
    });

    it('should return days for updates older than 24 hours', () => {
      store.lastUpdated = Date.now() - 259200000; // 3 days ago

      expect(store.formattedLastUpdated).toBe('3 days ago');
    });
  });

  describe('State mutations and side effects', () => {
    it('should maintain previous weather data when new fetch fails', async () => {
      // First successful fetch
      await store.fetchWeatherData('San Francisco');
      const previousWeather = store.currentWeather;

      // Second fetch fails
      weatherApi.getCurrentWeather.mockRejectedValue(new Error('API Error'));
      weatherApi.getHourlyForecast.mockRejectedValue(new Error('API Error'));
      weatherApi.getDailyForecast.mockRejectedValue(new Error('API Error'));

      await store.fetchWeatherData('InvalidLocation');

      // Previous data should still be there
      expect(store.currentWeather).toEqual(previousWeather);
      expect(store.error).toBeDefined();
    });

    it('should update lastUpdated only on successful fetch', async () => {
      // Successful fetch
      await store.fetchWeatherData('San Francisco');
      const firstTimestamp = store.lastUpdated;

      // Failed fetch
      weatherApi.getCurrentWeather.mockRejectedValue(new Error('API Error'));
      weatherApi.getHourlyForecast.mockRejectedValue(new Error('API Error'));
      weatherApi.getDailyForecast.mockRejectedValue(new Error('API Error'));

      await store.fetchWeatherData('InvalidLocation');

      // Timestamp should not have changed
      expect(store.lastUpdated).toBe(firstTimestamp);
    });

    it('should allow multiple concurrent fetches without state corruption', async () => {
      const promise1 = store.fetchWeatherData('San Francisco');
      const promise2 = store.fetchWeatherData('New York');

      await Promise.all([promise1, promise2]);

      // Last fetch should win
      expect(store.location.city).toBeDefined();
      expect(store.isLoading).toBe(false);
    });
  });
});
