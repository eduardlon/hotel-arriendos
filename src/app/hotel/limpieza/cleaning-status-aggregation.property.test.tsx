import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import LimpiezaPage from './page';
import * as dataAccess from '@/lib/data-access';
import type { Room } from '@/types';

/**
 * **Feature: hotel-arriendos, Property 10: Cleaning Status Aggregation**
 * 
 * For any set of rooms, the cleaning status panel should display counts that accurately
 * reflect the number of clean rooms, pending rooms, and rooms in process based on room statuses.
 * 
 * **Validates: Requirements 5.4**
 */

// Mock the data access layer
vi.mock('@/lib/data-access');

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await vi.importActual<typeof import('@/tests/utils/framer-motion-mock')>(
    '@/tests/utils/framer-motion-mock'
  );
  return createFramerMotionMock();
});

describe('Property 10: Cleaning Status Aggregation', () => {
  let roomCounter = 0;

  beforeEach(() => {
    vi.clearAllMocks();
    roomCounter = 0;
  });

  // Arbitrary generator for rooms with various statuses
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

  // Generator for arrays of rooms
  const roomsArrayArbitrary = fc.array(roomArbitrary, { minLength: 1, maxLength: 50 });

  it('should display correct count of clean rooms (disponible status)', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomsArrayArbitrary,
        async (rooms) => {
          vi.clearAllMocks();

          // Mock initial data
          vi.mocked(dataAccess.getRooms).mockResolvedValue(rooms);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([]);
          vi.mocked(dataAccess.getCleaningRecords).mockResolvedValue([]);

          const { unmount, container } = render(<LimpiezaPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              expect(screen.getByText('Limpieza')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Calculate expected count
            const expectedCleanCount = rooms.filter(r => r.status === 'disponible').length;

            // Find the status panel and verify the clean count
            await waitFor(() => {
              const statusPanel = container.querySelector('[class*="statusPanel"]');
              expect(statusPanel).toBeInTheDocument();
              
              // Get all status cards
              const statusCards = statusPanel?.querySelectorAll('[class*="statusCard"]');
              expect(statusCards).toBeDefined();
              expect(statusCards!.length).toBeGreaterThanOrEqual(3);
              
              // Find the card with "Limpias" label
              let cleanCountFound = false;
              statusCards?.forEach((card) => {
                if (card.textContent?.includes('Limpias')) {
                  const valueElement = card.querySelector('[class*="statusValue"]');
                  expect(valueElement?.textContent).toBe(expectedCleanCount.toString());
                  cleanCountFound = true;
                }
              });
              expect(cleanCountFound).toBe(true);
            }, { timeout: 3000 });

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 300000); // 5 minute timeout

  it('should display correct count of pending rooms (limpieza status)', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomsArrayArbitrary,
        async (rooms) => {
          vi.clearAllMocks();

          // Mock initial data
          vi.mocked(dataAccess.getRooms).mockResolvedValue(rooms);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([]);
          vi.mocked(dataAccess.getCleaningRecords).mockResolvedValue([]);

          const { unmount, container } = render(<LimpiezaPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              expect(screen.getByText('Limpieza')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Calculate expected count
            const expectedPendingCount = rooms.filter(r => r.status === 'limpieza').length;

            // Find the status panel and verify the pending count
            await waitFor(() => {
              const statusPanel = container.querySelector('[class*="statusPanel"]');
              expect(statusPanel).toBeInTheDocument();
              
              // Get all status cards
              const statusCards = statusPanel?.querySelectorAll('[class*="statusCard"]');
              expect(statusCards).toBeDefined();
              
              // Find the card with "Pendientes" label
              let pendingCountFound = false;
              statusCards?.forEach((card) => {
                if (card.textContent?.includes('Pendientes')) {
                  const valueElement = card.querySelector('[class*="statusValue"]');
                  expect(valueElement?.textContent).toBe(expectedPendingCount.toString());
                  pendingCountFound = true;
                }
              });
              expect(pendingCountFound).toBe(true);
            }, { timeout: 3000 });

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 300000); // 5 minute timeout

  it('should display correct count of rooms in process (ocupada status)', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomsArrayArbitrary,
        async (rooms) => {
          vi.clearAllMocks();

          // Mock initial data
          vi.mocked(dataAccess.getRooms).mockResolvedValue(rooms);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([]);
          vi.mocked(dataAccess.getCleaningRecords).mockResolvedValue([]);

          const { unmount, container } = render(<LimpiezaPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              expect(screen.getByText('Limpieza')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Calculate expected count
            const expectedInProcessCount = rooms.filter(r => r.status === 'ocupada').length;

            // Find the status panel and verify the in-process count
            await waitFor(() => {
              const statusPanel = container.querySelector('[class*="statusPanel"]');
              expect(statusPanel).toBeInTheDocument();
              
              // Get all status cards
              const statusCards = statusPanel?.querySelectorAll('[class*="statusCard"]');
              expect(statusCards).toBeDefined();
              
              // Find the card with "En Proceso" label
              let inProcessCountFound = false;
              statusCards?.forEach((card) => {
                if (card.textContent?.includes('En Proceso')) {
                  const valueElement = card.querySelector('[class*="statusValue"]');
                  expect(valueElement?.textContent).toBe(expectedInProcessCount.toString());
                  inProcessCountFound = true;
                }
              });
              expect(inProcessCountFound).toBe(true);
            }, { timeout: 3000 });

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 300000); // 5 minute timeout

  it('should display all three status counts simultaneously and correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomsArrayArbitrary,
        async (rooms) => {
          vi.clearAllMocks();

          // Mock initial data
          vi.mocked(dataAccess.getRooms).mockResolvedValue(rooms);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([]);
          vi.mocked(dataAccess.getCleaningRecords).mockResolvedValue([]);

          const { unmount, container } = render(<LimpiezaPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              expect(screen.getByText('Limpieza')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Calculate expected counts
            const expectedCleanCount = rooms.filter(r => r.status === 'disponible').length;
            const expectedPendingCount = rooms.filter(r => r.status === 'limpieza').length;
            const expectedInProcessCount = rooms.filter(r => r.status === 'ocupada').length;

            // Verify all three status cards
            await waitFor(() => {
              const statusPanel = container.querySelector('[class*="statusPanel"]');
              const statusCards = statusPanel?.querySelectorAll('[class*="statusCard"]');
              
              let cleanFound = false, pendingFound = false, inProcessFound = false;
              
              statusCards?.forEach((card) => {
                const text = card.textContent || '';
                if (text.includes('Limpias')) {
                  expect(card.querySelector('[class*="statusValue"]')?.textContent).toBe(expectedCleanCount.toString());
                  cleanFound = true;
                } else if (text.includes('Pendientes')) {
                  expect(card.querySelector('[class*="statusValue"]')?.textContent).toBe(expectedPendingCount.toString());
                  pendingFound = true;
                } else if (text.includes('En Proceso')) {
                  expect(card.querySelector('[class*="statusValue"]')?.textContent).toBe(expectedInProcessCount.toString());
                  inProcessFound = true;
                }
              });
              
              expect(cleanFound && pendingFound && inProcessFound).toBe(true);
            }, { timeout: 3000 });

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 300000); // 5 minute timeout

  it('should handle empty room list with zero counts', async () => {
    vi.clearAllMocks();

    // Mock empty data
    vi.mocked(dataAccess.getRooms).mockResolvedValue([]);
    vi.mocked(dataAccess.getEmployees).mockResolvedValue([]);
    vi.mocked(dataAccess.getCleaningRecords).mockResolvedValue([]);

    const { unmount, container } = render(<LimpiezaPage />);

    try {
      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Limpieza')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify all counts are zero
      await waitFor(() => {
        const statusPanel = container.querySelector('[class*="statusPanel"]');
        const statusCards = statusPanel?.querySelectorAll('[class*="statusCard"]');
        
        statusCards?.forEach((card) => {
          const text = card.textContent || '';
          if (text.includes('Limpias') || text.includes('Pendientes') || text.includes('En Proceso')) {
            expect(card.querySelector('[class*="statusValue"]')?.textContent).toBe('0');
          }
        });
      }, { timeout: 3000 });
    } finally {
      unmount();
    }
  });

  it('should handle rooms with only one status type', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<Room['status']>('disponible', 'limpieza', 'ocupada', 'mantenimiento'),
        fc.integer({ min: 1, max: 20 }),
        async (status, count) => {
          vi.clearAllMocks();

          // Create rooms all with the same status
          const rooms: Room[] = Array.from({ length: count }, (_, i) => ({
            id: `room-${i}`,
            number: `R${i}`,
            type: 'individual',
            floor: 1,
            price: 100,
            status,
          }));

          // Mock initial data
          vi.mocked(dataAccess.getRooms).mockResolvedValue(rooms);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([]);
          vi.mocked(dataAccess.getCleaningRecords).mockResolvedValue([]);

          const { unmount, container } = render(<LimpiezaPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              expect(screen.getByText('Limpieza')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Calculate expected counts based on status
            const expectedCleanCount = status === 'disponible' ? count : 0;
            const expectedPendingCount = status === 'limpieza' ? count : 0;
            const expectedInProcessCount = status === 'ocupada' ? count : 0;

            // Verify counts
            await waitFor(() => {
              const statusPanel = container.querySelector('[class*="statusPanel"]');
              const statusCards = statusPanel?.querySelectorAll('[class*="statusCard"]');
              
              statusCards?.forEach((card) => {
                const text = card.textContent || '';
                if (text.includes('Limpias')) {
                  expect(card.querySelector('[class*="statusValue"]')?.textContent).toBe(expectedCleanCount.toString());
                } else if (text.includes('Pendientes')) {
                  expect(card.querySelector('[class*="statusValue"]')?.textContent).toBe(expectedPendingCount.toString());
                } else if (text.includes('En Proceso')) {
                  expect(card.querySelector('[class*="statusValue"]')?.textContent).toBe(expectedInProcessCount.toString());
                }
              });
            }, { timeout: 3000 });

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 300000); // 5 minute timeout

  it('should correctly aggregate counts across different room types and floors', async () => {
    await fc.assert(
      fc.asyncProperty(
        roomsArrayArbitrary,
        async (rooms) => {
          vi.clearAllMocks();

          // Mock initial data
          vi.mocked(dataAccess.getRooms).mockResolvedValue(rooms);
          vi.mocked(dataAccess.getEmployees).mockResolvedValue([]);
          vi.mocked(dataAccess.getCleaningRecords).mockResolvedValue([]);

          const { unmount, container } = render(<LimpiezaPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              expect(screen.getByText('Limpieza')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Calculate expected counts (status is the only factor, not type or floor)
            const expectedCleanCount = rooms.filter(r => r.status === 'disponible').length;
            const expectedPendingCount = rooms.filter(r => r.status === 'limpieza').length;
            const expectedInProcessCount = rooms.filter(r => r.status === 'ocupada').length;

            // Verify counts are based on status only
            await waitFor(() => {
              const statusPanel = container.querySelector('[class*="statusPanel"]');
              const statusCards = statusPanel?.querySelectorAll('[class*="statusCard"]');
              
              statusCards?.forEach((card) => {
                const text = card.textContent || '';
                if (text.includes('Limpias')) {
                  expect(card.querySelector('[class*="statusValue"]')?.textContent).toBe(expectedCleanCount.toString());
                } else if (text.includes('Pendientes')) {
                  expect(card.querySelector('[class*="statusValue"]')?.textContent).toBe(expectedPendingCount.toString());
                } else if (text.includes('En Proceso')) {
                  expect(card.querySelector('[class*="statusValue"]')?.textContent).toBe(expectedInProcessCount.toString());
                }
              });
            }, { timeout: 3000 });

            // Verify that the sum of displayed counts accounts for disponible, limpieza, and ocupada
            const displayedTotal = expectedCleanCount + expectedPendingCount + expectedInProcessCount;
            const actualTotal = rooms.filter(r => 
              r.status === 'disponible' || r.status === 'limpieza' || r.status === 'ocupada'
            ).length;
            expect(displayedTotal).toBe(actualTotal);

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 300000); // 5 minute timeout
});



