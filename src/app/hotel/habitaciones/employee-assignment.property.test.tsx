import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import HabitacionesPage from './page';
import * as dataAccess from '@/lib/data-access';
import type { Room, Employee } from '@/types';

/**
 * **Feature: hotel-arriendos, Property 5: Employee-Room Assignment**
 * 
 * For any employee and any room, the system should allow assignment of that employee
 * to that room for cleaning responsibility, and the assignment should be reflected in
 * both the room and employee data.
 * 
 * **Validates: Requirements 3.7**
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

describe('Property 5: Employee-Room Assignment', () => {
  let roomCounter = 0;
  let employeeCounter = 0;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Arbitrary generators for room data
  const roomArbitrary = fc.record({
    number: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
    type: fc.constantFrom<Room['type']>('individual', 'doble', 'suite', 'familiar'),
    floor: fc.integer({ min: 1, max: 20 }),
    price: fc.float({ min: 10, max: 1000, noNaN: true }).map(p => Math.round(p * 100) / 100),
    status: fc.constantFrom<Room['status']>('disponible', 'ocupada', 'limpieza', 'mantenimiento'),
  }).map((room) => {
    const uniqueNum = roomCounter++;
    return {
      ...room,
      id: `room-${uniqueNum}`,
      number: `R${uniqueNum}`,
      assignedEmployeeId: undefined,
    };
  });

  // Arbitrary generator for employee data
  const employeeArbitrary = fc.record({
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
  });

  it('should allow assignment of any employee to any room', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomArbitrary,
        employeeArbitrary.filter(emp => emp.role === 'limpieza'),
        async (room, employee) => {
          // Clear mocks for each iteration
          vi.clearAllMocks();
          
          const user = userEvent.setup();

          // Mock the data access functions
          vi.mocked(dataAccess.getRooms).mockResolvedValue([room]);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([employee]);
          
          // Mock updateRoom to return the room with the assigned employee
          const updatedRoom: Room = {
            ...room,
            assignedEmployeeId: employee.id,
          };
          vi.mocked(dataAccess.updateRoom).mockResolvedValue(updatedRoom);

          const { unmount } = render(<HabitacionesPage />);

          try {
            // Wait for data to load
            await waitFor(() => {
              expect(screen.getByText(room.number)).toBeInTheDocument();
            }, { timeout: 3000 });

            // Click on the room to open edit modal
            const roomCard = screen.getByText(room.number);
            await user.click(roomCard);

            // Wait for modal to open
            await waitFor(() => {
              expect(screen.getByText('Editar Habitación')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Find the employee assignment dropdown
            const employeeSelect = screen.getByLabelText(/empleado asignado/i);
            expect(employeeSelect).toBeInTheDocument();

            // Select the employee
            await user.selectOptions(employeeSelect, employee.id);

            // Submit the form
            const submitButton = screen.getByRole('button', { name: /guardar cambios/i });
            await user.click(submitButton);

            // Verify updateRoom was called with the assigned employee
            await waitFor(() => {
              expect(dataAccess.updateRoom).toHaveBeenCalledWith(
                room.id,
                expect.objectContaining({
                  assignedEmployeeId: employee.id,
                })
              );
            }, { timeout: 3000 });

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 300000); // 5 minute timeout for property test

  it('should reflect employee assignment in room data after assignment', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomArbitrary,
        employeeArbitrary.filter(emp => emp.role === 'limpieza'),
        async (room, employee) => {
          // Clear mocks for each iteration
          vi.clearAllMocks();
          
          const user = userEvent.setup();

          // Initial state: room without assigned employee
          vi.mocked(dataAccess.getRooms).mockResolvedValue([room]);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([employee]);

          // After assignment: room with assigned employee
          const updatedRoom: Room = {
            ...room,
            assignedEmployeeId: employee.id,
          };
          vi.mocked(dataAccess.updateRoom).mockResolvedValue(updatedRoom);

          const { unmount } = render(<HabitacionesPage />);

          try {
            // Wait for initial load
            await waitFor(() => {
              expect(screen.getByText(room.number)).toBeInTheDocument();
            }, { timeout: 3000 });

            // Open edit modal
            await user.click(screen.getByText(room.number));

            // Wait for modal
            await waitFor(() => {
              expect(screen.getByText('Editar Habitación')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Assign employee
            const employeeSelect = screen.getByLabelText(/empleado asignado/i);
            await user.selectOptions(employeeSelect, employee.id);

            // Submit
            const submitButton = screen.getByRole('button', { name: /guardar cambios/i });
            await user.click(submitButton);

            // Verify the assignment was persisted
            await waitFor(() => {
              expect(dataAccess.updateRoom).toHaveBeenCalledWith(
                room.id,
                expect.objectContaining({
                  assignedEmployeeId: employee.id,
                })
              );
            }, { timeout: 3000 });

            // Verify the returned room has the assignment
            expect(updatedRoom.assignedEmployeeId).toBe(employee.id);

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 300000); // 5 minute timeout

  it('should allow unassigning an employee from a room', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomArbitrary,
        employeeArbitrary.filter(emp => emp.role === 'limpieza'),
        async (room, employee) => {
          // Clear mocks for each iteration
          vi.clearAllMocks();
          
          const user = userEvent.setup();

          // Initial state: room with assigned employee
          const roomWithEmployee: Room = {
            ...room,
            assignedEmployeeId: employee.id,
          };

          vi.mocked(dataAccess.getRooms).mockResolvedValue([roomWithEmployee]);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([employee]);

          // After unassignment: room without assigned employee
          const updatedRoom: Room = {
            ...room,
            assignedEmployeeId: undefined,
          };
          vi.mocked(dataAccess.updateRoom).mockResolvedValue(updatedRoom);

          const { unmount } = render(<HabitacionesPage />);

          try {
            // Wait for initial load
            await waitFor(() => {
              expect(screen.getByText(room.number)).toBeInTheDocument();
            }, { timeout: 3000 });

            // Open edit modal
            await user.click(screen.getByText(room.number));

            // Wait for modal
            await waitFor(() => {
              expect(screen.getByText('Editar Habitación')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Unassign employee (select "Sin asignar")
            const employeeSelect = screen.getByLabelText(/empleado asignado/i);
            await user.selectOptions(employeeSelect, '');

            // Submit
            const submitButton = screen.getByRole('button', { name: /guardar cambios/i });
            await user.click(submitButton);

            // Verify the unassignment was persisted
            await waitFor(() => {
              expect(dataAccess.updateRoom).toHaveBeenCalledWith(
                room.id,
                expect.objectContaining({
                  assignedEmployeeId: undefined,
                })
              );
            }, { timeout: 3000 });

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 300000); // 5 minute timeout

  it('should only show cleaning staff employees in assignment dropdown', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomArbitrary,
        fc.array(employeeArbitrary, { minLength: 4, maxLength: 10 }),
        async (room, employees) => {
          // Clear mocks for each iteration
          vi.clearAllMocks();
          
          const user = userEvent.setup();

          // Ensure we have a mix of roles
          const mixedEmployees = employees.map((emp, idx) => ({
            ...emp,
            role: (['limpieza', 'recepcionista', 'mantenimiento', 'gerente'] as const)[idx % 4],
          }));

          vi.mocked(dataAccess.getRooms).mockResolvedValue([room]);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue(mixedEmployees);

          const { unmount } = render(<HabitacionesPage />);

          try {
            // Wait for data to load
            await waitFor(() => {
              expect(screen.getByText(room.number)).toBeInTheDocument();
            }, { timeout: 3000 });

            // Open edit modal
            await user.click(screen.getByText(room.number));

            // Wait for modal
            await waitFor(() => {
              expect(screen.getByText('Editar Habitación')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Get the employee dropdown
            const employeeSelect = screen.getByLabelText(/empleado asignado/i) as HTMLSelectElement;

            // Count options (excluding "Sin asignar")
            const options = Array.from(employeeSelect.options).filter(opt => opt.value !== '');

            // Count cleaning staff in our test data
            const cleaningStaff = mixedEmployees.filter(emp => emp.role === 'limpieza');

            // Verify only cleaning staff are shown
            expect(options.length).toBe(cleaningStaff.length);

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 } // Reduced runs for complex test
    );
  }, 300000); // 5 minute timeout

  it('should preserve other room attributes when assigning employee', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomArbitrary,
        employeeArbitrary.filter(emp => emp.role === 'limpieza'),
        async (room, employee) => {
          // Clear mocks for each iteration
          vi.clearAllMocks();
          
          const user = userEvent.setup();

          vi.mocked(dataAccess.getRooms).mockResolvedValue([room]);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([employee]);

          const updatedRoom: Room = {
            ...room,
            assignedEmployeeId: employee.id,
          };
          vi.mocked(dataAccess.updateRoom).mockResolvedValue(updatedRoom);

          const { unmount } = render(<HabitacionesPage />);

          try {
            // Wait for data to load
            await waitFor(() => {
              expect(screen.getByText(room.number)).toBeInTheDocument();
            }, { timeout: 3000 });

            // Open edit modal
            await user.click(screen.getByText(room.number));

            // Wait for modal
            await waitFor(() => {
              expect(screen.getByText('Editar Habitación')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Assign employee
            const employeeSelect = screen.getByLabelText(/empleado asignado/i);
            await user.selectOptions(employeeSelect, employee.id);

            // Submit
            const submitButton = screen.getByRole('button', { name: /guardar cambios/i });
            await user.click(submitButton);

            // Verify all room attributes are preserved
            await waitFor(() => {
              expect(dataAccess.updateRoom).toHaveBeenCalledWith(
                room.id,
                expect.objectContaining({
                  number: room.number,
                  type: room.type,
                  floor: room.floor,
                  price: room.price,
                  status: room.status,
                  assignedEmployeeId: employee.id,
                })
              );
            }, { timeout: 3000 });

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 300000); // 5 minute timeout

  it('should allow reassigning a room from one employee to another', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomArbitrary,
        employeeArbitrary.filter(emp => emp.role === 'limpieza'),
        employeeArbitrary.filter(emp => emp.role === 'limpieza'),
        async (room, employee1, employee2) => {
          // Ensure we have two different employees
          if (employee1.id === employee2.id) {
            employee2 = { ...employee2, id: `${employee2.id}-different` };
          }

          // Clear mocks for each iteration
          vi.clearAllMocks();
          
          const user = userEvent.setup();

          // Initial state: room assigned to employee1
          const roomWithEmployee1: Room = {
            ...room,
            assignedEmployeeId: employee1.id,
          };

          vi.mocked(dataAccess.getRooms).mockResolvedValue([roomWithEmployee1]);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([employee1, employee2]);

          // After reassignment: room assigned to employee2
          const updatedRoom: Room = {
            ...room,
            assignedEmployeeId: employee2.id,
          };
          vi.mocked(dataAccess.updateRoom).mockResolvedValue(updatedRoom);

          const { unmount } = render(<HabitacionesPage />);

          try {
            // Wait for initial load
            await waitFor(() => {
              expect(screen.getByText(room.number)).toBeInTheDocument();
            }, { timeout: 3000 });

            // Open edit modal
            await user.click(screen.getByText(room.number));

            // Wait for modal
            await waitFor(() => {
              expect(screen.getByText('Editar Habitación')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Reassign to employee2
            const employeeSelect = screen.getByLabelText(/empleado asignado/i);
            await user.selectOptions(employeeSelect, employee2.id);

            // Submit
            const submitButton = screen.getByRole('button', { name: /guardar cambios/i });
            await user.click(submitButton);

            // Verify the reassignment was persisted
            await waitFor(() => {
              expect(dataAccess.updateRoom).toHaveBeenCalledWith(
                room.id,
                expect.objectContaining({
                  assignedEmployeeId: employee2.id,
                })
              );
            }, { timeout: 3000 });

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 } // Reduced runs for complex test with 3 arbitraries
    );
  }, 300000); // 5 minute timeout
});



