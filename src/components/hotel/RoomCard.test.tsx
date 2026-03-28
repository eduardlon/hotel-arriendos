import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoomCard from './RoomCard';
import type { Room } from '@/types';

describe('RoomCard', () => {
  const mockRoom: Room = {
    id: '1',
    number: '101',
    type: 'doble',
    floor: 1,
    price: 50000,
    status: 'disponible',
  };

  it('displays room number', () => {
    render(<RoomCard room={mockRoom} />);
    expect(screen.getByText('101')).toBeInTheDocument();
  });

  it('displays room type in Spanish', () => {
    render(<RoomCard room={mockRoom} />);
    expect(screen.getByText(/Doble/)).toBeInTheDocument();
  });

  it('displays floor number', () => {
    render(<RoomCard room={mockRoom} />);
    expect(screen.getByText(/Piso 1/)).toBeInTheDocument();
  });

  it('displays formatted price', () => {
    render(<RoomCard room={mockRoom} />);
    expect(screen.getByText(/50\.000/)).toBeInTheDocument();
  });

  it('displays room status', () => {
    render(<RoomCard room={mockRoom} />);
    expect(screen.getByText('disponible')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<RoomCard room={mockRoom} onClick={handleClick} />);
    
    const card = screen.getByText('101').closest('div')?.parentElement;
    if (card) {
      await user.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    }
  });

  it('displays all room types correctly', () => {
    const roomTypes: Array<Room['type']> = ['individual', 'doble', 'suite', 'familiar'];
    const expectedLabels = ['Individual', 'Doble', 'Suite', 'Familiar'];

    roomTypes.forEach((type, index) => {
      const room = { ...mockRoom, type };
      const { unmount } = render(<RoomCard room={room} />);
      expect(screen.getByText(new RegExp(expectedLabels[index]))).toBeInTheDocument();
      unmount();
    });
  });

  it('displays all room statuses correctly', () => {
    const statuses: Array<Room['status']> = ['disponible', 'ocupada', 'limpieza', 'mantenimiento'];

    statuses.forEach((status) => {
      const room = { ...mockRoom, status };
      const { unmount } = render(<RoomCard room={room} />);
      expect(screen.getByText(status)).toBeInTheDocument();
      unmount();
    });
  });

  it('applies correct CSS class for disponible status', () => {
    const room = { ...mockRoom, status: 'disponible' as const };
    const { container } = render(<RoomCard room={room} />);
    const card = container.querySelector('[class*="status-disponible"]');
    expect(card).toBeInTheDocument();
  });

  it('applies correct CSS class for ocupada status', () => {
    const room = { ...mockRoom, status: 'ocupada' as const };
    const { container } = render(<RoomCard room={room} />);
    const card = container.querySelector('[class*="status-ocupada"]');
    expect(card).toBeInTheDocument();
  });

  it('applies correct CSS class for limpieza status', () => {
    const room = { ...mockRoom, status: 'limpieza' as const };
    const { container } = render(<RoomCard room={room} />);
    const card = container.querySelector('[class*="status-limpieza"]');
    expect(card).toBeInTheDocument();
  });

  it('applies correct CSS class for mantenimiento status', () => {
    const room = { ...mockRoom, status: 'mantenimiento' as const };
    const { container } = render(<RoomCard room={room} />);
    const card = container.querySelector('[class*="status-mantenimiento"]');
    expect(card).toBeInTheDocument();
  });
});
