<template>
  <div class="search-bar">
    <form
      class="relative"
      role="search"
      @submit.prevent="handleSearch"
    >
      <!-- Search Input Container -->
      <div class="relative flex items-center">
        <!-- Search Icon -->
        <div class="absolute left-3 flex items-center pointer-events-none">
          <svg
            class="w-5 h-5 text-gray-400"
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <!-- Input Field -->
        <input
          ref="inputRef"
          v-model="searchQuery"
          type="text"
          class="search-input w-full pl-10 pr-20 py-3 text-base md:text-lg rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 placeholder-gray-400"
          :class="{
            'border-red-300 focus:border-red-500 focus:ring-red-200': validationError,
            'pr-28': searchQuery.length > 0
          }"
          placeholder="Search by city, zip code, or region..."
          :disabled="isSearching"
          :aria-label="'Search for weather by location'"
          :aria-describedby="validationError ? 'search-error' : undefined"
          :aria-invalid="!!validationError"
          @keydown="handleKeydown"
        >

        <!-- Clear Button -->
        <button
          v-if="searchQuery.length > 0 && !isSearching"
          type="button"
          class="clear-button absolute right-12 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          aria-label="Clear search"
          @click="handleClear"
        >
          <svg
            class="w-5 h-5"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- Search Button -->
        <button
          type="submit"
          class="search-button absolute right-2 p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          :disabled="isSearching || !searchQuery.trim()"
          :aria-label="isSearching ? 'Searching...' : 'Search'"
        >
          <!-- Loading Spinner -->
          <svg
            v-if="isSearching"
            class="w-5 h-5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <!-- Search Arrow -->
          <svg
            v-else
            class="w-5 h-5"
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
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </div>

      <!-- Validation Error Message -->
      <p
        v-if="validationError"
        id="search-error"
        class="mt-2 text-sm text-red-600"
        role="alert"
      >
        {{ validationError }}
      </p>

      <!-- Search Hint -->
      <p
        v-else-if="showHint"
        class="mt-2 text-xs text-gray-500"
      >
        Examples: "San Francisco", "94102", "California", "London, UK"
      </p>
    </form>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import {
  detectSearchType,
  sanitizeSearchInput,
  validateSearchInput,
} from '../utils/searchDetector.js';

export default {
  name: 'SearchBar',

  props: {
    /**
     * Whether to show the placeholder hint below the input
     */
    showHint: {
      type: Boolean,
      default: true,
    },
    /**
     * Initial value for the search input
     */
    initialValue: {
      type: String,
      default: '',
    },
  },

  emits: ['search'],

  setup(props, { emit }) {
    // Refs
    const inputRef = ref(null);
    const searchQuery = ref(props.initialValue);
    const isSearching = ref(false);
    const validationError = ref('');

    /**
     * Handles the search form submission
     * Validates input, detects search type, and emits search event
     * @fires search - With { query, type, originalInput } payload
     */
    function handleSearch() {
      // Debounce: prevent rapid submissions while already searching
      if (isSearching.value) {
        return;
      }
      // Clear any previous validation error
      validationError.value = '';

      // Sanitize the input
      const sanitizedQuery = sanitizeSearchInput(searchQuery.value);

      // Validate the input
      const validation = validateSearchInput(sanitizedQuery);
      if (!validation.valid) {
        validationError.value = validation.error;
        return;
      }

      // Detect the search type
      const searchResult = detectSearchType(sanitizedQuery);

      // Set loading state
      isSearching.value = true;

      // Emit search event with detected location info
      emit('search', {
        query: searchResult.value,
        type: searchResult.type,
        originalInput: searchQuery.value.trim(),
      });
    }

    /**
     * Clears the search input and resets state
     */
    function handleClear() {
      searchQuery.value = '';
      validationError.value = '';
      // Focus back on input after clearing
      inputRef.value?.focus();
    }

    /**
     * Handles keyboard events for shortcuts
     * @param {KeyboardEvent} event - The keyboard event
     */
    function handleKeydown(event) {
      // Escape key clears the input
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClear();
      }
    }

    /**
     * Stops the loading state
     * Called by parent component after search completes
     */
    function stopLoading() {
      isSearching.value = false;
    }

    /**
     * Sets a validation error from external source
     * @param {string} error - The error message
     */
    function setError(error) {
      validationError.value = error;
      isSearching.value = false;
    }

    /**
     * Focuses the input element
     */
    function focus() {
      inputRef.value?.focus();
    }

    /**
     * Global keyboard shortcut handler for focusing search
     * @param {KeyboardEvent} event - The keyboard event
     */
    function handleGlobalKeydown(event) {
      // Focus search on '/' key when not in an input
      // Defensive: verify inputRef exists before attempting focus
      if (event.key === '/' && !isInputElement(event.target) && inputRef.value) {
        event.preventDefault();
        inputRef.value.focus();
      }
    }

    /**
     * Checks if the target element is an input-like element
     * @param {Element} element - The element to check
     * @returns {boolean} True if element is input-like
     */
    function isInputElement(element) {
      const tagName = element.tagName.toLowerCase();
      return tagName === 'input' || tagName === 'textarea' || element.isContentEditable;
    }

    // Lifecycle hooks
    onMounted(() => {
      window.addEventListener('keydown', handleGlobalKeydown);
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', handleGlobalKeydown);
    });

    return {
      // Refs
      inputRef,
      searchQuery,
      isSearching,
      validationError,
      // Methods
      handleSearch,
      handleClear,
      handleKeydown,
      stopLoading,
      setError,
      focus,
    };
  },
};
</script>

<style scoped>
.search-bar {
  @apply w-full;
}

.search-input {
  /* Ensure consistent height across browsers */
  min-height: 48px;
}

/* Focus visible for better accessibility */
.search-input:focus-visible {
  outline: none;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .search-input {
    @apply text-base py-2.5;
    min-height: 44px;
  }
}
</style>
