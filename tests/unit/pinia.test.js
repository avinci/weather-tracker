import { describe, it, expect } from 'vitest';
import { createPinia, defineStore } from 'pinia';

describe('Pinia Store', () => {
  it('should create a pinia instance', () => {
    const pinia = createPinia();
    expect(pinia).toBeDefined();
  });

  it('should define and use a store', () => {
    const pinia = createPinia();
    
    const useTestStore = defineStore('test', {
      state: () => ({ count: 0 }),
      actions: {
        increment() {
          this.count++;
        },
      },
    });

    const store = useTestStore(pinia);
    expect(store.count).toBe(0);
    
    store.increment();
    expect(store.count).toBe(1);
  });
});
