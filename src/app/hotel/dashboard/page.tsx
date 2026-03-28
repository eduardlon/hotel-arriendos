import { getRooms, getHotelTransactions, getCleaningRecords, getEmployees } from '@/lib/data-access';
import HotelStats from '@/components/hotel/HotelStats';
import Chart from '@/components/shared/Chart';
import DataTable, { type Column } from '@/components/shared/DataTable';
import type { Room, CleaningRecord, Employee } from '@/types';
import { formatDate, formatDayShort, formatDayNumber } from '@/lib/format';
import styles from './page.module.css';

export default async function HotelDashboard() {
  // Fetch all required data
  const rooms = await getRooms();
  const transactions = await getHotelTransactions();
  const cleaningRecords = await getCleaningRecords();
  const employees = await getEmployees();

  // Prepare occupancy chart data (last 7 days)
  const today = new Date();
  const occupancyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    
    // For demo purposes, calculate occupancy based on current status
    // In a real app, this would come from historical data
    const occupiedCount = rooms.filter(r => r.status === 'ocupada').length;
    const totalRooms = rooms.length;
    const occupancyRate = Math.round((occupiedCount / totalRooms) * 100);
    
    return {
      name: `${formatDayShort(date)} ${formatDayNumber(date)}`,
      value: occupancyRate,
    };
  });

  // Get recent cleaning records (last 5)
  const recentCleaningRecords = cleaningRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Prepare cleaning records table data
  const cleaningTableData = recentCleaningRecords.map(record => {
    const room = rooms.find(r => r.id === record.roomId);
    const employee = employees.find(e => e.id === record.employeeId);
    
    return {
      room: room?.number || 'N/A',
      employee: employee?.name || 'N/A',
      date: formatDate(record.date),
      time: `${record.startTime} - ${record.endTime}`,
      notes: record.notes || '-',
    };
  });

  const cleaningColumns: Column<typeof cleaningTableData[0]>[] = [
    { key: 'room', label: 'Habitación' },
    { key: 'employee', label: 'Empleado' },
    { key: 'date', label: 'Fecha' },
    { key: 'time', label: 'Horario' },
    { key: 'notes', label: 'Notas' },
  ];

  // Get rooms needing cleaning today
  const roomsNeedingCleaning = rooms.filter(room => {
    if (room.status === 'limpieza') return true;
    
    // Check if room hasn't been cleaned today
    if (room.lastCleaned) {
      const lastCleanedDate = new Date(room.lastCleaned);
      const todayStart = new Date(today.setHours(0, 0, 0, 0));
      return lastCleanedDate < todayStart;
    }
    
    return false;
  });

  const roomsCleaningData = roomsNeedingCleaning.map(room => {
    const assignedEmployee = employees.find(e => e.id === room.assignedEmployeeId);
    
    return {
      room: room.number,
      type: room.type,
      floor: `Piso ${room.floor}`,
      status: room.status === 'limpieza' ? 'En limpieza' : 'Pendiente',
      assignedTo: assignedEmployee?.name || 'Sin asignar',
    };
  });

  const roomsCleaningColumns: Column<typeof roomsCleaningData[0]>[] = [
    { key: 'room', label: 'Habitación' },
    { key: 'type', label: 'Tipo' },
    { key: 'floor', label: 'Piso' },
    { key: 'status', label: 'Estado' },
    { key: 'assignedTo', label: 'Asignado a' },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard Hotel</h1>

      {/* Stats Cards */}
      <HotelStats rooms={rooms} transactions={transactions} />

      {/* Occupancy Chart */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tendencia de Ocupación</h2>
        <div className={styles.card}>
          <Chart
            type="line"
            data={occupancyData}
            config={{
              xKey: 'name',
              yKey: 'value',
              height: 300,
              showGrid: true,
              showLegend: false,
              showTooltip: true,
            }}
          />
        </div>
      </section>

      {/* Recent Cleaning Records */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Registros de Limpieza Recientes</h2>
        <div className={styles.card}>
          <DataTable
            columns={cleaningColumns}
            data={cleaningTableData}
            emptyMessage="No hay registros de limpieza disponibles"
            itemsPerPage={5}
          />
        </div>
      </section>

      {/* Rooms Needing Cleaning Today */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Habitaciones que Requieren Limpieza Hoy</h2>
        <div className={styles.card}>
          <DataTable
            columns={roomsCleaningColumns}
            data={roomsCleaningData}
            emptyMessage="No hay habitaciones pendientes de limpieza"
            itemsPerPage={10}
          />
        </div>
      </section>
    </div>
  );
}
