import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HabitacionesPage from './page';
import * as dataAccess from '@/lib/data-access';
import type { Room, Employee } from '@/types';

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

describe('HabitacionesPage', () => {
  const mockRooms: Room[] = [
    {
      id: 'room-1',
      number: '101',
      type: 'individual',
      floor: 1,
      price: 50000,
      status: 'disponible',
    },
    {
      id: 'room-2',
      number: '102',
      type: 'doble',
      floor: 1,
      price: 75000,
      status: 'ocupada',
      assignedEmployeeId: 'emp-1',
    },
  ];

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
    {
      id: 'emp-2',
      name: 'Juan Pérez',
      role: 'recepcionista',
      shift: 'tarde',
      phone: '+56987654321',
      email: 'juan@hotel.com',
      hireDate: new Date('2023-02-01'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
    vi.mocked(dataAccess.getEmployees).mockResolvedValue(mockEmployees);
  });

  it('should render page title and create button', async () => {
    render(<HabitacionesPage />);

    await waitFor(() => {
      expect(screen.getByText('Habitaciones')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /nueva habitación/i })).toBeInTheDocument();
  });

  it('should load and display rooms', async () => {
    render(<HabitacionesPage />);

    await waitFor(() => {
      expect(screen.getByText('101')).toBeInTheDocument();
      expect(screen.getByText('102')).toBeInTheDocument();
    });

    expect(dataAccess.getRooms).toHaveBeenCalledTimes(1);
    expect(dataAccess.getEmployees).toHaveBeenCalledTimes(1);
  });

  it('should open create modal when create button is clicked', async () => {
    const user = userEvent.setup();
    render(<HabitacionesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /nueva habitación/i })).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /nueva habitación/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      // Check for the modal title specifically (it's an h2 with role heading)
      expect(screen.getByRole('heading', { name: 'Nueva Habitación' })).toBeInTheDocument();
    });
  });

  it('should validate required fields when creating a room', async () => {
    const user = userEvent.setup();
    render(<HabitacionesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /nueva habitación/i })).toBeInTheDocument();
    });

    // Open create modal
    const createButton = screen.getByRole('button', { name: /nueva habitación/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /crear habitación/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El número de habitación es obligatorio')).toBeInTheDocument();
    });

    expect(dataAccess.createRoom).not.toHaveBeenCalled();
  });

  it('should create a new room with valid data', async () => {
    const user = userEvent.setup();
    const newRoom: Room = {
      id: 'room-3',
      number: '103',
      type: 'suite',
      floor: 1,
      price: 100000,
      status: 'disponible',
    };

    vi.mocked(dataAccess.createRoom).mockResolvedValue(newRoom);

    render(<HabitacionesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /nueva habitación/i })).toBeInTheDocument();
    });

    // Open create modal
    const createButton = screen.getByRole('button', { name: /nueva habitación/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Fill form
    const numberInput = screen.getByLabelText(/número de habitación/i);
    await user.clear(numberInput);
    await user.type(numberInput, '103');

    const typeSelect = screen.getByLabelText(/tipo/i);
    await user.selectOptions(typeSelect, 'suite');

    const priceInput = screen.getByLabelText(/precio por noche/i);
    await user.clear(priceInput);
    await user.type(priceInput, '100000');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /crear habitación/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(dataAccess.createRoom).toHaveBeenCalledWith({
        number: '103',
        type: 'suite',
        floor: 1,
        price: 100000,
        status: 'disponible',
        assignedEmployeeId: undefined,
      });
    });
  });

  it('should open edit modal when room is clicked', async () => {
    const user = userEvent.setup();
    render(<HabitacionesPage />);

    await waitFor(() => {
      expect(screen.getByText('101')).toBeInTheDocument();
    });

    // Click on a room card
    const roomCard = screen.getByText('101').closest('div');
    if (roomCard) {
      await user.click(roomCard);
    }

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Editar Habitación')).toBeInTheDocument();
    });
  });

  it('should update an existing room', async () => {
    const user = userEvent.setup();
    const updatedRoom: Room = {
      ...mockRooms[0],
      price: 60000,
    };

    vi.mocked(dataAccess.updateRoom).mockResolvedValue(updatedRoom);

    render(<HabitacionesPage />);

    await waitFor(() => {
      expect(screen.getByText('101')).toBeInTheDocument();
    });

    // Click on room to edit
    const roomCard = screen.getByText('101').closest('div');
    if (roomCard) {
      await user.click(roomCard);
    }

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Update price
    const priceInput = screen.getByLabelText(/precio por noche/i);
    await user.clear(priceInput);
    await user.type(priceInput, '60000');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /guardar cambios/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(dataAccess.updateRoom).toHaveBeenCalledWith('room-1', {
        number: '101',
        type: 'individual',
        floor: 1,
        price: 60000,
        status: 'disponible',
        assignedEmployeeId: undefined,
      });
    });
  });

  it('should assign an employee to a room', async () => {
    const user = userEvent.setup();
    const updatedRoom: Room = {
      ...mockRooms[0],
      assignedEmployeeId: 'emp-1',
    };

    vi.mocked(dataAccess.updateRoom).mockResolvedValue(updatedRoom);

    render(<HabitacionesPage />);

    await waitFor(() => {
      expect(screen.getByText('101')).toBeInTheDocument();
    });

    // Click on room to edit
    const roomCard = screen.getByText('101').closest('div');
    if (roomCard) {
      await user.click(roomCard);
    }

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Assign employee
    const employeeSelect = screen.getByLabelText(/empleado asignado/i);
    await user.selectOptions(employeeSelect, 'emp-1');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /guardar cambios/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(dataAccess.updateRoom).toHaveBeenCalledWith('room-1', expect.objectContaining({
        assignedEmployeeId: 'emp-1',
      }));
    });
  });

  it('should only show cleaning employees in assignment dropdown', async () => {
    const user = userEvent.setup();
    render(<HabitacionesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /nueva habitación/i })).toBeInTheDocument();
    });

    // Open create modal
    const createButton = screen.getByRole('button', { name: /nueva habitación/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Check employee dropdown
    const employeeSelect = screen.getByLabelText(/empleado asignado/i);
    const options = within(employeeSelect).getAllByRole('option');

    // Should have "Sin asignar" + 1 cleaning employee (María González)
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Sin asignar');
    expect(options[1]).toHaveTextContent('María González');
  });

  it('should delete a room when delete button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(dataAccess.deleteRoom).mockResolvedValue(true);

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<HabitacionesPage />);

    await waitFor(() => {
      expect(screen.getByText('101')).toBeInTheDocument();
    });

    // Click on room to edit
    const roomCard = screen.getByText('101').closest('div');
    if (roomCard) {
      await user.click(roomCard);
    }

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /eliminar/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
      expect(dataAccess.deleteRoom).toHaveBeenCalledWith('room-1');
    });

    confirmSpy.mockRestore();
  });

  it('should prevent duplicate room numbers', async () => {
    const user = userEvent.setup();
    render(<HabitacionesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /nueva habitación/i })).toBeInTheDocument();
    });

    // Open create modal
    const createButton = screen.getByRole('button', { name: /nueva habitación/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Try to create room with existing number
    const numberInput = screen.getByLabelText(/número de habitación/i);
    await user.clear(numberInput);
    await user.type(numberInput, '101'); // Already exists

    const priceInput = screen.getByLabelText(/precio por noche/i);
    await user.clear(priceInput);
    await user.type(priceInput, '50000');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /crear habitación/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Ya existe una habitación con este número')).toBeInTheDocument();
    });

    expect(dataAccess.createRoom).not.toHaveBeenCalled();
  });

  it('should validate price is greater than zero', async () => {
    const user = userEvent.setup();
    render(<HabitacionesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /nueva habitación/i })).toBeInTheDocument();
    });

    // Open create modal
    const createButton = screen.getByRole('button', { name: /nueva habitación/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Fill form with invalid price
    const numberInput = screen.getByLabelText(/número de habitación/i);
    await user.clear(numberInput);
    await user.type(numberInput, '103');

    const priceInput = screen.getByLabelText(/precio por noche/i);
    await user.clear(priceInput);
    await user.type(priceInput, '0');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /crear habitación/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El precio debe ser mayor que cero')).toBeInTheDocument();
    });

    expect(dataAccess.createRoom).not.toHaveBeenCalled();
  });
});




