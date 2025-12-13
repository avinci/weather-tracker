<template>
  <div class="daily-forecast">
    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-3" role="status" aria-label="Loading daily forecast">
      <div
        v-for="i in 7"
        :key="i"
        class="animate-pulse bg-gray-200 rounded-lg h-16"
      ></div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!dailyForecast || dailyForecast.length === 0"
      class="text-center py-8 text-gray-500"
      role="status"
    >
      <p>No forecast data available</p>
    </div>

    <!-- Forecast List -->
    <ul v-else class="space-y-2" aria-label="7-day weather forecast">
      <li
        v-for="day in dailyForecast"
        :key="day.date"
        class="daily-forecast-item flex items-center justify-between p-3 rounded-lg transition-colors"
        :class="[
          isToday(day.date) 
            ? 'bg-blue-50 border-2 border-blue-200' 
            : 'bg-white hover:bg-gray-50 border border-gray-200'
        ]"
      >
        <!-- Day Name and Date -->
        <div class="flex-1 min-w-0">
          <p 
            class="font-semibold text-gray-900"
            :class="{ 'text-blue-700': isToday(day.date) }"
          >
            {{ isToday(day.date) ? 'Today' : formatDayName(day.date) }}
          </p>
          <p class="text-sm text-gray-500">
            {{ formatDate(day.date) }}
          </p>
        </div>

        <!-- Weather Icon -->
        <div class="flex-shrink-0 mx-4">
          <img
            :src="getIconUrl(day.conditionIcon)"
            :alt="day.condition"
            class="w-10 h-10"
            width="40"
            height="40"
            loading="lazy"
          />
        </div>

        <!-- High/Low Temps -->
        <div class="flex items-center gap-3 text-right">
          <div class="w-12">
            <span class="font-bold text-gray-900" aria-label="High temperature">
              {{ formatTemperature(day.highTemp) }}
            </span>
          </div>
          <div class="w-12">
            <span class="text-gray-500" aria-label="Low temperature">
              {{ formatTemperature(day.lowTemp) }}
            </span>
          </div>
        </div>

        <!-- Precipitation Chance -->
        <div class="flex-shrink-0 w-16 text-right">
          <span
            v-if="day.precipitationChance > 0"
            class="text-sm text-blue-600"
            :aria-label="`${day.precipitationChance}% chance of precipitation`"
          >
            <span class="inline-block mr-1" aria-hidden="true">💧</span>
            {{ day.precipitationChance }}%
          </span>
          <span v-else class="text-sm text-gray-400" aria-label="No precipitation expected">
            —
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useWeatherStore } from '../stores/weather.js';

export default {
  name: 'DailyForecast',

  setup() {
    const weatherStore = useWeatherStore();

    // Reactive data from store
    const dailyForecast = computed(() => weatherStore.dailyForecast);
    const isLoading = computed(() => weatherStore.isLoading);

    /**
     * Checks if a date string represents today
     * @param {string} dateStr - Date in YYYY-MM-DD format
     * @returns {boolean} True if date is today
     */
    function isToday(dateStr) {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      return dateStr === todayStr;
    }

    /**
     * Formats a date string to day name (e.g., "Monday")
     * @param {string} dateStr - Date in YYYY-MM-DD format
     * @returns {string} Formatted day name
     */
    function formatDayName(dateStr) {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    /**
     * Formats a date string to readable date (e.g., "Jan 15")
     * @param {string} dateStr - Date in YYYY-MM-DD format
     * @returns {string} Formatted date
     */
    function formatDate(dateStr) {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    /**
     * Formats temperature with degree symbol
     * @param {number} temp - Temperature value
     * @returns {string} Formatted temperature (e.g., "72°")
     */
    function formatTemperature(temp) {
      if (temp === null || temp === undefined) {
        return '--°';
      }
      return `${Math.round(temp)}°`;
    }

    /**
     * Ensures icon URL uses HTTPS protocol
     * @param {string} iconUrl - Icon URL from API
     * @returns {string} HTTPS URL
     */
    function getIconUrl(iconUrl) {
      if (!iconUrl) {
        return '';
      }
      // Ensure HTTPS protocol
      if (iconUrl.startsWith('//')) {
        return `https:${iconUrl}`;
      }
      return iconUrl;
    }

    return {
      dailyForecast,
      isLoading,
      isToday,
      formatDayName,
      formatDate,
      formatTemperature,
      getIconUrl,
    };
  },
};
</script>

<style scoped>
.daily-forecast {
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .daily-forecast-item {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .daily-forecast-item > div:first-child {
    flex-basis: 100%;
    margin-bottom: 0.25rem;
  }
}
</style>
