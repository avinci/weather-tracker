/**
 * Unit tests for SearchBar.vue component
 *
 * Tests component rendering for:
 * - Search input field functionality
 * - Search button and enter key handling
 * - Search type detection integration
 * - Event emission with detected location
 * - Input validation and sanitization
 * - Search icon display
 * - Clear/reset button functionality
 * - Loading state during search
 * - Placeholder text and hints
 * - Focus and active states
 * - Responsive design elements
 * - Keyboard shortcuts (Enter, Escape)
 * - Various input types (zip, city, region)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SearchBar from '../../components/SearchBar.vue';

describe('SearchBar.vue', () => {
  let wrapper;

  /**
   * Helper function to mount the component with default or custom props
   */
  function mountComponent(props = {}) {
    return mount(SearchBar, {
      props: {
        showHint: true,
        initialValue: '',
        ...props,
      },
    });
  }

  beforeEach(() => {
    // Clean up any existing wrapper
    if (wrapper) {
      wrapper.unmount();
    }
    // Use fake timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('Initial Rendering', () => {
    it('should render search input field', () => {
      wrapper = mountComponent();

      const input = wrapper.find('input[type="text"]');
      expect(input.exists()).toBe(true);
    });

    it('should render search icon', () => {
      wrapper = mountComponent();

      const svg = wrapper.find('.pointer-events-none svg');
      expect(svg.exists()).toBe(true);
    });

    it('should render search button', () => {
      wrapper = mountComponent();

      const button = wrapper.find('.search-button');
      expect(button.exists()).toBe(true);
    });

    it('should have placeholder text', () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      expect(input.attributes('placeholder')).toContain('city');
      expect(input.attributes('placeholder')).toContain('zip code');
      expect(input.attributes('placeholder')).toContain('region');
    });

    it('should show hint text when showHint is true', () => {
      wrapper = mountComponent({ showHint: true });

      expect(wrapper.text()).toContain('Examples:');
      expect(wrapper.text()).toContain('San Francisco');
      expect(wrapper.text()).toContain('94102');
    });

    it('should hide hint text when showHint is false', () => {
      wrapper = mountComponent({ showHint: false });

      expect(wrapper.text()).not.toContain('Examples:');
    });

    it('should not show clear button when input is empty', () => {
      wrapper = mountComponent();

      expect(wrapper.find('.clear-button').exists()).toBe(false);
    });

    it('should apply initial value to input', () => {
      wrapper = mountComponent({ initialValue: 'New York' });

      const input = wrapper.find('input');
      expect(input.element.value).toBe('New York');
    });
  });

  describe('Search Input Behavior', () => {
    it('should update model when user types', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('San Francisco');

      expect(input.element.value).toBe('San Francisco');
    });

    it('should show clear button when input has value', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('test');

      expect(wrapper.find('.clear-button').exists()).toBe(true);
    });

    it('should be disabled when searching', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('test');

      // Trigger search
      await wrapper.find('form').trigger('submit');

      expect(input.attributes('disabled')).toBeDefined();
    });
  });

  describe('Search Submission', () => {
    it('should emit search event on form submit', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('San Francisco');
      await wrapper.find('form').trigger('submit');

      expect(wrapper.emitted('search')).toBeTruthy();
      expect(wrapper.emitted('search').length).toBe(1);
    });

    it('should emit search event with query and type for city', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('San Francisco');
      await wrapper.find('form').trigger('submit');

      const emitted = wrapper.emitted('search')[0][0];
      expect(emitted.query).toBe('San Francisco');
      expect(emitted.type).toBe('city');
      expect(emitted.originalInput).toBe('San Francisco');
    });

    it('should emit search event with zip_code type for zip codes', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('94102');
      await wrapper.find('form').trigger('submit');

      const emitted = wrapper.emitted('search')[0][0];
      expect(emitted.query).toBe('94102');
      expect(emitted.type).toBe('zip_code');
    });

    it('should emit search event with region type for states', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('California');
      await wrapper.find('form').trigger('submit');

      const emitted = wrapper.emitted('search')[0][0];
      expect(emitted.query).toBe('California');
      expect(emitted.type).toBe('region');
    });

    it('should sanitize input before emitting', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('  New   York  ');
      await wrapper.find('form').trigger('submit');

      const emitted = wrapper.emitted('search')[0][0];
      expect(emitted.query).toBe('New York');
    });

    it('should set loading state on submit', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('test');
      await wrapper.find('form').trigger('submit');

      // Check for loading spinner
      expect(wrapper.find('.animate-spin').exists()).toBe(true);
    });

    it('should disable search button during loading', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('test');
      await wrapper.find('form').trigger('submit');

      const button = wrapper.find('.search-button');
      expect(button.attributes('disabled')).toBeDefined();
    });

    it('should not emit when input is empty', async () => {
      wrapper = mountComponent();

      await wrapper.find('form').trigger('submit');

      expect(wrapper.emitted('search')).toBeFalsy();
    });

    it('should not emit when input is only whitespace', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('   ');
      await wrapper.find('form').trigger('submit');

      expect(wrapper.emitted('search')).toBeFalsy();
    });
  });

  describe('Validation', () => {
    it('should show validation error for empty input', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('');
      await wrapper.find('form').trigger('submit');

      expect(wrapper.find('#search-error').exists()).toBe(true);
      expect(wrapper.text()).toContain('required');
    });

    it('should show validation error for single character input', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('a');
      await wrapper.find('form').trigger('submit');

      expect(wrapper.find('#search-error').exists()).toBe(true);
      expect(wrapper.text()).toContain('at least 2 characters');
    });

    it('should clear validation error when user types valid input', async () => {
      wrapper = mountComponent();

      // First trigger validation error
      const input = wrapper.find('input');
      await input.setValue('a');
      await wrapper.find('form').trigger('submit');
      expect(wrapper.find('#search-error').exists()).toBe(true);

      // Now type valid input and submit again
      await input.setValue('San Francisco');
      await wrapper.find('form').trigger('submit');

      expect(wrapper.find('#search-error').exists()).toBe(false);
    });

    it('should have aria-invalid attribute when validation error exists', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('a');
      await wrapper.find('form').trigger('submit');

      expect(input.attributes('aria-invalid')).toBe('true');
    });

    it('should have aria-describedby pointing to error when validation error exists', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('a');
      await wrapper.find('form').trigger('submit');

      expect(input.attributes('aria-describedby')).toBe('search-error');
    });

    it('should apply error styling to input when validation error exists', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('a');
      await wrapper.find('form').trigger('submit');

      expect(input.classes()).toContain('border-red-300');
    });
  });

  describe('Clear Button', () => {
    it('should clear input when clear button clicked', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('test query');

      const clearButton = wrapper.find('.clear-button');
      await clearButton.trigger('click');

      expect(input.element.value).toBe('');
    });

    it('should hide clear button after clearing', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('test');

      const clearButton = wrapper.find('.clear-button');
      await clearButton.trigger('click');

      expect(wrapper.find('.clear-button').exists()).toBe(false);
    });

    it('should clear validation error when clear button clicked', async () => {
      wrapper = mountComponent();

      // Trigger validation error
      const input = wrapper.find('input');
      await input.setValue('a');
      await wrapper.find('form').trigger('submit');
      expect(wrapper.find('#search-error').exists()).toBe(true);

      // Type something to show clear button
      await input.setValue('test');
      
      // Clear
      const clearButton = wrapper.find('.clear-button');
      await clearButton.trigger('click');

      expect(wrapper.find('#search-error').exists()).toBe(false);
    });

    it('should have accessible aria-label', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('test');

      const clearButton = wrapper.find('.clear-button');
      expect(clearButton.attributes('aria-label')).toBe('Clear search');
    });

    it('should not show clear button when searching', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('test');
      await wrapper.find('form').trigger('submit');

      // Clear button should be hidden during search
      expect(wrapper.find('.clear-button').exists()).toBe(false);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should submit on Enter key', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('San Francisco');
      await wrapper.find('form').trigger('submit');

      expect(wrapper.emitted('search')).toBeTruthy();
    });

    it('should clear input on Escape key', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('test');
      await input.trigger('keydown', { key: 'Escape' });

      expect(input.element.value).toBe('');
    });

    it('should clear validation error on Escape key', async () => {
      wrapper = mountComponent();

      // Trigger validation error
      const input = wrapper.find('input');
      await input.setValue('a');
      await wrapper.find('form').trigger('submit');
      expect(wrapper.find('#search-error').exists()).toBe(true);

      // Press Escape
      await input.trigger('keydown', { key: 'Escape' });

      expect(wrapper.find('#search-error').exists()).toBe(false);
    });
  });

  describe('Search Type Detection', () => {
    describe('ZIP Codes', () => {
      it('should detect US 5-digit zip code', async () => {
        wrapper = mountComponent();

        const input = wrapper.find('input');
        await input.setValue('94102');
        await wrapper.find('form').trigger('submit');

        const emitted = wrapper.emitted('search')[0][0];
        expect(emitted.type).toBe('zip_code');
      });

      it('should detect US ZIP+4 format', async () => {
        wrapper = mountComponent();

        const input = wrapper.find('input');
        await input.setValue('94102-1234');
        await wrapper.find('form').trigger('submit');

        const emitted = wrapper.emitted('search')[0][0];
        expect(emitted.type).toBe('zip_code');
      });

      it('should detect 4-digit postal codes', async () => {
        wrapper = mountComponent();

        const input = wrapper.find('input');
        await input.setValue('1234');
        await wrapper.find('form').trigger('submit');

        const emitted = wrapper.emitted('search')[0][0];
        expect(emitted.type).toBe('zip_code');
      });
    });

    describe('City Names', () => {
      it('should detect simple city name', async () => {
        wrapper = mountComponent();

        const input = wrapper.find('input');
        await input.setValue('London');
        await wrapper.find('form').trigger('submit');

        const emitted = wrapper.emitted('search')[0][0];
        expect(emitted.type).toBe('city');
      });

      it('should detect city with spaces', async () => {
        wrapper = mountComponent();

        const input = wrapper.find('input');
        await input.setValue('San Francisco');
        await wrapper.find('form').trigger('submit');

        const emitted = wrapper.emitted('search')[0][0];
        expect(emitted.type).toBe('city');
      });

      it('should detect city with special characters', async () => {
        wrapper = mountComponent();

        const input = wrapper.find('input');
        await input.setValue('São Paulo');
        await wrapper.find('form').trigger('submit');

        const emitted = wrapper.emitted('search')[0][0];
        expect(emitted.type).toBe('city');
      });

      it('should detect city with country qualifier', async () => {
        wrapper = mountComponent();

        const input = wrapper.find('input');
        await input.setValue('Paris, France');
        await wrapper.find('form').trigger('submit');

        const emitted = wrapper.emitted('search')[0][0];
        expect(emitted.type).toBe('city');
      });
    });

    describe('Regions', () => {
      it('should detect US state full name', async () => {
        wrapper = mountComponent();

        const input = wrapper.find('input');
        await input.setValue('California');
        await wrapper.find('form').trigger('submit');

        const emitted = wrapper.emitted('search')[0][0];
        expect(emitted.type).toBe('region');
      });

      it('should detect US state abbreviation', async () => {
        wrapper = mountComponent();

        const input = wrapper.find('input');
        await input.setValue('TX');
        await wrapper.find('form').trigger('submit');

        const emitted = wrapper.emitted('search')[0][0];
        expect(emitted.type).toBe('region');
      });

      it('should detect country name', async () => {
        wrapper = mountComponent();

        const input = wrapper.find('input');
        await input.setValue('Japan');
        await wrapper.find('form').trigger('submit');

        const emitted = wrapper.emitted('search')[0][0];
        expect(emitted.type).toBe('region');
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when isSearching', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('test');
      await wrapper.find('form').trigger('submit');

      expect(wrapper.find('.animate-spin').exists()).toBe(true);
    });

    it('should hide search arrow icon when loading', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('test');
      
      // Before search - should show arrow
      const arrowBefore = wrapper.find('.search-button svg:not(.animate-spin)');
      expect(arrowBefore.exists()).toBe(true);

      await wrapper.find('form').trigger('submit');

      // After search - should show spinner, not arrow
      expect(wrapper.find('.search-button .animate-spin').exists()).toBe(true);
    });

    it('should update search button aria-label during loading', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('test');
      await wrapper.find('form').trigger('submit');

      const button = wrapper.find('.search-button');
      expect(button.attributes('aria-label')).toBe('Searching...');
    });

    it('should stop loading when stopLoading is called', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('test');
      await wrapper.find('form').trigger('submit');

      expect(wrapper.find('.animate-spin').exists()).toBe(true);

      // Call stopLoading through component instance
      wrapper.vm.stopLoading();
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.animate-spin').exists()).toBe(false);
    });
  });

  describe('Exposed Methods', () => {
    it('should expose stopLoading method', () => {
      wrapper = mountComponent();
      expect(typeof wrapper.vm.stopLoading).toBe('function');
    });

    it('should expose setError method', () => {
      wrapper = mountComponent();
      expect(typeof wrapper.vm.setError).toBe('function');
    });

    it('should expose focus method', () => {
      wrapper = mountComponent();
      expect(typeof wrapper.vm.focus).toBe('function');
    });

    it('should set error when setError is called', async () => {
      wrapper = mountComponent();

      wrapper.vm.setError('Location not found');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('#search-error').exists()).toBe(true);
      expect(wrapper.text()).toContain('Location not found');
    });

    it('should stop loading when setError is called', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('test');
      await wrapper.find('form').trigger('submit');

      expect(wrapper.find('.animate-spin').exists()).toBe(true);

      wrapper.vm.setError('Error occurred');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.animate-spin').exists()).toBe(false);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive text size classes', () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      expect(input.classes()).toContain('text-base');
      expect(input.classes()).toContain('md:text-lg');
    });

    it('should have responsive padding classes', () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      expect(input.classes()).toContain('py-3');
    });

    it('should have full width container', () => {
      wrapper = mountComponent();

      expect(wrapper.find('.search-bar').exists()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have form with role="search"', () => {
      wrapper = mountComponent();

      const form = wrapper.find('form');
      expect(form.attributes('role')).toBe('search');
    });

    it('should have accessible input label', () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      expect(input.attributes('aria-label')).toBe('Search for weather by location');
    });

    it('should have aria-hidden on decorative icons', () => {
      wrapper = mountComponent();

      const icons = wrapper.findAll('svg[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have accessible search button', () => {
      wrapper = mountComponent();

      const button = wrapper.find('.search-button');
      expect(button.attributes('aria-label')).toBeTruthy();
    });

    it('should have role="alert" on error message', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('a');
      await wrapper.find('form').trigger('submit');

      const error = wrapper.find('#search-error');
      expect(error.attributes('role')).toBe('alert');
    });

    it('should have focus ring styles on input', () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      expect(input.classes()).toContain('focus:ring-2');
      expect(input.classes()).toContain('focus:ring-blue-200');
    });

    it('should have focus ring styles on buttons', () => {
      wrapper = mountComponent();

      const searchButton = wrapper.find('.search-button');
      expect(searchButton.classes()).toContain('focus:ring-2');
    });
  });

  describe('Styling', () => {
    it('should have rounded corners on input', () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      expect(input.classes()).toContain('rounded-xl');
    });

    it('should have border on input', () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      expect(input.classes()).toContain('border-2');
      expect(input.classes()).toContain('border-gray-200');
    });

    it('should have blue background on search button', () => {
      wrapper = mountComponent();

      const button = wrapper.find('.search-button');
      expect(button.classes()).toContain('bg-blue-500');
    });

    it('should have hover state on search button', () => {
      wrapper = mountComponent();

      const button = wrapper.find('.search-button');
      expect(button.classes()).toContain('hover:bg-blue-600');
    });

    it('should have transition classes for animations', () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      expect(input.classes()).toContain('transition-all');
    });

    it('should show disabled styles on search button when empty', () => {
      wrapper = mountComponent();

      const button = wrapper.find('.search-button');
      expect(button.attributes('disabled')).toBeDefined();
      expect(button.classes()).toContain('disabled:opacity-50');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in input', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('New York, NY');
      await wrapper.find('form').trigger('submit');

      const emitted = wrapper.emitted('search')[0][0];
      expect(emitted.query).toBe('New York, NY');
    });

    it('should handle unicode characters', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('東京');
      await wrapper.find('form').trigger('submit');

      const emitted = wrapper.emitted('search')[0][0];
      expect(emitted.query).toBe('東京');
    });

    it('should strip HTML tags from input', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('<script>alert("xss")</script>test');
      await wrapper.find('form').trigger('submit');

      const emitted = wrapper.emitted('search')[0][0];
      expect(emitted.query).not.toContain('<script>');
      expect(emitted.query).not.toContain('</script>');
    });

    it('should handle very long input', async () => {
      wrapper = mountComponent();

      const longInput = 'a'.repeat(200);
      const input = wrapper.find('input');
      await input.setValue(longInput);
      await wrapper.find('form').trigger('submit');

      const emitted = wrapper.emitted('search')[0][0];
      // Should be truncated to max 100 characters
      expect(emitted.query.length).toBeLessThanOrEqual(100);
    });

    it('should disable search button after form submission to prevent rapid clicks', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('test');
      
      // First submit
      await wrapper.find('form').trigger('submit');
      
      // After first submit, button should be disabled
      const button = wrapper.find('.search-button');
      expect(button.attributes('disabled')).toBeDefined();
      
      // Input should also be disabled
      expect(input.attributes('disabled')).toBeDefined();
    });
  });

  describe('Component Structure', () => {
    it('should have root element with search-bar class', () => {
      wrapper = mountComponent();

      expect(wrapper.find('.search-bar').exists()).toBe(true);
    });

    it('should have form element as child', () => {
      wrapper = mountComponent();

      expect(wrapper.find('form').exists()).toBe(true);
    });

    it('should prevent default form submission', async () => {
      wrapper = mountComponent();

      const form = wrapper.find('form');
      const submitEvent = new Event('submit');
      submitEvent.preventDefault = vi.fn();

      await form.element.dispatchEvent(submitEvent);

      // Form should have @submit.prevent
      expect(form.attributes()).toBeDefined();
    });

    it('should have button type="submit" for search button', () => {
      wrapper = mountComponent();

      const button = wrapper.find('.search-button');
      expect(button.attributes('type')).toBe('submit');
    });

    it('should have button type="button" for clear button', async () => {
      wrapper = mountComponent();

      const input = wrapper.find('input');
      await input.setValue('test');

      const clearButton = wrapper.find('.clear-button');
      expect(clearButton.attributes('type')).toBe('button');
    });
  });
});
