<template>
  <div class="location-display">
    <!-- Loading State -->
    <div
      v-if="isLoading && !location"
      class="bg-white rounded-xl shadow-lg p-4 md:p-6 animate-pulse"
    >
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <div class="h-6 w-32 bg-gray-200 rounded mb-2" />
          <div class="h-4 w-48 bg-gray-200 rounded" />
        </div>
        <div class="h-8 w-8 bg-gray-200 rounded-full" />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!location"
      class="bg-white rounded-xl shadow-lg p-4 md:p-6 text-center"
    >
      <div class="text-gray-400 mb-2">
        <svg
          class="w-10 h-10 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>
      <p class="text-gray-500 text-sm">
        No location data available
      </p>
    </div>

    <!-- Location Data -->
    <div
      v-else
      class="bg-white rounded-xl shadow-lg p-4 md:p-6 transition-all duration-300"
    >
      <div class="flex items-center justify-between">
        <!-- Location Information -->
        <div class="flex-1 min-w-0">
          <!-- City Name - Prominent -->
          <h2 class="text-xl md:text-2xl font-bold text-gray-900 truncate">
            {{ location.city }}
          </h2>
          <!-- Region and Country -->
          <p class="text-sm md:text-base text-gray-600 truncate">
            {{ locationSubtitle }}
          </p>
          <!-- Last Updated Timestamp -->
          <p class="text-xs md:text-sm text-gray-400 mt-1">
            Last updated: {{ formattedLastUpdated }}
          </p>
        </div>

        <!-- Refresh Button -->
        <button
          type="button"
          class="refresh-button flex-shrink-0 ml-4 p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="{ 'animate-spin': isRefreshing }"
          :disabled="isRefreshing"
          :aria-label="isRefreshing ? 'Refreshing weather data' : 'Refresh weather data'"
          @click="handleRefresh"
        >
          <svg
            class="w-5 h-5 md:w-6 md:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useWeatherStore } from '../stores/weather.js';

export default {
  name: 'LocationDisplay',

  emits: ['refresh'],

  setup(props, { emit }) {
    const weatherStore = useWeatherStore();
    
    // Local state for refresh button animation
    const isRefreshing = ref(false);

    // Computed properties from store
    const location = computed(() => weatherStore.location);
    const isLoading = computed(() => weatherStore.isLoading);
    const formattedLastUpdated = computed(() => weatherStore.formattedLastUpdated);

    /**
     * Computed property to display region and country
     * Handles cases where region or country may be missing
     * @returns {string} Formatted location subtitle
     */
    const locationSubtitle = computed(() => {
      if (!location.value) return '';
      
      const parts = [];
      if (location.value.region) {
        parts.push(location.value.region);
      }
      if (location.value.country) {
        parts.push(location.value.country);
      }
      
      return parts.join(', ');
    });

    /**
     * Handles refresh button click
     * Emits refresh event to parent and manages loading state
     */
    async function handleRefresh() {
      if (isRefreshing.value) return;
      
      isRefreshing.value = true;
      emit('refresh');
      
      // Keep the spin animation for a minimum time for visual feedback
      // The parent component handles the actual refresh logic
      setTimeout(() => {
        isRefreshing.value = false;
      }, 1000);
    }

    return {
      location,
      isLoading,
      isRefreshing,
      formattedLastUpdated,
      locationSubtitle,
      handleRefresh,
    };
  },
};
</script>

<style scoped>
.location-display {
  @apply w-full;
}

/* Refresh button animation */
.refresh-button.animate-spin svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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
