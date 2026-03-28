import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import RoomGrid from './RoomGrid';
import type { Room } from '@/types';

/**
 * **Feature: hotel-arriendos, Property 3: Room Display and Status**
 * 
 * For any set of rooms, the room grid should display all rooms with color coding that
 * correctly corresponds to each room's status (disponible, ocupada, limpieza, mantenimiento).
 * 
 * **Validates: Requirements 3.1**
 */

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await vi.importActual<typeof import('@/tests/utils/framer-motion-mock')>(
    '@/tests/utils/framer-motion-mock'
  );
  return createFramerMotionMock();
});

describe('Property 3: Room Display and Status', () => {
  // Counter to ensure unique room numbers across all test runs
  let roomCounter = 0;

  // Arbitrary generators for room data
  const roomTypeArbitrary = fc.constantFrom<Room['type']>(
    'individual',
    'doble',
    'suite',
    'familiar'
  );

  const floorArbitrary = fc.integer({ min: 1, max: 20 });

  const priceArbitrary = fc.float({ min: 10, max: 1000, noNaN: true }).map(p => 
    Math.round(p * 100) / 100
  );

  const roomStatusArbitrary = fc.constantFrom<Room['status']>(
    'disponible',
    'ocupada',
    'limpieza',
    'mantenimiento'
  );

  // Generator for a single room with unique ID and number
  const roomArbitrary = fc.record({
    type: roomTypeArbitrary,
    floor: floorArbitrary,
    price: priceArbitrary,
    status: roomStatusArbitrary,
  }).map((room) => {
    const uniqueNum = roomCounter++;
    return {
      ...room,
      id: `room-${uniqueNum}`,
      number: `R${uniqueNum}`,
    };
  });

  // Generator for array of rooms with unique IDs and numbers
  const uniqueRoomsArbitrary = (minLength: number, maxLength: number) =>
    fc.array(roomArbitrary, { minLength, maxLength });

  // Map status to expected CSS class
  const getStatusClass = (status: Room['status']): string => {
    return `status-${status}`;
  };

  it('should display all rooms in the grid for any set of rooms', () => {
    fc.assert(
      fc.property(
        uniqueRoomsArbitrary(1, 20),
        (rooms) => {
          const { unmount } = render(<RoomGrid rooms={rooms} />);

          // Verify all rooms are displayed by checking their room numbers
          for (const room of rooms) {
            expect(screen.getByText(room.number)).toBeInTheDocument();
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should apply correct color coding class for each room status', () => {
    fc.assert(
      fc.property(
        uniqueRoomsArbitrary(1, 20),
        (rooms) => {
          const { container, unmount } = render(<RoomGrid rooms={rooms} />);

          // Verify each room has the correct status class
          for (const room of rooms) {
            const expectedClass = getStatusClass(room.status);
            
            // Find the room card by room number - get the parent card element
            const roomNumberElement = screen.getByText(room.number);
            // The room card is several levels up from the room number span
            const roomCard = roomNumberElement.closest('[class*="roomCard"]');
            
            expect(roomCard).toBeInTheDocument();
            expect(roomCard?.className).toContain(expectedClass);
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display rooms with disponible status with correct color coding', () => {
    fc.assert(
      fc.property(
        uniqueRoomsArbitrary(1, 10)
          .map(rooms => rooms.map(room => ({ ...room, status: 'disponible' as const }))),
        (rooms) => {
          const { unmount } = render(<RoomGrid rooms={rooms} />);

          // Verify all rooms are displayed
          for (const room of rooms) {
            const roomNumberElement = screen.getByText(room.number);
            const roomCard = roomNumberElement.closest('[class*="roomCard"]');
            
            expect(roomCard).toBeInTheDocument();
            expect(roomCard?.className).toContain('status-disponible');
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display rooms with ocupada status with correct color coding', () => {
    fc.assert(
      fc.property(
        uniqueRoomsArbitrary(1, 10)
          .map(rooms => rooms.map(room => ({ ...room, status: 'ocupada' as const }))),
        (rooms) => {
          const { unmount } = render(<RoomGrid rooms={rooms} />);

          // Verify all rooms are displayed with correct status class
          for (const room of rooms) {
            const roomNumberElement = screen.getByText(room.number);
            const roomCard = roomNumberElement.closest('[class*="roomCard"]');
            
            expect(roomCard).toBeInTheDocument();
            expect(roomCard?.className).toContain('status-ocupada');
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display rooms with limpieza status with correct color coding', () => {
    fc.assert(
      fc.property(
        uniqueRoomsArbitrary(1, 10)
          .map(rooms => rooms.map(room => ({ ...room, status: 'limpieza' as const }))),
        (rooms) => {
          const { unmount } = render(<RoomGrid rooms={rooms} />);

          // Verify all rooms are displayed with correct status class
          for (const room of rooms) {
            const roomNumberElement = screen.getByText(room.number);
            const roomCard = roomNumberElement.closest('[class*="roomCard"]');
            
            expect(roomCard).toBeInTheDocument();
            expect(roomCard?.className).toContain('status-limpieza');
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display rooms with mantenimiento status with correct color coding', () => {
    fc.assert(
      fc.property(
        uniqueRoomsArbitrary(1, 10)
          .map(rooms => rooms.map(room => ({ ...room, status: 'mantenimiento' as const }))),
        (rooms) => {
          const { unmount } = render(<RoomGrid rooms={rooms} />);

          // Verify all rooms are displayed with correct status class
          for (const room of rooms) {
            const roomNumberElement = screen.getByText(room.number);
            const roomCard = roomNumberElement.closest('[class*="roomCard"]');
            
            expect(roomCard).toBeInTheDocument();
            expect(roomCard?.className).toContain('status-mantenimiento');
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display mixed status rooms with correct color coding for each', () => {
    fc.assert(
      fc.property(
        uniqueRoomsArbitrary(4, 20),
        (rooms) => {
          // Ensure we have at least one room of each status
          const statuses: Room['status'][] = ['disponible', 'ocupada', 'limpieza', 'mantenimiento'];
          const roomsWithMixedStatus = rooms.map((room, index) => ({
            ...room,
            status: statuses[index % statuses.length],
          }));

          const { unmount } = render(<RoomGrid rooms={roomsWithMixedStatus} />);

          // Verify each room has the correct status class
          for (const room of roomsWithMixedStatus) {
            const roomNumberElement = screen.getByText(room.number);
            const roomCard = roomNumberElement.closest('[class*="roomCard"]');
            const expectedClass = getStatusClass(room.status);
            
            expect(roomCard).toBeInTheDocument();
            expect(roomCard?.className).toContain(expectedClass);
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display status badge with correct status text for each room', () => {
    fc.assert(
      fc.property(
        uniqueRoomsArbitrary(1, 15),
        (rooms) => {
          const { unmount } = render(<RoomGrid rooms={rooms} />);

          // Verify each room displays its status text
          for (const room of rooms) {
            // Find all elements with the status text (there might be multiple)
            const statusElements = screen.getAllByText(room.status);
            expect(statusElements.length).toBeGreaterThan(0);
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain correct color coding when rooms array is empty', () => {
    const { container, unmount } = render(<RoomGrid rooms={[]} />);

    // Verify empty state is displayed
    expect(screen.getByText(/no se encontraron habitaciones/i)).toBeInTheDocument();

    unmount();
  });

  it('should display all room attributes along with status color coding', () => {
    fc.assert(
      fc.property(
        uniqueRoomsArbitrary(1, 10),
        (rooms) => {
          const { unmount } = render(<RoomGrid rooms={rooms} />);

          // Verify each room displays its number, status, and has correct color coding
          for (const room of rooms) {
            // Check room number is displayed
            expect(screen.getByText(room.number)).toBeInTheDocument();
            
            // Check status is displayed
            const statusElements = screen.getAllByText(room.status);
            expect(statusElements.length).toBeGreaterThan(0);
            
            // Check color coding class is applied
            const roomNumberElement = screen.getByText(room.number);
            const roomCard = roomNumberElement.closest('[class*="roomCard"]');
            const expectedClass = getStatusClass(room.status);
            expect(roomCard?.className).toContain(expectedClass);
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly map status to color coding for any room', () => {
    fc.assert(
      fc.property(
        roomArbitrary,
        (room) => {
          const { unmount } = render(<RoomGrid rooms={[room]} />);

          const roomNumberElement = screen.getByText(room.number);
          const roomCard = roomNumberElement.closest('[class*="roomCard"]');
          
          // Verify the status class matches the room's status
          const expectedClass = getStatusClass(room.status);
          expect(roomCard?.className).toContain(expectedClass);
          
          // Verify status text is displayed
          expect(screen.getByText(room.status)).toBeInTheDocument();

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});



