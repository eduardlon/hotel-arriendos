'use client';

import { useState, useMemo } from 'react';
import type { Room } from '@/types';
import RoomCard from './RoomCard';
import styles from './RoomGrid.module.css';

interface RoomGridProps {
  rooms: Room[];
  onRoomClick?: (room: Room) => void;
}

export default function RoomGrid({ rooms, onRoomClick }: RoomGridProps) {
  const [statusFilter, setStatusFilter] = useState<Room['status'] | 'all'>('all');
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');
  const safeRooms = useMemo(() => rooms.filter((room): room is Room => Boolean(room)), [rooms]);

  // Get unique floors from rooms
  const floors = useMemo(() => {
    const uniqueFloors = Array.from(new Set(safeRooms.map(room => room.floor)));
    return uniqueFloors.sort((a, b) => a - b);
  }, [safeRooms]);

  // Filter rooms based on selected filters
  const filteredRooms = useMemo(() => {
    return safeRooms.filter(room => {
      const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
      const matchesFloor = floorFilter === 'all' || room.floor === floorFilter;
      return matchesStatus && matchesFloor;
    });
  }, [safeRooms, statusFilter, floorFilter]);

  return (
    <div className={styles.container}>
      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="status-filter" className={styles.filterLabel}>
            Estado:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Room['status'] | 'all')}
            className={styles.filterSelect}
          >
            <option value="all">Todos</option>
            <option value="disponible">Disponible</option>
            <option value="ocupada">Ocupada</option>
            <option value="limpieza">Limpieza</option>
            <option value="mantenimiento">Mantenimiento</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="floor-filter" className={styles.filterLabel}>
            Piso:
          </label>
          <select
            id="floor-filter"
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className={styles.filterSelect}
          >
            <option value="all">Todos</option>
            {floors.map(floor => (
              <option key={floor} value={floor}>
                Piso {floor}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Room Grid */}
      <div className={styles.grid}>
        {filteredRooms.map(room => (
          <RoomCard
            key={room.id}
            room={room}
            onClick={() => onRoomClick?.(room)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredRooms.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>
            No se encontraron habitaciones con los filtros seleccionados.
          </p>
        </div>
      )}
    </div>
  );
}
