import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import EmpleadosPage from './page';
import * as dataAccess from '@/lib/data-access';

// Mock the data access functions
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

describe('EmpleadosPage', () => {
  const mockEmployees = [
    {
      id: 'emp-1',
      name: 'Juan P�rez',
      role: 'limpieza' as const,
      shift: 'mañana' as const,
      phone: '555-1234',
      email: 'juan@hotel.com',
      hireDate: new Date('2023-01-15'),
    },
    {
      id: 'emp-2',
      name: 'Mar�a Garc�a',
      role: 'recepcionista' as const,
      shift: 'tarde' as const,
      phone: '555-5678',
      email: 'maria@hotel.com',
      photo: 'https://example.com/maria.jpg',
      hireDate: new Date('2023-03-20'),
    },
  ];

  const mockRooms = [
    {
      id: 'room-101',
      number: '101',
      type: 'individual' as const,
      floor: 1,
      price: 45000,
      status: 'disponible' as const,
    },
    {
      id: 'room-102',
      number: '102',
      type: 'doble' as const,
      floor: 1,
      price: 65000,
      status: 'ocupada' as const,
    },
  ];

  const mockCleaningRecords = [
    {
      id: 'clean-1',
      roomId: 'room-101',
      employeeId: 'emp-1',
      date: new Date('2024-01-15'),
      startTime: '08:00',
      endTime: '09:00',
      notes: 'Limpieza rutinaria',
    },
    {
      id: 'clean-2',
      roomId: 'room-102',
      employeeId: 'emp-1',
      date: new Date('2024-01-14'),
      startTime: '10:00',
      endTime: '11:00',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dataAccess.getEmployees).mockResolvedValue(mockEmployees);
    vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
    vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue([]);
  });

  const waitForPageReady = async () => {
    await waitFor(() => {
      expect(screen.getByText('Empleados')).toBeInTheDocument();
    });
  };

  it('should render the page title and create button', async () => {
    render(<EmpleadosPage />);

    await waitForPageReady();

    expect(screen.getByText('Empleados')).toBeInTheDocument();
    expect(screen.getByText('Nuevo Empleado')).toBeInTheDocument();
  });

  it('should load and display employees', async () => {
    render(<EmpleadosPage />);

    await waitForPageReady();

    await waitFor(() => {
      expect(screen.getByText('Juan P�rez')).toBeInTheDocument();
      expect(screen.getByText('Mar�a Garc�a')).toBeInTheDocument();
    });

    expect(dataAccess.getEmployees).toHaveBeenCalledTimes(1);
  });

  it('should open create modal when clicking create button', async () => {
    render(<EmpleadosPage />);

    await waitForPageReady();

    const createButton = screen.getByRole('button', { name: /Nuevo Empleado/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Nombre Completo/)).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    render(<EmpleadosPage />);

    await waitForPageReady();

    // Open create modal
    const createButton = screen.getByText('Nuevo Empleado');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Nombre Completo/)).toBeInTheDocument();
    });

    // Try to submit without filling required fields
    const submitButton = screen.getByText('Crear Empleado');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
      expect(screen.getByText('El tel�fono es obligatorio')).toBeInTheDocument();
      expect(screen.getByText('El correo electr�nico es obligatorio')).toBeInTheDocument();
    });

    expect(dataAccess.createEmployee).not.toHaveBeenCalled();
  });

  it('should validate email format', async () => {
    render(<EmpleadosPage />);

    await waitForPageReady();

    // Open create modal
    const createButton = screen.getByRole('button', { name: /Nuevo Empleado/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Correo Electr�nico/)).toBeInTheDocument();
    });

    // Fill in name and phone (required fields)
    fireEvent.change(screen.getByLabelText(/Nombre Completo/), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/Tel�fono/), {
      target: { value: '555-0000' },
    });

    // Fill in invalid email
    const emailInput = screen.getByLabelText(/Correo Electr�nico/);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    // Submit form - use fireEvent.submit to bypass browser validation
    const form = screen.getByRole('dialog').querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.getByText('El formato del correo electr�nico no es v�lido')).toBeInTheDocument();
    });
  });

  it('should create a new employee', async () => {
    const newEmployee = {
      id: 'emp-3',
      name: 'Carlos L�pez',
      role: 'mantenimiento' as const,
      shift: 'noche' as const,
      phone: '555-9999',
      email: 'carlos@hotel.com',
      hireDate: new Date('2024-01-10'),
    };

    vi.mocked(dataAccess.createEmployee).mockResolvedValue(newEmployee);

    render(<EmpleadosPage />);

    await waitForPageReady();

    // Open create modal
    const createButton = screen.getByText('Nuevo Empleado');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Nombre Completo/)).toBeInTheDocument();
    });

    // Fill in form
    fireEvent.change(screen.getByLabelText(/Nombre Completo/), {
      target: { value: 'Carlos L�pez' },
    });
    fireEvent.change(screen.getByLabelText(/Rol/), {
      target: { value: 'mantenimiento' },
    });
    fireEvent.change(screen.getByLabelText(/Turno/), {
      target: { value: 'noche' },
    });
    fireEvent.change(screen.getByLabelText(/Tel�fono/), {
      target: { value: '555-9999' },
    });
    fireEvent.change(screen.getByLabelText(/Correo Electr�nico/), {
      target: { value: 'carlos@hotel.com' },
    });

    // Submit form
    const submitButton = screen.getByText('Crear Empleado');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(dataAccess.createEmployee).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Carlos L�pez',
          role: 'mantenimiento',
          shift: 'noche',
          phone: '555-9999',
          email: 'carlos@hotel.com',
        })
      );
    });
  });

  it('should open detail modal when clicking an employee card', async () => {
    vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue(mockCleaningRecords);

    render(<EmpleadosPage />);

    await waitForPageReady();

    await waitFor(() => {
      expect(screen.getByText('Juan P�rez')).toBeInTheDocument();
    });

    // Click on employee card
    const employeeCard = screen.getByText('Juan P�rez').closest('div');
    if (employeeCard) {
      fireEvent.click(employeeCard);
    }

    await waitFor(() => {
      expect(screen.getByText('Detalles de Juan P�rez')).toBeInTheDocument();
      expect(screen.getByText('Informaci�n del Empleado')).toBeInTheDocument();
      expect(screen.getByText('Historial de Limpieza')).toBeInTheDocument();
    });

    expect(dataAccess.getCleaningRecordsByEmployeeId).toHaveBeenCalledWith('emp-1');
  });

  it('should display employee information in detail modal', async () => {
    vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue([]);

    render(<EmpleadosPage />);

    await waitForPageReady();

    await waitFor(() => {
      expect(screen.getByText('Juan P�rez')).toBeInTheDocument();
    });

    // Click on employee card
    const employeeCard = screen.getByText('Juan P�rez').closest('div');
    if (employeeCard) {
      fireEvent.click(employeeCard);
    }

    await waitFor(() => {
      expect(screen.getByText('Nombre:')).toBeInTheDocument();
      expect(screen.getByText('Rol:')).toBeInTheDocument();
      expect(screen.getByText('Turno:')).toBeInTheDocument();
      expect(screen.getByText('Tel�fono:')).toBeInTheDocument();
      expect(screen.getByText('Email:')).toBeInTheDocument();
      expect(screen.getByText('Fecha de Contrataci�n:')).toBeInTheDocument();
      expect(screen.getByText('555-1234')).toBeInTheDocument();
      expect(screen.getByText('juan@hotel.com')).toBeInTheDocument();
    });
  });

  it('should display cleaning history in detail modal', async () => {
    vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue(mockCleaningRecords);

    render(<EmpleadosPage />);

    await waitForPageReady();

    await waitFor(() => {
      expect(screen.getByText('Juan P�rez')).toBeInTheDocument();
    });

    // Click on employee card
    const employeeCard = screen.getByText('Juan P�rez').closest('div');
    if (employeeCard) {
      fireEvent.click(employeeCard);
    }

    await waitFor(() => {
      expect(screen.getByText('Historial de Limpieza')).toBeInTheDocument();
      expect(screen.getByText('101')).toBeInTheDocument();
      expect(screen.getByText('102')).toBeInTheDocument();
      expect(screen.getByText('08:00')).toBeInTheDocument();
      expect(screen.getByText('09:00')).toBeInTheDocument();
      expect(screen.getByText('10:00')).toBeInTheDocument();
      expect(screen.getByText('11:00')).toBeInTheDocument();
      expect(screen.getByText('Limpieza rutinaria')).toBeInTheDocument();
    });
  });

  it('should display empty message when employee has no cleaning history', async () => {
    vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue([]);

    render(<EmpleadosPage />);

    await waitForPageReady();

    await waitFor(() => {
      expect(screen.getByText('Juan P�rez')).toBeInTheDocument();
    });

    // Click on employee card
    const employeeCard = screen.getByText('Juan P�rez').closest('div');
    if (employeeCard) {
      fireEvent.click(employeeCard);
    }

    await waitFor(() => {
      expect(screen.getByText('No hay registros de limpieza para este empleado.')).toBeInTheDocument();
    });
  });

  it('should open edit modal from detail modal', async () => {
    vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue([]);

    render(<EmpleadosPage />);

    await waitForPageReady();

    await waitFor(() => {
      expect(screen.getByText('Juan P�rez')).toBeInTheDocument();
    });

    // Click on employee card to open detail modal
    const employeeCard = screen.getByText('Juan P�rez').closest('div');
    if (employeeCard) {
      fireEvent.click(employeeCard);
    }

    await waitFor(() => {
      expect(screen.getByText('Detalles de Juan P�rez')).toBeInTheDocument();
    });

    // Click edit button in detail modal
    const editButton = screen.getByText('Editar Empleado');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Juan P�rez')).toBeInTheDocument();
      expect(screen.getByText('Guardar Cambios')).toBeInTheDocument();
    });
  });

  it('should update an existing employee', async () => {
    const updatedEmployee = {
      ...mockEmployees[0],
      name: 'Juan P�rez Actualizado',
    };

    vi.mocked(dataAccess.updateEmployee).mockResolvedValue(updatedEmployee);
    vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue([]);

    render(<EmpleadosPage />);

    await waitForPageReady();

    await waitFor(() => {
      expect(screen.getByText('Juan P�rez')).toBeInTheDocument();
    });

    // Click on employee card to open detail modal
    const employeeCard = screen.getByText('Juan P�rez').closest('div');
    if (employeeCard) {
      fireEvent.click(employeeCard);
    }

    await waitFor(() => {
      expect(screen.getByText('Detalles de Juan P�rez')).toBeInTheDocument();
    });

    // Click edit button in detail modal
    const editButton = screen.getByText('Editar Empleado');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Juan P�rez')).toBeInTheDocument();
    });

    // Update name
    const nameInput = screen.getByDisplayValue('Juan P�rez');
    fireEvent.change(nameInput, { target: { value: 'Juan P�rez Actualizado' } });

    // Submit form
    const submitButton = screen.getByText('Guardar Cambios');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(dataAccess.updateEmployee).toHaveBeenCalledWith(
        'emp-1',
        expect.objectContaining({
          name: 'Juan P�rez Actualizado',
        })
      );
    });
  });

  it('should delete an employee', async () => {
    vi.mocked(dataAccess.deleteEmployee).mockResolvedValue(true);
    vi.mocked(dataAccess.getCleaningRecordsByEmployeeId).mockResolvedValue([]);
    
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<EmpleadosPage />);

    await waitForPageReady();

    await waitFor(() => {
      expect(screen.getByText('Juan P�rez')).toBeInTheDocument();
    });

    // Click on employee card to open detail modal
    const employeeCard = screen.getByText('Juan P�rez').closest('div');
    if (employeeCard) {
      fireEvent.click(employeeCard);
    }

    await waitFor(() => {
      expect(screen.getByText('Detalles de Juan P�rez')).toBeInTheDocument();
    });

    // Click edit button in detail modal
    const editButton = screen.getByText('Editar Empleado');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Eliminar')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByText('Eliminar');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
      expect(dataAccess.deleteEmployee).toHaveBeenCalledWith('emp-1');
    });

    confirmSpy.mockRestore();
  });

  it('should prevent duplicate email addresses', async () => {
    render(<EmpleadosPage />);

    await waitForPageReady();

    // Open create modal
    const createButton = screen.getByText('Nuevo Empleado');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Correo Electr�nico/)).toBeInTheDocument();
    });

    // Fill in form with existing email
    fireEvent.change(screen.getByLabelText(/Nombre Completo/), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/Tel�fono/), {
      target: { value: '555-0000' },
    });
    fireEvent.change(screen.getByLabelText(/Correo Electr�nico/), {
      target: { value: 'juan@hotel.com' }, // Existing email
    });

    // Submit form
    const submitButton = screen.getByText('Crear Empleado');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Ya existe un empleado con este correo electr�nico')).toBeInTheDocument();
    });

    expect(dataAccess.createEmployee).not.toHaveBeenCalled();
  });
});






