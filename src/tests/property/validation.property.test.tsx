import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import HabitacionesPage from '@/app/hotel/habitaciones/page';
import type { Employee } from '@/types';

const addToast = vi.fn();

vi.mock('@/components/shared/Toast', () => ({
  useToast: () => ({ addToast }),
}));

vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await vi.importActual<typeof import('@/tests/utils/framer-motion-mock')>(
    '@/tests/utils/framer-motion-mock'
  );
  return createFramerMotionMock();
});

vi.mock('@/lib/data-access', () => ({
  isCachePrimed: vi.fn(() => false),
  getRooms: vi.fn(),
  getEmployees: vi.fn(),
  createRoom: vi.fn(),
}));

/**
 * **Feature: hotel-arriendos, Property 41: Data Input Validation**
 */

describe('Property 41: Data Input Validation', () => {
  it('should show validation errors for invalid room data', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ max: 0 }), async (invalidPrice) => {
        const dataAccess = await import('@/lib/data-access');
        vi.mocked(dataAccess.getRooms).mockResolvedValue([]);
        vi.mocked(dataAccess.getEmployees).mockResolvedValue([
          {
            id: 'emp-1',
            name: 'Limpieza',
            role: 'limpieza',
            shift: 'mañana',
            phone: '123',
            email: 'test@test.com',
            hireDate: new Date(),
          } as Employee,
        ]);

        const user = userEvent.setup({ delay: null });
        const { unmount } = render(<HabitacionesPage />);

        try {
          await waitFor(() => {
            expect(screen.getByRole('button', { name: /nueva habitación/i })).toBeInTheDocument();
          });

          await user.click(screen.getByRole('button', { name: /nueva habitación/i }));

          await user.type(screen.getByLabelText(/número de habitación/i), '101');
          const priceInput = screen.getByLabelText(/precio por noche/i);
          fireEvent.change(priceInput, { target: { value: invalidPrice.toString() } });

          const form = screen.getByRole('dialog').querySelector('form');
          if (form) {
            fireEvent.submit(form);
          }

          expect(screen.getByText(/el precio debe ser mayor que cero/i)).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: 5 }
    );
  });
});




