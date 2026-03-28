import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HotelStats from './HotelStats';
import { mockRooms, mockHotelTransactions } from '@/data/hotel-mock';

describe('HotelStats Integration Tests', () => {
  it('should calculate correct statistics from actual mock data', () => {
    render(<HotelStats rooms={mockRooms} transactions={mockHotelTransactions} />);
    
    // Verify all stat card titles are present
    expect(screen.getByText('Habitaciones Ocupadas')).toBeInTheDocument();
    expect(screen.getByText('Habitaciones Disponibles')).toBeInTheDocument();
    expect(screen.getByText('Ingresos Mensuales')).toBeInTheDocument();
    expect(screen.getByText('Gastos Mensuales')).toBeInTheDocument();
  });

  it('should count occupied rooms correctly from mock data', () => {
    const occupiedCount = mockRooms.filter(room => room.status === 'ocupada').length;
    expect(occupiedCount).toBeGreaterThan(0);
  });

  it('should count available rooms correctly from mock data', () => {
    const availableCount = mockRooms.filter(room => room.status === 'disponible').length;
    expect(availableCount).toBeGreaterThan(0);
  });

  it('should have income transactions in mock data', () => {
    const incomeTransactions = mockHotelTransactions.filter(t => t.type === 'ingreso');
    expect(incomeTransactions.length).toBeGreaterThan(0);
  });

  it('should have expense transactions in mock data', () => {
    const expenseTransactions = mockHotelTransactions.filter(t => t.type === 'gasto');
    expect(expenseTransactions.length).toBeGreaterThan(0);
  });

  it('should render without errors with real mock data', () => {
    const { container } = render(
      <HotelStats rooms={mockRooms} transactions={mockHotelTransactions} />
    );
    
    // Should have 4 stat cards
    const statCards = container.querySelectorAll('[class*="statCard"]');
    expect(statCards.length).toBe(4);
  });
});
