import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

// Set up JSDOM URL handling
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn();
  window.URL.revokeObjectURL = vi.fn();
}

// Mock requestAnimationFrame and cancel
window.requestAnimationFrame = function(callback: FrameRequestCallback): number {
  return setTimeout(callback, 0);
};
window.cancelAnimationFrame = function(handle: number): void {
  clearTimeout(handle);
};

// Runs a cleanup after each test case
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
