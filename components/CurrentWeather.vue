<template>
  <div class="current-weather">
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="bg-white rounded-xl shadow-lg p-6 md:p-8 animate-pulse"
    >
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <!-- Left: Temperature skeleton -->
        <div class="flex items-center mb-4 md:mb-0">
          <div class="w-20 h-20 md:w-24 md:h-24 bg-gray-200 rounded-full mr-4" />
          <div>
            <div class="h-12 md:h-16 w-32 bg-gray-200 rounded mb-2" />
            <div class="h-5 w-24 bg-gray-200 rounded" />
          </div>
        </div>
        <!-- Right: Details skeleton -->
        <div class="grid grid-cols-2 gap-4 md:gap-6">
          <div class="h-12 w-24 bg-gray-200 rounded" />
          <div class="h-12 w-24 bg-gray-200 rounded" />
          <div class="h-12 w-24 bg-gray-200 rounded" />
          <div class="h-12 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!currentWeather"
      class="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center"
    >
      <div class="text-gray-400 mb-2">
        <svg
          class="w-16 h-16 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
          />
        </svg>
      </div>
      <p class="text-gray-500 text-lg">
        No weather data available
      </p>
      <p class="text-gray-400 text-sm mt-1">
        Search for a location to get started
      </p>
    </div>

    <!-- Weather Data -->
    <div
      v-else
      class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 md:p-8 text-white transition-all duration-300"
    >
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <!-- Left Section: Icon, Temperature, Condition -->
        <div class="flex items-center mb-6 md:mb-0">
          <!-- Weather Icon -->
          <div class="flex-shrink-0 mr-4">
            <img
              :src="iconUrl"
              :alt="currentWeather.condition"
              class="w-20 h-20 md:w-24 md:h-24 transition-transform duration-300 hover:scale-110"
            >
          </div>
          <!-- Temperature and Condition -->
          <div>
            <div class="text-5xl md:text-6xl font-bold tracking-tight transition-all duration-300">
              {{ formattedTemperature }}
            </div>
            <div class="text-lg md:text-xl text-blue-100 mt-1">
              {{ currentWeather.condition }}
            </div>
          </div>
        </div>

        <!-- Right Section: Weather Details -->
        <div class="grid grid-cols-2 gap-4 md:gap-6">
          <!-- Feels Like -->
          <div class="weather-detail">
            <div class="weather-detail-label">
              Feels Like
            </div>
            <div class="weather-detail-value">
              {{ formattedFeelsLike }}
            </div>
          </div>
          
          <!-- Humidity -->
          <div class="weather-detail">
            <div class="weather-detail-label">
              Humidity
            </div>
            <div class="weather-detail-value">
              {{ formattedHumidity }}
            </div>
          </div>
          
          <!-- Wind Speed -->
          <div class="weather-detail">
            <div class="weather-detail-label">
              Wind
            </div>
            <div class="weather-detail-value">
              {{ formattedWind }}
            </div>
          </div>
          
          <!-- Wind Direction (if available) -->
          <div
            v-if="currentWeather.windDirection"
            class="weather-detail"
          >
            <div class="weather-detail-label">
              Direction
            </div>
            <div class="weather-detail-value">
              {{ currentWeather.windDirection }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useWeatherStore } from '../stores/weather.js';
import {
  formatTemperature,
  formatHumidity,
  formatWind,
} from '../utils/formatters.js';

export default {
  name: 'CurrentWeather',

  setup() {
    const weatherStore = useWeatherStore();

    // Computed properties from store
    const currentWeather = computed(() => weatherStore.currentWeather);
    const isLoading = computed(() => weatherStore.isLoading);

    // Formatted values
    const formattedTemperature = computed(() => {
      if (!currentWeather.value) return '--';
      return formatTemperature(currentWeather.value.temperature);
    });

    const formattedFeelsLike = computed(() => {
      if (!currentWeather.value) return '--';
      return formatTemperature(currentWeather.value.feelsLike);
    });

    const formattedHumidity = computed(() => {
      if (!currentWeather.value) return '--';
      return formatHumidity(currentWeather.value.humidity);
    });

    const formattedWind = computed(() => {
      if (!currentWeather.value) return '--';
      return formatWind(currentWeather.value.windSpeed);
    });

    // Icon URL - ensure it uses https
    const iconUrl = computed(() => {
      if (!currentWeather.value?.conditionIcon) return '';
      // WeatherAPI returns URLs starting with // or http://
      const icon = currentWeather.value.conditionIcon;
      if (icon.startsWith('//')) {
        return `https:${icon}`;
      } else if (icon.startsWith('http://')) {
        return icon.replace('http://', 'https://');
      }
      return icon;
    });

    return {
      currentWeather,
      isLoading,
      formattedTemperature,
      formattedFeelsLike,
      formattedHumidity,
      formattedWind,
      iconUrl,
    };
  },
};
</script>

<style scoped>
.current-weather {
  @apply w-full;
}

.weather-detail {
  @apply bg-white/10 rounded-lg p-3 md:p-4 backdrop-blur-sm;
}

.weather-detail-label {
  @apply text-xs md:text-sm text-blue-100 uppercase tracking-wide mb-1;
}

.weather-detail-value {
  @apply text-lg md:text-xl font-semibold;
}

/* Animation for data updates */
.current-weather :deep(.transition-all) {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Skeleton pulse animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
