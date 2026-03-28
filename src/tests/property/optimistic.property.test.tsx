import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import HabitacionesPage from '@/app/hotel/habitaciones/page';
import type { Room, Employee } from '@/types';

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
  updateRoom: vi.fn(),
  deleteRoom: vi.fn(),
}));

/**
 * **Feature: hotel-arriendos, Property 44: Optimistic UI Updates**
 */

describe('Property 44: Optimistic UI Updates', () => {
  const roomNumberArb = fc
    .string({ minLength: 3, maxLength: 5 })
    .map((value) => value.replace(/\s+/g, ' ').trim())
    .filter((value) => value.length >= 3);

  const roomArb = fc.record({
    number: roomNumberArb,
    type: fc.constantFrom<Room['type']>('individual', 'doble', 'suite', 'familiar'),
    floor: fc.integer({ min: 1, max: 5 }),
    price: fc.integer({ min: 10000, max: 50000 }),
    status: fc.constantFrom<Room['status']>('disponible', 'ocupada', 'limpieza', 'mantenimiento'),
  });

  it('should update the UI before the create operation resolves', async () => {
    await fc.assert(
      fc.asyncProperty(roomArb, async (roomData) => {
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

        let resolveCreate: (value: Room) => void = () => undefined;
        const createPromise = new Promise<Room>((resolve) => {
          resolveCreate = resolve;
        });
        vi.mocked(dataAccess.createRoom).mockReturnValue(createPromise as any);

        const user = userEvent.setup({ delay: null });
        const { unmount } = render(<HabitacionesPage />);

        try {
          await waitFor(() => {
            expect(screen.getByRole('button', { name: /nueva habitación/i })).toBeInTheDocument();
          });

          await user.click(screen.getByRole('button', { name: /nueva habitación/i }));

          fireEvent.change(screen.getByLabelText(/número de habitación/i), {
            target: { value: roomData.number },
          });
          await user.selectOptions(screen.getByLabelText(/^tipo \*/i), roomData.type);
          fireEvent.change(screen.getByLabelText(/^piso \*/i), {
            target: { value: roomData.floor.toString() },
          });
          fireEvent.change(screen.getByLabelText(/precio por noche/i), {
            target: { value: roomData.price.toString() },
          });
          await user.selectOptions(screen.getByLabelText(/^estado \*/i), roomData.status);

          await user.click(screen.getByRole('button', { name: /crear habitación/i }));

          await waitFor(() => {
            expect(screen.getByText(roomData.number)).toBeInTheDocument();
          });

          await act(async () => {
            resolveCreate({ id: 'room-1', ...roomData });
          });
        } finally {
          unmount();
        }
      }),
      { numRuns: 5 }
    );
  });
});




