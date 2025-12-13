/**
 * Unit tests for CurrentWeather.vue component
 *
 * Tests component rendering for:
 * - Loading state (skeleton UI)
 * - Empty state (no weather data)
 * - Weather data display (various conditions)
 * - Responsive design elements
 * - Reactive data updates
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import CurrentWeather from '../../components/CurrentWeather.vue';
import { useWeatherStore } from '../../stores/weather.js';

// Mock the formatters module
vi.mock('../../utils/formatters.js', () => ({
  formatTemperature: vi.fn((temp) => (temp !== null && temp !== undefined ? `${temp}°F` : '--')),
  formatHumidity: vi.fn((humidity) => (humidity !== null && humidity !== undefined ? `${humidity}%` : '--')),
  formatWind: vi.fn((speed) => (speed !== null && speed !== undefined ? `${speed} mph` : '--')),
}));

describe('CurrentWeather.vue', () => {
  let store;

  // Mock weather data for different scenarios
  const mockSunnyWeather = {
    temperature: 72,
    feelsLike: 70,
    condition: 'Sunny',
    conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
    humidity: 45,
    windSpeed: 8,
    windDirection: 'NW',
    lastUpdated: '2024-01-15 10:30',
  };

  const mockRainyWeather = {
    temperature: 55,
    feelsLike: 52,
    condition: 'Heavy rain',
    conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/308.png',
    humidity: 95,
    windSpeed: 15,
    windDirection: 'SE',
    lastUpdated: '2024-01-15 14:00',
  };

  const mockSnowyWeather = {
    temperature: 28,
    feelsLike: 22,
    condition: 'Heavy snow',
    conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/338.png',
    humidity: 85,
    windSpeed: 20,
    windDirection: 'N',
    lastUpdated: '2024-01-15 08:00',
  };

  const mockPartlyCloudyWeather = {
    temperature: 65,
    feelsLike: 63,
    condition: 'Partly cloudy',
    conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
    humidity: 60,
    windSpeed: 12,
    windDirection: 'W',
    lastUpdated: '2024-01-15 16:00',
  };

  const mockExtremeHeatWeather = {
    temperature: 105,
    feelsLike: 115,
    condition: 'Extreme heat',
    conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
    humidity: 20,
    windSpeed: 5,
    windDirection: 'S',
    lastUpdated: '2024-07-15 14:00',
  };

  const mockWeatherWithoutWindDirection = {
    temperature: 60,
    feelsLike: 58,
    condition: 'Clear',
    conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
    humidity: 50,
    windSpeed: 3,
    windDirection: null,
    lastUpdated: '2024-01-15 10:00',
  };

  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia());
    store = useWeatherStore();
  });

  /**
   * Helper function to mount the component
   */
  function mountComponent() {
    return mount(CurrentWeather, {
      global: {
        plugins: [],
      },
    });
  }

  describe('Loading State', () => {
    it('should display loading skeleton when isLoading is true', () => {
      store.isLoading = true;
      store.currentWeather = null;

      const wrapper = mountComponent();

      // Should have animate-pulse class for skeleton effect
      expect(wrapper.find('.animate-pulse').exists()).toBe(true);
    });

    it('should display skeleton elements for temperature area', () => {
      store.isLoading = true;
      store.currentWeather = null;

      const wrapper = mountComponent();

      // Should have skeleton elements with bg-gray-200 background
      const skeletonElements = wrapper.findAll('.bg-gray-200');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('should not display weather data when loading', () => {
      store.isLoading = true;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      // Should show skeleton, not actual weather data
      expect(wrapper.find('.animate-pulse').exists()).toBe(true);
      // Weather gradient should not be visible
      expect(wrapper.find('.from-blue-500').exists()).toBe(false);
    });

    it('should display skeleton layout with correct grid structure', () => {
      store.isLoading = true;
      store.currentWeather = null;

      const wrapper = mountComponent();

      // Check for the grid layout in skeleton
      const gridContainer = wrapper.find('.grid.grid-cols-2');
      expect(gridContainer.exists()).toBe(true);
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no weather data and not loading', () => {
      store.isLoading = false;
      store.currentWeather = null;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('No weather data available');
    });

    it('should display helpful message to search for location', () => {
      store.isLoading = false;
      store.currentWeather = null;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('Search for a location to get started');
    });

    it('should display a cloud icon in empty state', () => {
      store.isLoading = false;
      store.currentWeather = null;

      const wrapper = mountComponent();

      // Check for SVG cloud icon
      const svgElement = wrapper.find('svg');
      expect(svgElement.exists()).toBe(true);
    });

    it('should have centered text layout in empty state', () => {
      store.isLoading = false;
      store.currentWeather = null;

      const wrapper = mountComponent();

      const emptyStateContainer = wrapper.find('.text-center');
      expect(emptyStateContainer.exists()).toBe(true);
    });
  });

  describe('Weather Data Display', () => {
    describe('Temperature Display', () => {
      it('should display current temperature prominently', () => {
        store.isLoading = false;
        store.currentWeather = mockSunnyWeather;

        const wrapper = mountComponent();

        // Check for large temperature display
        const temperatureEl = wrapper.find('.text-5xl, .text-6xl');
        expect(temperatureEl.exists()).toBe(true);
        expect(wrapper.text()).toContain('72°F');
      });

      it('should display feels like temperature', () => {
        store.isLoading = false;
        store.currentWeather = mockSunnyWeather;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('Feels Like');
        expect(wrapper.text()).toContain('70°F');
      });

      it('should display extreme heat temperature correctly', () => {
        store.isLoading = false;
        store.currentWeather = mockExtremeHeatWeather;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('105°F');
        expect(wrapper.text()).toContain('115°F');
      });

      it('should display cold temperature correctly', () => {
        store.isLoading = false;
        store.currentWeather = mockSnowyWeather;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('28°F');
        expect(wrapper.text()).toContain('22°F');
      });
    });

    describe('Weather Condition Display', () => {
      it('should display weather condition text', () => {
        store.isLoading = false;
        store.currentWeather = mockSunnyWeather;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('Sunny');
      });

      it('should display rainy condition', () => {
        store.isLoading = false;
        store.currentWeather = mockRainyWeather;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('Heavy rain');
      });

      it('should display snowy condition', () => {
        store.isLoading = false;
        store.currentWeather = mockSnowyWeather;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('Heavy snow');
      });

      it('should display partly cloudy condition', () => {
        store.isLoading = false;
        store.currentWeather = mockPartlyCloudyWeather;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('Partly cloudy');
      });
    });

    describe('Weather Icon Display', () => {
      it('should display weather icon with correct src', () => {
        store.isLoading = false;
        store.currentWeather = mockSunnyWeather;

        const wrapper = mountComponent();

        const img = wrapper.find('img');
        expect(img.exists()).toBe(true);
        expect(img.attributes('src')).toBe('https://cdn.weatherapi.com/weather/64x64/day/113.png');
      });

      it('should convert http:// icon URL to https://', () => {
        store.isLoading = false;
        store.currentWeather = {
          ...mockSunnyWeather,
          conditionIcon: 'http://cdn.weatherapi.com/weather/64x64/day/113.png',
        };

        const wrapper = mountComponent();

        const img = wrapper.find('img');
        expect(img.attributes('src')).toBe('https://cdn.weatherapi.com/weather/64x64/day/113.png');
      });

      it('should handle icon URL starting with //', () => {
        store.isLoading = false;
        store.currentWeather = mockSunnyWeather;

        const wrapper = mountComponent();

        const img = wrapper.find('img');
        expect(img.attributes('src')).toContain('https://');
      });

      it('should set alt attribute for weather icon', () => {
        store.isLoading = false;
        store.currentWeather = mockSunnyWeather;

        const wrapper = mountComponent();

        const img = wrapper.find('img');
        expect(img.attributes('alt')).toBe('Sunny');
      });

      it('should display different icon for rainy weather', () => {
        store.isLoading = false;
        store.currentWeather = mockRainyWeather;

        const wrapper = mountComponent();

        const img = wrapper.find('img');
        expect(img.attributes('src')).toContain('308.png');
        expect(img.attributes('alt')).toBe('Heavy rain');
      });
    });

    describe('Additional Weather Details', () => {
      it('should display humidity', () => {
        store.isLoading = false;
        store.currentWeather = mockSunnyWeather;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('Humidity');
        expect(wrapper.text()).toContain('45%');
      });

      it('should display wind speed', () => {
        store.isLoading = false;
        store.currentWeather = mockSunnyWeather;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('Wind');
        expect(wrapper.text()).toContain('8 mph');
      });

      it('should display wind direction when available', () => {
        store.isLoading = false;
        store.currentWeather = mockSunnyWeather;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('Direction');
        expect(wrapper.text()).toContain('NW');
      });

      it('should not display wind direction when not available', () => {
        store.isLoading = false;
        store.currentWeather = mockWeatherWithoutWindDirection;

        const wrapper = mountComponent();

        // Wind direction section should not be rendered
        expect(wrapper.text()).not.toContain('Direction');
      });

      it('should display high humidity correctly', () => {
        store.isLoading = false;
        store.currentWeather = mockRainyWeather;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('95%');
      });

      it('should display high wind speed correctly', () => {
        store.isLoading = false;
        store.currentWeather = mockSnowyWeather;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('20 mph');
      });
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive temperature size classes', () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      // Should have both mobile and desktop size classes
      const html = wrapper.html();
      expect(html).toContain('text-5xl');
      expect(html).toContain('md:text-6xl');
    });

    it('should have responsive padding classes', () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      const html = wrapper.html();
      expect(html).toContain('p-6');
      expect(html).toContain('md:p-8');
    });

    it('should have responsive grid gap classes', () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      const html = wrapper.html();
      expect(html).toContain('gap-4');
      expect(html).toContain('md:gap-6');
    });

    it('should have responsive flex direction classes', () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      const html = wrapper.html();
      expect(html).toContain('flex-col');
      expect(html).toContain('md:flex-row');
    });

    it('should have responsive icon size classes', () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      const img = wrapper.find('img');
      expect(img.classes()).toContain('w-20');
      expect(img.classes()).toContain('h-20');
      expect(img.classes()).toContain('md:w-24');
      expect(img.classes()).toContain('md:h-24');
    });
  });

  describe('Styling and Visual Elements', () => {
    it('should have gradient background when displaying weather', () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      const weatherContainer = wrapper.find('.bg-gradient-to-br');
      expect(weatherContainer.exists()).toBe(true);
    });

    it('should have blue gradient colors', () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      const html = wrapper.html();
      expect(html).toContain('from-blue-500');
      expect(html).toContain('to-blue-600');
    });

    it('should have rounded corners', () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      expect(wrapper.find('.rounded-xl').exists()).toBe(true);
    });

    it('should have shadow styling', () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      expect(wrapper.find('.shadow-lg').exists()).toBe(true);
    });

    it('should have transition classes for animations', () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      expect(wrapper.find('.transition-all').exists()).toBe(true);
    });

    it('should have weather detail cards with backdrop blur', () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      const detailCards = wrapper.findAll('.weather-detail');
      expect(detailCards.length).toBeGreaterThan(0);
    });
  });

  describe('Reactive Data Updates', () => {
    it('should update display when currentWeather changes', async () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('72°F');
      expect(wrapper.text()).toContain('Sunny');

      // Update weather data
      store.currentWeather = mockRainyWeather;
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('55°F');
      expect(wrapper.text()).toContain('Heavy rain');
    });

    it('should transition from loading to weather display', async () => {
      store.isLoading = true;
      store.currentWeather = null;

      const wrapper = mountComponent();

      expect(wrapper.find('.animate-pulse').exists()).toBe(true);

      // Simulate data load completion
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.animate-pulse').exists()).toBe(false);
      expect(wrapper.text()).toContain('Sunny');
    });

    it('should transition from weather to empty state', async () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('Sunny');

      // Clear weather data
      store.currentWeather = null;
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('No weather data available');
    });

    it('should update humidity when weather changes', async () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('45%');

      // Update to rainy weather with higher humidity
      store.currentWeather = mockRainyWeather;
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('95%');
    });

    it('should update wind speed when weather changes', async () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('8 mph');

      // Update to snowy weather with higher wind
      store.currentWeather = mockSnowyWeather;
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('20 mph');
    });
  });

  describe('Various Weather Conditions', () => {
    it('should render sunny weather correctly', () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('72°F');
      expect(wrapper.text()).toContain('Sunny');
      expect(wrapper.text()).toContain('45%');
      expect(wrapper.find('img').attributes('src')).toContain('113.png');
    });

    it('should render rainy weather correctly', () => {
      store.isLoading = false;
      store.currentWeather = mockRainyWeather;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('55°F');
      expect(wrapper.text()).toContain('Heavy rain');
      expect(wrapper.text()).toContain('95%');
      expect(wrapper.find('img').attributes('src')).toContain('308.png');
    });

    it('should render snowy weather correctly', () => {
      store.isLoading = false;
      store.currentWeather = mockSnowyWeather;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('28°F');
      expect(wrapper.text()).toContain('Heavy snow');
      expect(wrapper.text()).toContain('85%');
      expect(wrapper.find('img').attributes('src')).toContain('338.png');
    });

    it('should render partly cloudy weather correctly', () => {
      store.isLoading = false;
      store.currentWeather = mockPartlyCloudyWeather;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('65°F');
      expect(wrapper.text()).toContain('Partly cloudy');
      expect(wrapper.text()).toContain('60%');
      expect(wrapper.find('img').attributes('src')).toContain('116.png');
    });

    it('should render extreme heat weather correctly', () => {
      store.isLoading = false;
      store.currentWeather = mockExtremeHeatWeather;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('105°F');
      expect(wrapper.text()).toContain('Extreme heat');
      expect(wrapper.text()).toContain('20%');
    });
  });

  describe('Edge Cases', () => {
    it('should handle weather with zero values', () => {
      store.isLoading = false;
      store.currentWeather = {
        temperature: 0,
        feelsLike: 0,
        condition: 'Freezing',
        conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
        humidity: 0,
        windSpeed: 0,
        windDirection: null,
        lastUpdated: '2024-01-15 00:00',
      };

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('0°F');
      expect(wrapper.text()).toContain('0%');
      expect(wrapper.text()).toContain('0 mph');
    });

    it('should handle weather with very long condition text', () => {
      store.isLoading = false;
      store.currentWeather = {
        ...mockSunnyWeather,
        condition: 'Patchy light snow with thunder in some areas',
      };

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('Patchy light snow with thunder in some areas');
    });

    it('should handle missing icon URL gracefully', () => {
      store.isLoading = false;
      store.currentWeather = {
        ...mockSunnyWeather,
        conditionIcon: null,
      };

      const wrapper = mountComponent();

      const img = wrapper.find('img');
      expect(img.attributes('src')).toBe('');
    });

    it('should handle undefined icon URL gracefully', () => {
      store.isLoading = false;
      store.currentWeather = {
        ...mockSunnyWeather,
        conditionIcon: undefined,
      };

      const wrapper = mountComponent();

      const img = wrapper.find('img');
      expect(img.attributes('src')).toBe('');
    });
  });

  describe('Component Structure', () => {
    it('should have root element with current-weather class', () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      expect(wrapper.find('.current-weather').exists()).toBe(true);
    });

    it('should have current-weather class on root for full width styling', () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      // The .current-weather class applies w-full via @apply in scoped styles
      expect(wrapper.find('.current-weather').exists()).toBe(true);
    });

    it('should have grid layout for weather details', () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      const grid = wrapper.find('.grid.grid-cols-2');
      expect(grid.exists()).toBe(true);
    });

    it('should have at least 3 weather detail sections', () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      const details = wrapper.findAll('.weather-detail');
      expect(details.length).toBeGreaterThanOrEqual(3);
    });

    it('should have 4 weather detail sections when wind direction is available', () => {
      store.isLoading = false;
      store.currentWeather = mockSunnyWeather;

      const wrapper = mountComponent();

      const details = wrapper.findAll('.weather-detail');
      expect(details.length).toBe(4);
    });

    it('should have 3 weather detail sections when wind direction is not available', () => {
      store.isLoading = false;
      store.currentWeather = mockWeatherWithoutWindDirection;

      const wrapper = mountComponent();

      const details = wrapper.findAll('.weather-detail');
      expect(details.length).toBe(3);
    });
  });
});
