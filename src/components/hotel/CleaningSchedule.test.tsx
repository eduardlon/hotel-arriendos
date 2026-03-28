import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CleaningSchedule from './CleaningSchedule';
import type { CleaningRecord, Room, Employee } from '@/types';

describe('CleaningSchedule', () => {
  const mockRooms: Room[] = [
    {
      id: 'room-101',
      number: '101',
      type: 'individual',
      floor: 1,
      price: 45000,
      status: 'disponible',
    },
    {
      id: 'room-102',
      number: '102',
      type: 'doble',
      floor: 2,
      price: 65000,
      status: 'ocupada',
    },
  ];

  const mockEmployees: Employee[] = [
    {
      id: 'emp-001',
      name: 'María González',
      role: 'limpieza',
      shift: 'mañana',
      phone: '+56912345678',
      email: 'maria.gonzalez@hotel.cl',
      hireDate: new Date('2022-03-15'),
    },
    {
      id: 'emp-002',
      name: 'Carlos Rodríguez',
      role: 'limpieza',
      shift: 'tarde',
      phone: '+56923456789',
      email: 'carlos.rodriguez@hotel.cl',
      hireDate: new Date('2021-07-20'),
    },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mockCleaningRecords: CleaningRecord[] = [
    {
      id: 'clean-001',
      roomId: 'room-101',
      employeeId: 'emp-001',
      date: today,
      startTime: '08:00',
      endTime: '08:45',
      notes: 'Limpieza rutinaria',
    },
    {
      id: 'clean-002',
      roomId: 'room-102',
      employeeId: 'emp-002',
      date: today,
      startTime: '14:00',
      endTime: '15:00',
      notes: 'Cambio de sábanas',
    },
  ];

  it('renders the component with title', () => {
    render(
      <CleaningSchedule
        cleaningRecords={[]}
        rooms={mockRooms}
        employees={mockEmployees}
      />
    );

    expect(screen.getByText('Calendario de Limpieza Semanal')).toBeInTheDocument();
  });

  it('displays 7 days in the weekly calendar', () => {
    render(
      <CleaningSchedule
        cleaningRecords={[]}
        rooms={mockRooms}
        employees={mockEmployees}
      />
    );

    const emptyDays = screen.getAllByText('Sin limpiezas');
    expect(emptyDays.length).toBe(7);
  });

  it('displays cleaning assignments for today', () => {
    render(
      <CleaningSchedule
        cleaningRecords={mockCleaningRecords}
        rooms={mockRooms}
        employees={mockEmployees}
      />
    );

    expect(screen.getByText('Hab. 101')).toBeInTheDocument();
    expect(screen.getByText('Hab. 102')).toBeInTheDocument();
    expect(screen.getByText('María González')).toBeInTheDocument();
    expect(screen.getByText('Carlos Rodríguez')).toBeInTheDocument();
  });

  it('displays room floor information', () => {
    render(
      <CleaningSchedule
        cleaningRecords={mockCleaningRecords}
        rooms={mockRooms}
        employees={mockEmployees}
      />
    );

    expect(screen.getByText('Piso 1')).toBeInTheDocument();
    expect(screen.getByText('Piso 2')).toBeInTheDocument();
  });

  it('displays cleaning time information', () => {
    render(
      <CleaningSchedule
        cleaningRecords={mockCleaningRecords}
        rooms={mockRooms}
        employees={mockEmployees}
      />
    );

    expect(screen.getByText('08:00 - 08:45')).toBeInTheDocument();
    expect(screen.getByText('14:00 - 15:00')).toBeInTheDocument();
  });

  it('displays empty state for days with no cleanings', () => {
    render(
      <CleaningSchedule
        cleaningRecords={[]}
        rooms={mockRooms}
        employees={mockEmployees}
      />
    );

    const emptyMessages = screen.getAllByText('Sin limpiezas');
    expect(emptyMessages.length).toBeGreaterThan(0);
  });

  it('handles missing room data gracefully', () => {
    const recordWithMissingRoom: CleaningRecord = {
      id: 'clean-003',
      roomId: 'room-999',
      employeeId: 'emp-001',
      date: today,
      startTime: '09:00',
      endTime: '09:45',
    };

    render(
      <CleaningSchedule
        cleaningRecords={[recordWithMissingRoom]}
        rooms={mockRooms}
        employees={mockEmployees}
      />
    );

    expect(screen.queryByText('Hab. 999')).not.toBeInTheDocument();
  });

  it('handles missing employee data gracefully', () => {
    const recordWithMissingEmployee: CleaningRecord = {
      id: 'clean-004',
      roomId: 'room-101',
      employeeId: 'emp-999',
      date: today,
      startTime: '10:00',
      endTime: '10:45',
    };

    render(
      <CleaningSchedule
        cleaningRecords={[recordWithMissingEmployee]}
        rooms={mockRooms}
        employees={mockEmployees}
      />
    );

    expect(screen.queryByText('Hab. 101')).not.toBeInTheDocument();
  });

  it('displays multiple cleanings for the same day', () => {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const multipleCleanings: CleaningRecord[] = [
      {
        id: 'clean-005',
        roomId: 'room-101',
        employeeId: 'emp-001',
        date: tomorrow,
        startTime: '08:00',
        endTime: '08:45',
      },
      {
        id: 'clean-006',
        roomId: 'room-102',
        employeeId: 'emp-002',
        date: tomorrow,
        startTime: '09:00',
        endTime: '09:45',
      },
    ];

    render(
      <CleaningSchedule
        cleaningRecords={multipleCleanings}
        rooms={mockRooms}
        employees={mockEmployees}
      />
    );

    const room101Elements = screen.getAllByText('Hab. 101');
    const room102Elements = screen.getAllByText('Hab. 102');
    
    expect(room101Elements.length).toBeGreaterThan(0);
    expect(room102Elements.length).toBeGreaterThan(0);
  });
});
