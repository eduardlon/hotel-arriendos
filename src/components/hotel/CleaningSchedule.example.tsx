/**
 * Example usage of CleaningSchedule component
 * 
 * This file demonstrates how to use the CleaningSchedule component
 * with mock data from the hotel module.
 */

import CleaningSchedule from './CleaningSchedule';
import { mockCleaningRecords, mockRooms, mockEmployees } from '@/data/hotel-mock';

export default function CleaningScheduleExample() {
  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <CleaningSchedule
        cleaningRecords={mockCleaningRecords}
        rooms={mockRooms}
        employees={mockEmployees}
      />
    </div>
  );
}
