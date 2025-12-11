import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';

// Mock fetch globally before importing the service
global.fetch = vi.fn();

// Set up environment variables before importing the service
beforeAll(() => {
  if (!import.meta.env) {
    import.meta.env = {};
  }
  import.meta.env.VITE_WEATHER_API_KEY = 'test_api_key_12345';
});

import {
  getCurrentWeather,
  getHourlyForecast,
  getDailyForecast,
  WeatherApiError,
} from '../../services/weatherApi.js';

// Sample API response data
const mockApiResponse = {
  location: {
    name: 'San Francisco',
    region: 'California',
    country: 'United States of America',
    tz_id: 'America/Los_Angeles',
    localtime: '2024-01-15 10:30',
  },
  current: {
    temp_f: 65,
    feelslike_f: 63,
    condition: {
      text: 'Partly cloudy',
      icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
    },
    humidity: 72,
    wind_mph: 10.5,
    wind_dir: 'WSW',
    last_updated: '2024-01-15 10:00',
  },
  forecast: {
    forecastday: [
      {
        date: '2024-01-15',
        day: {
          maxtemp_f: 68,
          mintemp_f: 55,
          condition: {
            text: 'Partly cloudy',
            icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
          },
          daily_chance_of_rain: 20,
          daily_chance_of_snow: 0,
        },
        hour: [
          {
            time: '2024-01-15 10:00',
            temp_f: 62,
            condition: {
              text: 'Partly cloudy',
              icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
            },
            chance_of_rain: 10,
            chance_of_snow: 0,
            wind_mph: 8.5,
            humidity: 70,
          },
          {
            time: '2024-01-15 11:00',
            temp_f: 64,
            condition: {
              text: 'Sunny',
              icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
            },
            chance_of_rain: 5,
            chance_of_snow: 0,
            wind_mph: 9.0,
            humidity: 68,
          },
        ],
      },
      {
        date: '2024-01-16',
        day: {
          maxtemp_f: 70,
          mintemp_f: 56,
          condition: {
            text: 'Sunny',
            icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          },
          daily_chance_of_rain: 5,
          daily_chance_of_snow: 0,
        },
        hour: [
          {
            time: '2024-01-16 00:00',
            temp_f: 58,
            condition: {
              text: 'Clear',
              icon: '//cdn.weatherapi.com/weather/64x64/night/113.png',
            },
            chance_of_rain: 0,
            chance_of_snow: 0,
            wind_mph: 7.0,
            humidity: 75,
          },
        ],
      },
      {
        date: '2024-01-17',
        day: {
          maxtemp_f: 72,
          mintemp_f: 58,
          condition: {
            text: 'Sunny',
            icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          },
          daily_chance_of_rain: 0,
          daily_chance_of_snow: 0,
        },
        hour: [],
      },
      {
        date: '2024-01-18',
        day: {
          maxtemp_f: 71,
          mintemp_f: 57,
          condition: {
            text: 'Partly cloudy',
            icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
          },
          daily_chance_of_rain: 15,
          daily_chance_of_snow: 0,
        },
        hour: [],
      },
      {
        date: '2024-01-19',
        day: {
          maxtemp_f: 69,
          mintemp_f: 56,
          condition: {
            text: 'Cloudy',
            icon: '//cdn.weatherapi.com/weather/64x64/day/119.png',
          },
          daily_chance_of_rain: 30,
          daily_chance_of_snow: 0,
        },
        hour: [],
      },
      {
        date: '2024-01-20',
        day: {
          maxtemp_f: 66,
          mintemp_f: 54,
          condition: {
            text: 'Light rain',
            icon: '//cdn.weatherapi.com/weather/64x64/day/296.png',
          },
          daily_chance_of_rain: 60,
          daily_chance_of_snow: 0,
        },
        hour: [],
      },
      {
        date: '2024-01-21',
        day: {
          maxtemp_f: 67,
          mintemp_f: 55,
          condition: {
            text: 'Partly cloudy',
            icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
          },
          daily_chance_of_rain: 25,
          daily_chance_of_snow: 0,
        },
        hour: [],
      },
    ],
  },
};

describe('weatherApi Service', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Ensure API key is always set
    import.meta.env.VITE_WEATHER_API_KEY = 'test_api_key_12345';
  });

  afterEach(() => {
    // Restore API key after tests that modify it
    import.meta.env.VITE_WEATHER_API_KEY = 'test_api_key_12345';
  });

  describe('getCurrentWeather', () => {
    it('should fetch and return current weather for a valid location', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await getCurrentWeather('San Francisco');

      expect(fetch).toHaveBeenCalledTimes(1);
      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl).toContain('San%20Francisco');
      expect(callUrl).toContain('forecast.json');
      
      expect(result).toHaveProperty('current');
      expect(result).toHaveProperty('location');
      
      expect(result.current.temperature).toBe(65);
      expect(result.current.feelsLike).toBe(63);
      expect(result.current.condition).toBe('Partly cloudy');
      expect(result.current.humidity).toBe(72);
      expect(result.current.windSpeed).toBe(10.5);
      
      expect(result.location.city).toBe('San Francisco');
      expect(result.location.region).toBe('California');
      expect(result.location.country).toBe('United States of America');
    });

    it('should handle location not found (404 error)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

      const error = await getCurrentWeather('InvalidLocation123').catch(e => e);
      
      expect(error).toBeInstanceOf(WeatherApiError);
      expect(error.message).toContain("We couldn't find that location");
    });

    it('should handle API server error (500)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      const error = await getCurrentWeather('San Francisco').catch(e => e);
      
      expect(error).toBeInstanceOf(WeatherApiError);
      expect(error.message).toContain('Weather service is temporarily unavailable');
    });

    it('should handle network failure', async () => {
      fetch.mockRejectedValueOnce(new TypeError('Network request failed'));

      await expect(getCurrentWeather('San Francisco')).rejects.toThrow(
        WeatherApiError
      );
      await expect(getCurrentWeather('San Francisco')).rejects.toThrow(
        'Unable to fetch weather data'
      );
    });

    it('should throw error when location is empty', async () => {
      await expect(getCurrentWeather('')).rejects.toThrow(WeatherApiError);
      await expect(getCurrentWeather('')).rejects.toThrow(
        'Location is required'
      );
    });

    it('should throw error when location is not a string', async () => {
      await expect(getCurrentWeather(null)).rejects.toThrow(WeatherApiError);
      await expect(getCurrentWeather(undefined)).rejects.toThrow(
        WeatherApiError
      );
      await expect(getCurrentWeather(123)).rejects.toThrow(WeatherApiError);
    });

    it('should throw error when API key is missing', async () => {
      import.meta.env.VITE_WEATHER_API_KEY = '';

      await expect(getCurrentWeather('San Francisco')).rejects.toThrow(
        WeatherApiError
      );
      await expect(getCurrentWeather('San Francisco')).rejects.toThrow(
        'Unable to connect to weather service'
      );
    });

    it('should throw error when API key is invalid placeholder', async () => {
      import.meta.env.VITE_WEATHER_API_KEY = 'your_api_key_here';

      await expect(getCurrentWeather('San Francisco')).rejects.toThrow(
        WeatherApiError
      );
      await expect(getCurrentWeather('San Francisco')).rejects.toThrow(
        'Unable to connect to weather service'
      );
    });

    it('should handle invalid JSON response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new SyntaxError('Invalid JSON');
        },
      });

      const error = await getCurrentWeather('San Francisco').catch(e => e);
      
      expect(error).toBeInstanceOf(WeatherApiError);
      expect(error.message).toContain('Invalid response from weather service');
    });

    it('should handle malformed API response (missing required fields)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          location: { name: 'Test' },
          // Missing current and forecast
        }),
      });

      const error = await getCurrentWeather('San Francisco').catch(e => e);
      
      expect(error).toBeInstanceOf(WeatherApiError);
      expect(error.message).toContain('Invalid response from weather service');
    });

    it('should handle 401 unauthorized error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({}),
      });

      await expect(getCurrentWeather('San Francisco')).rejects.toThrow(
        'Unable to connect to weather service'
      );
    });

    it('should handle 403 forbidden error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({}),
      });

      await expect(getCurrentWeather('San Francisco')).rejects.toThrow(
        'Unable to connect to weather service'
      );
    });
  });

  describe('getHourlyForecast', () => {
    it('should fetch and return hourly forecast for a valid location', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await getHourlyForecast('San Francisco');

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('hourly');
      expect(result).toHaveProperty('location');
      
      expect(Array.isArray(result.hourly)).toBe(true);
      expect(result.hourly.length).toBeGreaterThan(0);
      
      const firstHour = result.hourly[0];
      expect(firstHour).toHaveProperty('time');
      expect(firstHour).toHaveProperty('temperature');
      expect(firstHour).toHaveProperty('condition');
      expect(firstHour).toHaveProperty('conditionIcon');
      expect(firstHour).toHaveProperty('precipitationChance');
      expect(firstHour).toHaveProperty('windSpeed');
      expect(firstHour).toHaveProperty('humidity');
      
      expect(result.location.city).toBe('San Francisco');
    });

    it('should handle location not found error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

      await expect(getHourlyForecast('InvalidCity')).rejects.toThrow(
        WeatherApiError
      );
    });

    it('should handle network failure', async () => {
      fetch.mockRejectedValueOnce(new TypeError('Network error'));

      await expect(getHourlyForecast('San Francisco')).rejects.toThrow(
        'Unable to fetch weather data'
      );
    });

    it('should return empty array if forecast data is missing', async () => {
      const responseWithoutHours = {
        ...mockApiResponse,
        forecast: {
          forecastday: [
            {
              date: '2024-01-15',
              day: mockApiResponse.forecast.forecastday[0].day,
              hour: undefined, // Missing hour data
            },
          ],
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithoutHours,
      });

      const result = await getHourlyForecast('San Francisco');
      expect(result.hourly).toEqual([]);
    });

    it('should handle zip code search', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await getHourlyForecast('94102');

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl).toContain('94102');
      expect(result).toHaveProperty('hourly');
      expect(result).toHaveProperty('location');
    });
  });

  describe('getDailyForecast', () => {
    it('should fetch and return 7-day forecast for a valid location', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await getDailyForecast('San Francisco');

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('daily');
      expect(result).toHaveProperty('location');
      
      expect(Array.isArray(result.daily)).toBe(true);
      expect(result.daily.length).toBe(7);
      
      const firstDay = result.daily[0];
      expect(firstDay).toHaveProperty('date');
      expect(firstDay).toHaveProperty('highTemp');
      expect(firstDay).toHaveProperty('lowTemp');
      expect(firstDay).toHaveProperty('condition');
      expect(firstDay).toHaveProperty('conditionIcon');
      expect(firstDay).toHaveProperty('precipitationChance');
      
      expect(firstDay.date).toBe('2024-01-15');
      expect(firstDay.highTemp).toBe(68);
      expect(firstDay.lowTemp).toBe(55);
      expect(firstDay.condition).toBe('Partly cloudy');
      expect(firstDay.precipitationChance).toBe(20);
      
      expect(result.location.city).toBe('San Francisco');
    });

    it('should handle location not found error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

      await expect(getDailyForecast('InvalidLocation')).rejects.toThrow(
        WeatherApiError
      );
    });

    it('should handle API error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      await expect(getDailyForecast('San Francisco')).rejects.toThrow(
        'Weather service is temporarily unavailable'
      );
    });

    it('should return empty array if forecast data is invalid', async () => {
      const responseWithoutForecast = {
        ...mockApiResponse,
        forecast: {
          forecastday: null, // Invalid forecast data
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithoutForecast,
      });

      const result = await getDailyForecast('San Francisco');
      expect(result.daily).toEqual([]);
    });

    it('should handle region search', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await getDailyForecast('California');

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl).toContain('California');
      expect(result).toHaveProperty('daily');
      expect(result.daily.length).toBe(7);
    });

    it('should use chance_of_snow if chance_of_rain is not available', async () => {
      const responseWithSnow = {
        ...mockApiResponse,
        forecast: {
          forecastday: [
            {
              date: '2024-01-15',
              day: {
                maxtemp_f: 32,
                mintemp_f: 25,
                condition: {
                  text: 'Snow',
                  icon: '//cdn.weatherapi.com/weather/64x64/day/338.png',
                },
                daily_chance_of_rain: 0,
                daily_chance_of_snow: 80,
              },
              hour: [],
            },
          ],
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithSnow,
      });

      const result = await getDailyForecast('Denver');
      expect(result.daily[0].precipitationChance).toBe(80);
    });

    it('should default precipitation chance to 0 if both rain and snow are missing', async () => {
      const responseNoPrecip = {
        ...mockApiResponse,
        forecast: {
          forecastday: [
            {
              date: '2024-01-15',
              day: {
                maxtemp_f: 75,
                mintemp_f: 60,
                condition: {
                  text: 'Sunny',
                  icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
                },
                // No chance_of_rain or chance_of_snow
              },
              hour: [],
            },
          ],
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseNoPrecip,
      });

      const result = await getDailyForecast('Phoenix');
      expect(result.daily[0].precipitationChance).toBe(0);
    });
  });

  describe('WeatherApiError', () => {
    it('should create error with correct properties', () => {
      const error = new WeatherApiError(
        'Test error message',
        'network',
        new Error('Original error')
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(WeatherApiError);
      expect(error.message).toBe('Test error message');
      expect(error.name).toBe('WeatherApiError');
      expect(error.type).toBe('network');
      expect(error.originalError).toBeInstanceOf(Error);
    });

    it('should create error without original error', () => {
      const error = new WeatherApiError('Test error', 'validation');

      expect(error.message).toBe('Test error');
      expect(error.type).toBe('validation');
      expect(error.originalError).toBeNull();
    });
  });
});
