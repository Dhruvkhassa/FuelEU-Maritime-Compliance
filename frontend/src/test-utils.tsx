import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

// Mock axios module
vi.mock('axios', () => {
  const axiosInstance = {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() }
    },
    create: vi.fn().mockReturnThis(),
    defaults: { baseURL: '' }
  };
  return {
    default: axiosInstance,
    create: vi.fn(() => axiosInstance)
  };
});

// Mock window.URL
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'URL', {
    value: {
      createObjectURL: vi.fn(),
      revokeObjectURL: vi.fn(),
    },
    writable: true
  });
}

// Custom render function
const customRender = (ui: React.ReactElement) => {
  return render(ui);
};

// re-export everything
export * from '@testing-library/react';
export { customRender as render };