/**
 * Unit tests for DailyForecast component
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import DailyForecast from '../../components/DailyForecast.vue';
import { useWeatherStore } from '../../stores/weather.js';
import { PLACEHOLDER_ICON } from '../../utils/formatters.js';

describe('DailyForecast', () => {
  let wrapper;
  let store;

  // Mock daily forecast data
  const mockDailyForecast = [
    {
      date: '2024-01-15',
      highTemp: 72,
      lowTemp: 58,
      condition: 'Partly cloudy',
      conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
      precipitationChance: 20,
    },
    {
      date: '2024-01-16',
      highTemp: 70,
      lowTemp: 56,
      condition: 'Sunny',
      conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
      precipitationChance: 0,
    },
    {
      date: '2024-01-17',
      highTemp: 68,
      lowTemp: 52,
      condition: 'Rainy',
      conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/296.png',
      precipitationChance: 80,
    },
    {
      date: '2024-01-18',
      highTemp: 65,
      lowTemp: 50,
      condition: 'Cloudy',
      conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/119.png',
      precipitationChance: 30,
    },
    {
      date: '2024-01-19',
      highTemp: 69,
      lowTemp: 54,
      condition: 'Sunny',
      conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
      precipitationChance: 5,
    },
    {
      date: '2024-01-20',
      highTemp: 74,
      lowTemp: 60,
      condition: 'Sunny',
      conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
      precipitationChance: 0,
    },
    {
      date: '2024-01-21',
      highTemp: 76,
      lowTemp: 62,
      condition: 'Partly cloudy',
      conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
      precipitationChance: 10,
    },
  ];

  beforeEach(() => {
    // Create fresh pinia for each test
    setActivePinia(createPinia());
    store = useWeatherStore();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  function mountComponent() {
    wrapper = mount(DailyForecast, {
      global: {
        plugins: [],
      },
    });
    return wrapper;
  }

  describe('Loading State', () => {
    it('should show loading skeleton when isLoading is true', () => {
      store.isLoading = true;
      mountComponent();

      const loadingElements = wrapper.findAll('.animate-pulse');
      expect(loadingElements.length).toBe(7);
    });

    it('should have correct ARIA attributes for loading state', () => {
      store.isLoading = true;
      mountComponent();

      const loadingContainer = wrapper.find('[role="status"]');
      expect(loadingContainer.exists()).toBe(true);
      expect(loadingContainer.attributes('aria-label')).toBe('Loading daily forecast');
    });

    it('should not show loading state when isLoading is false', () => {
      store.isLoading = false;
      store.dailyForecast = mockDailyForecast;
      mountComponent();

      const loadingElements = wrapper.findAll('.animate-pulse');
      expect(loadingElements.length).toBe(0);
    });
  });

  describe('Empty State', () => {
    it('should show empty message when forecast is empty', () => {
      store.isLoading = false;
      store.dailyForecast = [];
      mountComponent();

      expect(wrapper.text()).toContain('No forecast data available');
    });

    it('should show empty message when forecast is null', () => {
      store.isLoading = false;
      store.dailyForecast = null;
      mountComponent();

      expect(wrapper.text()).toContain('No forecast data available');
    });

    it('should not show empty state when data is available', () => {
      store.isLoading = false;
      store.dailyForecast = mockDailyForecast;
      mountComponent();

      expect(wrapper.text()).not.toContain('No forecast data available');
    });
  });

  describe('Forecast Rendering', () => {
    beforeEach(() => {
      store.isLoading = false;
      store.dailyForecast = mockDailyForecast;
    });

    it('should render all 7 daily forecast items', () => {
      mountComponent();

      const items = wrapper.findAll('.daily-forecast-item');
      expect(items.length).toBe(7);
    });

    it('should display high and low temperatures for each day', () => {
      mountComponent();

      // Check first day
      const html = wrapper.html();
      expect(html).toContain('72°');
      expect(html).toContain('58°');
    });

    it('should render weather condition icons', () => {
      mountComponent();

      const icons = wrapper.findAll('img');
      expect(icons.length).toBe(7);
      
      // Check first icon
      expect(icons[0].attributes('src')).toBe('https://cdn.weatherapi.com/weather/64x64/day/116.png');
      expect(icons[0].attributes('alt')).toBe('Partly cloudy');
    });

    it('should display precipitation chance when greater than 0', () => {
      mountComponent();

      // 20% precipitation for first day
      expect(wrapper.text()).toContain('20%');
      expect(wrapper.text()).toContain('80%');
    });

    it('should show dash when precipitation is 0', () => {
      mountComponent();

      const precipElements = wrapper.findAll('[aria-label="No precipitation expected"]');
      expect(precipElements.length).toBeGreaterThan(0);
    });

    it('should display date in readable format', () => {
      mountComponent();

      // Jan 15, Jan 16, etc.
      expect(wrapper.text()).toContain('Jan 15');
      expect(wrapper.text()).toContain('Jan 16');
    });

    it('should have accessible forecast list', () => {
      mountComponent();

      const list = wrapper.find('ul');
      expect(list.attributes('aria-label')).toBe('7-day weather forecast');
    });
  });

  describe('Current Day Highlighting', () => {
    it('should show "Today" for current date', () => {
      // Set first day to today
      const today = new Date().toISOString().split('T')[0];
      const forecastWithToday = [
        { ...mockDailyForecast[0], date: today },
        ...mockDailyForecast.slice(1),
      ];
      
      store.isLoading = false;
      store.dailyForecast = forecastWithToday;
      mountComponent();

      expect(wrapper.text()).toContain('Today');
    });

    it('should apply distinct styling to current day', () => {
      const today = new Date().toISOString().split('T')[0];
      const forecastWithToday = [
        { ...mockDailyForecast[0], date: today },
        ...mockDailyForecast.slice(1),
      ];
      
      store.isLoading = false;
      store.dailyForecast = forecastWithToday;
      mountComponent();

      const items = wrapper.findAll('.daily-forecast-item');
      expect(items[0].classes()).toContain('bg-blue-50');
      expect(items[0].classes()).toContain('border-blue-200');
    });

    it('should display day names for non-today dates', () => {
      store.isLoading = false;
      store.dailyForecast = mockDailyForecast;
      mountComponent();

      // Check that day names are present (not "Today" for past dates)
      const text = wrapper.text();
      // Date names like Monday, Tuesday, etc.
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const hasDayName = dayNames.some(day => text.includes(day));
      expect(hasDayName).toBe(true);
    });
  });

  describe('Temperature Formatting', () => {
    beforeEach(() => {
      store.isLoading = false;
    });

    it('should round temperatures to whole numbers', () => {
      store.dailyForecast = [{
        ...mockDailyForecast[0],
        highTemp: 72.7,
        lowTemp: 58.3,
      }];
      mountComponent();

      expect(wrapper.text()).toContain('73°');
      expect(wrapper.text()).toContain('58°');
    });

    it('should handle null temperature values', () => {
      store.dailyForecast = [{
        ...mockDailyForecast[0],
        highTemp: null,
        lowTemp: null,
      }];
      mountComponent();

      expect(wrapper.text()).toContain('--°');
    });

    it('should handle undefined temperature values', () => {
      store.dailyForecast = [{
        date: '2024-01-15',
        condition: 'Sunny',
        conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
        precipitationChance: 0,
        // highTemp and lowTemp intentionally omitted
      }];
      mountComponent();

      expect(wrapper.text()).toContain('--°');
    });
  });

  describe('Icon URL Handling', () => {
    beforeEach(() => {
      store.isLoading = false;
    });

    it('should convert protocol-relative URLs to HTTPS', () => {
      store.dailyForecast = [{
        ...mockDailyForecast[0],
        conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
      }];
      mountComponent();

      const img = wrapper.find('img');
      expect(img.attributes('src')).toBe('https://cdn.weatherapi.com/weather/64x64/day/116.png');
    });

    it('should preserve HTTPS URLs', () => {
      store.dailyForecast = [{
        ...mockDailyForecast[0],
        conditionIcon: 'https://cdn.weatherapi.com/weather/64x64/day/116.png',
      }];
      mountComponent();

      const img = wrapper.find('img');
      expect(img.attributes('src')).toBe('https://cdn.weatherapi.com/weather/64x64/day/116.png');
    });

    it('should handle empty icon URL', () => {
      store.dailyForecast = [{
        ...mockDailyForecast[0],
        conditionIcon: '',
      }];
      mountComponent();

      const img = wrapper.find('img');
      expect(img.attributes('src')).toBe('');
    });

    it('should handle null icon URL', () => {
      store.dailyForecast = [{
        ...mockDailyForecast[0],
        conditionIcon: null,
      }];
      mountComponent();

      const img = wrapper.find('img');
      expect(img.attributes('src')).toBe('');
    });

    it('should have error handler on images', () => {
      store.dailyForecast = mockDailyForecast;
      mountComponent();

      // Verify the @error handler is present by checking the component exposes handleImageError
      expect(typeof wrapper.vm.handleImageError).toBe('function');
    });

    it('should replace image src with placeholder on error', () => {
      store.dailyForecast = [{
        ...mockDailyForecast[0],
        conditionIcon: 'https://invalid-url.com/broken.png',
      }];
      mountComponent();

      // Simulate image error event
      const mockEvent = { target: { src: '' } };
      wrapper.vm.handleImageError(mockEvent);
      
      expect(mockEvent.target.src).toBe(PLACEHOLDER_ICON);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      store.isLoading = false;
      store.dailyForecast = mockDailyForecast;
    });

    it('should have alt text on all weather icons', () => {
      mountComponent();

      const icons = wrapper.findAll('img');
      icons.forEach(icon => {
        expect(icon.attributes('alt')).toBeTruthy();
      });
    });

    it('should have ARIA labels for temperatures', () => {
      mountComponent();

      const highTempLabels = wrapper.findAll('[aria-label="High temperature"]');
      const lowTempLabels = wrapper.findAll('[aria-label="Low temperature"]');
      
      expect(highTempLabels.length).toBe(7);
      expect(lowTempLabels.length).toBe(7);
    });

    it('should have ARIA label for precipitation chance', () => {
      mountComponent();

      // Check for precipitation ARIA label
      const precipWithValue = wrapper.find('[aria-label*="chance of precipitation"]');
      expect(precipWithValue.exists()).toBe(true);
    });

    it('should have lazy loading on images', () => {
      mountComponent();

      const icons = wrapper.findAll('img');
      icons.forEach(icon => {
        // Vue Test Utils may not capture boolean-like attributes the same way
        // Check if the attribute exists in the rendered HTML
        expect(icon.element.loading).toBe('lazy');
      });
    });

    it('should have width and height on images to prevent layout shift', () => {
      mountComponent();

      const icons = wrapper.findAll('img');
      icons.forEach(icon => {
        expect(icon.attributes('width')).toBe('40');
        expect(icon.attributes('height')).toBe('40');
      });
    });
  });

  describe('Reactive Updates', () => {
    it('should update when store data changes', async () => {
      store.isLoading = false;
      store.dailyForecast = mockDailyForecast.slice(0, 3);
      mountComponent();

      expect(wrapper.findAll('.daily-forecast-item').length).toBe(3);

      // Update store
      store.dailyForecast = mockDailyForecast;
      await wrapper.vm.$nextTick();

      expect(wrapper.findAll('.daily-forecast-item').length).toBe(7);
    });

    it('should show loading when store isLoading changes', async () => {
      store.isLoading = false;
      store.dailyForecast = mockDailyForecast;
      mountComponent();

      expect(wrapper.findAll('.animate-pulse').length).toBe(0);

      // Set loading
      store.isLoading = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.findAll('.animate-pulse').length).toBe(7);
    });
  });

  describe('Date Formatting', () => {
    beforeEach(() => {
      store.isLoading = false;
    });

    it('should format day names correctly', () => {
      // Use a known date
      store.dailyForecast = [{
        ...mockDailyForecast[0],
        date: '2024-01-15', // This is a Monday
      }];
      mountComponent();

      // Should show Monday (unless it's today)
      const today = new Date().toISOString().split('T')[0];
      if ('2024-01-15' !== today) {
        expect(wrapper.text()).toContain('Monday');
      }
    });

    it('should format dates as "Mon DD"', () => {
      store.dailyForecast = [{
        ...mockDailyForecast[0],
        date: '2024-12-25',
      }];
      mountComponent();

      expect(wrapper.text()).toContain('Dec 25');
    });
  });
});
