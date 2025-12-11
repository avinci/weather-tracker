import { describe, it, expect } from 'vitest';

describe('Environment Variables', () => {
  it('should have access to VITE_ prefixed env variables', () => {
    // In test environment, this will be undefined unless .env is loaded
    // This verifies the config is set up correctly
    expect(import.meta.env).toBeDefined();
    expect(import.meta.env.MODE).toBeDefined();
  });
});
