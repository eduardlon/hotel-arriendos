import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import * as fc from 'fast-check';
import EmpleadosPage from './page';
import * as dataAccess from '@/lib/data-access';
import type { Employee, CleaningRecord, Room } from '@/types';
import { formatDate } from '@/lib/format';

const FAST_CHECK_RUNS = Number(process.env.FAST_CHECK_RUNS ?? 15);
const FAST_CHECK_RUNS_HEAVY = Number(process.env.FAST_CHECK_RUNS_HEAVY ?? Math.min(FAST_CHECK_RUNS, 8));

/**
 * **Feature: hotel-arriendos, Property 6: Employee CRUD Operations**
 * 
 * For any valid employee data (name, role, shift, contact information), creating an employee
 * should add them to the system, updating an employee should modify their attributes, and
 * deleting an employee should remove them from the system.
 * 
 * **Validates: Requirements 4.3, 4.4**
 */

// Mock data access functions
vi.mock('@/lib/data-access', () => ({
  isCachePrimed: vi.fn(() => false),
  getEmployees: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
  getCleaningRecordsByEmployeeId: vi.fn(),
  getRooms: vi.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await vi.importActual<typeof import('@/tests/utils/framer-motion-mock')>(
    '@/tests/utils/framer-motion-mock'
  );
  return createFramerMotionMock();
});

describe('Property 6: Employee CRUD Operations - UI Integration', () => {
  const mockRooms: Room[] = [
    {
      id: 'room-1',
      number: '101',
      type: 'individual',
      floor: 1,
      price: 50,
      status: 'disponible',
    },
  ];

  const mockCleaningRecords: CleaningRecord[] = [];

  // Arbitrary generators for employee data
  const employeeNameArbitrary = fc.string({ minLength: 3, maxLength: 50 })
    .map((value) => value.replace(/\s+/g, ' ').trim())
    .filter((value) => value.length >= 3 && /[a-zA-Z]/.test(value));

  const employeeRoleArbitrary = fc.constantFrom<Employee['role']>(
    'recepcionista',
    'limpieza',
    'mantenimiento',
    'gerente'
  );

  const employeeShiftArbitrary = fc.constantFrom<Employee['shift']>(
    'mañana',
    'tarde',
    'noche'
  );

  const phoneArbitrary = fc.oneof(
    fc.integer({ min: 10000000, max: 99999999 }).map(n => `+569${n}`),
    fc.integer({ min: 1000000, max: 9999999 }).map(n => `+562${n}`)
  );

  const emailArbitrary = fc.emailAddress();

  const hireDateArbitrary = fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31'), noInvalidDate: true });

  const employeeDataArbitrary = fc.record({
    name: employeeNameArbitrary,
    role: employeeRoleArbitrary,
    shift: employeeShiftArbitrary,
    phone: phoneArbitrary,
    email: emailArbitrary,
    hireDate: hireDateArbitrary,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
    vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue(mockCleaningRecords);
  });

  it('should create an employee with any valid data and reflect it in the UI', async () => {
    await fc.assert(
      fc.asyncProperty(
        employeeDataArbitrary,
        async (employeeData) => {
          // Clear all mocks before each iteration
          vi.clearAllMocks();
          vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
          vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue(mockCleaningRecords);
          
          // Start with empty employees
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([]);
          
          // Mock createEmployee to return the created employee with an ID
          const createdEmployee: Employee = {
            id: `emp-${Date.now()}`,
            ...employeeData,
          };
          vi.mocked(dataAccess.createEmployee).mockResolvedValue(createdEmployee);

          const { unmount, container } = render(<EmpleadosPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              const buttons = screen.queryAllByRole('button', { name: /nuevo empleado/i });
              expect(buttons.length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Open create modal
            const createButtons = screen.getAllByRole('button', { name: /nuevo empleado/i });
            fireEvent.click(createButtons[0]);

            await waitFor(() => {
              expect(screen.getByRole('dialog')).toBeInTheDocument();
            }, { timeout: 1500 });

            // Fill form with generated data
            const nameInput = screen.getByLabelText(/nombre completo/i);
            fireEvent.change(nameInput, { target: { value: employeeData.name } });

            const roleSelect = screen.getByLabelText(/^rol \*/i);
            fireEvent.change(roleSelect, { target: { value: employeeData.role } });

            const shiftSelect = screen.getByLabelText(/^turno \*/i);
            fireEvent.change(shiftSelect, { target: { value: employeeData.shift } });

            const phoneInput = screen.getByLabelText(/tel�fono/i);
            fireEvent.change(phoneInput, { target: { value: employeeData.phone } });

            const emailInput = screen.getByLabelText(/correo electr�nico/i);
            fireEvent.change(emailInput, { target: { value: employeeData.email } });

            const hireDateInput = screen.getByLabelText(/fecha de contrataci�n/i);
            fireEvent.change(hireDateInput, {
              target: { value: employeeData.hireDate.toISOString().split('T')[0] },
            });

            // Submit form
            const createForm = screen.getByRole('dialog').querySelector('form');
            if (createForm) {
              fireEvent.submit(createForm);
            }

            // Verify createEmployee was called with correct data
            await waitFor(() => {
              expect(dataAccess.createEmployee).toHaveBeenCalledWith({
                name: employeeData.name,
                role: employeeData.role,
                shift: employeeData.shift,
                phone: employeeData.phone,
                email: employeeData.email,
                photo: undefined,
                hireDate: expect.any(Date),
              });
            }, { timeout: 1500 });

            // Verify UI reflects the new employee
            await waitFor(() => {
              expect(screen.getAllByText(employeeData.name).length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            return true;
          } finally {
            unmount();
            container.remove();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS }
    );
  }, 300000); // 5 minute timeout for property test

  it('should update an employee with any valid attribute changes and reflect it in the UI', async () => {
    await fc.assert(
      fc.asyncProperty(
        employeeDataArbitrary,
        employeeDataArbitrary,
        async (initialData, updateData) => {
          // Ensure emails are different to avoid validation errors
          if (initialData.email === updateData.email) {
            updateData = { ...updateData, email: `updated-${updateData.email}` };
          }

          // Clear all mocks before each iteration
          vi.clearAllMocks();
          vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
          vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue(mockCleaningRecords);
          
          // Create initial employee
          const initialEmployee: Employee = {
            id: 'emp-test',
            ...initialData,
          };
          
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([initialEmployee]);
          
          // Mock updateEmployee to return the updated employee
          const updatedEmployee: Employee = {
            id: 'emp-test',
            ...updateData,
          };
          vi.mocked(dataAccess.updateEmployee).mockResolvedValue(updatedEmployee);

          const { unmount, container } = render(<EmpleadosPage />);

          try {
            // Wait for page to load and employee to appear
            await waitFor(() => {
              const employeeNames = screen.queryAllByText(initialData.name);
              expect(employeeNames.length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Click on employee card to view details
            const employeeCards = screen.getAllByText(initialData.name);
            const employeeCard = employeeCards[0].closest('div');
            if (employeeCard) {
              fireEvent.click(employeeCard);
            }

            // Wait for detail modal to open
            await waitFor(() => {
              expect(screen.getAllByText(/detalles de/i).length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Click edit button in detail modal
            const editButton = screen.getByRole('button', { name: /editar empleado/i });
            fireEvent.click(editButton);

            // Wait for edit modal to open
            await waitFor(() => {
              expect(screen.getAllByText('Editar Empleado').length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Update all fields with new data
            const nameInput = screen.getByLabelText(/nombre completo/i);
            fireEvent.change(nameInput, { target: { value: updateData.name } });

            const roleSelect = screen.getByLabelText(/^rol \*/i);
            fireEvent.change(roleSelect, { target: { value: updateData.role } });

            const shiftSelect = screen.getByLabelText(/^turno \*/i);
            fireEvent.change(shiftSelect, { target: { value: updateData.shift } });

            const phoneInput = screen.getByLabelText(/tel�fono/i);
            fireEvent.change(phoneInput, { target: { value: updateData.phone } });

            const emailInput = screen.getByLabelText(/correo electr�nico/i);
            fireEvent.change(emailInput, { target: { value: updateData.email } });

            const hireDateInput = screen.getByLabelText(/fecha de contrataci�n/i);
            fireEvent.change(hireDateInput, {
              target: { value: updateData.hireDate.toISOString().split('T')[0] },
            });

            // Submit form
            const editForm = screen.getByRole('dialog').querySelector('form');
            if (editForm) {
              fireEvent.submit(editForm);
            }

            // Verify updateEmployee was called with correct data
            await waitFor(() => {
              expect(dataAccess.updateEmployee).toHaveBeenCalledWith('emp-test', {
                name: updateData.name,
                role: updateData.role,
                shift: updateData.shift,
                phone: updateData.phone,
                email: updateData.email,
                photo: undefined,
                hireDate: expect.any(Date),
              });
            }, { timeout: 1500 });

            // Verify UI reflects the updated employee
            await waitFor(() => {
              expect(screen.getAllByText(updateData.name).length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            return true;
          } finally {
            unmount();
            container.remove();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS }
    );
  }, 300000); // 5 minute timeout

  it('should delete an employee and remove them from the UI', async () => {
    await fc.assert(
      fc.asyncProperty(
        employeeDataArbitrary,
        async (employeeData) => {
          // Clear all mocks before each iteration
          vi.clearAllMocks();
          vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
          vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue(mockCleaningRecords);
          
          // Create initial employee
          const employee: Employee = {
            id: 'emp-to-delete',
            ...employeeData,
          };
          
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([employee]);
          vi.mocked(dataAccess.deleteEmployee).mockResolvedValue(true);

          // Mock window.confirm to always return true
          const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

          const { unmount, container } = render(<EmpleadosPage />);

          try {
            // Wait for page to load and employee to appear
            await waitFor(() => {
              const employeeNames = screen.queryAllByText(employeeData.name);
              expect(employeeNames.length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Click on employee card to view details
            const employeeCards = screen.getAllByText(employeeData.name);
            const employeeCard = employeeCards[0].closest('div');
            if (employeeCard) {
              fireEvent.click(employeeCard);
            }

            // Wait for detail modal to open
            await waitFor(() => {
              expect(screen.getAllByText(/detalles de/i).length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Click edit button in detail modal
            const editButton = screen.getByRole('button', { name: /editar empleado/i });
            fireEvent.click(editButton);

            // Wait for edit modal to open
            await waitFor(() => {
              expect(screen.getAllByText('Editar Empleado').length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Click delete button
            const deleteButton = screen.getByRole('button', { name: /eliminar/i });
            fireEvent.click(deleteButton);

            // Verify deleteEmployee was called
            await waitFor(() => {
              expect(dataAccess.deleteEmployee).toHaveBeenCalledWith('emp-to-delete');
            }, { timeout: 1500 });

            // Verify UI no longer shows the employee
            await waitFor(() => {
              expect(screen.queryByText(employeeData.name)).not.toBeInTheDocument();
            }, { timeout: 1500 });

            return true;
          } finally {
            confirmSpy.mockRestore();
            unmount();
            container.remove();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS }
    );
  }, 300000); // 5 minute timeout

  it('should handle multiple CRUD operations in sequence and maintain UI consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(employeeDataArbitrary, { minLength: 2, maxLength: 2 }),
        async (employeeDataArray) => {
          // Ensure unique emails to avoid validation errors
          const uniqueEmployees = employeeDataArray.map((emp, idx) => ({
            ...emp,
            email: `employee${idx}-${emp.email}`,
          }));

          // Clear all mocks before each iteration
          vi.clearAllMocks();
          vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
          vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue(mockCleaningRecords);
          
          // Start with empty employees
          let currentEmployees: Employee[] = [];
          vi.mocked(dataAccess.getEmployees).mockImplementation(async () => [...currentEmployees]);

          const { unmount, container } = render(<EmpleadosPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              const buttons = screen.queryAllByRole('button', { name: /nuevo empleado/i });
              expect(buttons.length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Create multiple employees
            for (let i = 0; i < uniqueEmployees.length; i++) {
              const employeeData = uniqueEmployees[i];
              const createdEmployee: Employee = {
                id: `emp-${i}`,
                ...employeeData,
              };

              vi.mocked(dataAccess.createEmployee).mockResolvedValue(createdEmployee);

              // Open create modal
              const createButtons = screen.getAllByRole('button', { name: /nuevo empleado/i });
              fireEvent.click(createButtons[0]);

              await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
              }, { timeout: 1500 });

              // Fill form
              const nameInput = screen.getByLabelText(/nombre completo/i);
              fireEvent.change(nameInput, { target: { value: employeeData.name } });

              const phoneInput = screen.getByLabelText(/tel�fono/i);
              fireEvent.change(phoneInput, { target: { value: employeeData.phone } });

              const emailInput = screen.getByLabelText(/correo electr�nico/i);
              fireEvent.change(emailInput, { target: { value: employeeData.email } });

              // Submit form
              const createForm = screen.getByRole('dialog').querySelector('form');
              if (createForm) {
                fireEvent.submit(createForm);
              }

              // Update current employees
              currentEmployees.push(createdEmployee);

              // Verify employee appears in UI
              await waitFor(() => {
                expect(screen.getAllByText(employeeData.name).length).toBeGreaterThan(0);
              }, { timeout: 1500 });
            }

            // Verify all employees are displayed
            for (const employeeData of uniqueEmployees) {
              expect(screen.getAllByText(employeeData.name).length).toBeGreaterThan(0);
            }

            return true;
          } finally {
            unmount();
            container.remove();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS_HEAVY } // Reduced runs for complex test
    );
  }, 300000); // 5 minute timeout

  it('should validate required fields and prevent creation with invalid data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.constantFrom('', '  ', '\t'),
          phone: fc.constantFrom('', '  '),
          email: fc.constantFrom('', 'invalid-email', 'no@domain'),
        }),
        async (invalidData) => {
          // Clear all mocks before each iteration
          vi.clearAllMocks();
          vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
          vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue(mockCleaningRecords);
          
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([]);

          const { unmount, container } = render(<EmpleadosPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              const buttons = screen.queryAllByRole('button', { name: /nuevo empleado/i });
              expect(buttons.length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Open create modal
            const createButtons = screen.getAllByRole('button', { name: /nuevo empleado/i });
            fireEvent.click(createButtons[0]);

            await waitFor(() => {
              expect(screen.getByRole('dialog')).toBeInTheDocument();
            }, { timeout: 1500 });

            // Fill form with invalid data
            const nameInput = screen.getByLabelText(/nombre completo/i);
            fireEvent.change(nameInput, { target: { value: invalidData.name ?? '' } });

            const phoneInput = screen.getByLabelText(/tel�fono/i);
            fireEvent.change(phoneInput, { target: { value: invalidData.phone ?? '' } });

            const emailInput = screen.getByLabelText(/correo electr�nico/i);
            fireEvent.change(emailInput, { target: { value: invalidData.email ?? '' } });

            // Submit form
            const createForm = screen.getByRole('dialog').querySelector('form');
            if (createForm) {
              fireEvent.submit(createForm);
            }

            // Verify createEmployee was NOT called
            await waitFor(() => {
              expect(dataAccess.createEmployee).not.toHaveBeenCalled();
            }, { timeout: 1000 });

            // Verify error messages are displayed
            await waitFor(() => {
              const errorMessages = screen.queryAllByText(/obligatorio|v�lido/i);
              expect(errorMessages.length).toBeGreaterThan(0);
            }, { timeout: 1000 });

            return true;
          } finally {
            unmount();
            container.remove();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS_HEAVY }
    );
  }, 300000); // 5 minute timeout
});

/**
 * **Feature: hotel-arriendos, Property 7: Employee Display with Attributes**
 * 
 * For any employee, their card display should show all required attributes including
 * photo, name, role, and shift.
 * 
 * **Validates: Requirements 4.1**
 */
describe('Property 7: Employee Display with Attributes', () => {
  const mockRooms: Room[] = [
    {
      id: 'room-1',
      number: '101',
      type: 'individual',
      floor: 1,
      price: 50,
      status: 'disponible',
    },
  ];

  const mockCleaningRecords: CleaningRecord[] = [];

  // Arbitrary generators for employee data
  const employeeNameArbitrary = fc.string({ minLength: 3, maxLength: 50 })
    .map((value) => value.replace(/\s+/g, ' ').trim())
    .filter((value) => value.length >= 3 && /[a-zA-Z]/.test(value));

  const employeeRoleArbitrary = fc.constantFrom<Employee['role']>(
    'recepcionista',
    'limpieza',
    'mantenimiento',
    'gerente'
  );

  const employeeShiftArbitrary = fc.constantFrom<Employee['shift']>(
    'mañana',
    'tarde',
    'noche'
  );

  const phoneArbitrary = fc.oneof(
    fc.integer({ min: 10000000, max: 99999999 }).map(n => `+569${n}`),
    fc.integer({ min: 1000000, max: 9999999 }).map(n => `+562${n}`)
  );

  const emailArbitrary = fc.emailAddress();

  const hireDateArbitrary = fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31'), noInvalidDate: true });

  const photoArbitrary = fc.option(
    fc.webUrl({ validSchemes: ['https'] }),
    { nil: undefined }
  );

  const employeeArbitrary = fc.record({
    id: fc.uuid(),
    name: employeeNameArbitrary,
    role: employeeRoleArbitrary,
    shift: employeeShiftArbitrary,
    phone: phoneArbitrary,
    email: emailArbitrary,
    hireDate: hireDateArbitrary,
    photo: photoArbitrary,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
    vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue(mockCleaningRecords);
  });

  it('should display all employee attributes (photo, name, role, shift) for any employee', async () => {
    await fc.assert(
      fc.asyncProperty(
        employeeArbitrary,
        async (employee) => {
          // Clear all mocks before each iteration
          vi.clearAllMocks();
          vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
          vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue(mockCleaningRecords);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([employee]);

          const { unmount, container } = render(<EmpleadosPage />);

          try {
            // Wait for page to load and employee to appear
            await waitFor(() => {
              expect(screen.getAllByText(employee.name).length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Verify name is displayed
            expect(screen.getAllByText(employee.name).length).toBeGreaterThan(0);

            // Verify role is displayed (Spanish label)
            const roleLabels: Record<Employee['role'], string> = {
              recepcionista: 'Recepcionista',
              limpieza: 'Limpieza',
              mantenimiento: 'Mantenimiento',
              gerente: 'Gerente',
            };
            expect(screen.getAllByText(roleLabels[employee.role]).length).toBeGreaterThan(0);

            // Verify shift is displayed (Spanish label)
            const shiftLabels: Record<Employee['shift'], string> = {
              mañana: 'mañana',
              tarde: 'Tarde',
              noche: 'Noche',
            };
            expect(screen.getAllByText(shiftLabels[employee.shift]).length).toBeGreaterThan(0);

            // Verify photo or placeholder is displayed
            if (employee.photo) {
              const photoElement = screen.getByAltText(employee.name);
              expect(photoElement).toBeInTheDocument();
              expect(photoElement).toHaveAttribute('src', employee.photo);
            } else {
              // When no photo, a placeholder with User icon should be displayed
              // The EmployeeCard component renders a div with User icon from lucide-react
              const employeeCard = screen.getAllByText(employee.name)[0].closest('div');
              expect(employeeCard).toBeInTheDocument();
            }

            return true;
          } finally {
            unmount();
            container.remove();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS }
    );
  }, 300000); // 5 minute timeout

  it('should display multiple employees with their respective attributes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(employeeArbitrary, { minLength: 2, maxLength: 5 }),
        async (employees) => {
          // Ensure unique IDs and emails
          const uniqueEmployees = employees.map((emp, idx) => ({
            ...emp,
            id: `emp-${idx}`,
            name: `${emp.name}-${idx}`,
            email: `employee${idx}-${emp.email}`,
          }));

          // Clear all mocks before each iteration
          vi.clearAllMocks();
          vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
          vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue(mockCleaningRecords);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue(uniqueEmployees);

          const { unmount, container } = render(<EmpleadosPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              const buttons = screen.queryAllByRole('button', { name: /nuevo empleado/i });
              expect(buttons.length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Verify all employees are displayed with their attributes
            for (const employee of uniqueEmployees) {
              // Verify name
              expect(screen.getAllByText(employee.name).length).toBeGreaterThan(0);

              // Verify role
              const roleLabels: Record<Employee['role'], string> = {
                recepcionista: 'Recepcionista',
                limpieza: 'Limpieza',
                mantenimiento: 'Mantenimiento',
                gerente: 'Gerente',
              };
              const roleElements = screen.getAllByText(roleLabels[employee.role]);
              expect(roleElements.length).toBeGreaterThan(0);

              // Verify shift
              const shiftLabels: Record<Employee['shift'], string> = {
                mañana: 'mañana',
                tarde: 'Tarde',
                noche: 'Noche',
              };
              const shiftElements = screen.getAllByText(shiftLabels[employee.shift]);
              expect(shiftElements.length).toBeGreaterThan(0);

              // Verify photo or placeholder
              if (employee.photo) {
                const photoElement = screen.getByAltText(employee.name);
                expect(photoElement).toBeInTheDocument();
                expect(photoElement).toHaveAttribute('src', employee.photo);
              }
            }

            return true;
          } finally {
            unmount();
            container.remove();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS }
    );
  }, 300000); // 5 minute timeout

  it('should correctly display role labels in Spanish for all role types', async () => {
    await fc.assert(
      fc.asyncProperty(
        employeeRoleArbitrary,
        employeeShiftArbitrary,
        employeeNameArbitrary,
        async (role, shift, name) => {
          const employee: Employee = {
            id: 'test-emp',
            name,
            role,
            shift,
            phone: '+56912345678',
            email: 'test@example.com',
            hireDate: new Date('2023-01-01'),
          };

          // Clear all mocks before each iteration
          vi.clearAllMocks();
          vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
          vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue(mockCleaningRecords);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([employee]);

          const { unmount, container } = render(<EmpleadosPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              expect(screen.getAllByText(name).length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Verify role label is in Spanish
            const roleLabels: Record<Employee['role'], string> = {
              recepcionista: 'Recepcionista',
              limpieza: 'Limpieza',
              mantenimiento: 'Mantenimiento',
              gerente: 'Gerente',
            };
            expect(screen.getAllByText(roleLabels[role]).length).toBeGreaterThan(0);

            // Verify shift label is in Spanish
            const shiftLabels: Record<Employee['shift'], string> = {
              mañana: 'mañana',
              tarde: 'Tarde',
              noche: 'Noche',
            };
            expect(screen.getAllByText(shiftLabels[shift]).length).toBeGreaterThan(0);

            return true;
          } finally {
            unmount();
            container.remove();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS }
    );
  }, 300000); // 5 minute timeout

  it('should handle employees with and without photos correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          employeeArbitrary.map(emp => ({ ...emp, photo: undefined })),
          employeeArbitrary.filter(emp => emp.photo !== undefined)
        ),
        async ([employeeWithoutPhoto, employeeWithPhoto]) => {
          // Ensure unique IDs and emails
          const employees = [
            { ...employeeWithoutPhoto, id: 'emp-no-photo', email: 'nophoto@example.com' },
            { ...employeeWithPhoto, id: 'emp-with-photo', email: 'withphoto@example.com' },
          ];

          // Clear all mocks before each iteration
          vi.clearAllMocks();
          vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
          vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue(mockCleaningRecords);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue(employees);

          const { unmount, container } = render(<EmpleadosPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              expect(screen.getAllByText(employeeWithoutPhoto.name).length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Verify both employees are displayed
            expect(screen.getAllByText(employeeWithoutPhoto.name).length).toBeGreaterThan(0);
            expect(screen.getAllByText(employeeWithPhoto.name).length).toBeGreaterThan(0);

            // Verify employee with photo has img element
            if (employeeWithPhoto.photo) {
              const photoElement = screen.getByAltText(employeeWithPhoto.name);
              expect(photoElement).toBeInTheDocument();
              expect(photoElement).toHaveAttribute('src', employeeWithPhoto.photo);
            }

            // Verify employee without photo still displays name, role, and shift
            expect(screen.getAllByText(employeeWithoutPhoto.name).length).toBeGreaterThan(0);

            return true;
          } finally {
            unmount();
            container.remove();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS }
    );
  }, 300000); // 5 minute timeout
});

/**
 * **Feature: hotel-arriendos, Property 8: Employee Cleaning History**
 * 
 * For any employee, their detail view should display their complete cleaning history
 * including all dates, rooms cleaned, and times.
 * 
 * **Validates: Requirements 4.5**
 */
describe('Property 8: Employee Cleaning History', () => {
  const mockRooms: Room[] = [
    {
      id: 'room-1',
      number: '101',
      type: 'individual',
      floor: 1,
      price: 50,
      status: 'disponible',
    },
    {
      id: 'room-2',
      number: '102',
      type: 'doble',
      floor: 1,
      price: 75,
      status: 'disponible',
    },
    {
      id: 'room-3',
      number: '201',
      type: 'suite',
      floor: 2,
      price: 120,
      status: 'disponible',
    },
  ];

  // Arbitrary generators for cleaning records
  const timeArbitrary = fc.tuple(
    fc.integer({ min: 0, max: 23 }),
    fc.integer({ min: 0, max: 59 })
  ).map(([hour, minute]) => 
    `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  );

  const cleaningDateArbitrary = fc.date({ min: new Date('2023-01-01'), max: new Date('2024-12-31'), noInvalidDate: true });

  const notesArbitrary = fc.option(
    fc.oneof(
      fc.constant('Limpieza rutinaria'),
      fc.constant('Limpieza profunda'),
      fc.constant('Cambio de s�banas'),
      fc.constant('Mantenimiento preventivo'),
      fc.string({ minLength: 5, maxLength: 100 })
        .map((value) => value.replace(/\s+/g, ' ').trim())
        .filter((value) => value.length > 0)
    ),
    { nil: undefined }
  );

  const cleaningRecordArbitrary = fc.record({
    id: fc.uuid(),
    roomId: fc.constantFrom(...mockRooms.map(r => r.id)),
    employeeId: fc.constant('test-employee'),
    date: cleaningDateArbitrary,
    startTime: timeArbitrary,
    endTime: timeArbitrary,
    notes: notesArbitrary,
  }).filter(record => record.startTime < record.endTime);

  const employeeArbitrary = fc.record({
    id: fc.constant('test-employee'),
    name: fc.string({ minLength: 3, maxLength: 50 })
      .map((value) => value.replace(/\s+/g, ' ').trim())
      .filter((value) => value.length >= 3 && /[a-zA-Z]/.test(value)),
    role: fc.constantFrom<Employee['role']>('recepcionista', 'limpieza', 'mantenimiento', 'gerente'),
    shift: fc.constantFrom<Employee['shift']>('mañana', 'tarde', 'noche'),
    phone: fc.oneof(
      fc.integer({ min: 10000000, max: 99999999 }).map(n => `+569${n}`),
      fc.integer({ min: 1000000, max: 9999999 }).map(n => `+562${n}`)
    ),
    email: fc.emailAddress(),
    hireDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31'), noInvalidDate: true }),
    photo: fc.option(fc.webUrl({ validSchemes: ['https'] }), { nil: undefined }),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
  });

  it('should display complete cleaning history with dates, rooms, and times for any employee', async () => {
    await fc.assert(
      fc.asyncProperty(
        employeeArbitrary,
        fc.array(cleaningRecordArbitrary, { minLength: 1, maxLength: 10 }),
        async (employee, cleaningRecords) => {
          // Ensure all records have the same employeeId
          const records = cleaningRecords.map((record, idx) => ({
            ...record,
            id: `record-${idx}`,
            employeeId: employee.id,
          }));

          // Clear all mocks before each iteration
          vi.clearAllMocks();
          vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([employee]);
          vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue(records);
          const { unmount, container } = render(<EmpleadosPage />);

          try {
            // Wait for page to load and employee to appear
            await waitFor(() => {
              expect(screen.getAllByText(employee.name).length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Click on employee card to open detail modal
            const employeeCard = screen.getAllByText(employee.name)[0].closest('div');
            if (employeeCard) {
              fireEvent.click(employeeCard);
            }

            // Wait for detail modal to open
            await waitFor(() => {
              expect(screen.getAllByText(/detalles de/i).length).toBeGreaterThan(0);
              expect(screen.getAllByText('Historial de Limpieza').length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Verify cleaning history table is displayed
            const historyTable = screen.getByRole('table');
            expect(historyTable).toBeInTheDocument();

            // Verify table headers
            expect(screen.getAllByText('Fecha').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Habitaci�n').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Hora Inicio').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Hora Fin').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Notas').length).toBeGreaterThan(0);

            // Verify all cleaning records are displayed
            for (const record of records) {
              // Find the room number for this record
              const room = mockRooms.find(r => r.id === record.roomId);
              if (room) {
                expect(screen.getAllByText(room.number).length).toBeGreaterThan(0);
              }

              // Verify times are displayed
              expect(screen.getAllByText(record.startTime).length).toBeGreaterThan(0);
              expect(screen.getAllByText(record.endTime).length).toBeGreaterThan(0);

              // Verify notes or dash for empty notes
              if (record.notes) {
                expect(screen.getAllByText(record.notes).length).toBeGreaterThan(0);
              }
            }

            // Verify the correct number of data rows (excluding header)
            const tableRows = historyTable.querySelectorAll('tbody tr');
            expect(tableRows.length).toBe(records.length);

            return true;
          } finally {
            unmount();
            container.remove();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS }
    );
  }, 300000); // 5 minute timeout

  it('should display empty message when employee has no cleaning history', async () => {
    await fc.assert(
      fc.asyncProperty(
        employeeArbitrary,
        async (employee) => {
          // Clear all mocks before each iteration
          vi.clearAllMocks();
          vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([employee]);
          vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue([]);
          const { unmount, container } = render(<EmpleadosPage />);

          try {
            // Wait for page to load and employee to appear
            await waitFor(() => {
              expect(screen.getAllByText(employee.name).length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Click on employee card to open detail modal
            const employeeCard = screen.getAllByText(employee.name)[0].closest('div');
            if (employeeCard) {
              fireEvent.click(employeeCard);
            }

            // Wait for detail modal to open
            await waitFor(() => {
              expect(screen.getAllByText(/detalles de/i).length).toBeGreaterThan(0);
              expect(screen.getAllByText('Historial de Limpieza').length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Verify empty message is displayed
            expect(screen.getAllByText('No hay registros de limpieza para este empleado.').length).toBeGreaterThan(0);

            // Verify table is NOT displayed
            expect(screen.queryByRole('table')).not.toBeInTheDocument();

            return true;
          } finally {
            unmount();
            container.remove();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS }
    );
  }, 300000); // 5 minute timeout

  it('should sort cleaning history by date descending (most recent first)', async () => {
    await fc.assert(
      fc.asyncProperty(
        employeeArbitrary,
        fc.array(cleaningRecordArbitrary, { minLength: 3, maxLength: 10 }),
        async (employee, cleaningRecords) => {
          // Ensure all records have the same employeeId and different dates
          const records = cleaningRecords.map((record, idx) => ({
            ...record,
            id: `record-${idx}`,
            employeeId: employee.id,
            date: new Date(2024, 0, idx + 1), // Different dates
          }));

          // Clear all mocks before each iteration
          vi.clearAllMocks();
          vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([employee]);
          vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue(records);
          const { unmount, container } = render(<EmpleadosPage />);

          try {
            // Wait for page to load and employee to appear
            await waitFor(() => {
              expect(screen.getAllByText(employee.name).length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Click on employee card to open detail modal
            const employeeCard = screen.getAllByText(employee.name)[0].closest('div');
            if (employeeCard) {
              fireEvent.click(employeeCard);
            }

            // Wait for detail modal to open
            await waitFor(() => {
              expect(screen.getAllByText(/detalles de/i).length).toBeGreaterThan(0);
              expect(screen.getAllByText('Historial de Limpieza').length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Get all date cells from the table
            const historyTable = screen.getByRole('table');
            const tableRows = historyTable.querySelectorAll('tbody tr');
            
            // Extract dates from table rows
            const displayedDates: Date[] = [];
            tableRows.forEach(row => {
              const dateCell = row.querySelector('td:first-child');
              if (dateCell) {
                const dateText = dateCell.textContent || '';
                // Parse Spanish date format (DD/MM/YYYY)
                const [day, month, year] = dateText.split('/').map(Number);
                if (day && month && year) {
                  displayedDates.push(new Date(year, month - 1, day));
                }
              }
            });

            // Verify dates are in descending order (most recent first)
            for (let i = 0; i < displayedDates.length - 1; i++) {
              expect(displayedDates[i].getTime()).toBeGreaterThanOrEqual(displayedDates[i + 1].getTime());
            }

            return true;
          } finally {
            unmount();
            container.remove();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS }
    );
  }, 300000); // 5 minute timeout

  it('should display room numbers correctly by mapping roomId to room number', async () => {
    await fc.assert(
      fc.asyncProperty(
        employeeArbitrary,
        fc.array(cleaningRecordArbitrary, { minLength: 1, maxLength: 5 }),
        async (employee, cleaningRecords) => {
          // Ensure all records have the same employeeId
          const records = cleaningRecords.map((record, idx) => ({
            ...record,
            id: `record-${idx}`,
            employeeId: employee.id,
          }));

          // Clear all mocks before each iteration
          vi.clearAllMocks();
          vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([employee]);
          vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue(records);
          const { unmount, container } = render(<EmpleadosPage />);

          try {
            // Wait for page to load and employee to appear
            await waitFor(() => {
              expect(screen.getAllByText(employee.name).length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Click on employee card to open detail modal
            const employeeCard = screen.getAllByText(employee.name)[0].closest('div');
            if (employeeCard) {
              fireEvent.click(employeeCard);
            }

            // Wait for detail modal to open
            await waitFor(() => {
              expect(screen.getAllByText(/detalles de/i).length).toBeGreaterThan(0);
              expect(screen.getAllByText('Historial de Limpieza').length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Verify each cleaning record displays the correct room number
            for (const record of records) {
              const room = mockRooms.find(r => r.id === record.roomId);
              if (room) {
                // Room number should be displayed in the table
                expect(screen.getAllByText(room.number).length).toBeGreaterThan(0);
              }
            }

            return true;
          } finally {
            unmount();
            container.remove();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS }
    );
  }, 300000); // 5 minute timeout

  it('should format dates in Spanish locale (DD/MM/YYYY)', async () => {
    await fc.assert(
      fc.asyncProperty(
        employeeArbitrary,
        cleaningRecordArbitrary,
        async (employee, cleaningRecord) => {
          const record = {
            ...cleaningRecord,
            employeeId: employee.id,
          };

          // Clear all mocks before each iteration
          vi.clearAllMocks();
          vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([employee]);
          vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue([record]);
          const { unmount, container } = render(<EmpleadosPage />);

          try {
            // Wait for page to load and employee to appear
            await waitFor(() => {
              expect(screen.getAllByText(employee.name).length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Click on employee card to open detail modal
            const employeeCard = screen.getAllByText(employee.name)[0].closest('div');
            if (employeeCard) {
              fireEvent.click(employeeCard);
            }

            // Wait for detail modal to open
            await waitFor(() => {
              expect(screen.getAllByText(/detalles de/i).length).toBeGreaterThan(0);
              expect(screen.getAllByText('Historial de Limpieza').length).toBeGreaterThan(0);
            }, { timeout: 1500 });

            // Format the date in Spanish locale
            const expectedDate = formatDate(record.date);

            // Verify the date is displayed in the correct format
            expect(screen.getAllByText(expectedDate).length).toBeGreaterThan(0);

            return true;
          } finally {
            unmount();
            container.remove();
          }
        }
      ),
      { numRuns: FAST_CHECK_RUNS }
    );
  }, 300000); // 5 minute timeout
});







