/**
 * Performance Test for Hotel Dashboard
 * 
 * Verifies that the dashboard loads within 500ms as specified in Requirement 2.5
 * 
 * **Validates: Requirement 2.5**
 */

import { describe, it, expect } from 'vitest';
import { getRooms, getHotelTransactions, getCleaningRecords, getEmployees } from '@/lib/data-access';

describe('Hotel Dashboard Performance', () => {
  it('should load all dashboard data within 500ms', async () => {
    const startTime = performance.now();
    
    // Fetch all data required for the dashboard
    await Promise.all([
      getRooms(),
      getHotelTransactions(),
      getCleaningRecords(),
      getEmployees(),
    ]);
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    // Verify load time is under 500ms
    expect(loadTime).toBeLessThan(500);
  });

  it('should fetch rooms data quickly', async () => {
    const startTime = performance.now();
    const rooms = await getRooms();
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100);
    expect(rooms.length).toBeGreaterThan(0);
  });

  it('should fetch transactions data quickly', async () => {
    const startTime = performance.now();
    const transactions = await getHotelTransactions();
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100);
    expect(transactions.length).toBeGreaterThan(0);
  });

  it('should fetch cleaning records data quickly', async () => {
    const startTime = performance.now();
    const records = await getCleaningRecords();
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100);
    expect(records.length).toBeGreaterThan(0);
  });

  it('should fetch employees data quickly', async () => {
    const startTime = performance.now();
    const employees = await getEmployees();
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100);
    expect(employees.length).toBeGreaterThan(0);
  });
});
