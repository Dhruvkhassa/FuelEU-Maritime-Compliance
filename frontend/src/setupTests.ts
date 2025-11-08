import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Runs a cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock requestAnimationFrame globally
window.requestAnimationFrame = function(callback: FrameRequestCallback): number {
  return setTimeout(callback, 0);
};
