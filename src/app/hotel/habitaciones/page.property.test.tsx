import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import HabitacionesPage from './page';
import * as dataAccess from '@/lib/data-access';
import type { Room, Employee } from '@/types';

/**
 * **Feature: hotel-arriendos, Property 2: Room CRUD Operations**
 * 
 * For any valid room data (number, type, floor, price, status), creating a room should add it
 * to the system, updating a room should modify its attributes, and deleting a room should remove
 * it from the system, with all operations immediately reflected in the UI.
 * 
 * **Validates: Requirements 3.4, 3.5**
 */

// Mock data access functions
vi.mock('@/lib/data-access', () => ({
  isCachePrimed: vi.fn(() => false),
  getRooms: vi.fn(),
  createRoom: vi.fn(),
  updateRoom: vi.fn(),
  deleteRoom: vi.fn(),
  getEmployees: vi.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await vi.importActual<typeof import('@/tests/utils/framer-motion-mock')>(
    '@/tests/utils/framer-motion-mock'
  );
  return createFramerMotionMock();
});

describe('Property 2: Room CRUD Operations - UI Integration', () => {
  const mockEmployees: Employee[] = [
    {
      id: 'emp-1',
      name: 'María González',
      role: 'limpieza',
      shift: 'mañana',
      phone: '+56912345678',
      email: 'maria@hotel.com',
      hireDate: new Date('2023-01-15'),
    },
  ];

  // Arbitrary generators for room data
  const roomNumberArbitrary = fc.oneof(
    fc.integer({ min: 100, max: 999 }).map(n => n.toString()),
    fc.constantFrom('A', 'B', 'C', 'D')
      .chain(letter => fc.integer({ min: 1, max: 50 }).map(n => `${letter}${n}`))
  );

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

  const roomDataArbitrary = fc.record({
    number: roomNumberArbitrary,
    type: roomTypeArbitrary,
    floor: floorArbitrary,
    price: priceArbitrary,
    status: roomStatusArbitrary,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dataAccess.getEmployees).mockResolvedValue(mockEmployees);
  });

  it('should create a room with any valid data and reflect it in the UI', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomDataArbitrary,
        async (roomData) => {
          // Clear all mocks before each iteration
          vi.clearAllMocks();
          vi.mocked(dataAccess.getEmployees).mockResolvedValue(mockEmployees);
          
          const user = userEvent.setup({ delay: null });
          
          // Start with empty rooms
          vi.mocked(dataAccess.getRooms).mockResolvedValue([]);
          
          // Mock createRoom to return the created room with an ID
          const createdRoom: Room = {
            id: `room-${Date.now()}`,
            ...roomData,
          };
          vi.mocked(dataAccess.createRoom).mockResolvedValue(createdRoom);

          const { unmount, container } = render(<HabitacionesPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              const buttons = screen.queryAllByRole('button', { name: /nueva habitación/i });
              expect(buttons.length).toBeGreaterThan(0);
            });

            // Open create modal - use getAllByRole and take the first one
            const createButtons = screen.getAllByRole('button', { name: /nueva habitación/i });
            await user.click(createButtons[0]);

            await waitFor(() => {
              expect(screen.getByRole('dialog')).toBeInTheDocument();
            });

            // Fill form with generated data
            const numberInput = screen.getByLabelText(/número de habitación/i);
            fireEvent.change(numberInput, { target: { value: roomData.number } });

            const typeSelect = screen.getByLabelText(/^tipo \*/i);
            await user.selectOptions(typeSelect, roomData.type);

            const floorInput = screen.getByLabelText(/^piso \*/i);
            fireEvent.change(floorInput, { target: { value: roomData.floor.toString() } });

            const priceInput = screen.getByLabelText(/precio por noche/i);
            fireEvent.change(priceInput, { target: { value: roomData.price.toString() } });

            const statusSelect = screen.getByLabelText(/^estado \*/i);
            await user.selectOptions(statusSelect, roomData.status);

            // Submit form
            const submitButton = screen.getByRole('button', { name: /crear habitación/i });
            await user.click(submitButton);

            // Verify createRoom was called with correct data
            await waitFor(() => {
              expect(dataAccess.createRoom).toHaveBeenCalledWith({
                number: roomData.number,
                type: roomData.type,
                floor: roomData.floor,
                price: roomData.price,
                status: roomData.status,
                assignedEmployeeId: undefined,
              });
            });

            // Verify UI reflects the new room
            await waitFor(() => {
              expect(screen.getByText(roomData.number)).toBeInTheDocument();
            });

            return true;
          } finally {
            unmount();
            // Clean up any remaining DOM elements
            container.remove();
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);

  it('should update a room with any valid attribute changes and reflect it in the UI', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomDataArbitrary,
        roomDataArbitrary,
        async (initialData, updateData) => {
          // Clear all mocks before each iteration
          vi.clearAllMocks();
          vi.mocked(dataAccess.getEmployees).mockResolvedValue(mockEmployees);
          
          const user = userEvent.setup({ delay: null });
          
          // Create initial room
          const initialRoom: Room = {
            id: 'room-test',
            ...initialData,
          };
          
          vi.mocked(dataAccess.getRooms).mockResolvedValue([initialRoom]);
          
          // Mock updateRoom to return the updated room
          const updatedRoom: Room = {
            id: 'room-test',
            ...updateData,
          };
          vi.mocked(dataAccess.updateRoom).mockResolvedValue(updatedRoom);

          const { unmount, container } = render(<HabitacionesPage />);

          try {
            // Wait for page to load and room to appear - use getAllByText and take first
            await waitFor(() => {
              const roomNumbers = screen.queryAllByText(initialData.number);
              expect(roomNumbers.length).toBeGreaterThan(0);
            });

            // Click on room to edit - use getAllByText and take first
            const roomNumbers = screen.getAllByText(initialData.number);
            const roomCard = roomNumbers[0].closest('div');
            if (roomCard) {
              await user.click(roomCard);
            }

            await waitFor(() => {
              expect(screen.getByRole('dialog')).toBeInTheDocument();
            });

            // Update all fields with new data
            const numberInput = screen.getByLabelText(/número de habitación/i);
            fireEvent.change(numberInput, { target: { value: updateData.number } });

            const typeSelect = screen.getByLabelText(/^tipo \*/i);
            await user.selectOptions(typeSelect, updateData.type);

            const floorInput = screen.getByLabelText(/^piso \*/i);
            fireEvent.change(floorInput, { target: { value: updateData.floor.toString() } });

            const priceInput = screen.getByLabelText(/precio por noche/i);
            fireEvent.change(priceInput, { target: { value: updateData.price.toString() } });

            const statusSelect = screen.getByLabelText(/^estado \*/i);
            await user.selectOptions(statusSelect, updateData.status);

            // Submit form
            const submitButton = screen.getByRole('button', { name: /guardar cambios/i });
            await user.click(submitButton);

            // Verify updateRoom was called with correct data
            await waitFor(() => {
              expect(dataAccess.updateRoom).toHaveBeenCalledWith('room-test', {
                number: updateData.number,
                type: updateData.type,
                floor: updateData.floor,
                price: updateData.price,
                status: updateData.status,
                assignedEmployeeId: undefined,
              });
            });

            // Verify UI reflects the updated room
            await waitFor(() => {
              expect(screen.getByText(updateData.number)).toBeInTheDocument();
            });

            return true;
          } finally {
            unmount();
            // Clean up any remaining DOM elements
            container.remove();
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);

  it('should delete a room and remove it from the UI', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomDataArbitrary,
        async (roomData) => {
          // Clear all mocks before each iteration
          vi.clearAllMocks();
          vi.mocked(dataAccess.getEmployees).mockResolvedValue(mockEmployees);
          
          const user = userEvent.setup({ delay: null });
          
          // Create initial room
          const room: Room = {
            id: 'room-to-delete',
            ...roomData,
          };
          
          vi.mocked(dataAccess.getRooms).mockResolvedValue([room]);
          vi.mocked(dataAccess.deleteRoom).mockResolvedValue(true);

          // Mock window.confirm to always return true
          const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

          const { unmount, container } = render(<HabitacionesPage />);

          try {
            // Wait for page to load and room to appear
            await waitFor(() => {
              const roomNumbers = screen.queryAllByText(roomData.number);
              expect(roomNumbers.length).toBeGreaterThan(0);
            });

            // Click on room to edit - use getAllByText and take first
            const roomNumbers = screen.getAllByText(roomData.number);
            const roomCard = roomNumbers[0].closest('div');
            if (roomCard) {
              await user.click(roomCard);
            }

            await waitFor(() => {
              expect(screen.getByRole('dialog')).toBeInTheDocument();
            });

            // Click delete button
            const deleteButton = screen.getByRole('button', { name: /eliminar/i });
            await user.click(deleteButton);

            // Verify deleteRoom was called
            await waitFor(() => {
              expect(dataAccess.deleteRoom).toHaveBeenCalledWith('room-to-delete');
            });

            // Verify UI no longer shows the room
            await waitFor(() => {
              expect(screen.queryByText(roomData.number)).not.toBeInTheDocument();
            });

            return true;
          } finally {
            confirmSpy.mockRestore();
            unmount();
            // Clean up any remaining DOM elements
            container.remove();
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);

  it('should handle multiple CRUD operations in sequence and maintain UI consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(roomDataArbitrary, { minLength: 2, maxLength: 3 }),
        async (roomDataArray) => {
          // Clear all mocks before each iteration
          vi.clearAllMocks();
          vi.mocked(dataAccess.getEmployees).mockResolvedValue(mockEmployees);
          
          const user = userEvent.setup({ delay: null });
          
          // Start with empty rooms
          let currentRooms: Room[] = [];
          vi.mocked(dataAccess.getRooms).mockImplementation(async () => [...currentRooms]);

          const { unmount, container } = render(<HabitacionesPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              const buttons = screen.queryAllByRole('button', { name: /nueva habitación/i });
              expect(buttons.length).toBeGreaterThan(0);
            });

            // Create multiple rooms
            for (let i = 0; i < roomDataArray.length; i++) {
              const roomData = roomDataArray[i];
              const createdRoom: Room = {
                id: `room-${i}`,
                ...roomData,
              };

              vi.mocked(dataAccess.createRoom).mockResolvedValue(createdRoom);

              // Open create modal - use getAllByRole and take first
              const createButtons = screen.getAllByRole('button', { name: /nueva habitación/i });
              await user.click(createButtons[0]);

              await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
              });

              // Fill form
              const numberInput = screen.getByLabelText(/número de habitación/i);
              fireEvent.change(numberInput, { target: { value: roomData.number } });

              const priceInput = screen.getByLabelText(/precio por noche/i);
              fireEvent.change(priceInput, { target: { value: roomData.price.toString() } });

              // Submit form
              const submitButton = screen.getByRole('button', { name: /crear habitación/i });
              await user.click(submitButton);

              // Update current rooms
              currentRooms.push(createdRoom);

              // Verify room appears in UI
              await waitFor(() => {
                expect(screen.getByText(roomData.number)).toBeInTheDocument();
              });
            }

            // Verify all rooms are displayed
            for (const roomData of roomDataArray) {
              expect(screen.getByText(roomData.number)).toBeInTheDocument();
            }

            return true;
          } finally {
            unmount();
            // Clean up any remaining DOM elements
            container.remove();
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 40000);
});




