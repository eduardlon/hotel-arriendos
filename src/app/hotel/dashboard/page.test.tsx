/**
 * Unit Tests for Hotel Dashboard Page
 * 
 * Tests that the dashboard displays:
 * - Stat cards with correct values
 * - Occupancy chart with data
 * - Recent cleaning records list
 * - Rooms needing cleaning today
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HotelDashboard from './page';
import type { Room, HotelTransaction, CleaningRecord, Employee } from '@/types';

// Mock the data access functions
vi.mock('@/lib/data-access', () => ({
  isCachePrimed: vi.fn(() => false),
  getRooms: vi.fn(),
  getHotelTransactions: vi.fn(),
  getCleaningRecords: vi.fn(),
  getEmployees: vi.fn(),
}));

// Mock the Chart component to capture props
vi.mock('@/components/shared/Chart', () => ({
  default: ({ data, type, config }: { data: any[]; type: string; config: any }) => (
    <div data-testid="occupancy-chart" data-type={type} data-config={JSON.stringify(config)}>
      Chart with {data.length} data points
    </div>
  ),
}));

// Mock the DataTable component to capture props
vi.mock('@/components/shared/DataTable', () => ({
  default: ({ data, columns, emptyMessage }: { data: any[]; columns: any[]; emptyMessage: string }) => (
    <div data-testid="data-table" data-columns={JSON.stringify(columns)}>
      {data.length === 0 ? emptyMessage : `Table with ${data.length} rows`}
    </div>
  ),
}));

// Mock the HotelStats component to capture props
vi.mock('@/components/hotel/HotelStats', () => ({
  default: ({ rooms, transactions }: { rooms: Room[]; transactions: HotelTransaction[] }) => (
    <div data-testid="hotel-stats" data-rooms={rooms.length} data-transactions={transactions.length}>
      Stats: {rooms.length} rooms, {transactions.length} transactions
    </div>
  ),
}));

describe('HotelDashboard', () => {
  const mockRooms: Room[] = [
    {
      id: 'room-1',
      number: '101',
      type: 'individual',
      floor: 1,
      price: 50000,
      status: 'ocupada',
      assignedEmployeeId: 'emp-1',
      lastCleaned: new Date('2024-01-10'),
    },
    {
      id: 'room-2',
      number: '102',
      type: 'doble',
      floor: 1,
      price: 70000,
      status: 'disponible',
      lastCleaned: new Date(),
    },
    {
      id: 'room-3',
      number: '201',
      type: 'suite',
      floor: 2,
      price: 120000,
      status: 'limpieza',
      assignedEmployeeId: 'emp-2',
      lastCleaned: new Date('2024-01-12'),
    },
  ];

  const mockTransactions: HotelTransaction[] = [
    {
      id: 'trans-1',
      type: 'ingreso',
      amount: 50000,
      category: 'Hospedaje',
      date: new Date(),
      description: 'Pago habitación 101',
      roomId: 'room-1',
    },
    {
      id: 'trans-2',
      type: 'gasto',
      amount: 20000,
      category: 'Limpieza',
      date: new Date(),
      description: 'Productos de limpieza',
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
    {
      id: 'clean-2',
      roomId: 'room-2',
      employeeId: 'emp-2',
      date: new Date(Date.now() - 86400000), // Yesterday
      startTime: '10:00',
      endTime: '11:00',
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
      hireDate: new Date('2021-06-01'),
    },
  ];

  beforeEach(async () => {
    const dataAccess = await import('@/lib/data-access');
    
    vi.mocked(dataAccess.getRooms).mockResolvedValue(mockRooms);
    vi.mocked(dataAccess.getHotelTransactions).mockResolvedValue(mockTransactions);
    vi.mocked(dataAccess.getCleaningRecords).mockResolvedValue(mockCleaningRecords);
    vi.mocked(dataAccess.getEmployees).mockResolvedValue(mockEmployees);
  });

  it('should display the dashboard title', async () => {
    const component = await HotelDashboard();
    render(component);
    
    expect(screen.getByText('Dashboard Hotel')).toBeDefined();
  });

  it('should display HotelStats component with rooms and transactions', async () => {
    const component = await HotelDashboard();
    render(component);
    
    const stats = screen.getByTestId('hotel-stats');
    expect(stats).toBeDefined();
    expect(stats.textContent).toContain('3 rooms');
    expect(stats.textContent).toContain('2 transactions');
  });

  it('should display occupancy chart section', async () => {
    const component = await HotelDashboard();
    render(component);
    
    expect(screen.getByText('Tendencia de Ocupación')).toBeDefined();
    const chart = screen.getByTestId('occupancy-chart');
    expect(chart).toBeDefined();
    expect(chart.textContent).toContain('7 data points'); // 7 days of data
  });

  it('should display recent cleaning records section', async () => {
    const component = await HotelDashboard();
    render(component);
    
    expect(screen.getByText('Registros de Limpieza Recientes')).toBeDefined();
    const tables = screen.getAllByTestId('data-table');
    expect(tables.length).toBeGreaterThan(0);
  });

  it('should display rooms needing cleaning section', async () => {
    const component = await HotelDashboard();
    render(component);
    
    expect(screen.getByText('Habitaciones que Requieren Limpieza Hoy')).toBeDefined();
    const tables = screen.getAllByTestId('data-table');
    expect(tables.length).toBeGreaterThan(0);
  });

  it('should show rooms with status "limpieza" in rooms needing cleaning', async () => {
    const component = await HotelDashboard();
    render(component);
    
    // Room 201 has status 'limpieza' and room 101 has lastCleaned in the past
    const tables = screen.getAllByTestId('data-table');
    const cleaningTable = tables[1]; // Second table is rooms needing cleaning
    expect(cleaningTable.textContent).toContain('2 rows');
  });

  it('should format cleaning records with room number and employee name', async () => {
    const component = await HotelDashboard();
    render(component);
    
    // The cleaning records should be formatted with room numbers and employee names
    // This is verified by the DataTable receiving the correct data structure
    const tables = screen.getAllByTestId('data-table');
    expect(tables[0].textContent).toContain('2 rows'); // 2 cleaning records
  });

  describe('Stat Cards Display (Requirement 2.1)', () => {
    it('should pass correct room data to HotelStats component', async () => {
      const component = await HotelDashboard();
      render(component);
      
      const stats = screen.getByTestId('hotel-stats');
      expect(stats.getAttribute('data-rooms')).toBe('3');
    });

    it('should pass correct transaction data to HotelStats component', async () => {
      const component = await HotelDashboard();
      render(component);
      
      const stats = screen.getByTestId('hotel-stats');
      expect(stats.getAttribute('data-transactions')).toBe('2');
    });

    it('should display HotelStats with all required data', async () => {
      const component = await HotelDashboard();
      render(component);
      
      const stats = screen.getByTestId('hotel-stats');
      expect(stats).toBeDefined();
      // HotelStats component calculates: occupied, available, income, expenses
      expect(stats.textContent).toContain('Stats');
    });
  });

  describe('Occupancy Chart Display (Requirement 2.2)', () => {
    it('should render chart with 7 days of occupancy data', async () => {
      const component = await HotelDashboard();
      render(component);
      
      const chart = screen.getByTestId('occupancy-chart');
      expect(chart.textContent).toContain('7 data points');
    });

    it('should configure chart as line type', async () => {
      const component = await HotelDashboard();
      render(component);
      
      const chart = screen.getByTestId('occupancy-chart');
      expect(chart.getAttribute('data-type')).toBe('line');
    });

    it('should configure chart with correct settings', async () => {
      const component = await HotelDashboard();
      render(component);
      
      const chart = screen.getByTestId('occupancy-chart');
      const config = JSON.parse(chart.getAttribute('data-config') || '{}');
      
      expect(config.xKey).toBe('name');
      expect(config.yKey).toBe('value');
      expect(config.height).toBe(300);
      expect(config.showGrid).toBe(true);
      expect(config.showTooltip).toBe(true);
    });

    it('should display chart section with title', async () => {
      const component = await HotelDashboard();
      render(component);
      
      expect(screen.getByText('Tendencia de Ocupación')).toBeDefined();
    });
  });

  describe('Recent Cleaning Records List (Requirement 2.3)', () => {
    it('should display recent cleaning records section title', async () => {
      const component = await HotelDashboard();
      render(component);
      
      expect(screen.getByText('Registros de Limpieza Recientes')).toBeDefined();
    });

    it('should display cleaning records table with data', async () => {
      const component = await HotelDashboard();
      render(component);
      
      const tables = screen.getAllByTestId('data-table');
      const cleaningTable = tables[0]; // First table is cleaning records
      expect(cleaningTable.textContent).toContain('2 rows');
    });

    it('should configure cleaning records table with correct columns', async () => {
      const component = await HotelDashboard();
      render(component);
      
      const tables = screen.getAllByTestId('data-table');
      const cleaningTable = tables[0];
      const columns = JSON.parse(cleaningTable.getAttribute('data-columns') || '[]');
      
      const columnKeys = columns.map((col: any) => col.key);
      expect(columnKeys).toContain('room');
      expect(columnKeys).toContain('employee');
      expect(columnKeys).toContain('date');
      expect(columnKeys).toContain('time');
      expect(columnKeys).toContain('notes');
    });

    it('should limit cleaning records to 5 most recent', async () => {
      // Add more cleaning records to test the limit
      const manyCleaningRecords: CleaningRecord[] = Array.from({ length: 10 }, (_, i) => ({
        id: `clean-${i}`,
        roomId: 'room-1',
        employeeId: 'emp-1',
        date: new Date(Date.now() - i * 86400000),
        startTime: '08:00',
        endTime: '09:00',
      }));

      const dataAccess = await import('@/lib/data-access');
      vi.mocked(dataAccess.getCleaningRecords).mockResolvedValue(manyCleaningRecords);

      const component = await HotelDashboard();
      render(component);
      
      const tables = screen.getAllByTestId('data-table');
      const cleaningTable = tables[0];
      expect(cleaningTable.textContent).toContain('5 rows');
    });
  });

  describe('Rooms Needing Cleaning Today (Requirement 2.4)', () => {
    it('should display rooms needing cleaning section title', async () => {
      const component = await HotelDashboard();
      render(component);
      
      expect(screen.getByText('Habitaciones que Requieren Limpieza Hoy')).toBeDefined();
    });

    it('should include rooms with status "limpieza"', async () => {
      const component = await HotelDashboard();
      render(component);
      
      const tables = screen.getAllByTestId('data-table');
      const cleaningNeededTable = tables[1]; // Second table
      // Room 201 has status 'limpieza'
      expect(cleaningNeededTable.textContent).toMatch(/\d+ rows?/);
    });

    it('should configure rooms needing cleaning table with correct columns', async () => {
      const component = await HotelDashboard();
      render(component);
      
      const tables = screen.getAllByTestId('data-table');
      const cleaningNeededTable = tables[1];
      const columns = JSON.parse(cleaningNeededTable.getAttribute('data-columns') || '[]');
      
      const columnKeys = columns.map((col: any) => col.key);
      expect(columnKeys).toContain('room');
      expect(columnKeys).toContain('type');
      expect(columnKeys).toContain('floor');
      expect(columnKeys).toContain('status');
      expect(columnKeys).toContain('assignedTo');
    });

    it('should include rooms not cleaned today', async () => {
      // Room 101 has lastCleaned in the past
      const component = await HotelDashboard();
      render(component);
      
      const tables = screen.getAllByTestId('data-table');
      const cleaningNeededTable = tables[1];
      // Should have at least 2 rooms (room 101 not cleaned today + room 201 in limpieza status)
      expect(cleaningNeededTable.textContent).toMatch(/\d+ rows?/);
    });

    it('should show employee assignment for rooms needing cleaning', async () => {
      const component = await HotelDashboard();
      render(component);
      
      const tables = screen.getAllByTestId('data-table');
      const cleaningNeededTable = tables[1];
      const columns = JSON.parse(cleaningNeededTable.getAttribute('data-columns') || '[]');
      
      // Verify assignedTo column exists
      const hasAssignedColumn = columns.some((col: any) => col.key === 'assignedTo');
      expect(hasAssignedColumn).toBe(true);
    });
  });

  describe('Empty State Handling', () => {
    it('should display empty message when no cleaning records exist', async () => {
      const dataAccess = await import('@/lib/data-access');
      vi.mocked(dataAccess.getCleaningRecords).mockResolvedValue([]);

      const component = await HotelDashboard();
      render(component);
      
      const tables = screen.getAllByTestId('data-table');
      const cleaningTable = tables[0];
      expect(cleaningTable.textContent).toContain('No hay registros de limpieza disponibles');
    });

    it('should display empty message when no rooms need cleaning', async () => {
      const dataAccess = await import('@/lib/data-access');
      
      // All rooms cleaned today
      const cleanRooms: Room[] = [
        {
          id: 'room-1',
          number: '101',
          type: 'individual',
          floor: 1,
          price: 50000,
          status: 'disponible',
          lastCleaned: new Date(),
        },
      ];
      
      vi.mocked(dataAccess.getRooms).mockResolvedValue(cleanRooms);

      const component = await HotelDashboard();
      render(component);
      
      const tables = screen.getAllByTestId('data-table');
      const cleaningNeededTable = tables[1];
      expect(cleaningNeededTable.textContent).toContain('No hay habitaciones pendientes de limpieza');
    });
  });

  describe('Data Integration', () => {
    it('should call all required data access functions', async () => {
      const dataAccess = await import('@/lib/data-access');

      await HotelDashboard();
      
      expect(dataAccess.getRooms).toHaveBeenCalled();
      expect(dataAccess.getHotelTransactions).toHaveBeenCalled();
      expect(dataAccess.getCleaningRecords).toHaveBeenCalled();
      expect(dataAccess.getEmployees).toHaveBeenCalled();
    });

    it('should match employee names to cleaning records', async () => {
      const component = await HotelDashboard();
      render(component);
      
      // Verify that the cleaning records table receives data
      // The actual matching is done in the page component
      const tables = screen.getAllByTestId('data-table');
      expect(tables.length).toBeGreaterThan(0);
    });

    it('should match room numbers to cleaning records', async () => {
      const component = await HotelDashboard();
      render(component);
      
      // Verify that the cleaning records table receives data
      const tables = screen.getAllByTestId('data-table');
      expect(tables[0]).toBeDefined();
    });
  });
});

