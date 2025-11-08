import { afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Set up global mocks
beforeAll(() => {
  // Mock window functions
  Object.defineProperty(window, 'requestAnimationFrame', {
    value: (callback: FrameRequestCallback) => setTimeout(callback, 0),
    writable: true
  });
  
  Object.defineProperty(window, 'cancelAnimationFrame', {
    value: (handle: number) => clearTimeout(handle),
    writable: true
  });

  // Mock Element.getBoundingClientRect
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    toJSON: () => ({})
  }));
});

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
