/**
 * Unit tests for TabContainer component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import TabContainer from '../../components/TabContainer.vue';

// Mock child components to isolate TabContainer testing
vi.mock('../../components/HourlyForecast.vue', () => ({
  default: {
    name: 'HourlyForecast',
    template: '<div class="mock-hourly-forecast">HourlyForecast Mock</div>',
  },
}));

vi.mock('../../components/DailyForecast.vue', () => ({
  default: {
    name: 'DailyForecast',
    template: '<div class="mock-daily-forecast">DailyForecast Mock</div>',
  },
}));

describe('TabContainer', () => {
  let wrapper;

  beforeEach(() => {
    // Create fresh pinia for each test
    setActivePinia(createPinia());
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  function mountComponent() {
    wrapper = mount(TabContainer, {
      global: {
        plugins: [],
      },
    });
    return wrapper;
  }

  describe('Initial Rendering', () => {
    it('should render two tabs', () => {
      mountComponent();

      const tabs = wrapper.findAll('[role="tab"]');
      expect(tabs.length).toBe(2);
    });

    it('should have Hourly and Daily tab labels', () => {
      mountComponent();

      const text = wrapper.text();
      expect(text).toContain('Hourly');
      expect(text).toContain('Daily');
    });

    it('should have hourly tab active by default', () => {
      mountComponent();

      const hourlyTab = wrapper.find('#tab-hourly');
      const dailyTab = wrapper.find('#tab-daily');

      expect(hourlyTab.attributes('aria-selected')).toBe('true');
      expect(dailyTab.attributes('aria-selected')).toBe('false');
    });

    it('should show HourlyForecast component by default', () => {
      mountComponent();

      const hourlyPanel = wrapper.find('#panel-hourly');
      const dailyPanel = wrapper.find('#panel-daily');

      // v-show sets display:none style
      // Check that hourly is visible (no display:none)
      expect(hourlyPanel.attributes('style')).toBeFalsy();
      // Check that daily is hidden (has display:none)
      expect(dailyPanel.attributes('style')).toContain('display: none');
    });

    it('should render tab panels with correct roles', () => {
      mountComponent();

      const panels = wrapper.findAll('[role="tabpanel"]');
      expect(panels.length).toBe(2);
    });
  });

  describe('Tab Switching', () => {
    it('should switch to daily tab when clicked', async () => {
      mountComponent();

      const dailyTab = wrapper.find('#tab-daily');
      await dailyTab.trigger('click');

      expect(dailyTab.attributes('aria-selected')).toBe('true');
      expect(wrapper.find('#tab-hourly').attributes('aria-selected')).toBe('false');
    });

    it('should show DailyForecast when daily tab is active', async () => {
      mountComponent();

      const dailyTab = wrapper.find('#tab-daily');
      await dailyTab.trigger('click');

      const hourlyPanel = wrapper.find('#panel-hourly');
      const dailyPanel = wrapper.find('#panel-daily');

      // Check that hourly is hidden (has display:none)
      expect(hourlyPanel.attributes('style')).toContain('display: none');
      // Check that daily is visible (no display:none)
      expect(dailyPanel.attributes('style')).toBeFalsy();
    });

    it('should switch back to hourly tab when clicked', async () => {
      mountComponent();

      // First switch to daily
      const dailyTab = wrapper.find('#tab-daily');
      await dailyTab.trigger('click');

      // Then switch back to hourly
      const hourlyTab = wrapper.find('#tab-hourly');
      await hourlyTab.trigger('click');

      expect(hourlyTab.attributes('aria-selected')).toBe('true');
      expect(dailyTab.attributes('aria-selected')).toBe('false');
    });

    it('should only render one forecast component at a time (visibility)', async () => {
      mountComponent();

      // Check hourly is visible, daily is hidden
      expect(wrapper.find('#panel-hourly').attributes('style')).toBeFalsy();
      expect(wrapper.find('#panel-daily').attributes('style')).toContain('display: none');

      // Switch to daily
      await wrapper.find('#tab-daily').trigger('click');

      // Check daily is visible, hourly is hidden
      expect(wrapper.find('#panel-hourly').attributes('style')).toContain('display: none');
      expect(wrapper.find('#panel-daily').attributes('style')).toBeFalsy();
    });
  });

  describe('Active Tab Styling', () => {
    it('should have distinct styling for active tab', () => {
      mountComponent();

      const hourlyTab = wrapper.find('#tab-hourly');
      const dailyTab = wrapper.find('#tab-daily');

      // Active tab should have blue styling
      expect(hourlyTab.classes()).toContain('text-blue-600');
      expect(hourlyTab.classes()).toContain('border-b-2');
      expect(hourlyTab.classes()).toContain('bg-blue-50');

      // Inactive tab should have gray styling
      expect(dailyTab.classes()).toContain('text-gray-500');
    });

    it('should update styling when tab changes', async () => {
      mountComponent();

      const hourlyTab = wrapper.find('#tab-hourly');
      const dailyTab = wrapper.find('#tab-daily');

      // Switch to daily
      await dailyTab.trigger('click');

      // Daily should now be active
      expect(dailyTab.classes()).toContain('text-blue-600');
      expect(dailyTab.classes()).toContain('bg-blue-50');

      // Hourly should be inactive
      expect(hourlyTab.classes()).toContain('text-gray-500');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should switch to daily tab with ArrowRight', async () => {
      mountComponent();

      const hourlyTab = wrapper.find('#tab-hourly');
      await hourlyTab.trigger('keydown', { key: 'ArrowRight' });

      expect(wrapper.find('#tab-daily').attributes('aria-selected')).toBe('true');
    });

    it('should switch to hourly tab with ArrowLeft', async () => {
      mountComponent();

      // First switch to daily
      await wrapper.find('#tab-daily').trigger('click');

      // Then press ArrowLeft
      const dailyTab = wrapper.find('#tab-daily');
      await dailyTab.trigger('keydown', { key: 'ArrowLeft' });

      expect(wrapper.find('#tab-hourly').attributes('aria-selected')).toBe('true');
    });

    it('should go to first tab with Home key', async () => {
      mountComponent();

      // First switch to daily
      await wrapper.find('#tab-daily').trigger('click');

      // Then press Home
      const dailyTab = wrapper.find('#tab-daily');
      await dailyTab.trigger('keydown', { key: 'Home' });

      expect(wrapper.find('#tab-hourly').attributes('aria-selected')).toBe('true');
    });

    it('should go to last tab with End key', async () => {
      mountComponent();

      const hourlyTab = wrapper.find('#tab-hourly');
      await hourlyTab.trigger('keydown', { key: 'End' });

      expect(wrapper.find('#tab-daily').attributes('aria-selected')).toBe('true');
    });

    it('should not go past first tab with ArrowLeft', async () => {
      mountComponent();

      const hourlyTab = wrapper.find('#tab-hourly');
      await hourlyTab.trigger('keydown', { key: 'ArrowLeft' });

      // Should stay on hourly
      expect(hourlyTab.attributes('aria-selected')).toBe('true');
    });

    it('should not go past last tab with ArrowRight', async () => {
      mountComponent();

      // First switch to daily
      await wrapper.find('#tab-daily').trigger('click');

      const dailyTab = wrapper.find('#tab-daily');
      await dailyTab.trigger('keydown', { key: 'ArrowRight' });

      // Should stay on daily
      expect(dailyTab.attributes('aria-selected')).toBe('true');
    });

    it('should ignore other keys', async () => {
      mountComponent();

      const hourlyTab = wrapper.find('#tab-hourly');
      await hourlyTab.trigger('keydown', { key: 'Enter' });
      await hourlyTab.trigger('keydown', { key: 'Space' });
      await hourlyTab.trigger('keydown', { key: 'a' });

      // Should stay on hourly
      expect(hourlyTab.attributes('aria-selected')).toBe('true');
    });
  });

  describe('Accessibility', () => {
    it('should have tablist role on navigation container', () => {
      mountComponent();

      const tablist = wrapper.find('[role="tablist"]');
      expect(tablist.exists()).toBe(true);
    });

    it('should have aria-label on tablist', () => {
      mountComponent();

      const tablist = wrapper.find('[role="tablist"]');
      expect(tablist.attributes('aria-label')).toBe('Forecast views');
    });

    it('should have correct aria-controls on tabs', () => {
      mountComponent();

      const hourlyTab = wrapper.find('#tab-hourly');
      const dailyTab = wrapper.find('#tab-daily');

      expect(hourlyTab.attributes('aria-controls')).toBe('panel-hourly');
      expect(dailyTab.attributes('aria-controls')).toBe('panel-daily');
    });

    it('should have correct aria-labelledby on panels', () => {
      mountComponent();

      const hourlyPanel = wrapper.find('#panel-hourly');
      const dailyPanel = wrapper.find('#panel-daily');

      expect(hourlyPanel.attributes('aria-labelledby')).toBe('tab-hourly');
      expect(dailyPanel.attributes('aria-labelledby')).toBe('tab-daily');
    });

    it('should set correct tabindex on active/inactive tabs', () => {
      mountComponent();

      const hourlyTab = wrapper.find('#tab-hourly');
      const dailyTab = wrapper.find('#tab-daily');

      // Active tab should have tabindex 0
      expect(hourlyTab.attributes('tabindex')).toBe('0');
      // Inactive tab should have tabindex -1
      expect(dailyTab.attributes('tabindex')).toBe('-1');
    });

    it('should update tabindex when tab changes', async () => {
      mountComponent();

      const hourlyTab = wrapper.find('#tab-hourly');
      const dailyTab = wrapper.find('#tab-daily');

      // Switch to daily
      await dailyTab.trigger('click');

      expect(hourlyTab.attributes('tabindex')).toBe('-1');
      expect(dailyTab.attributes('tabindex')).toBe('0');
    });

    it('should set correct tabindex on active/inactive panels', () => {
      mountComponent();

      const hourlyPanel = wrapper.find('#panel-hourly');
      const dailyPanel = wrapper.find('#panel-daily');

      // Active panel should have tabindex 0
      expect(hourlyPanel.attributes('tabindex')).toBe('0');
      // Inactive panel should have tabindex -1
      expect(dailyPanel.attributes('tabindex')).toBe('-1');
    });

    it('should have icons with aria-hidden', () => {
      mountComponent();

      const icons = wrapper.findAll('svg');
      icons.forEach((icon) => {
        expect(icon.attributes('aria-hidden')).toBe('true');
      });
    });
  });

  describe('Component Integration', () => {
    it('should render HourlyForecast component', () => {
      mountComponent();

      expect(wrapper.find('.mock-hourly-forecast').exists()).toBe(true);
    });

    it('should render DailyForecast component', () => {
      mountComponent();

      expect(wrapper.find('.mock-daily-forecast').exists()).toBe(true);
    });

    it('should expose setActiveTab function', () => {
      mountComponent();

      expect(typeof wrapper.vm.setActiveTab).toBe('function');
    });

    it('should expose handleKeyDown function', () => {
      mountComponent();

      expect(typeof wrapper.vm.handleKeyDown).toBe('function');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes on tabs', () => {
      mountComponent();

      const tabs = wrapper.findAll('.tab-button');
      tabs.forEach((tab) => {
        expect(tab.classes()).toContain('flex-1');
        // Check for responsive text size classes
        expect(tab.html()).toContain('md:text-base');
      });
    });

    it('should have responsive icon sizes in markup', () => {
      mountComponent();

      const icons = wrapper.findAll('svg');
      icons.forEach((icon) => {
        expect(icon.classes()).toContain('w-5');
        expect(icon.classes()).toContain('h-5');
      });
    });
  });

  describe('Reactivity', () => {
    it('should update view when activeTab changes programmatically', async () => {
      mountComponent();

      // Directly change the activeTab value
      wrapper.vm.setActiveTab('daily');
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.activeTab).toBe('daily');
      expect(wrapper.find('#tab-daily').attributes('aria-selected')).toBe('true');
    });

    it('should maintain state correctly after multiple switches', async () => {
      mountComponent();

      // Switch multiple times
      await wrapper.find('#tab-daily').trigger('click');
      await wrapper.find('#tab-hourly').trigger('click');
      await wrapper.find('#tab-daily').trigger('click');
      await wrapper.find('#tab-hourly').trigger('click');

      // Should be back on hourly
      expect(wrapper.vm.activeTab).toBe('hourly');
      // Hourly panel should be visible (no display:none style)
      expect(wrapper.find('#panel-hourly').attributes('style')).toBeFalsy();
    });
  });
});
