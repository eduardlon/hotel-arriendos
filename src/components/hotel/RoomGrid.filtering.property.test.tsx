import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import RoomGrid from './RoomGrid';
import type { Room } from '@/types';

/**
 * **Feature: hotel-arriendos, Property 4: Room Filtering**
 * 
 * For any combination of room status and floor filters, the filtered room grid
 * should display only rooms that match all selected filter criteria.
 * 
 * **Validates: Requirements 3.6**
 */

vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await vi.importActual<typeof import('@/tests/utils/framer-motion-mock')>(
    '@/tests/utils/framer-motion-mock'
  );
  return createFramerMotionMock();
});

const roomArbitrary = fc.record({
  type: fc.constantFrom<Room['type']>('individual', 'doble', 'suite', 'familiar'),
  floor: fc.integer({ min: 1, max: 5 }),
  price: fc.integer({ min: 20000, max: 200000 }),
  status: fc.constantFrom<Room['status']>('disponible', 'ocupada', 'limpieza', 'mantenimiento'),
});

describe('Property 4: Room Filtering', () => {
  it('should display only rooms that match status and floor filters', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(roomArbitrary, { minLength: 3, maxLength: 10 }), async (rooms) => {
        const user = userEvent.setup({ delay: null });
        const hydratedRooms = rooms.map((room, index) => ({
          ...room,
          id: `room-${index}-${Math.random().toString(36).slice(2, 6)}`,
          number: `R${index + 1}`,
        }));
        const { unmount } = render(<RoomGrid rooms={hydratedRooms} />);

        try {
          const targetRoom = hydratedRooms[0];
          const statusSelect = screen.getByLabelText(/estado/i);
          const floorSelect = screen.getByLabelText(/piso/i);

          await user.selectOptions(statusSelect, targetRoom.status);
          await user.selectOptions(floorSelect, String(targetRoom.floor));

          const expectedRooms = hydratedRooms.filter(
            (room) => room.status === targetRoom.status && room.floor === targetRoom.floor
          );

          if (expectedRooms.length === 0) {
            expect(screen.getByText(/no se encontraron habitaciones/i)).toBeInTheDocument();
          } else {
            expectedRooms.forEach((room) => {
              expect(screen.getByText(room.number)).toBeInTheDocument();
            });

            const unexpectedRooms = hydratedRooms.filter(
              (room) => room.status !== targetRoom.status || room.floor !== targetRoom.floor
            );
            unexpectedRooms.forEach((room) => {
              expect(screen.queryByText(room.number)).not.toBeInTheDocument();
            });
          }
        } finally {
          unmount();
        }
      }),
      { numRuns: 20 }
    );
  });
});



