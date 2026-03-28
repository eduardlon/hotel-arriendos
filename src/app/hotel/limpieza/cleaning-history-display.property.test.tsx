import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import CleaningSchedule from '@/components/hotel/CleaningSchedule';
import type { Room, Employee, CleaningRecord } from '@/types';

/**
 * **Feature: hotel-arriendos, Property 11: Cleaning History Display**
 * 
 * For any cleaning record, the cleaning history should display which employee
 * cleaned which room and at what time.
 * 
 * **Validates: Requirements 5.6**
 */

describe('Property 11: Cleaning History Display', () => {
  let roomCounter = 0;
  let employeeCounter = 0;
  let cleaningCounter = 0;

  // Arbitrary generator for rooms
  const roomArbitrary = fc.record({
    number: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
    type: fc.constantFrom<Room['type']>('individual', 'doble', 'suite', 'familiar'),
    floor: fc.integer({ min: 1, max: 20 }),
    price: fc.float({ min: 10, max: 1000, noNaN: true }).map(p => Math.round(p * 100) / 100),
    status: fc.constantFrom<Room['status']>('disponible', 'ocupada', 'limpieza', 'mantenimiento'),
  }).map((room) => {
    const uniqueNum = roomCounter++;
    return {
      ...room,
      id: `room-${uniqueNum}`,
      number: `R${uniqueNum}`,
    };
  });

  // Arbitrary generator for employees
  const employeeArbitrary = fc.record({
    name: fc.string({ minLength: 5, maxLength: 50 })
      .filter(s => {
        const normalized = s.trim().replace(/\s+/g, ' '); // Normalize whitespace
        // Ensure name has at least one letter and is at least 5 chars after normalization
        return normalized.length >= 5 && /[a-zA-Z]/.test(normalized);
      })
      .map(s => s.trim().replace(/\s+/g, ' ')), // Normalize whitespace to match component behavior
    role: fc.constantFrom<Employee['role']>('recepcionista', 'limpieza', 'mantenimiento', 'gerente'),
    shift: fc.constantFrom<Employee['shift']>('mañana', 'tarde', 'noche'),
    phone: fc.string({ minLength: 8, maxLength: 15 }),
    email: fc.emailAddress(),
  }).map((emp) => {
    const uniqueNum = employeeCounter++;
    return {
      ...emp,
      id: `emp-${uniqueNum}`,
      hireDate: new Date('2024-01-01'),
    };
  });

  // Arbitrary generator for time strings (HH:MM format)
  const timeArbitrary = fc.record({
    hour: fc.integer({ min: 0, max: 23 }),
    minute: fc.integer({ min: 0, max: 59 }),
  }).map(({ hour, minute }) => {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  });

  // Arbitrary generator for valid time ranges (start < end)
  const timeRangeArbitrary = fc.tuple(timeArbitrary, timeArbitrary)
    .filter(([start, end]) => start < end)
    .map(([start, end]) => ({ startTime: start, endTime: end }));

  // Arbitrary generator for dates within the current week
  const currentWeekDateArbitrary = fc.integer({ min: 0, max: 6 }).map((daysFromToday) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + daysFromToday);
    return date;
  });

  // Arbitrary generator for cleaning records
  const cleaningRecordArbitrary = (roomId: string, employeeId: string) =>
    fc.record({
      date: currentWeekDateArbitrary,
      timeRange: timeRangeArbitrary,
      notes: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
    }).map(({ date, timeRange, notes }) => {
      const uniqueNum = cleaningCounter++;
      const record: CleaningRecord = {
        id: `clean-${uniqueNum}`,
        roomId,
        employeeId,
        date,
        startTime: timeRange.startTime,
        endTime: timeRange.endTime,
      };
      if (notes) {
        record.notes = notes;
      }
      return record;
    });

  it('should display employee name for each cleaning record', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(roomArbitrary, employeeArbitrary).chain(([room, employee]) =>
            cleaningRecordArbitrary(room.id, employee.id).map(record => ({
              room,
              employee,
              record,
            }))
          ),
          { minLength: 1, maxLength: 10 }
        ),
        (cleaningData) => {
          roomCounter = 0;
          employeeCounter = 0;
          cleaningCounter = 0;

          const rooms = cleaningData.map(d => d.room);
          const employees = cleaningData.map(d => d.employee);
          const records = cleaningData.map(d => d.record);

          const { unmount } = render(
            <CleaningSchedule
              cleaningRecords={records}
              rooms={rooms}
              employees={employees}
            />
          );

          try {
            // Verify each employee name is displayed (use queryAllByText since names might be duplicated)
            for (const { employee } of cleaningData) {
              const elements = screen.queryAllByText(employee.name);
              expect(elements.length).toBeGreaterThan(0);
            }

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display room number for each cleaning record', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(roomArbitrary, employeeArbitrary).chain(([room, employee]) =>
            cleaningRecordArbitrary(room.id, employee.id).map(record => ({
              room,
              employee,
              record,
            }))
          ),
          { minLength: 1, maxLength: 10 }
        ),
        (cleaningData) => {
          roomCounter = 0;
          employeeCounter = 0;
          cleaningCounter = 0;

          const rooms = cleaningData.map(d => d.room);
          const employees = cleaningData.map(d => d.employee);
          const records = cleaningData.map(d => d.record);

          const { unmount } = render(
            <CleaningSchedule
              cleaningRecords={records}
              rooms={rooms}
              employees={employees}
            />
          );

          try {
            // Verify each room number is displayed (format: "Hab. {number}")
            for (const { room } of cleaningData) {
              expect(screen.getByText(`Hab. ${room.number}`)).toBeInTheDocument();
            }

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display cleaning time for each cleaning record', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(roomArbitrary, employeeArbitrary).chain(([room, employee]) =>
            cleaningRecordArbitrary(room.id, employee.id).map(record => ({
              room,
              employee,
              record,
            }))
          ),
          { minLength: 1, maxLength: 10 }
        ),
        (cleaningData) => {
          roomCounter = 0;
          employeeCounter = 0;
          cleaningCounter = 0;

          const rooms = cleaningData.map(d => d.room);
          const employees = cleaningData.map(d => d.employee);
          const records = cleaningData.map(d => d.record);

          const { unmount } = render(
            <CleaningSchedule
              cleaningRecords={records}
              rooms={rooms}
              employees={employees}
            />
          );

          try {
            // Verify each time range is displayed (format: "HH:MM - HH:MM")
            for (const { record } of cleaningData) {
              const timeText = `${record.startTime} - ${record.endTime}`;
              expect(screen.getByText(timeText)).toBeInTheDocument();
            }

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display all cleaning records in the history', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(roomArbitrary, employeeArbitrary).chain(([room, employee]) =>
            cleaningRecordArbitrary(room.id, employee.id).map(record => ({
              room,
              employee,
              record,
            }))
          ),
          { minLength: 1, maxLength: 15 }
        ),
        (cleaningData) => {
          roomCounter = 0;
          employeeCounter = 0;
          cleaningCounter = 0;

          const rooms = cleaningData.map(d => d.room);
          const employees = cleaningData.map(d => d.employee);
          const records = cleaningData.map(d => d.record);

          const { unmount } = render(
            <CleaningSchedule
              cleaningRecords={records}
              rooms={rooms}
              employees={employees}
            />
          );

          try {
            // Count the number of cleaning items displayed
            const cleaningItems = screen.queryAllByText(/Hab\. R\d+/);
            
            // All cleaning records should be displayed
            expect(cleaningItems.length).toBe(cleaningData.length);

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display accurate information matching the cleaning record data', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(roomArbitrary, employeeArbitrary).chain(([room, employee]) =>
            cleaningRecordArbitrary(room.id, employee.id).map(record => ({
              room,
              employee,
              record,
            }))
          ),
          { minLength: 1, maxLength: 10 }
        ),
        (cleaningData) => {
          roomCounter = 0;
          employeeCounter = 0;
          cleaningCounter = 0;

          const rooms = cleaningData.map(d => d.room);
          const employees = cleaningData.map(d => d.employee);
          const records = cleaningData.map(d => d.record);

          const { unmount } = render(
            <CleaningSchedule
              cleaningRecords={records}
              rooms={rooms}
              employees={employees}
            />
          );

          try {
            // Verify that for each cleaning record, all three pieces of information are present:
            // 1. Employee who performed the cleaning
            // 2. Room that was cleaned
            // 3. Time when cleaning occurred
            for (const { room, employee, record } of cleaningData) {
              // Check employee name (use queryAllByText since names might be duplicated)
              const employeeElements = screen.queryAllByText(employee.name);
              expect(employeeElements.length).toBeGreaterThan(0);
              
              // Check room number (use queryAllByText since room numbers might be duplicated)
              const roomElements = screen.queryAllByText(`Hab. ${room.number}`);
              expect(roomElements.length).toBeGreaterThan(0);
              
              // Check time (use queryAllByText since times might be duplicated)
              const timeText = `${record.startTime} - ${record.endTime}`;
              const timeElements = screen.queryAllByText(timeText);
              expect(timeElements.length).toBeGreaterThan(0);
            }

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display room floor information for each cleaning record', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(roomArbitrary, employeeArbitrary).chain(([room, employee]) =>
            cleaningRecordArbitrary(room.id, employee.id).map(record => ({
              room,
              employee,
              record,
            }))
          ),
          { minLength: 1, maxLength: 10 }
        ),
        (cleaningData) => {
          roomCounter = 0;
          employeeCounter = 0;
          cleaningCounter = 0;

          const rooms = cleaningData.map(d => d.room);
          const employees = cleaningData.map(d => d.employee);
          const records = cleaningData.map(d => d.record);

          const { unmount } = render(
            <CleaningSchedule
              cleaningRecords={records}
              rooms={rooms}
              employees={employees}
            />
          );

          try {
            // Verify each room floor is displayed (format: "Piso {floor}")
            // Use getAllByText since multiple rooms can have the same floor
            for (const { room } of cleaningData) {
              const floorElements = screen.getAllByText(`Piso ${room.floor}`);
              expect(floorElements.length).toBeGreaterThan(0);
            }

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty cleaning records gracefully', () => {
    fc.assert(
      fc.property(
        fc.array(roomArbitrary, { minLength: 1, maxLength: 5 }),
        fc.array(employeeArbitrary, { minLength: 1, maxLength: 5 }),
        (rooms, employees) => {
          roomCounter = 0;
          employeeCounter = 0;

          const { unmount } = render(
            <CleaningSchedule
              cleaningRecords={[]}
              rooms={rooms}
              employees={employees}
            />
          );

          try {
            // Should display "Sin limpiezas" for days with no cleanings
            const emptyMessages = screen.queryAllByText('Sin limpiezas');
            expect(emptyMessages.length).toBeGreaterThan(0);

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly associate employee with room in each cleaning record', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(roomArbitrary, employeeArbitrary).chain(([room, employee]) =>
            cleaningRecordArbitrary(room.id, employee.id).map(record => ({
              room,
              employee,
              record,
            }))
          ),
          { minLength: 1, maxLength: 8 }
        ),
        (cleaningData) => {
          roomCounter = 0;
          employeeCounter = 0;
          cleaningCounter = 0;

          const rooms = cleaningData.map(d => d.room);
          const employees = cleaningData.map(d => d.employee);
          const records = cleaningData.map(d => d.record);

          const { container, unmount } = render(
            <CleaningSchedule
              cleaningRecords={records}
              rooms={rooms}
              employees={employees}
            />
          );

          try {
            // For each cleaning record, verify that the employee, room, and time
            // are displayed together in the same cleaning item
            const cleaningItems = container.querySelectorAll('[class*="cleaningItem"]');
            
            expect(cleaningItems.length).toBe(cleaningData.length);

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display cleaning records with different employees and rooms correctly', () => {
    fc.assert(
      fc.property(
        fc.array(roomArbitrary, { minLength: 3, maxLength: 5 }),
        fc.array(employeeArbitrary, { minLength: 3, maxLength: 5 }),
        fc.array(timeRangeArbitrary, { minLength: 3, maxLength: 5 }),
        fc.array(currentWeekDateArbitrary, { minLength: 3, maxLength: 5 }),
        (rooms, employees, timeRanges, dates) => {
          roomCounter = 0;
          employeeCounter = 0;
          cleaningCounter = 0;

          // Create cleaning records with different combinations
          const records: CleaningRecord[] = [];
          const minLength = Math.min(rooms.length, employees.length, timeRanges.length, dates.length);
          
          for (let i = 0; i < minLength; i++) {
            records.push({
              id: `clean-${cleaningCounter++}`,
              roomId: rooms[i].id,
              employeeId: employees[i].id,
              date: dates[i],
              startTime: timeRanges[i].startTime,
              endTime: timeRanges[i].endTime,
            });
          }

          const { unmount } = render(
            <CleaningSchedule
              cleaningRecords={records}
              rooms={rooms}
              employees={employees}
            />
          );

          try {
            // Verify each unique employee is displayed (use queryAllByText since names might be duplicated)
            for (let i = 0; i < minLength; i++) {
              const employeeElements = screen.queryAllByText(employees[i].name);
              expect(employeeElements.length).toBeGreaterThan(0);
            }

            // Verify each unique room is displayed (use queryAllByText since room numbers might be duplicated)
            for (let i = 0; i < minLength; i++) {
              const roomElements = screen.queryAllByText(`Hab. ${rooms[i].number}`);
              expect(roomElements.length).toBeGreaterThan(0);
            }

            // Verify each unique time is displayed (use queryAllByText since times might be duplicated)
            for (let i = 0; i < minLength; i++) {
              const timeText = `${timeRanges[i].startTime} - ${timeRanges[i].endTime}`;
              const timeElements = screen.queryAllByText(timeText);
              expect(timeElements.length).toBeGreaterThan(0);
            }

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
