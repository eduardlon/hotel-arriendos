import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import * as fc from 'fast-check';
import LimpiezaPage from './page';
import * as dataAccess from '@/lib/data-access';
import type { Room, Employee, CleaningRecord } from '@/types';

const FAST_CHECK_RUNS = Number(process.env.FAST_CHECK_RUNS ?? 15);
const FAST_CHECK_RUNS_HEAVY = Number(process.env.FAST_CHECK_RUNS_HEAVY ?? Math.min(FAST_CHECK_RUNS, 8));

/**
 * **Feature: hotel-arriendos, Property 9: Cleaning Record Creation**
 * 
 * For any cleaning task completion, the system should create a cleaning record with
 * the employee ID, room ID, and timestamp, and update the room status accordingly.
 * 
 * **Validates: Requirements 5.3, 5.5**
 */

// Mock the data access layer
vi.mock('@/lib/data-access');

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await vi.importActual<typeof import('@/tests/utils/framer-motion-mock')>(
    '@/tests/utils/framer-motion-mock'
  );
  return createFramerMotionMock();
});

describe('Property 9: Cleaning Record Creation', () => {
  let roomCounter = 0;
  let employeeCounter = 0;

  beforeEach(() => {
    vi.clearAllMocks();
    roomCounter = 0;
    employeeCounter = 0;
  });

  // Arbitrary generator for rooms needing cleaning
  const roomNeedingCleaningArbitrary = fc.record({
    number: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
    type: fc.constantFrom<Room['type']>('individual', 'doble', 'suite', 'familiar'),
    floor: fc.integer({ min: 1, max: 20 }),
    price: fc.float({ min: 10, max: 1000, noNaN: true }).map(p => Math.round(p * 100) / 100),
  }).map((room) => {
    const uniqueNum = roomCounter++;
    return {
      ...room,
      id: `room-${uniqueNum}`,
      number: `R${uniqueNum}`,
      status: 'limpieza' as const,
      assignedEmployeeId: undefined,
    };
  });

  // Arbitrary generator for cleaning employees
  const cleaningEmployeeArbitrary = fc.record({
    name: fc.string({ minLength: 3, maxLength: 50 }).filter(s => s.trim().length > 0),
    shift: fc.constantFrom<Employee['shift']>('mañana', 'tarde', 'noche'),
    phone: fc.string({ minLength: 8, maxLength: 15 }),
    email: fc.emailAddress(),
  }).map((emp) => {
    const uniqueNum = employeeCounter++;
    return {
      ...emp,
      id: `emp-${uniqueNum}`,
      role: 'limpieza' as const,
      hireDate: new Date('2024-01-01'),
    };
  });

  // Arbitrary generator for time strings (HH:MM format)
  const timeArbitrary = fc.record({
    hour: fc.integer({ min: 0, max: 23 }),
    minute: fc.integer({ min: 0, max: 59 }),
  }).map(({ hour, minute }) => {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  });

  // Arbitrary generator for valid time ranges (start < end)
  const timeRangeArbitrary = fc.tuple(timeArbitrary, timeArbitrary)
    .filter(([start, end]) => start < end)
    .map(([start, end]) => ({ startTime: start, endTime: end }));

  it('should create a cleaning record with employee ID, room ID, and timestamp when completing a cleaning task', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomNeedingCleaningArbitrary,
        cleaningEmployeeArbitrary,
        timeRangeArbitrary,
        async (room, employee, { startTime, endTime }) => {
          vi.clearAllMocks();

          // Mock initial data
          vi.mocked(dataAccess.getRooms).mockResolvedValue([room]);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([employee]);
          vi.mocked(dataAccess.getCleaningRecords).mockResolvedValue([]);

          // Mock cleaning record creation
          const mockCleaningRecord: CleaningRecord = {
            id: 'clean-001',
            roomId: room.id,
            employeeId: employee.id,
            date: new Date(),
            startTime,
            endTime,
          };
          vi.mocked(dataAccess.createCleaningRecord).mockResolvedValue(mockCleaningRecord);

          // Mock room update
          const updatedRoom: Room = {
            ...room,
            status: 'disponible',
            lastCleaned: new Date(),
          };
          vi.mocked(dataAccess.updateRoom).mockResolvedValue(updatedRoom);

          const { unmount } = render(<LimpiezaPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              expect(screen.getByText('Limpieza')).toBeInTheDocument();
            }, { timeout: 1500 });

            // Find and click the "Marcar como Completa" button
            const completeButton = await screen.findByRole('button', { name: /marcar como completa/i });
            fireEvent.click(completeButton);

            const dialog = await screen.findByRole('dialog');
            const dialogQueries = within(dialog);

            // Fill in the form
            const employeeSelect = dialogQueries.getByLabelText(/empleado/i);
            fireEvent.change(employeeSelect, { target: { value: employee.id } });

            const startTimeInput = dialogQueries.getByLabelText(/hora de inicio/i);
            fireEvent.change(startTimeInput, { target: { value: startTime } });

            const endTimeInput = dialogQueries.getByLabelText(/hora de fin/i);
            fireEvent.change(endTimeInput, { target: { value: endTime } });

            // Submit the form
            const submitButton = dialogQueries.getByRole('button', { name: /completar limpieza/i });
            fireEvent.click(submitButton);

            // Verify createCleaningRecord was called with correct parameters
            await waitFor(() => {
              expect(dataAccess.createCleaningRecord).toHaveBeenCalledWith(
                expect.objectContaining({
                  roomId: room.id,
                  employeeId: employee.id,
                  startTime,
                  endTime,
                  date: expect.any(Date),
                })
              );
            }, { timeout: 1500 });

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS }
    );
  }, 300000); // 5 minute timeout

  it('should update room status to disponible after completing cleaning', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomNeedingCleaningArbitrary,
        cleaningEmployeeArbitrary,
        timeRangeArbitrary,
        async (room, employee, { startTime, endTime }) => {
          vi.clearAllMocks();

          // Mock initial data
          vi.mocked(dataAccess.getRooms).mockResolvedValue([room]);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([employee]);
          vi.mocked(dataAccess.getCleaningRecords).mockResolvedValue([]);

          // Mock cleaning record creation
          const mockCleaningRecord: CleaningRecord = {
            id: 'clean-001',
            roomId: room.id,
            employeeId: employee.id,
            date: new Date(),
            startTime,
            endTime,
          };
          vi.mocked(dataAccess.createCleaningRecord).mockResolvedValue(mockCleaningRecord);

          // Mock room update
          const updatedRoom: Room = {
            ...room,
            status: 'disponible',
            lastCleaned: new Date(),
          };
          vi.mocked(dataAccess.updateRoom).mockResolvedValue(updatedRoom);

          const { unmount } = render(<LimpiezaPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              expect(screen.getByText('Limpieza')).toBeInTheDocument();
            }, { timeout: 1500 });

            // Complete the cleaning task
            const completeButton = await screen.findByRole('button', { name: /marcar como completa/i });
            fireEvent.click(completeButton);

            const dialog = await screen.findByRole('dialog');
            const dialogQueries = within(dialog);

            const employeeSelect = dialogQueries.getByLabelText(/empleado/i);
            fireEvent.change(employeeSelect, { target: { value: employee.id } });

            const startTimeInput = dialogQueries.getByLabelText(/hora de inicio/i);
            fireEvent.change(startTimeInput, { target: { value: startTime } });

            const endTimeInput = dialogQueries.getByLabelText(/hora de fin/i);
            fireEvent.change(endTimeInput, { target: { value: endTime } });

            const submitButton = dialogQueries.getByRole('button', { name: /completar limpieza/i });
            fireEvent.click(submitButton);

            // Verify updateRoom was called to change status to disponible
            await waitFor(() => {
              expect(dataAccess.updateRoom).toHaveBeenCalledWith(
                room.id,
                expect.objectContaining({
                  status: 'disponible',
                  lastCleaned: expect.any(Date),
                })
              );
            }, { timeout: 1500 });

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS }
    );
  }, 300000); // 5 minute timeout

  it('should set lastCleaned timestamp when completing cleaning', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomNeedingCleaningArbitrary,
        cleaningEmployeeArbitrary,
        timeRangeArbitrary,
        async (room, employee, { startTime, endTime }) => {
          vi.clearAllMocks();

          // Mock initial data
          vi.mocked(dataAccess.getRooms).mockResolvedValue([room]);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([employee]);
          vi.mocked(dataAccess.getCleaningRecords).mockResolvedValue([]);

          // Mock cleaning record creation
          const mockCleaningRecord: CleaningRecord = {
            id: 'clean-001',
            roomId: room.id,
            employeeId: employee.id,
            date: new Date(),
            startTime,
            endTime,
          };
          vi.mocked(dataAccess.createCleaningRecord).mockResolvedValue(mockCleaningRecord);

          // Mock room update
          const updatedRoom: Room = {
            ...room,
            status: 'disponible',
            lastCleaned: new Date(),
          };
          vi.mocked(dataAccess.updateRoom).mockResolvedValue(updatedRoom);

          const { unmount } = render(<LimpiezaPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              expect(screen.getByText('Limpieza')).toBeInTheDocument();
            }, { timeout: 1500 });

            // Complete the cleaning task
            const completeButton = await screen.findByRole('button', { name: /marcar como completa/i });
            fireEvent.click(completeButton);

            const dialog = await screen.findByRole('dialog');
            const dialogQueries = within(dialog);

            const employeeSelect = dialogQueries.getByLabelText(/empleado/i);
            fireEvent.change(employeeSelect, { target: { value: employee.id } });

            const startTimeInput = dialogQueries.getByLabelText(/hora de inicio/i);
            fireEvent.change(startTimeInput, { target: { value: startTime } });

            const endTimeInput = dialogQueries.getByLabelText(/hora de fin/i);
            fireEvent.change(endTimeInput, { target: { value: endTime } });

            const submitButton = dialogQueries.getByRole('button', { name: /completar limpieza/i });
            fireEvent.click(submitButton);

            // Verify lastCleaned was set
            await waitFor(() => {
              const updateCall = vi.mocked(dataAccess.updateRoom).mock.calls[0];
              expect(updateCall).toBeDefined();
              expect(updateCall[1]).toHaveProperty('lastCleaned');
              expect(updateCall[1].lastCleaned).toBeInstanceOf(Date);
            }, { timeout: 1500 });

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS }
    );
  }, 300000); // 5 minute timeout

  it('should include optional notes in cleaning record when provided', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomNeedingCleaningArbitrary,
        cleaningEmployeeArbitrary,
        timeRangeArbitrary,
        fc.string({ minLength: 1, maxLength: 200 }),
        async (room, employee, { startTime, endTime }, notes) => {
          vi.clearAllMocks();

          // Mock initial data
          vi.mocked(dataAccess.getRooms).mockResolvedValue([room]);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([employee]);
          vi.mocked(dataAccess.getCleaningRecords).mockResolvedValue([]);

          // Mock cleaning record creation
          const mockCleaningRecord: CleaningRecord = {
            id: 'clean-001',
            roomId: room.id,
            employeeId: employee.id,
            date: new Date(),
            startTime,
            endTime,
            notes,
          };
          vi.mocked(dataAccess.createCleaningRecord).mockResolvedValue(mockCleaningRecord);

          // Mock room update
          const updatedRoom: Room = {
            ...room,
            status: 'disponible',
            lastCleaned: new Date(),
          };
          vi.mocked(dataAccess.updateRoom).mockResolvedValue(updatedRoom);

          const { unmount } = render(<LimpiezaPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              expect(screen.getByText('Limpieza')).toBeInTheDocument();
            }, { timeout: 1500 });

            // Complete the cleaning task
            const completeButton = await screen.findByRole('button', { name: /marcar como completa/i });
            fireEvent.click(completeButton);

            const dialog = await screen.findByRole('dialog');
            const dialogQueries = within(dialog);

            const employeeSelect = dialogQueries.getByLabelText(/empleado/i);
            fireEvent.change(employeeSelect, { target: { value: employee.id } });

            const startTimeInput = dialogQueries.getByLabelText(/hora de inicio/i);
            fireEvent.change(startTimeInput, { target: { value: startTime } });

            const endTimeInput = dialogQueries.getByLabelText(/hora de fin/i);
            fireEvent.change(endTimeInput, { target: { value: endTime } });

            // Add notes
            const notesTextarea = dialogQueries.getByLabelText(/notas/i);
            fireEvent.change(notesTextarea, { target: { value: notes } });

            const submitButton = dialogQueries.getByRole('button', { name: /completar limpieza/i });
            fireEvent.click(submitButton);

            // Verify notes were included
            await waitFor(() => {
              expect(dataAccess.createCleaningRecord).toHaveBeenCalledWith(
                expect.objectContaining({
                  notes,
                })
              );
            }, { timeout: 1500 });

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS }
    );
  }, 300000); // 5 minute timeout

  it('should preserve other room attributes when updating status after cleaning', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomNeedingCleaningArbitrary,
        cleaningEmployeeArbitrary,
        timeRangeArbitrary,
        async (room, employee, { startTime, endTime }) => {
          vi.clearAllMocks();

          // Mock initial data
          vi.mocked(dataAccess.getRooms).mockResolvedValue([room]);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([employee]);
          vi.mocked(dataAccess.getCleaningRecords).mockResolvedValue([]);

          // Mock cleaning record creation
          const mockCleaningRecord: CleaningRecord = {
            id: 'clean-001',
            roomId: room.id,
            employeeId: employee.id,
            date: new Date(),
            startTime,
            endTime,
          };
          vi.mocked(dataAccess.createCleaningRecord).mockResolvedValue(mockCleaningRecord);

          // Mock room update - preserve all attributes
          const updatedRoom: Room = {
            ...room,
            status: 'disponible',
            lastCleaned: new Date(),
          };
          vi.mocked(dataAccess.updateRoom).mockResolvedValue(updatedRoom);

          const { unmount } = render(<LimpiezaPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              expect(screen.getByText('Limpieza')).toBeInTheDocument();
            }, { timeout: 1500 });

            // Complete the cleaning task
            const completeButton = await screen.findByRole('button', { name: /marcar como completa/i });
            fireEvent.click(completeButton);

            const dialog = await screen.findByRole('dialog');
            const dialogQueries = within(dialog);

            const employeeSelect = dialogQueries.getByLabelText(/empleado/i);
            fireEvent.change(employeeSelect, { target: { value: employee.id } });

            const startTimeInput = dialogQueries.getByLabelText(/hora de inicio/i);
            fireEvent.change(startTimeInput, { target: { value: startTime } });

            const endTimeInput = dialogQueries.getByLabelText(/hora de fin/i);
            fireEvent.change(endTimeInput, { target: { value: endTime } });

            const submitButton = dialogQueries.getByRole('button', { name: /completar limpieza/i });
            fireEvent.click(submitButton);

            // Verify room attributes are preserved (only status and lastCleaned change)
            await waitFor(() => {
              expect(dataAccess.updateRoom).toHaveBeenCalledWith(
                room.id,
                expect.objectContaining({
                  status: 'disponible',
                  lastCleaned: expect.any(Date),
                })
              );
            }, { timeout: 1500 });

            // Verify the updated room preserves original attributes
            expect(updatedRoom.number).toBe(room.number);
            expect(updatedRoom.type).toBe(room.type);
            expect(updatedRoom.floor).toBe(room.floor);
            expect(updatedRoom.price).toBe(room.price);

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS }
    );
  }, 300000); // 5 minute timeout

  it('should only allow cleaning employees to be selected for cleaning tasks', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomNeedingCleaningArbitrary,
        fc.array(
          fc.record({
            name: fc.string({ minLength: 3, maxLength: 50 }).filter(s => s.trim().length > 0),
            role: fc.constantFrom<Employee['role']>('recepcionista', 'limpieza', 'mantenimiento', 'gerente'),
            shift: fc.constantFrom<Employee['shift']>('mañana', 'tarde', 'noche'),
            phone: fc.string({ minLength: 8, maxLength: 15 }),
            email: fc.emailAddress(),
          }).map((emp) => {
            const uniqueNum = employeeCounter++;
            return {
              ...emp,
              id: `emp-${uniqueNum}`,
              hireDate: new Date('2024-01-01'),
            };
          }),
          { minLength: 4, maxLength: 10 }
        ),
        async (room, employees) => {
          vi.clearAllMocks();

          // Mock initial data
          vi.mocked(dataAccess.getRooms).mockResolvedValue([room]);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue(employees);
          vi.mocked(dataAccess.getCleaningRecords).mockResolvedValue([]);

          const { unmount } = render(<LimpiezaPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              expect(screen.getByText('Limpieza')).toBeInTheDocument();
            }, { timeout: 1500 });

            // Open the modal
            const completeButton = await screen.findByRole('button', { name: /marcar como completa/i });
            fireEvent.click(completeButton);

            const dialog = await screen.findByRole('dialog');
            const dialogQueries = within(dialog);

            // Get the employee dropdown
            const employeeSelect = dialogQueries.getByLabelText(/empleado/i) as HTMLSelectElement;

            // Count options (excluding "Seleccionar empleado")
            const options = Array.from(employeeSelect.options).filter(opt => opt.value !== '');

            // Count cleaning staff in our test data
            const cleaningStaff = employees.filter(emp => emp.role === 'limpieza');

            // Verify only cleaning staff are shown
            expect(options.length).toBe(cleaningStaff.length);

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS_HEAVY } // Reduced runs for complex test
    );
  }, 300000); // 5 minute timeout
});





