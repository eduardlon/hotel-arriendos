'use client';

import { useMemo } from 'react';
import { Calendar, User } from 'lucide-react';
import type { CleaningRecord, Room, Employee } from '@/types';
import { formatDayNumber, formatDayShort } from '@/lib/format';
import styles from './CleaningSchedule.module.css';

interface CleaningScheduleProps {
  cleaningRecords: CleaningRecord[];
  rooms: Room[];
  employees: Employee[];
}

interface DaySchedule {
  date: Date;
  dayName: string;
  cleanings: Array<{
    record: CleaningRecord;
    room: Room;
    employee: Employee;
  }>;
}

export default function CleaningSchedule({
  cleaningRecords,
  rooms,
  employees,
}: CleaningScheduleProps) {
  // Generate the current week (7 days starting from today)
  const weekSchedule = useMemo<DaySchedule[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: DaySchedule[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Filter cleaning records for this day
      const dayCleanings = cleaningRecords
        .filter((record) => {
          const recordDate = new Date(record.date);
          recordDate.setHours(0, 0, 0, 0);
          return recordDate.getTime() === date.getTime();
        })
        .map((record) => {
          const room = rooms.find((r) => r.id === record.roomId);
          const employee = employees.find((e) => e.id === record.employeeId);
          return {
            record,
            room: room!,
            employee: employee!,
          };
        })
        .filter((item) => item.room && item.employee);

      days.push({
        date,
        dayName: formatDayShort(date),
        cleanings: dayCleanings,
      });
    }

    return days;
  }, [cleaningRecords, rooms, employees]);

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Calendar className={styles.headerIcon} size={24} />
        <h2 className={styles.title}>Calendario de Limpieza Semanal</h2>
      </div>

      <div className={styles.weekGrid}>
        {weekSchedule.map((day, index) => (
          <div
            key={index}
            className={`${styles.dayColumn} ${isToday(day.date) ? styles.today : ''}`}
          >
            <div className={styles.dayHeader}>
              <span className={styles.dayName}>{day.dayName}</span>
              <span className={styles.dayDate}>{formatDayNumber(day.date)}</span>
            </div>

            <div className={styles.cleaningsList}>
              {day.cleanings.length > 0 ? (
                day.cleanings.map((cleaning, idx) => (
                  <div key={idx} className={styles.cleaningItem}>
                    <div className={styles.roomInfo}>
                      <span className={styles.roomNumber}>Hab. {cleaning.room.number}</span>
                      <span className={styles.roomFloor}>Piso {cleaning.room.floor}</span>
                    </div>

                    <div className={styles.employeeInfo}>
                      <User className={styles.employeeIcon} size={14} />
                      <span className={styles.employeeName}>{cleaning.employee.name}</span>
                    </div>

                    <div className={styles.timeInfo}>
                      <span className={styles.time}>
                        {cleaning.record.startTime} - {cleaning.record.endTime}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyDay}>
                  <span className={styles.emptyText}>Sin limpiezas</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
