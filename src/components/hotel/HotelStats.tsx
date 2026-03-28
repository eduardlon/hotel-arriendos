'use client';

import StatCard from '@/components/shared/StatCard';
import { Home, DoorOpen, DollarSign, TrendingDown } from 'lucide-react';
import type { Room, HotelTransaction } from '@/types';
import { formatCurrency } from '@/lib/format';
import styles from './HotelStats.module.css';

interface HotelStatsProps {
  rooms: Room[];
  transactions: HotelTransaction[];
}

export default function HotelStats({ rooms, transactions }: HotelStatsProps) {
  // Calculate occupied rooms count
  const occupiedRooms = rooms.filter(room => room.status === 'ocupada').length;

  // Calculate available rooms count
  const availableRooms = rooms.filter(room => room.status === 'disponible').length;

  // Calculate monthly income (current month)
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthlyIncome = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      return (
        t.type === 'ingreso' &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate monthly expenses (current month)
  const monthlyExpenses = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      return (
        t.type === 'gasto' &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Format currency values
  return (
    <div className={styles.grid}>
      <StatCard 
        title="Habitaciones Ocupadas" 
        value={occupiedRooms} 
        icon={Home}
      />
      <StatCard 
        title="Habitaciones Disponibles" 
        value={availableRooms} 
        icon={DoorOpen}
      />
      <StatCard 
        title="Ingresos Mensuales" 
        value={formatCurrency(monthlyIncome)} 
        icon={DollarSign}
      />
      <StatCard 
        title="Gastos Mensuales" 
        value={formatCurrency(monthlyExpenses)} 
        icon={TrendingDown}
      />
    </div>
  );
}
