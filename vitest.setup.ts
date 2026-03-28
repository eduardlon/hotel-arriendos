import '@testing-library/jest-dom';
import { vi } from 'vitest';

const stableAddToast = vi.fn();

vi.mock('@/components/shared/Toast', () => ({
  useToast: () => ({ addToast: stableAddToast }),
  ToastProvider: ({ children }: { children: any }) => children,
}));

vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await vi.importActual<typeof import('@/tests/utils/framer-motion-mock')>(
    '@/tests/utils/framer-motion-mock'
  );
  return createFramerMotionMock();
});
