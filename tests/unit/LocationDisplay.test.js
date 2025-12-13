/**
 * Unit tests for LocationDisplay.vue component
 *
 * Tests component rendering for:
 * - Loading state (skeleton UI)
 * - Empty state (no location data)
 * - Location data display (city, region, country)
 * - Last updated timestamp formatting
 * - Refresh button functionality
 * - Responsive design elements
 * - Reactive data updates
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import LocationDisplay from '../../components/LocationDisplay.vue';
import { useWeatherStore } from '../../stores/weather.js';

describe('LocationDisplay.vue', () => {
  let store;

  // Mock location data for different scenarios
  const mockSanFranciscoLocation = {
    city: 'San Francisco',
    region: 'California',
    country: 'USA',
  };

  const mockLondonLocation = {
    city: 'London',
    region: 'Greater London',
    country: 'United Kingdom',
  };

  const mockTokyoLocation = {
    city: 'Tokyo',
    region: 'Tokyo',
    country: 'Japan',
  };

  const mockCityOnlyLocation = {
    city: 'Berlin',
    region: null,
    country: null,
  };

  const mockCityAndCountryLocation = {
    city: 'Paris',
    region: null,
    country: 'France',
  };

  const mockLongNameLocation = {
    city: 'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch',
    region: 'Isle of Anglesey',
    country: 'Wales',
  };

  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia());
    store = useWeatherStore();
    // Use fake timers to control time-dependent behavior
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Helper function to mount the component
   */
  function mountComponent() {
    return mount(LocationDisplay, {
      global: {
        plugins: [],
      },
    });
  }

  describe('Loading State', () => {
    it('should display loading skeleton when isLoading is true and no location', () => {
      store.isLoading = true;
      store.location = null;

      const wrapper = mountComponent();

      // Should have animate-pulse class for skeleton effect
      expect(wrapper.find('.animate-pulse').exists()).toBe(true);
    });

    it('should display skeleton elements with gray background', () => {
      store.isLoading = true;
      store.location = null;

      const wrapper = mountComponent();

      // Should have skeleton elements with bg-gray-200 background
      const skeletonElements = wrapper.findAll('.bg-gray-200');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('should show location data when loading but location exists', () => {
      store.isLoading = true;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      // Should show location data, not skeleton
      expect(wrapper.find('.animate-pulse').exists()).toBe(false);
      expect(wrapper.text()).toContain('San Francisco');
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no location data and not loading', () => {
      store.isLoading = false;
      store.location = null;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('No location data available');
    });

    it('should display a location pin icon in empty state', () => {
      store.isLoading = false;
      store.location = null;

      const wrapper = mountComponent();

      // Check for SVG location icon
      const svgElement = wrapper.find('svg');
      expect(svgElement.exists()).toBe(true);
    });

    it('should have centered text layout in empty state', () => {
      store.isLoading = false;
      store.location = null;

      const wrapper = mountComponent();

      const emptyStateContainer = wrapper.find('.text-center');
      expect(emptyStateContainer.exists()).toBe(true);
    });

    it('should not show refresh button in empty state', () => {
      store.isLoading = false;
      store.location = null;

      const wrapper = mountComponent();

      expect(wrapper.find('.refresh-button').exists()).toBe(false);
    });
  });

  describe('Location Data Display', () => {
    describe('City Display', () => {
      it('should display city name prominently', () => {
        store.isLoading = false;
        store.location = mockSanFranciscoLocation;

        const wrapper = mountComponent();

        const cityElement = wrapper.find('h2');
        expect(cityElement.exists()).toBe(true);
        expect(cityElement.text()).toBe('San Francisco');
      });

      it('should display city with proper heading classes', () => {
        store.isLoading = false;
        store.location = mockSanFranciscoLocation;

        const wrapper = mountComponent();

        const cityElement = wrapper.find('h2');
        expect(cityElement.classes()).toContain('font-bold');
        expect(cityElement.classes()).toContain('text-xl');
      });

      it('should truncate long city names', () => {
        store.isLoading = false;
        store.location = mockLongNameLocation;

        const wrapper = mountComponent();

        const cityElement = wrapper.find('h2');
        expect(cityElement.classes()).toContain('truncate');
      });
    });

    describe('Region and Country Display', () => {
      it('should display region and country together', () => {
        store.isLoading = false;
        store.location = mockSanFranciscoLocation;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('California, USA');
      });

      it('should display only country when region is missing', () => {
        store.isLoading = false;
        store.location = mockCityAndCountryLocation;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('France');
        expect(wrapper.text()).not.toContain(',');
      });

      it('should handle city-only location gracefully', () => {
        store.isLoading = false;
        store.location = mockCityOnlyLocation;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('Berlin');
        // Region/country line should be empty
        const subtitleElement = wrapper.findAll('p')[0];
        expect(subtitleElement.text()).toBe('');
      });

      it('should display London location correctly', () => {
        store.isLoading = false;
        store.location = mockLondonLocation;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('London');
        expect(wrapper.text()).toContain('Greater London, United Kingdom');
      });

      it('should display Tokyo location correctly', () => {
        store.isLoading = false;
        store.location = mockTokyoLocation;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('Tokyo');
        expect(wrapper.text()).toContain('Tokyo, Japan');
      });
    });

    describe('Last Updated Timestamp', () => {
      it('should display "Last updated" label', () => {
        store.isLoading = false;
        store.location = mockSanFranciscoLocation;
        store.lastUpdated = Date.now();

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('Last updated:');
      });

      it('should display "Just now" for recent updates', () => {
        store.isLoading = false;
        store.location = mockSanFranciscoLocation;
        store.lastUpdated = Date.now();

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('Just now');
      });

      it('should display "Never" when lastUpdated is null', () => {
        store.isLoading = false;
        store.location = mockSanFranciscoLocation;
        store.lastUpdated = null;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('Never');
      });

      it('should display minutes ago for older updates', () => {
        store.isLoading = false;
        store.location = mockSanFranciscoLocation;
        // Set lastUpdated to 5 minutes ago
        store.lastUpdated = Date.now() - 5 * 60 * 1000;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('5 minutes ago');
      });

      it('should display "1 minute ago" for singular minute', () => {
        store.isLoading = false;
        store.location = mockSanFranciscoLocation;
        // Set lastUpdated to 1 minute ago
        store.lastUpdated = Date.now() - 60 * 1000;

        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('1 minute ago');
      });

      it('should have appropriate text styling for timestamp', () => {
        store.isLoading = false;
        store.location = mockSanFranciscoLocation;
        store.lastUpdated = Date.now();

        const wrapper = mountComponent();

        const timestampElement = wrapper.findAll('p').find(p => p.text().includes('Last updated'));
        expect(timestampElement.classes()).toContain('text-gray-400');
        expect(timestampElement.classes()).toContain('text-xs');
      });
    });
  });

  describe('Refresh Button', () => {
    it('should display refresh button when location exists', () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      expect(wrapper.find('.refresh-button').exists()).toBe(true);
    });

    it('should have accessible aria-label', () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      const button = wrapper.find('.refresh-button');
      expect(button.attributes('aria-label')).toBe('Refresh weather data');
    });

    it('should have refresh icon', () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      const button = wrapper.find('.refresh-button');
      expect(button.find('svg').exists()).toBe(true);
    });

    it('should emit refresh event when clicked', async () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      await wrapper.find('.refresh-button').trigger('click');

      expect(wrapper.emitted('refresh')).toBeTruthy();
      expect(wrapper.emitted('refresh').length).toBe(1);
    });

    it('should show spinning animation when refreshing', async () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      await wrapper.find('.refresh-button').trigger('click');

      expect(wrapper.find('.refresh-button').classes()).toContain('animate-spin');
    });

    it('should be disabled when refreshing', async () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      await wrapper.find('.refresh-button').trigger('click');

      expect(wrapper.find('.refresh-button').attributes('disabled')).toBeDefined();
    });

    it('should update aria-label when refreshing', async () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      await wrapper.find('.refresh-button').trigger('click');

      expect(wrapper.find('.refresh-button').attributes('aria-label')).toBe('Refreshing weather data');
    });

    it('should not emit multiple events when clicked rapidly', async () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      const button = wrapper.find('.refresh-button');
      await button.trigger('click');
      await button.trigger('click');
      await button.trigger('click');

      // Should only emit once due to disabled state during refresh
      expect(wrapper.emitted('refresh').length).toBe(1);
    });

    it('should stop spinning after timeout', async () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      await wrapper.find('.refresh-button').trigger('click');

      // Initially spinning
      expect(wrapper.find('.refresh-button').classes()).toContain('animate-spin');

      // Fast-forward time
      vi.advanceTimersByTime(1100);
      await wrapper.vm.$nextTick();

      // Should stop spinning
      expect(wrapper.find('.refresh-button').classes()).not.toContain('animate-spin');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive text size classes for city', () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      const html = wrapper.html();
      expect(html).toContain('text-xl');
      expect(html).toContain('md:text-2xl');
    });

    it('should have responsive padding classes', () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      const html = wrapper.html();
      expect(html).toContain('p-4');
      expect(html).toContain('md:p-6');
    });

    it('should have responsive icon size classes', () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      const refreshIcon = wrapper.find('.refresh-button svg');
      expect(refreshIcon.classes()).toContain('w-5');
      expect(refreshIcon.classes()).toContain('h-5');
      expect(refreshIcon.classes()).toContain('md:w-6');
      expect(refreshIcon.classes()).toContain('md:h-6');
    });

    it('should handle text overflow with truncate class', () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      const cityElement = wrapper.find('h2');
      expect(cityElement.classes()).toContain('truncate');
    });
  });

  describe('Styling and Visual Elements', () => {
    it('should have white background when displaying location', () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      expect(wrapper.find('.bg-white').exists()).toBe(true);
    });

    it('should have rounded corners', () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      expect(wrapper.find('.rounded-xl').exists()).toBe(true);
    });

    it('should have shadow styling', () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      expect(wrapper.find('.shadow-lg').exists()).toBe(true);
    });

    it('should have transition classes for animations', () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      expect(wrapper.find('.transition-all').exists()).toBe(true);
    });

    it('should have flex layout for content', () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      const html = wrapper.html();
      expect(html).toContain('flex');
      expect(html).toContain('items-center');
      expect(html).toContain('justify-between');
    });
  });

  describe('Reactive Data Updates', () => {
    it('should update display when location changes', async () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('San Francisco');
      expect(wrapper.text()).toContain('California, USA');

      // Update location data
      store.location = mockLondonLocation;
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('London');
      expect(wrapper.text()).toContain('Greater London, United Kingdom');
    });

    it('should transition from loading to location display', async () => {
      store.isLoading = true;
      store.location = null;

      const wrapper = mountComponent();

      expect(wrapper.find('.animate-pulse').exists()).toBe(true);

      // Simulate data load completion
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.animate-pulse').exists()).toBe(false);
      expect(wrapper.text()).toContain('San Francisco');
    });

    it('should transition from location to empty state', async () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('San Francisco');

      // Clear location data
      store.location = null;
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('No location data available');
    });

    it('should update timestamp display reactively', async () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;
      store.lastUpdated = Date.now();

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('Just now');

      // Update lastUpdated to 10 minutes ago
      store.lastUpdated = Date.now() - 10 * 60 * 1000;
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('10 minutes ago');
    });
  });

  describe('Component Structure', () => {
    it('should have root element with location-display class', () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      expect(wrapper.find('.location-display').exists()).toBe(true);
    });

    it('should have button with type="button"', () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      const button = wrapper.find('.refresh-button');
      expect(button.attributes('type')).toBe('button');
    });

    it('should have proper heading hierarchy', () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      // City should be h2 for proper hierarchy
      expect(wrapper.find('h2').exists()).toBe(true);
      // Should not have h1 (reserved for page title)
      expect(wrapper.find('h1').exists()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle location with empty strings', () => {
      store.isLoading = false;
      store.location = {
        city: '',
        region: '',
        country: '',
      };

      const wrapper = mountComponent();

      // Should still render without errors
      expect(wrapper.find('.location-display').exists()).toBe(true);
    });

    it('should handle location with special characters', () => {
      store.isLoading = false;
      store.location = {
        city: 'São Paulo',
        region: 'São Paulo',
        country: 'Brasil',
      };

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('São Paulo');
      expect(wrapper.text()).toContain('Brasil');
    });

    it('should handle location with unicode characters', () => {
      store.isLoading = false;
      store.location = {
        city: '東京',
        region: '東京都',
        country: '日本',
      };

      const wrapper = mountComponent();

      expect(wrapper.text()).toContain('東京');
      expect(wrapper.text()).toContain('日本');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-hidden on decorative SVG icons', () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      const svgIcons = wrapper.findAll('svg');
      svgIcons.forEach(svg => {
        expect(svg.attributes('aria-hidden')).toBe('true');
      });
    });

    it('should have focusable refresh button', () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      const button = wrapper.find('.refresh-button');
      // Buttons are focusable by default
      expect(button.element.tagName).toBe('BUTTON');
    });

    it('should have focus ring styles on refresh button', () => {
      store.isLoading = false;
      store.location = mockSanFranciscoLocation;

      const wrapper = mountComponent();

      const button = wrapper.find('.refresh-button');
      expect(button.classes()).toContain('focus:ring-2');
      expect(button.classes()).toContain('focus:ring-blue-500');
    });
  });
});
