/**
 * Weather Store
 * 
 * Centralized state management for weather data, loading states, and error handling.
 * 
 * @module stores/weather
 */

import { defineStore } from 'pinia';
import {
  getCurrentWeather,
  getHourlyForecast,
  getDailyForecast,
  WeatherApiError,
} from '../services/weatherApi.js';

/**
 * Default location to load on first visit
 */
const DEFAULT_LOCATION = 'San Francisco';

/**
 * LocalStorage key for persisting last searched location
 */
const STORAGE_KEY = 'weather_last_location';

export const useWeatherStore = defineStore('weather', {
  /**
   * Store state
   */
  state: () => ({
    /**
     * Current weather data
     * @type {Object|null}
     */
    currentWeather: null,

    /**
     * Hourly forecast data (next 24 hours)
     * @type {Array<Object>}
     */
    hourlyForecast: [],

    /**
     * Daily forecast data (7 days)
     * @type {Array<Object>}
     */
    dailyForecast: [],

    /**
     * Current location information
     * @type {Object|null}
     */
    location: null,

    /**
     * Loading state indicator
     * @type {boolean}
     */
    isLoading: false,

    /**
     * Error message (null if no error)
     * @type {string|null}
     */
    error: null,

    /**
     * Timestamp of last successful data fetch
     * @type {number|null}
     */
    lastUpdated: null,
  }),

  /**
   * Store getters
   */
  getters: {
    /**
     * Returns a human-readable formatted string for the last updated timestamp
     * @param {Object} state - Store state
     * @returns {string} Formatted timestamp (e.g., "2 minutes ago", "Just now")
     */
    formattedLastUpdated: (state) => {
      if (!state.lastUpdated) {
        return 'Never';
      }

      const now = Date.now();
      const diffMs = now - state.lastUpdated;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);

      if (diffSec < 30) {
        return 'Just now';
      } else if (diffSec < 60) {
        return `${diffSec} seconds ago`;
      } else if (diffMin === 1) {
        return '1 minute ago';
      } else if (diffMin < 60) {
        return `${diffMin} minutes ago`;
      } else if (diffHour === 1) {
        return '1 hour ago';
      } else if (diffHour < 24) {
        return `${diffHour} hours ago`;
      } else {
        const diffDays = Math.floor(diffHour / 24);
        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
      }
    },
  },

  /**
   * Store actions
   */
  actions: {
    /**
     * Fetches weather data for a given location
     * Updates currentWeather, hourlyForecast, dailyForecast, location, and lastUpdated
     * 
     * @param {string} locationQuery - Location query (city name, zip code, or region)
     * @returns {Promise<void>}
     */
    async fetchWeatherData(locationQuery) {
      // Set loading state
      this.isLoading = true;
      this.error = null;

      try {
        // Fetch all weather data in parallel for better performance
        const [currentData, hourlyData, dailyData] = await Promise.all([
          getCurrentWeather(locationQuery),
          getHourlyForecast(locationQuery),
          getDailyForecast(locationQuery),
        ]);

        // Update state with fetched data
        this.currentWeather = currentData.current;
        this.hourlyForecast = hourlyData.hourly;
        this.dailyForecast = dailyData.daily;
        this.location = currentData.location;
        this.lastUpdated = Date.now();

        // Persist last searched location to localStorage
        this.saveLastLocation(locationQuery);
      } catch (error) {
        // Handle errors - store user-friendly message
        if (error instanceof WeatherApiError) {
          this.error = error.message;
        } else {
          this.error = 'Something went wrong. Please try again.';
        }

        // Log error for debugging
        console.error('Weather fetch error:', error);
      } finally {
        // Always clear loading state
        this.isLoading = false;
      }
    },

    /**
     * Refreshes weather data for the current location
     * Uses the last known location if available
     * 
     * @returns {Promise<void>}
     */
    async refreshWeather() {
      const locationToRefresh = this.location?.city || DEFAULT_LOCATION;
      await this.fetchWeatherData(locationToRefresh);
    },

    /**
     * Clears the current error state
     */
    clearError() {
      this.error = null;
    },

    /**
     * Initializes the store with default location
     * Checks localStorage for last searched location and uses that if available
     * 
     * @returns {Promise<void>}
     */
    async initializeStore() {
      const lastLocation = this.loadLastLocation();
      const initialLocation = lastLocation || DEFAULT_LOCATION;
      await this.fetchWeatherData(initialLocation);
    },

    /**
     * Saves the last searched location to localStorage
     * @param {string} location - Location query to save
     */
    saveLastLocation(location) {
      try {
        localStorage.setItem(STORAGE_KEY, location);
      } catch (error) {
        // Silently fail if localStorage is unavailable (private browsing, etc.)
        console.warn('Could not save location to localStorage:', error);
      }
    },

    /**
     * Loads the last searched location from localStorage
     * @returns {string|null} Last location or null if not found
     */
    loadLastLocation() {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch (error) {
        // Silently fail if localStorage is unavailable
        console.warn('Could not load location from localStorage:', error);
        return null;
      }
    },
  },
});
