<template>
  <div class="hourly-forecast">
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="bg-white rounded-xl shadow-lg p-4 md:p-6"
    >
      <div class="flex gap-4 overflow-x-hidden">
        <div
          v-for="i in 8"
          :key="`skeleton-${i}`"
          class="flex-shrink-0 w-24 animate-pulse"
        >
          <div class="bg-gray-200 h-4 w-12 rounded mb-2 mx-auto" />
          <div class="bg-gray-200 h-12 w-12 rounded-full mb-2 mx-auto" />
          <div class="bg-gray-200 h-5 w-10 rounded mb-2 mx-auto" />
          <div class="bg-gray-200 h-3 w-14 rounded mb-1 mx-auto" />
          <div class="bg-gray-200 h-3 w-14 rounded mb-1 mx-auto" />
          <div class="bg-gray-200 h-3 w-14 rounded mx-auto" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!hourlyForecast || hourlyForecast.length === 0"
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p class="text-gray-500 text-lg">
        No hourly forecast available
      </p>
      <p class="text-gray-400 text-sm mt-1">
        Search for a location to see hourly weather
      </p>
    </div>

    <!-- Hourly Forecast Data -->
    <div
      v-else
      class="bg-white rounded-xl shadow-lg p-4 md:p-6"
    >
      <div
        ref="scrollContainer"
        class="hourly-scroll-container flex gap-3 md:gap-4 overflow-x-auto pb-2 scroll-smooth"
      >
        <template
          v-for="(hour, index) in hourlyForecast"
          :key="hour.time"
        >
          <!-- Date Separator - shown when crossing midnight -->
          <div
            v-if="showDateSeparator(hour, index)"
            class="date-separator flex-shrink-0 flex items-center justify-center px-3 md:px-4"
          >
            <div class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs md:text-sm font-medium whitespace-nowrap">
              {{ formatDateLabel(hour.time) }}
            </div>
          </div>

          <!-- Hourly Card -->
          <div
            class="hourly-card flex-shrink-0 w-20 md:w-24 bg-gradient-to-b from-blue-50 to-white rounded-lg p-3 md:p-4 text-center border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all duration-200"
            :class="{ 'ring-2 ring-blue-400': isCurrentHour(hour, index) }"
          >
            <!-- Time -->
            <div class="text-xs md:text-sm font-medium text-gray-600 mb-2">
              {{ formatHourTime(hour.time) }}
            </div>

            <!-- Weather Icon -->
            <div class="flex justify-center mb-2">
              <img
                :src="getIconUrl(hour.conditionIcon)"
                :alt="hour.condition"
                class="w-10 h-10 md:w-12 md:h-12"
              >
            </div>

            <!-- Temperature -->
            <div class="text-base md:text-lg font-bold text-gray-900 mb-2">
              {{ formatTemperature(hour.temperature) }}
            </div>

            <!-- Details -->
            <div class="space-y-1 text-xs text-gray-500">
              <!-- Precipitation -->
              <div
                class="flex items-center justify-center gap-1"
                :title="'Chance of precipitation'"
              >
                <svg
                  class="w-3 h-3 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>{{ formatPrecipitation(hour.precipitationChance) }}</span>
              </div>

              <!-- Wind Speed -->
              <div
                class="flex items-center justify-center gap-1"
                :title="'Wind speed'"
              >
                <svg
                  class="w-3 h-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                  />
                </svg>
                <span>{{ formatWindSpeed(hour.windSpeed) }}</span>
              </div>

              <!-- Humidity -->
              <div
                class="flex items-center justify-center gap-1"
                :title="'Humidity'"
              >
                <svg
                  class="w-3 h-3 text-cyan-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>{{ formatHumidity(hour.humidity) }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Scroll Indicators (visible on mobile when scrollable) -->
      <div class="flex justify-center mt-3 gap-1 md:hidden">
        <div class="w-8 h-1 bg-blue-200 rounded-full" />
        <div class="w-2 h-1 bg-gray-200 rounded-full" />
        <div class="w-2 h-1 bg-gray-200 rounded-full" />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useWeatherStore } from '../stores/weather.js';
import {
  formatTemperature as formatTemp,
  formatPrecipitation as formatPrecip,
  formatWindSpeed as formatWind,
  formatHumidity as formatHum,
  formatHourTime as formatHour,
} from '../utils/formatters.js';

export default {
  name: 'HourlyForecast',

  setup() {
    const weatherStore = useWeatherStore();
    const scrollContainer = ref(null);

    // Computed properties from store
    const hourlyForecast = computed(() => weatherStore.hourlyForecast);
    const isLoading = computed(() => weatherStore.isLoading);

    /**
     * Formats temperature using the formatters utility
     * @param {number} temp - Temperature value
     * @returns {string} Formatted temperature string
     */
    function formatTemperature(temp) {
      return formatTemp(temp);
    }

    /**
     * Formats precipitation percentage
     * @param {number} precip - Precipitation chance (0-100)
     * @returns {string} Formatted precipitation string
     */
    function formatPrecipitation(precip) {
      return formatPrecip(precip);
    }

    /**
     * Formats wind speed
     * @param {number} speed - Wind speed value
     * @returns {string} Formatted wind speed string
     */
    function formatWindSpeed(speed) {
      return formatWind(speed);
    }

    /**
     * Formats humidity percentage
     * @param {number} humidity - Humidity value (0-100)
     * @returns {string} Formatted humidity string
     */
    function formatHumidity(humidity) {
      return formatHum(humidity);
    }

    /**
     * Formats hour time for display
     * @param {string} datetime - Datetime string
     * @returns {string} Formatted hour string (e.g., "2 PM")
     */
    function formatHourTime(datetime) {
      return formatHour(datetime);
    }

    /**
     * Gets the HTTPS URL for a weather icon
     * @param {string} iconUrl - Icon URL from API
     * @returns {string} HTTPS icon URL
     */
    function getIconUrl(iconUrl) {
      if (!iconUrl) return '';
      if (iconUrl.startsWith('//')) {
        return `https:${iconUrl}`;
      } else if (iconUrl.startsWith('http://')) {
        return iconUrl.replace('http://', 'https://');
      }
      return iconUrl;
    }

    /**
     * Determines if a date separator should be shown before this hour
     * Shows separator at midnight (00:00) or at the start if it's a new day
     * @param {Object} hour - Hour forecast data
     * @param {number} index - Index in the array
     * @returns {boolean} Whether to show date separator
     */
    function showDateSeparator(hour, index) {
      if (!hour?.time) return false;

      // Parse the hour from the time string (format: "YYYY-MM-DD HH:MM")
      const timeParts = hour.time.split(' ');
      if (timeParts.length < 2) return false;

      const hourValue = parseInt(timeParts[1].split(':')[0], 10);

      // Show separator at midnight (hour 0)
      if (hourValue === 0 && index > 0) {
        return true;
      }

      return false;
    }

    /**
     * Formats a date label for the separator
     * @param {string} datetime - Datetime string
     * @returns {string} Formatted date label (e.g., "Tomorrow" or "Wed, Jan 15")
     */
    function formatDateLabel(datetime) {
      if (!datetime) return '';

      const datePart = datetime.split(' ')[0];
      const date = new Date(datePart + 'T00:00:00');

      if (isNaN(date.getTime())) return '';

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Check if it's tomorrow
      if (
        date.getFullYear() === tomorrow.getFullYear() &&
        date.getMonth() === tomorrow.getMonth() &&
        date.getDate() === tomorrow.getDate()
      ) {
        return 'Tomorrow';
      }

      // Otherwise, format as day and date
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const dayName = dayNames[date.getDay()];
      const monthName = monthNames[date.getMonth()];
      const dayNum = date.getDate();

      return `${dayName}, ${monthName} ${dayNum}`;
    }

    /**
     * Determines if this hour is the current hour (first hour in forecast)
     * @param {Object} hour - Hour forecast data
     * @param {number} index - Index in the array
     * @returns {boolean} Whether this is the current hour
     */
    function isCurrentHour(hour, index) {
      // The first hour in the forecast is typically the current/nearest hour
      return index === 0;
    }

    return {
      scrollContainer,
      hourlyForecast,
      isLoading,
      formatTemperature,
      formatPrecipitation,
      formatWindSpeed,
      formatHumidity,
      formatHourTime,
      getIconUrl,
      showDateSeparator,
      formatDateLabel,
      isCurrentHour,
    };
  },
};
</script>

<style scoped>
.hourly-forecast {
  @apply w-full;
}

.hourly-scroll-container {
  /* Hide scrollbar for Chrome, Safari and Opera */
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.hourly-scroll-container::-webkit-scrollbar {
  height: 6px;
}

.hourly-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.hourly-scroll-container::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

.hourly-scroll-container::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

/* Smooth scroll behavior */
.scroll-smooth {
  scroll-behavior: smooth;
}

.hourly-card {
  min-width: 5rem;
}

@media (min-width: 768px) {
  .hourly-card {
    min-width: 6rem;
  }
}

/* Date separator styling */
.date-separator {
  align-self: stretch;
  display: flex;
  align-items: center;
}

/* Animation for current hour highlight */
@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  70% {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.hourly-card.ring-2 {
  animation: pulse-ring 2s ease-in-out infinite;
}

/* Skeleton animation */
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
