<template>
  <div class="tab-container">
    <!-- Tab Navigation -->
    <div
      role="tablist"
      aria-label="Forecast views"
      class="flex border-b border-gray-200 mb-4"
    >
      <button
        id="tab-hourly"
        ref="hourlyTabRef"
        role="tab"
        :aria-selected="activeTab === 'hourly'"
        :aria-controls="'panel-hourly'"
        :tabindex="activeTab === 'hourly' ? 0 : -1"
        class="tab-button flex-1 py-3 px-4 text-center font-medium text-sm md:text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        :class="[
          activeTab === 'hourly'
            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        ]"
        @click="setActiveTab('hourly')"
        @keydown="handleKeyDown"
      >
        <span class="flex items-center justify-center gap-2">
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Hourly
        </span>
      </button>

      <button
        id="tab-daily"
        ref="dailyTabRef"
        role="tab"
        :aria-selected="activeTab === 'daily'"
        :aria-controls="'panel-daily'"
        :tabindex="activeTab === 'daily' ? 0 : -1"
        class="tab-button flex-1 py-3 px-4 text-center font-medium text-sm md:text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        :class="[
          activeTab === 'daily'
            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        ]"
        @click="setActiveTab('daily')"
        @keydown="handleKeyDown"
      >
        <span class="flex items-center justify-center gap-2">
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Daily
        </span>
      </button>
    </div>

    <!-- Tab Panels -->
    <div class="tab-panels">
      <!-- Hourly Panel -->
      <div
        v-show="activeTab === 'hourly'"
        id="panel-hourly"
        role="tabpanel"
        aria-labelledby="tab-hourly"
        :tabindex="activeTab === 'hourly' ? 0 : -1"
      >
        <HourlyForecast />
      </div>

      <!-- Daily Panel -->
      <div
        v-show="activeTab === 'daily'"
        id="panel-daily"
        role="tabpanel"
        aria-labelledby="tab-daily"
        :tabindex="activeTab === 'daily' ? 0 : -1"
      >
        <DailyForecast />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import HourlyForecast from './HourlyForecast.vue';
import DailyForecast from './DailyForecast.vue';

export default {
  name: 'TabContainer',

  components: {
    HourlyForecast,
    DailyForecast,
  },

  setup() {
    // Local state for active tab
    const activeTab = ref('hourly');
    
    // Refs for tab buttons (for keyboard navigation)
    const hourlyTabRef = ref(null);
    const dailyTabRef = ref(null);

    /**
     * Sets the active tab
     * @param {string} tab - Tab identifier ('hourly' or 'daily')
     */
    function setActiveTab(tab) {
      activeTab.value = tab;
    }

    /**
     * Handles keyboard navigation for tabs
     * - ArrowLeft/ArrowRight: Switch between tabs
     * - Home: Go to first tab
     * - End: Go to last tab
     * @param {KeyboardEvent} event - Keyboard event
     */
    function handleKeyDown(event) {
      const tabs = ['hourly', 'daily'];
      const currentIndex = tabs.indexOf(activeTab.value);

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (currentIndex > 0) {
            setActiveTab(tabs[currentIndex - 1]);
            hourlyTabRef.value?.focus();
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1]);
            dailyTabRef.value?.focus();
          }
          break;
        case 'Home':
          event.preventDefault();
          setActiveTab(tabs[0]);
          hourlyTabRef.value?.focus();
          break;
        case 'End':
          event.preventDefault();
          setActiveTab(tabs[tabs.length - 1]);
          dailyTabRef.value?.focus();
          break;
        default:
          // No action for other keys
          break;
      }
    }

    return {
      activeTab,
      hourlyTabRef,
      dailyTabRef,
      setActiveTab,
      handleKeyDown,
    };
  },
};
</script>

<style scoped>
.tab-container {
  @apply w-full;
}

.tab-button {
  position: relative;
}

/* Active tab indicator animation */
.tab-button::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: transparent;
  transition: background-color 0.2s ease;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .tab-button {
    padding: 0.625rem 0.75rem;
  }
  
  .tab-button span {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .tab-button svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}
</style>
