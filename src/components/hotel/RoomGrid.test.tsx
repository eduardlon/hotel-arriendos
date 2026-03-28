import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RoomGrid from './RoomGrid';
import type { Room } from '@/types';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await vi.importActual<typeof import('@/tests/utils/framer-motion-mock')>(
    '@/tests/utils/framer-motion-mock'
  );
  return createFramerMotionMock();
});

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
    floor: 1,
    price: 65000,
    status: 'ocupada',
  },
  {
    id: 'room-201',
    number: '201',
    type: 'individual',
    floor: 2,
    price: 48000,
    status: 'limpieza',
  },
  {
    id: 'room-202',
    number: '202',
    type: 'suite',
    floor: 2,
    price: 120000,
    status: 'mantenimiento',
  },
  {
    id: 'room-301',
    number: '301',
    type: 'familiar',
    floor: 3,
    price: 95000,
    status: 'disponible',
  },
];

describe('RoomGrid', () => {
  it('renders all rooms by default', () => {
    render(<RoomGrid rooms={mockRooms} />);
    
    // Check that all room numbers are displayed
    expect(screen.getByText('101')).toBeInTheDocument();
    expect(screen.getByText('102')).toBeInTheDocument();
    expect(screen.getByText('201')).toBeInTheDocument();
    expect(screen.getByText('202')).toBeInTheDocument();
    expect(screen.getByText('301')).toBeInTheDocument();
  });

  it('displays filter controls', () => {
    render(<RoomGrid rooms={mockRooms} />);
    
    // Check for status filter
    expect(screen.getByLabelText('Estado:')).toBeInTheDocument();
    
    // Check for floor filter
    expect(screen.getByLabelText('Piso:')).toBeInTheDocument();
  });

  it('filters rooms by status', () => {
    render(<RoomGrid rooms={mockRooms} />);
    
    const statusFilter = screen.getByLabelText('Estado:');
    
    // Filter by "disponible"
    fireEvent.change(statusFilter, { target: { value: 'disponible' } });
    
    // Should show only available rooms
    expect(screen.getByText('101')).toBeInTheDocument();
    expect(screen.getByText('301')).toBeInTheDocument();
    
    // Should not show occupied, cleaning, or maintenance rooms
    expect(screen.queryByText('102')).not.toBeInTheDocument();
    expect(screen.queryByText('201')).not.toBeInTheDocument();
    expect(screen.queryByText('202')).not.toBeInTheDocument();
  });

  it('filters rooms by floor', () => {
    render(<RoomGrid rooms={mockRooms} />);
    
    const floorFilter = screen.getByLabelText('Piso:');
    
    // Filter by floor 2
    fireEvent.change(floorFilter, { target: { value: '2' } });
    
    // Should show only floor 2 rooms
    expect(screen.getByText('201')).toBeInTheDocument();
    expect(screen.getByText('202')).toBeInTheDocument();
    
    // Should not show floor 1 or 3 rooms
    expect(screen.queryByText('101')).not.toBeInTheDocument();
    expect(screen.queryByText('102')).not.toBeInTheDocument();
    expect(screen.queryByText('301')).not.toBeInTheDocument();
  });

  it('filters rooms by both status and floor', () => {
    render(<RoomGrid rooms={mockRooms} />);
    
    const statusFilter = screen.getByLabelText('Estado:');
    const floorFilter = screen.getByLabelText('Piso:');
    
    // Filter by "disponible" and floor 1
    fireEvent.change(statusFilter, { target: { value: 'disponible' } });
    fireEvent.change(floorFilter, { target: { value: '1' } });
    
    // Should show only room 101 (available on floor 1)
    expect(screen.getByText('101')).toBeInTheDocument();
    
    // Should not show other rooms
    expect(screen.queryByText('102')).not.toBeInTheDocument();
    expect(screen.queryByText('201')).not.toBeInTheDocument();
    expect(screen.queryByText('202')).not.toBeInTheDocument();
    expect(screen.queryByText('301')).not.toBeInTheDocument();
  });

  it('shows empty state when no rooms match filters', () => {
    render(<RoomGrid rooms={mockRooms} />);
    
    const statusFilter = screen.getByLabelText('Estado:');
    const floorFilter = screen.getByLabelText('Piso:');
    
    // Filter by "limpieza" and floor 1 (no such room exists)
    fireEvent.change(statusFilter, { target: { value: 'limpieza' } });
    fireEvent.change(floorFilter, { target: { value: '1' } });
    
    // Should show empty state message
    expect(screen.getByText('No se encontraron habitaciones con los filtros seleccionados.')).toBeInTheDocument();
    
    // Should not show any room numbers
    expect(screen.queryByText('101')).not.toBeInTheDocument();
    expect(screen.queryByText('102')).not.toBeInTheDocument();
    expect(screen.queryByText('201')).not.toBeInTheDocument();
  });

  it('resets to show all rooms when filters are set to "all"', () => {
    render(<RoomGrid rooms={mockRooms} />);
    
    const statusFilter = screen.getByLabelText('Estado:');
    const floorFilter = screen.getByLabelText('Piso:');
    
    // Apply filters
    fireEvent.change(statusFilter, { target: { value: 'disponible' } });
    fireEvent.change(floorFilter, { target: { value: '1' } });
    
    // Reset filters
    fireEvent.change(statusFilter, { target: { value: 'all' } });
    fireEvent.change(floorFilter, { target: { value: 'all' } });
    
    // Should show all rooms again
    expect(screen.getByText('101')).toBeInTheDocument();
    expect(screen.getByText('102')).toBeInTheDocument();
    expect(screen.getByText('201')).toBeInTheDocument();
    expect(screen.getByText('202')).toBeInTheDocument();
    expect(screen.getByText('301')).toBeInTheDocument();
  });

  it('calls onRoomClick when a room card is clicked', () => {
    const onRoomClick = vi.fn();
    render(<RoomGrid rooms={mockRooms} onRoomClick={onRoomClick} />);
    
    // Click on room 101
    const room101 = screen.getByText('101').closest('div');
    fireEvent.click(room101!);
    
    // Should call onRoomClick with the room data
    expect(onRoomClick).toHaveBeenCalledWith(mockRooms[0]);
  });

  it('displays all unique floors in floor filter', () => {
    render(<RoomGrid rooms={mockRooms} />);
    
    const floorFilter = screen.getByLabelText('Piso:');
    
    // Check that all floor options are present
    expect(floorFilter).toContainHTML('<option value="all">Todos</option>');
    expect(floorFilter).toContainHTML('<option value="1">Piso 1</option>');
    expect(floorFilter).toContainHTML('<option value="2">Piso 2</option>');
    expect(floorFilter).toContainHTML('<option value="3">Piso 3</option>');
  });

  it('handles empty rooms array', () => {
    render(<RoomGrid rooms={[]} />);
    
    // Should show empty state
    expect(screen.getByText('No se encontraron habitaciones con los filtros seleccionados.')).toBeInTheDocument();
  });

  it('displays all status options in status filter', () => {
    render(<RoomGrid rooms={mockRooms} />);
    
    const statusFilter = screen.getByLabelText('Estado:');
    
    // Check that all status options are present
    expect(statusFilter).toContainHTML('<option value="all">Todos</option>');
    expect(statusFilter).toContainHTML('<option value="disponible">Disponible</option>');
    expect(statusFilter).toContainHTML('<option value="ocupada">Ocupada</option>');
    expect(statusFilter).toContainHTML('<option value="limpieza">Limpieza</option>');
    expect(statusFilter).toContainHTML('<option value="mantenimiento">Mantenimiento</option>');
  });
});



