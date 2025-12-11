/**
 * Weather API Service
 * 
 * Provides functions to interact with WeatherAPI.com for fetching current weather,
 * hourly forecasts, and daily forecasts.
 * 
 * @module services/weatherApi
 */

// API Configuration
const API_BASE_URL = 'https://api.weatherapi.com/v1';

/**
 * Gets the API key from environment variables
 * @returns {string} API key
 */
function getApiKey() {
  return import.meta.env.VITE_WEATHER_API_KEY;
}

/**
 * Custom error class for weather API errors
 */
class WeatherApiError extends Error {
  constructor(message, type, originalError = null) {
    super(message);
    this.name = 'WeatherApiError';
    this.type = type; // 'network', 'not_found', 'api_error', 'validation', 'config'
    this.originalError = originalError;
  }
}

/**
 * Validates the API configuration
 * 
 * @throws {WeatherApiError} If API key is missing or invalid
 */
function validateConfig() {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'your_api_key_here' || apiKey.trim() === '') {
    throw new WeatherApiError(
      'Unable to connect to weather service. Please check configuration.',
      'config'
    );
  }
}

/**
 * Makes an HTTP request to the WeatherAPI.com forecast endpoint
 * 
 * @param {string} location - Location query (city name, zip code, or region)
 * @returns {Promise<Object>} Raw API response data
 * @throws {WeatherApiError} If request fails or returns an error
 */
async function fetchWeatherData(location) {
  validateConfig();

  if (!location || typeof location !== 'string' || location.trim() === '') {
    throw new WeatherApiError(
      'Location is required and must be a valid string.',
      'validation'
    );
  }

  const apiKey = getApiKey();
  const url = `${API_BASE_URL}/forecast.json?key=${apiKey}&q=${encodeURIComponent(location)}&days=7&aqi=no`;

  try {
    const response = await fetch(url);

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 400 || response.status === 404) {
        throw new WeatherApiError(
          "We couldn't find that location. Please try a different city, zip code, or region.",
          'not_found'
        );
      } else if (response.status === 401 || response.status === 403) {
        throw new WeatherApiError(
          'Unable to connect to weather service. Please check configuration.',
          'config'
        );
      } else if (response.status >= 500) {
        throw new WeatherApiError(
          'Weather service is temporarily unavailable. Please try again later.',
          'api_error'
        );
      } else {
        throw new WeatherApiError(
          'Something went wrong. Please try again.',
          'api_error'
        );
      }
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // Handle JSON parsing errors
      throw new WeatherApiError(
        'Invalid response from weather service.',
        'validation',
        jsonError
      );
    }

    // Validate response structure
    if (!data || !data.location || !data.current || !data.forecast) {
      throw new WeatherApiError(
        'Invalid response from weather service.',
        'validation'
      );
    }

    return data;
  } catch (error) {
    // If it's already a WeatherApiError, re-throw it
    if (error instanceof WeatherApiError) {
      throw error;
    }

    // Handle network errors (fetch failures, connection issues)
    if (error instanceof TypeError || error.message.includes('fetch')) {
      throw new WeatherApiError(
        'Unable to fetch weather data. Please check your internet connection and try again.',
        'network',
        error
      );
    }

    // Generic error fallback
    throw new WeatherApiError(
      'Something went wrong. Please try again.',
      'api_error',
      error
    );
  }
}

/**
 * Transforms raw current weather data into normalized format
 * 
 * @param {Object} data - Raw API response
 * @returns {Object} Normalized current weather data
 */
function transformCurrentWeather(data) {
  return {
    temperature: data.current.temp_f,
    feelsLike: data.current.feelslike_f,
    condition: data.current.condition.text,
    conditionIcon: data.current.condition.icon,
    humidity: data.current.humidity,
    windSpeed: data.current.wind_mph,
    windDirection: data.current.wind_dir,
    lastUpdated: data.current.last_updated,
  };
}

/**
 * Transforms raw hourly forecast data into normalized format
 * 
 * @param {Object} data - Raw API response
 * @returns {Array<Object>} Array of normalized hourly forecast data (24 hours)
 */
function transformHourlyForecast(data) {
  const hourlyData = [];
  
  // Get forecast days (should include today and tomorrow for 24-hour coverage)
  const forecastDays = data.forecast.forecastday;
  
  if (!forecastDays || forecastDays.length === 0) {
    return hourlyData;
  }

  // Collect all hourly data from forecast days
  forecastDays.forEach((day) => {
    if (day.hour && Array.isArray(day.hour)) {
      day.hour.forEach((hour) => {
        hourlyData.push({
          time: hour.time,
          temperature: hour.temp_f,
          condition: hour.condition.text,
          conditionIcon: hour.condition.icon,
          precipitationChance: hour.chance_of_rain || hour.chance_of_snow || 0,
          windSpeed: hour.wind_mph,
          humidity: hour.humidity,
        });
      });
    }
  });

  // If we have 24 or fewer hours total, return all
  if (hourlyData.length <= 24) {
    return hourlyData;
  }

  // Get current time to filter future hours
  const now = new Date();
  const currentHour = now.getHours();
  const currentDate = now.toISOString().split('T')[0];

  // Filter to get next 24 hours
  const futureHours = hourlyData.filter((hour) => {
    const hourDate = hour.time.split(' ')[0];
    const hourTime = parseInt(hour.time.split(' ')[1].split(':')[0]);
    
    // Include hours from current time onwards
    if (hourDate === currentDate) {
      return hourTime >= currentHour;
    }
    // Include all hours from future dates
    return hourDate > currentDate;
  });

  // Return only the next 24 hours
  return futureHours.slice(0, 24);
}

/**
 * Transforms raw daily forecast data into normalized format
 * 
 * @param {Object} data - Raw API response
 * @returns {Array<Object>} Array of normalized daily forecast data (7 days)
 */
function transformDailyForecast(data) {
  const forecastDays = data.forecast.forecastday;
  
  if (!forecastDays || !Array.isArray(forecastDays)) {
    return [];
  }

  return forecastDays.map((day) => ({
    date: day.date,
    highTemp: day.day.maxtemp_f,
    lowTemp: day.day.mintemp_f,
    condition: day.day.condition.text,
    conditionIcon: day.day.condition.icon,
    precipitationChance: day.day.daily_chance_of_rain || day.day.daily_chance_of_snow || 0,
  }));
}

/**
 * Transforms raw location data into normalized format
 * 
 * @param {Object} data - Raw API response
 * @returns {Object} Normalized location data
 */
function transformLocation(data) {
  return {
    city: data.location.name,
    region: data.location.region,
    country: data.location.country,
    timezone: data.location.tz_id,
    localtime: data.location.localtime,
  };
}

/**
 * Gets current weather for a location
 * 
 * @param {string} location - Location query (city name, zip code, or region)
 * @returns {Promise<Object>} Object containing current weather and location data
 * @throws {WeatherApiError} If request fails or data is invalid
 * 
 * @example
 * const weather = await getCurrentWeather('San Francisco');
 * console.log(weather.current.temperature); // 65
 * console.log(weather.location.city); // "San Francisco"
 */
export async function getCurrentWeather(location) {
  const data = await fetchWeatherData(location);
  
  return {
    current: transformCurrentWeather(data),
    location: transformLocation(data),
  };
}

/**
 * Gets hourly forecast for the next 24 hours for a location
 * 
 * @param {string} location - Location query (city name, zip code, or region)
 * @returns {Promise<Object>} Object containing hourly forecast and location data
 * @throws {WeatherApiError} If request fails or data is invalid
 * 
 * @example
 * const forecast = await getHourlyForecast('94102');
 * console.log(forecast.hourly.length); // 24
 * console.log(forecast.hourly[0].temperature); // 68
 */
export async function getHourlyForecast(location) {
  const data = await fetchWeatherData(location);
  
  return {
    hourly: transformHourlyForecast(data),
    location: transformLocation(data),
  };
}

/**
 * Gets 7-day daily forecast for a location
 * 
 * @param {string} location - Location query (city name, zip code, or region)
 * @returns {Promise<Object>} Object containing daily forecast and location data
 * @throws {WeatherApiError} If request fails or data is invalid
 * 
 * @example
 * const forecast = await getDailyForecast('New York');
 * console.log(forecast.daily.length); // 7
 * console.log(forecast.daily[0].highTemp); // 72
 */
export async function getDailyForecast(location) {
  const data = await fetchWeatherData(location);
  
  return {
    daily: transformDailyForecast(data),
    location: transformLocation(data),
  };
}

// Export error class for testing and error handling
export { WeatherApiError };
