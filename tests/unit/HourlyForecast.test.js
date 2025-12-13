/**
 * Unit tests for HourlyForecast.vue component
 *
 * Tests component rendering for:
 * - Loading state (skeleton UI)
 * - Empty state (no hourly data)
 * - Hourly data display (24 hours)
 * - Date separators when crossing midnight (EC-004)
 * - Responsive design elements
 * - Reactive data updates
 * - Various weather conditions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import HourlyForecast from '../../components/HourlyForecast.vue';
import { useWeatherStore } from '../../stores/weather.js';

// Mock the formatters module
vi.mock('../../utils/formatters.js', () => ({
  formatTemperature: vi.fn((temp) => (temp !== null && temp !== undefined ? `${temp}°F` : '--')),
  formatPrecipitation: vi.fn((precip) => (precip !== null && precip !== undefined ? `${precip}%` : '--')),
  formatWindSpeed: vi.fn((speed) => (speed !== null && speed !== undefined ? `${speed} mph` : '--')),
  formatHumidity: vi.fn((humidity) => (humidity !== null && humidity !== undefined ? `${humidity}%` : '--')),
  formatHourTime: vi.fn((datetime) => {
    if (!datetime) return '--';
    const timePart = datetime.split(' ')[1];
    if (!timePart) return '--';
    const hour = parseInt(timePart.split(':')[0], 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${period}`;
  }),
}));

describe('HourlyForecast.vue', () => {
  let store;

  // Mock hourly data starting at 10 AM today
  const mockHourlyDataNoMidnight = [
    { time: '2024-01-15 10:00', temperature: 68, condition: 'Sunny', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png', precipitationChance: 5, windSpeed: 8, humidity: 45 },
    { time: '2024-01-15 11:00', temperature: 70, condition: 'Sunny', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png', precipitationChance: 5, windSpeed: 10, humidity: 42 },
    { time: '2024-01-15 12:00', temperature: 72, condition: 'Partly cloudy', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png', precipitationChance: 10, windSpeed: 12, humidity: 40 },
    { time: '2024-01-15 13:00', temperature: 74, condition: 'Partly cloudy', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png', precipitationChance: 15, windSpeed: 12, humidity: 38 },
  ];

  // Mock hourly data crossing midnight
  const mockHourlyDataCrossingMidnight = [
    { time: '2024-01-15 22:00', temperature: 55, condition: 'Clear', conditionIcon: '//cdn.weatherapi.com/weather/64x64/night/113.png', precipitationChance: 0, windSpeed: 5, humidity: 60 },
    { time: '2024-01-15 23:00', temperature: 52, condition: 'Clear', conditionIcon: '//cdn.weatherapi.com/weather/64x64/night/113.png', precipitationChance: 0, windSpeed: 4, humidity: 65 },
    { time: '2024-01-16 00:00', temperature: 50, condition: 'Clear', conditionIcon: '//cdn.weatherapi.com/weather/64x64/night/113.png', precipitationChance: 0, windSpeed: 3, humidity: 70 },
    { time: '2024-01-16 01:00', temperature: 48, condition: 'Clear', conditionIcon: '//cdn.weatherapi.com/weather/64x64/night/113.png', precipitationChance: 0, windSpeed: 3, humidity: 72 },
    { time: '2024-01-16 02:00', temperature: 47, condition: 'Clear', conditionIcon: '//cdn.weatherapi.com/weather/64x64/night/113.png', precipitationChance: 0, windSpeed: 2, humidity: 75 },
  ];

  // Full 24 hours of data crossing midnight
  const mockFull24Hours = [
    { time: '2024-01-15 14:00', temperature: 72, condition: 'Sunny', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png', precipitationChance: 5, windSpeed: 10, humidity: 40 },
    { time: '2024-01-15 15:00', temperature: 71, condition: 'Sunny', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png', precipitationChance: 5, windSpeed: 11, humidity: 42 },
    { time: '2024-01-15 16:00', temperature: 69, condition: 'Partly cloudy', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png', precipitationChance: 10, windSpeed: 12, humidity: 45 },
    { time: '2024-01-15 17:00', temperature: 67, condition: 'Partly cloudy', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png', precipitationChance: 10, windSpeed: 10, humidity: 48 },
    { time: '2024-01-15 18:00', temperature: 64, condition: 'Cloudy', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/119.png', precipitationChance: 15, windSpeed: 8, humidity: 52 },
    { time: '2024-01-15 19:00', temperature: 61, condition: 'Cloudy', conditionIcon: '//cdn.weatherapi.com/weather/64x64/night/119.png', precipitationChance: 20, windSpeed: 7, humidity: 55 },
    { time: '2024-01-15 20:00', temperature: 58, condition: 'Clear', conditionIcon: '//cdn.weatherapi.com/weather/64x64/night/113.png', precipitationChance: 10, windSpeed: 6, humidity: 58 },
    { time: '2024-01-15 21:00', temperature: 56, condition: 'Clear', conditionIcon: '//cdn.weatherapi.com/weather/64x64/night/113.png', precipitationChance: 5, windSpeed: 5, humidity: 60 },
    { time: '2024-01-15 22:00', temperature: 54, condition: 'Clear', conditionIcon: '//cdn.weatherapi.com/weather/64x64/night/113.png', precipitationChance: 5, windSpeed: 5, humidity: 62 },
    { time: '2024-01-15 23:00', temperature: 52, condition: 'Clear', conditionIcon: '//cdn.weatherapi.com/weather/64x64/night/113.png', precipitationChance: 5, windSpeed: 4, humidity: 65 },
    { time: '2024-01-16 00:00', temperature: 50, condition: 'Clear', conditionIcon: '//cdn.weatherapi.com/weather/64x64/night/113.png', precipitationChance: 5, windSpeed: 3, humidity: 68 },
    { time: '2024-01-16 01:00', temperature: 49, condition: 'Clear', conditionIcon: '//cdn.weatherapi.com/weather/64x64/night/113.png', precipitationChance: 5, windSpeed: 3, humidity: 70 },
    { time: '2024-01-16 02:00', temperature: 48, condition: 'Clear', conditionIcon: '//cdn.weatherapi.com/weather/64x64/night/113.png', precipitationChance: 5, windSpeed: 3, humidity: 72 },
    { time: '2024-01-16 03:00', temperature: 47, condition: 'Clear', conditionIcon: '//cdn.weatherapi.com/weather/64x64/night/113.png', precipitationChance: 5, windSpeed: 2, humidity: 74 },
    { time: '2024-01-16 04:00', temperature: 46, condition: 'Clear', conditionIcon: '//cdn.weatherapi.com/weather/64x64/night/113.png', precipitationChance: 5, windSpeed: 2, humidity: 75 },
    { time: '2024-01-16 05:00', temperature: 46, condition: 'Clear', conditionIcon: '//cdn.weatherapi.com/weather/64x64/night/113.png', precipitationChance: 5, windSpeed: 2, humidity: 76 },
    { time: '2024-01-16 06:00', temperature: 47, condition: 'Clear', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png', precipitationChance: 5, windSpeed: 3, humidity: 75 },
    { time: '2024-01-16 07:00', temperature: 50, condition: 'Sunny', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png', precipitationChance: 5, windSpeed: 4, humidity: 70 },
    { time: '2024-01-16 08:00', temperature: 54, condition: 'Sunny', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png', precipitationChance: 5, windSpeed: 5, humidity: 65 },
    { time: '2024-01-16 09:00', temperature: 58, condition: 'Sunny', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png', precipitationChance: 5, windSpeed: 6, humidity: 58 },
    { time: '2024-01-16 10:00', temperature: 62, condition: 'Sunny', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png', precipitationChance: 5, windSpeed: 8, humidity: 52 },
    { time: '2024-01-16 11:00', temperature: 66, condition: 'Sunny', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png', precipitationChance: 5, windSpeed: 10, humidity: 48 },
    { time: '2024-01-16 12:00', temperature: 70, condition: 'Sunny', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png', precipitationChance: 5, windSpeed: 11, humidity: 44 },
    { time: '2024-01-16 13:00', temperature: 72, condition: 'Sunny', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png', precipitationChance: 5, windSpeed: 12, humidity: 42 },
  ];

  // Mock rainy hourly data
  const mockRainyHourlyData = [
    { time: '2024-01-15 10:00', temperature: 55, condition: 'Light rain', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/296.png', precipitationChance: 80, windSpeed: 15, humidity: 85 },
    { time: '2024-01-15 11:00', temperature: 54, condition: 'Moderate rain', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/302.png', precipitationChance: 90, windSpeed: 18, humidity: 90 },
    { time: '2024-01-15 12:00', temperature: 53, condition: 'Heavy rain', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/308.png', precipitationChance: 100, windSpeed: 20, humidity: 95 },
  ];

  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia());
    store = useWeatherStore();
  });

  /**
   * Helper function to mount the component
   */
  function mountComponent() {
    return mount(HourlyForecast, {
      global: {
        plugins: [],
      },
    });
  }

  describe('Loading State', () => {
    it('should display loading skeleton when isLoading is true', () => {
      store.isLoading = true;
      store.hourlyForecast = [];

      const wrapper = mountComponent();

      // Should have animate-pulse class for skeleton effect
      expect(wrapper.find('.animate-pulse').exists()).toBe(true);
    });

    it('should display multiple skeleton items', () => {
      store.isLoading = true;
      store.hourlyForecast = [];

      const wrapper = mountComponent();

      // Should have 8 skeleton items
      const skeletonItems = wrapper.findAll('.animate-pulse');
      expect(skeletonItems.length).toBeGreaterThan(0);
    });

    it('should display skeleton elements with gray backgrounds', () => {
      store.isLoading = true;
      store.hourlyForecast = [];

      const wrapper = mountComponent();

      const grayElements = wrapper.findAll('.bg-gray-200');
      expect(grayElements.length).toBeGreaterThan(0);
    });

    it('should not display hourly cards when loading', () => {
      store.isLoading = true;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      // Should show skeleton, not hourly cards
      expect(wrapper.find('.hourly-card').exists()).toBe(false);
    });

    it('should have container with rounded corners during loading', () => {
      store.isLoading = true;
      store.hourlyForecast = [];

      const wrapper = mountComponent();

      expect(wrapper.find('.rounded-xl').exists()).toBe(true);
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no hourly data and not loading', () => {
      store.isLoading = false;
      store.hourlyForecast = [];

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('No hourly forecast available');
    });

    it('should display empty state when hourlyForecast is null', () => {
      store.isLoading = false;
      store.hourlyForecast = null;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('No hourly forecast available');
    });

    it('should display helpful message to search for location', () => {
      store.isLoading = false;
      store.hourlyForecast = [];

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('Search for a location to see hourly weather');
    });

    it('should display a clock icon in empty state', () => {
      store.isLoading = false;
      store.hourlyForecast = [];

      const wrapper = mountComponent();

      const svgElement = wrapper.find('svg');
      expect(svgElement.exists()).toBe(true);
    });

    it('should have centered text layout in empty state', () => {
      store.isLoading = false;
      store.hourlyForecast = [];

      const wrapper = mountComponent();

      expect(wrapper.find('.text-center').exists()).toBe(true);
    });
  });

  describe('Hourly Data Display', () => {
    describe('Hourly Cards', () => {
      it('should display hourly cards for each hour', () => {
        store.isLoading = false;
        store.hourlyForecast = mockHourlyDataNoMidnight;

        const wrapper = mountComponent();

        const hourlyCards = wrapper.findAll('.hourly-card');
        expect(hourlyCards.length).toBe(mockHourlyDataNoMidnight.length);
      });

      it('should display all 24 hourly cards when full data provided', () => {
        store.isLoading = false;
        store.hourlyForecast = mockFull24Hours;

        const wrapper = mountComponent();

        const hourlyCards = wrapper.findAll('.hourly-card');
        expect(hourlyCards.length).toBe(24);
      });

      it('should display time for each hour', () => {
        store.isLoading = false;
        store.hourlyForecast = mockHourlyDataNoMidnight;

        const wrapper = mountComponent();

        // Check that times are displayed
        expect(wrapper.text()).toContain('10 AM');
        expect(wrapper.text()).toContain('11 AM');
        expect(wrapper.text()).toContain('12 PM');
        expect(wrapper.text()).toContain('1 PM');
      });

      it('should display temperature for each hour', () => {
        store.isLoading = false;
        store.hourlyForecast = mockHourlyDataNoMidnight;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('68°F');
        expect(wrapper.text()).toContain('70°F');
        expect(wrapper.text()).toContain('72°F');
      });

      it('should display weather icon for each hour', () => {
        store.isLoading = false;
        store.hourlyForecast = mockHourlyDataNoMidnight;

        const wrapper = mountComponent();

        const images = wrapper.findAll('.hourly-card img');
        expect(images.length).toBe(mockHourlyDataNoMidnight.length);
      });

      it('should convert icon URLs to HTTPS', () => {
        store.isLoading = false;
        store.hourlyForecast = mockHourlyDataNoMidnight;

        const wrapper = mountComponent();

        const images = wrapper.findAll('.hourly-card img');
        images.forEach((img) => {
          const src = img.attributes('src');
          expect(src).toContain('https://');
          expect(src).not.toContain('http://cdn');
        });
      });

      it('should display precipitation chance for each hour', () => {
        store.isLoading = false;
        store.hourlyForecast = mockHourlyDataNoMidnight;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('5%');
        expect(wrapper.text()).toContain('10%');
        expect(wrapper.text()).toContain('15%');
      });

      it('should display wind speed for each hour', () => {
        store.isLoading = false;
        store.hourlyForecast = mockHourlyDataNoMidnight;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('8 mph');
        expect(wrapper.text()).toContain('10 mph');
        expect(wrapper.text()).toContain('12 mph');
      });

      it('should display humidity for each hour', () => {
        store.isLoading = false;
        store.hourlyForecast = mockHourlyDataNoMidnight;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('45%');
        expect(wrapper.text()).toContain('42%');
        expect(wrapper.text()).toContain('40%');
      });
    });

    describe('Current Hour Highlight', () => {
      it('should highlight the first hour as current hour', () => {
        store.isLoading = false;
        store.hourlyForecast = mockHourlyDataNoMidnight;

        const wrapper = mountComponent();

        const hourlyCards = wrapper.findAll('.hourly-card');
        expect(hourlyCards[0].classes()).toContain('ring-2');
        expect(hourlyCards[0].classes()).toContain('ring-blue-400');
      });

      it('should not highlight subsequent hours', () => {
        store.isLoading = false;
        store.hourlyForecast = mockHourlyDataNoMidnight;

        const wrapper = mountComponent();

        const hourlyCards = wrapper.findAll('.hourly-card');
        for (let i = 1; i < hourlyCards.length; i++) {
          expect(hourlyCards[i].classes()).not.toContain('ring-2');
        }
      });
    });
  });

  describe('Date Separator (EC-004 - Midnight Crossing)', () => {
    it('should show date separator when crossing midnight', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataCrossingMidnight;

      const wrapper = mountComponent();

      const separators = wrapper.findAll('.date-separator');
      expect(separators.length).toBe(1);
    });

    it('should display "Tomorrow" when midnight is next day', () => {
      // Mock today's date to match our test data
      vi.setSystemTime(new Date('2024-01-15T22:00:00'));

      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataCrossingMidnight;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('Tomorrow');

      vi.useRealTimers();
    });

    it('should show date separator in full 24-hour data', () => {
      store.isLoading = false;
      store.hourlyForecast = mockFull24Hours;

      const wrapper = mountComponent();

      const separators = wrapper.findAll('.date-separator');
      expect(separators.length).toBe(1);
    });

    it('should position date separator before midnight hour', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataCrossingMidnight;

      const wrapper = mountComponent();

      // The separator should appear before the 00:00 hour card
      const html = wrapper.html();
      const separatorIndex = html.indexOf('date-separator');
      const midnightIndex = html.indexOf('12 AM');

      // Separator should appear before midnight
      expect(separatorIndex).toBeLessThan(midnightIndex);
    });

    it('should not show separator when data does not cross midnight', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      const separators = wrapper.findAll('.date-separator');
      expect(separators.length).toBe(0);
    });

    it('should not show separator at the first hour (index 0)', () => {
      // Create data starting at midnight
      const midnightStartData = [
        { time: '2024-01-16 00:00', temperature: 50, condition: 'Clear', conditionIcon: '//cdn.weatherapi.com/weather/64x64/night/113.png', precipitationChance: 0, windSpeed: 3, humidity: 70 },
        { time: '2024-01-16 01:00', temperature: 48, condition: 'Clear', conditionIcon: '//cdn.weatherapi.com/weather/64x64/night/113.png', precipitationChance: 0, windSpeed: 3, humidity: 72 },
      ];

      store.isLoading = false;
      store.hourlyForecast = midnightStartData;

      const wrapper = mountComponent();

      // Should not show separator since midnight is at index 0
      const separators = wrapper.findAll('.date-separator');
      expect(separators.length).toBe(0);
    });

    it('should style date separator with blue background', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataCrossingMidnight;

      const wrapper = mountComponent();

      const separator = wrapper.find('.date-separator');
      const labelDiv = separator.find('.bg-blue-100');
      expect(labelDiv.exists()).toBe(true);
    });
  });

  describe('Horizontal Scroll', () => {
    it('should have horizontal scroll container', () => {
      store.isLoading = false;
      store.hourlyForecast = mockFull24Hours;

      const wrapper = mountComponent();

      const scrollContainer = wrapper.find('.hourly-scroll-container');
      expect(scrollContainer.exists()).toBe(true);
      expect(scrollContainer.classes()).toContain('overflow-x-auto');
    });

    it('should have smooth scroll behavior', () => {
      store.isLoading = false;
      store.hourlyForecast = mockFull24Hours;

      const wrapper = mountComponent();

      const scrollContainer = wrapper.find('.hourly-scroll-container');
      expect(scrollContainer.classes()).toContain('scroll-smooth');
    });

    it('should have flex layout for horizontal scrolling', () => {
      store.isLoading = false;
      store.hourlyForecast = mockFull24Hours;

      const wrapper = mountComponent();

      const scrollContainer = wrapper.find('.hourly-scroll-container');
      expect(scrollContainer.classes()).toContain('flex');
    });

    it('should have flex-shrink-0 on cards to prevent shrinking', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      const hourlyCards = wrapper.findAll('.hourly-card');
      hourlyCards.forEach((card) => {
        expect(card.classes()).toContain('flex-shrink-0');
      });
    });

    it('should show scroll indicators on mobile', () => {
      store.isLoading = false;
      store.hourlyForecast = mockFull24Hours;

      const wrapper = mountComponent();

      // Check for scroll indicator dots (hidden on md+)
      const indicators = wrapper.find('.md\\:hidden');
      expect(indicators.exists()).toBe(true);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive card width classes', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      const html = wrapper.html();
      expect(html).toContain('w-20');
      expect(html).toContain('md:w-24');
    });

    it('should have responsive padding classes', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      const container = wrapper.find('.rounded-xl');
      expect(container.classes()).toContain('p-4');
      expect(container.classes()).toContain('md:p-6');
    });

    it('should have responsive gap classes', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      const scrollContainer = wrapper.find('.hourly-scroll-container');
      expect(scrollContainer.classes()).toContain('gap-3');
      expect(scrollContainer.classes()).toContain('md:gap-4');
    });

    it('should have responsive icon size classes', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      const img = wrapper.find('.hourly-card img');
      expect(img.classes()).toContain('w-10');
      expect(img.classes()).toContain('h-10');
      expect(img.classes()).toContain('md:w-12');
      expect(img.classes()).toContain('md:h-12');
    });

    it('should have responsive text size classes', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      const html = wrapper.html();
      expect(html).toContain('text-xs');
      expect(html).toContain('md:text-sm');
      expect(html).toContain('text-base');
      expect(html).toContain('md:text-lg');
    });
  });

  describe('Styling and Visual Elements', () => {
    it('should have white background container', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      expect(wrapper.find('.bg-white').exists()).toBe(true);
    });

    it('should have rounded corners on container', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      expect(wrapper.find('.rounded-xl').exists()).toBe(true);
    });

    it('should have shadow on container', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      expect(wrapper.find('.shadow-lg').exists()).toBe(true);
    });

    it('should have gradient background on hourly cards', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      const hourlyCard = wrapper.find('.hourly-card');
      expect(hourlyCard.classes()).toContain('bg-gradient-to-b');
    });

    it('should have border on hourly cards', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      const hourlyCard = wrapper.find('.hourly-card');
      expect(hourlyCard.classes()).toContain('border');
      expect(hourlyCard.classes()).toContain('border-blue-100');
    });

    it('should have hover effects on hourly cards', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      const hourlyCard = wrapper.find('.hourly-card');
      expect(hourlyCard.classes()).toContain('hover:border-blue-300');
      expect(hourlyCard.classes()).toContain('hover:shadow-md');
    });

    it('should have transition classes for animations', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      const hourlyCard = wrapper.find('.hourly-card');
      expect(hourlyCard.classes()).toContain('transition-all');
    });
  });

  describe('Reactive Data Updates', () => {
    it('should update display when hourlyForecast changes', async () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('68°F');

      // Update hourly data
      store.hourlyForecast = mockRainyHourlyData;
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('55°F');
      // Condition is shown in alt attribute, not as text
      const img = wrapper.find('.hourly-card img');
      expect(img.attributes('alt')).toBe('Light rain');
    });

    it('should transition from loading to data display', async () => {
      store.isLoading = true;
      store.hourlyForecast = [];

      const wrapper = mountComponent();

      expect(wrapper.find('.animate-pulse').exists()).toBe(true);

      // Simulate data load completion
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.animate-pulse').exists()).toBe(false);
      expect(wrapper.findAll('.hourly-card').length).toBe(4);
    });

    it('should transition from data to empty state', async () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      expect(wrapper.findAll('.hourly-card').length).toBe(4);

      // Clear hourly data
      store.hourlyForecast = [];
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('No hourly forecast available');
    });

    it('should update number of cards when data changes', async () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      expect(wrapper.findAll('.hourly-card').length).toBe(4);

      // Update to full 24 hours
      store.hourlyForecast = mockFull24Hours;
      await wrapper.vm.$nextTick();

      expect(wrapper.findAll('.hourly-card').length).toBe(24);
    });
  });

  describe('Various Weather Conditions', () => {
    it('should render sunny hours correctly', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      // Condition is shown in alt attribute of icons
      const img = wrapper.find('.hourly-card img');
      expect(img.attributes('alt')).toBe('Sunny');
    });

    it('should render rainy hours correctly', () => {
      store.isLoading = false;
      store.hourlyForecast = mockRainyHourlyData;

      const wrapper = mountComponent();

      // Condition is shown in alt attribute of icons
      const images = wrapper.findAll('.hourly-card img');
      expect(images[0].attributes('alt')).toBe('Light rain');
      expect(images[1].attributes('alt')).toBe('Moderate rain');
      expect(images[2].attributes('alt')).toBe('Heavy rain');
    });

    it('should display high precipitation for rainy conditions', () => {
      store.isLoading = false;
      store.hourlyForecast = mockRainyHourlyData;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('80%');
      expect(wrapper.text()).toContain('90%');
      expect(wrapper.text()).toContain('100%');
    });

    it('should display high humidity for rainy conditions', () => {
      store.isLoading = false;
      store.hourlyForecast = mockRainyHourlyData;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('85%');
      expect(wrapper.text()).toContain('90%');
      expect(wrapper.text()).toContain('95%');
    });
  });

  describe('Edge Cases', () => {
    it('should handle hourly data with zero values', () => {
      const zeroData = [
        { time: '2024-01-15 10:00', temperature: 0, condition: 'Freezing', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png', precipitationChance: 0, windSpeed: 0, humidity: 0 },
      ];

      store.isLoading = false;
      store.hourlyForecast = zeroData;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('0°F');
      expect(wrapper.text()).toContain('0%');
      expect(wrapper.text()).toContain('0 mph');
    });

    it('should handle single hour of data', () => {
      store.isLoading = false;
      store.hourlyForecast = [mockHourlyDataNoMidnight[0]];

      const wrapper = mountComponent();

      const hourlyCards = wrapper.findAll('.hourly-card');
      expect(hourlyCards.length).toBe(1);
    });

    it('should handle missing icon URL gracefully', () => {
      const noIconData = [
        { time: '2024-01-15 10:00', temperature: 68, condition: 'Unknown', conditionIcon: null, precipitationChance: 5, windSpeed: 8, humidity: 45 },
      ];

      store.isLoading = false;
      store.hourlyForecast = noIconData;

      const wrapper = mountComponent();

      const img = wrapper.find('.hourly-card img');
      expect(img.attributes('src')).toBe('');
    });

    it('should handle undefined conditionIcon gracefully', () => {
      const undefinedIconData = [
        { time: '2024-01-15 10:00', temperature: 68, condition: 'Unknown', conditionIcon: undefined, precipitationChance: 5, windSpeed: 8, humidity: 45 },
      ];

      store.isLoading = false;
      store.hourlyForecast = undefinedIconData;

      const wrapper = mountComponent();

      const img = wrapper.find('.hourly-card img');
      expect(img.attributes('src')).toBe('');
    });

    it('should handle very long condition text', () => {
      const longConditionData = [
        { time: '2024-01-15 10:00', temperature: 68, condition: 'Patchy light rain with thunder', conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png', precipitationChance: 5, windSpeed: 8, humidity: 45 },
      ];

      store.isLoading = false;
      store.hourlyForecast = longConditionData;

      const wrapper = mountComponent();

      const img = wrapper.find('.hourly-card img');
      expect(img.attributes('alt')).toBe('Patchy light rain with thunder');
    });

    it('should handle http:// icon URLs by converting to https', () => {
      const httpIconData = [
        { time: '2024-01-15 10:00', temperature: 68, condition: 'Sunny', conditionIcon: 'http://cdn.weatherapi.com/weather/64x64/day/113.png', precipitationChance: 5, windSpeed: 8, humidity: 45 },
      ];

      store.isLoading = false;
      store.hourlyForecast = httpIconData;

      const wrapper = mountComponent();

      const img = wrapper.find('.hourly-card img');
      expect(img.attributes('src')).toBe('https://cdn.weatherapi.com/weather/64x64/day/113.png');
    });
  });

  describe('Component Structure', () => {
    it('should have root element with hourly-forecast class', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      expect(wrapper.find('.hourly-forecast').exists()).toBe(true);
    });

    it('should have scroll container ref', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      expect(wrapper.find('.hourly-scroll-container').exists()).toBe(true);
    });

    it('should render icons in each card for details', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      // Each card should have SVG icons for precipitation, wind, and humidity
      const hourlyCard = wrapper.find('.hourly-card');
      const svgs = hourlyCard.findAll('svg');
      expect(svgs.length).toBe(3); // precipitation, wind, humidity icons
    });
  });

  describe('Accessibility', () => {
    it('should have alt text for weather icons', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      const images = wrapper.findAll('.hourly-card img');
      images.forEach((img) => {
        expect(img.attributes('alt')).toBeTruthy();
      });
    });

    it('should have title attributes for detail icons', () => {
      store.isLoading = false;
      store.hourlyForecast = mockHourlyDataNoMidnight;

      const wrapper = mountComponent();

      const hourlyCard = wrapper.find('.hourly-card');
      const detailItems = hourlyCard.findAll('[title]');
      expect(detailItems.length).toBeGreaterThan(0);
    });
  });
});
