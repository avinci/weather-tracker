<template>
  <div class="daily-forecast">
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="space-y-3"
      role="status"
      aria-label="Loading daily forecast"
    >
      <div
        v-for="i in 7"
        :key="i"
        class="animate-pulse bg-gray-200 rounded-lg h-16"
      />
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
    <ul
      v-else
      class="space-y-2"
      aria-label="7-day weather forecast"
    >
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
            @error="handleImageError"
          >
        </div>

        <!-- High/Low Temps -->
        <div class="flex items-center gap-3 text-right">
          <div class="w-12">
            <span
              class="font-bold text-gray-900"
              aria-label="High temperature"
            >
              {{ formatTemperature(day.highTemp) }}
            </span>
          </div>
          <div class="w-12">
            <span
              class="text-gray-500"
              aria-label="Low temperature"
            >
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
            <span
              class="inline-block mr-1"
              aria-hidden="true"
            >💧</span>
            {{ day.precipitationChance }}%
          </span>
          <span
            v-else
            class="text-sm text-gray-400"
            aria-label="No precipitation expected"
          >
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
import {
  isToday,
  formatDayName,
  formatDate,
  formatTemperature,
  getIconUrl,
  PLACEHOLDER_ICON,
} from '../utils/formatters.js';

export default {
  name: 'DailyForecast',

  setup() {
    const weatherStore = useWeatherStore();

    // Reactive data from store
    const dailyForecast = computed(() => weatherStore.dailyForecast);
    const isLoading = computed(() => weatherStore.isLoading);

    /**
     * Handles image load errors by replacing src with placeholder
     * @param {Event} event - Image error event
     */
    function handleImageError(event) {
      event.target.src = PLACEHOLDER_ICON;
    }

    return {
      dailyForecast,
      isLoading,
      isToday,
      formatDayName,
      formatDate,
      formatTemperature,
      getIconUrl,
      handleImageError,
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
