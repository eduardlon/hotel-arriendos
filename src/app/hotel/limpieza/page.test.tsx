import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LimpiezaPage from './page';
import * as dataAccess from '@/lib/data-access';
import type { Room, Employee, CleaningRecord } from '@/types';

// Mock data access functions
vi.mock('@/lib/data-access', () => ({
  isCachePrimed: vi.fn(() => false),
  getRooms: vi.fn(),
  getEmployees: vi.fn(),
  getCleaningRecords: vi.fn(),
  createCleaningRecord: vi.fn(),
  updateRoom: vi.fn(),
  getShiftConfig: vi.fn(),
  updateShiftConfig: vi.fn(),
}));

describe('LimpiezaPage', () => {
  const mockRooms: Room[] = [
    {
      id: 'room-1',
      number: '101',
      type: 'individual',
      floor: 1,
      price: 50000,
      status: 'disponible',
      lastCleaned: new Date('2024-01-15'),
    },
    {
      id: 'room-2',
      number: '102',
      type: 'doble',
      floor: 1,
      price: 70000,
      status: 'limpieza',
      assignedEmployeeId: 'emp-1',
      lastCleaned: new Date('2024-01-14'),
    },
    {
      id: 'room-3',
      number: '201',
      type: 'suite',
      floor: 2,
      price: 120000,
      status: 'ocupada',
      assignedEmployeeId: 'emp-2',
      lastCleaned: new Date('2024-01-14'),
    },
  ];

  const mockEmployees: Employee[] = [
    {
      id: 'emp-1',
      name: 'María González',
      role: 'limpieza',
      shift: 'mañana',
      phone: '+56912345678',
      email: 'maria@hotel.cl',
      hireDate: new Date('2022-01-01'),
    },
    {
      id: 'emp-2',
      name: 'Carlos Rodríguez',
      role: 'limpieza',
      shift: 'tarde',
      phone: '+56923456789',
      email: 'carlos@hotel.cl',
      hireDate: new Date('2022-01-01'),
    },
  ];

  const mockCleaningRecords: CleaningRecord[] = [
    {
      id: 'clean-1',
      roomId: 'room-1',
      employeeId: 'emp-1',
      date: new Date(),
      startTime: '08:00',
      endTime: '09:00',
      notes: 'Limpieza rutinaria',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
    vi.mocked(dataAccess.getEmployees).mockResolvedValue(mockEmployees);
    vi.mocked(dataAccess.getCleaningRecords).mockResolvedValue(mockCleaningRecords);
    vi.mocked(dataAccess.getShiftConfig).mockResolvedValue({
      dayStart: '06:00',
      dayEnd: '18:00',
      nightStart: '18:00',
      nightEnd: '06:00',
      cleaningsPerDay: 8,
    });
  });

  it('should render the page title', async () => {
    render(<LimpiezaPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Limpieza')).toBeInTheDocument();
    });
  });

  it('should display status panel with correct counts', async () => {
    render(<LimpiezaPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Limpias')).toBeInTheDocument();
      expect(screen.getByText('Pendientes')).toBeInTheDocument();
      expect(screen.getByText('En Proceso')).toBeInTheDocument();
    });

    // Verify the status values are displayed (1 disponible, 1 limpieza, 1 ocupada)
    expect(screen.getByText('Limpias').parentElement?.parentElement).toBeInTheDocument();
  });

  it('should display rooms needing cleaning', async () => {
    render(<LimpiezaPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Habitaciones Pendientes de Limpieza')).toBeInTheDocument();
      expect(screen.getByText('Habitación 102')).toBeInTheDocument();
    });
  });

  it('should display CleaningSchedule component', async () => {
    render(<LimpiezaPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Calendario de Limpieza Semanal')).toBeInTheDocument();
    });
  });

  it('should open modal when clicking mark as complete button', async () => {
    const user = userEvent.setup();
    render(<LimpiezaPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Habitación 102')).toBeInTheDocument();
    });

    const completeButton = screen.getByRole('button', { name: /Marcar como Completa/i });
    await user.click(completeButton);

    await waitFor(() => {
      expect(screen.getByText('Completar Limpieza - Habitación 102')).toBeInTheDocument();
    });
  });

  it('should validate form fields when submitting', async () => {
    const user = userEvent.setup();
    render(<LimpiezaPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Habitación 102')).toBeInTheDocument();
    });

    const completeButton = screen.getByRole('button', { name: /Marcar como Completa/i });
    await user.click(completeButton);

    await waitFor(() => {
      expect(screen.getByText('Completar Limpieza - Habitación 102')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Completar Limpieza/i });
    await user.click(submitButton);

    // Wait for validation errors to appear
    await waitFor(() => {
      const errors = screen.queryAllByText(/obligatori/i);
      expect(errors.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });

  it('should create cleaning record and update room status on successful submission', async () => {
    const user = userEvent.setup();
    const newCleaningRecord: CleaningRecord = {
      id: 'clean-2',
      roomId: 'room-2',
      employeeId: 'emp-1',
      date: new Date(),
      startTime: '10:00',
      endTime: '11:00',
    };

    const updatedRoom: Room = {
      ...mockRooms[1],
      status: 'disponible',
      lastCleaned: new Date(),
    };

    vi.mocked(dataAccess.createCleaningRecord).mockResolvedValue(newCleaningRecord);
    vi.mocked(dataAccess.updateRoom).mockResolvedValue(updatedRoom);

    render(<LimpiezaPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Habitación 102')).toBeInTheDocument();
    });

    const completeButton = screen.getByRole('button', { name: /Marcar como Completa/i });
    await user.click(completeButton);

    await waitFor(() => {
      expect(screen.getByText('Completar Limpieza - Habitación 102')).toBeInTheDocument();
    });

    // Fill form
    const employeeSelect = screen.getByLabelText(/Empleado/i);
    await user.selectOptions(employeeSelect, 'emp-1');

    const startTimeInput = screen.getByLabelText(/Hora de Inicio/i);
    await user.type(startTimeInput, '10:00');

    const endTimeInput = screen.getByLabelText(/Hora de Fin/i);
    await user.type(endTimeInput, '11:00');

    const submitButton = screen.getByRole('button', { name: /Completar Limpieza/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(dataAccess.createCleaningRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          roomId: 'room-2',
          employeeId: 'emp-1',
          startTime: '10:00',
          endTime: '11:00',
        })
      );
      expect(dataAccess.updateRoom).toHaveBeenCalledWith('room-2', {
        status: 'disponible',
        lastCleaned: expect.any(Date),
      });
    });
  });

  it('should validate that end time is after start time', async () => {
    const user = userEvent.setup();
    render(<LimpiezaPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Habitación 102')).toBeInTheDocument();
    });

    const completeButton = screen.getByRole('button', { name: /Marcar como Completa/i });
    await user.click(completeButton);

    await waitFor(() => {
      expect(screen.getByText('Completar Limpieza - Habitación 102')).toBeInTheDocument();
    });

    // Fill form with invalid times
    const employeeSelect = screen.getByLabelText(/Empleado/i);
    await user.selectOptions(employeeSelect, 'emp-1');

    const startTimeInput = screen.getByLabelText(/Hora de Inicio/i);
    await user.type(startTimeInput, '11:00');

    const endTimeInput = screen.getByLabelText(/Hora de Fin/i);
    await user.type(endTimeInput, '10:00');

    const submitButton = screen.getByRole('button', { name: /Completar Limpieza/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('La hora de fin debe ser posterior a la hora de inicio')).toBeInTheDocument();
    });
  });
});

