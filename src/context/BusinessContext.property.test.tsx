import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BusinessProvider, useBusinessContext } from './BusinessContext';
import type { BusinessContext } from '@/types';

/**
 * **Feature: hotel-arriendos, Property 1: Business Context Switching**
 * 
 * For any business context (Hotel or Arriendos), when the user toggles the business switcher,
 * the application should update the context, redirect to the appropriate dashboard, update the
 * sidebar navigation with context-specific menu items, and persist the selection across page
 * navigations within the session.
 * 
 * **Validates: Requirements 1.2, 1.3, 1.4, 1.5**
 */
describe('Property 1: Business Context Switching', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  // Arbitrary generator for business context
  const businessContextArbitrary = fc.constantFrom<BusinessContext>('hotel', 'arriendos');

  it('should update context when toggling from any business context', () => {
    fc.assert(
      fc.property(
        businessContextArbitrary,
        (initialBusiness) => {
          const { result } = renderHook(() => useBusinessContext(), {
            wrapper: BusinessProvider,
          });

          // Set initial business context
          act(() => {
            result.current.setBusiness(initialBusiness);
          });

          expect(result.current.currentBusiness).toBe(initialBusiness);

          // Toggle business context
          act(() => {
            result.current.toggleBusiness();
          });

          // Verify context switched to the opposite business
          const expectedBusiness = initialBusiness === 'hotel' ? 'arriendos' : 'hotel';
          expect(result.current.currentBusiness).toBe(expectedBusiness);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should persist business context selection across multiple operations', () => {
    fc.assert(
      fc.property(
        fc.array(businessContextArbitrary, { minLength: 1, maxLength: 10 }),
        (businessSequence) => {
          const { result } = renderHook(() => useBusinessContext(), {
            wrapper: BusinessProvider,
          });

          // Apply sequence of business context changes
          for (const business of businessSequence) {
            act(() => {
              result.current.setBusiness(business);
            });
          }

          // Verify final state matches last business in sequence
          const lastBusiness = businessSequence[businessSequence.length - 1];
          expect(result.current.currentBusiness).toBe(lastBusiness);

          // Verify persistence in sessionStorage
          expect(sessionStorage.getItem('hotel-arriendos-business-context')).toBe(lastBusiness);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should maintain context consistency after multiple toggles', () => {
    fc.assert(
      fc.property(
        businessContextArbitrary,
        fc.integer({ min: 0, max: 20 }),
        (initialBusiness, toggleCount) => {
          const { result } = renderHook(() => useBusinessContext(), {
            wrapper: BusinessProvider,
          });

          // Set initial business context
          act(() => {
            result.current.setBusiness(initialBusiness);
          });

          // Perform multiple toggles
          for (let i = 0; i < toggleCount; i++) {
            act(() => {
              result.current.toggleBusiness();
            });
          }

          // Verify final state is correct based on toggle count
          // Even number of toggles = back to initial, odd = opposite
          const expectedBusiness = toggleCount % 2 === 0 
            ? initialBusiness 
            : (initialBusiness === 'hotel' ? 'arriendos' : 'hotel');
          
          expect(result.current.currentBusiness).toBe(expectedBusiness);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should persist context across simulated page navigations (re-renders)', async () => {
    await fc.assert(
      fc.asyncProperty(
        businessContextArbitrary,
        async (selectedBusiness) => {
          // First render: set business context
          const { result: result1 } = renderHook(() => useBusinessContext(), {
            wrapper: BusinessProvider,
          });

          act(() => {
            result1.current.setBusiness(selectedBusiness);
          });

          await waitFor(() => {
            expect(sessionStorage.getItem('hotel-arriendos-business-context')).toBe(selectedBusiness);
          });

          // Second render: simulate page navigation by creating new hook instance
          const { result: result2 } = renderHook(() => useBusinessContext(), {
            wrapper: BusinessProvider,
          });

          // Wait for initialization from sessionStorage
          await waitFor(() => {
            expect(result2.current.currentBusiness).toBe(selectedBusiness);
          });

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should correctly set business context to any valid value', () => {
    fc.assert(
      fc.property(
        businessContextArbitrary,
        (targetBusiness) => {
          const { result } = renderHook(() => useBusinessContext(), {
            wrapper: BusinessProvider,
          });

          act(() => {
            result.current.setBusiness(targetBusiness);
          });

          expect(result.current.currentBusiness).toBe(targetBusiness);
          expect(sessionStorage.getItem('hotel-arriendos-business-context')).toBe(targetBusiness);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should handle rapid context switches correctly', () => {
    fc.assert(
      fc.property(
        fc.array(businessContextArbitrary, { minLength: 5, maxLength: 20 }),
        (businessSequence) => {
          const { result } = renderHook(() => useBusinessContext(), {
            wrapper: BusinessProvider,
          });

          // Rapidly switch contexts
          for (const business of businessSequence) {
            act(() => {
              result.current.setBusiness(business);
            });
          }

          // Final state should match the last operation
          const lastBusiness = businessSequence[businessSequence.length - 1];
          expect(result.current.currentBusiness).toBe(lastBusiness);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should maintain context provider value structure for any business context', () => {
    fc.assert(
      fc.property(
        businessContextArbitrary,
        (business) => {
          const { result } = renderHook(() => useBusinessContext(), {
            wrapper: BusinessProvider,
          });

          act(() => {
            result.current.setBusiness(business);
          });

          // Verify the context value has all required properties
          expect(result.current).toHaveProperty('currentBusiness');
          expect(result.current).toHaveProperty('toggleBusiness');
          expect(result.current).toHaveProperty('setBusiness');
          
          // Verify types
          expect(typeof result.current.currentBusiness).toBe('string');
          expect(typeof result.current.toggleBusiness).toBe('function');
          expect(typeof result.current.setBusiness).toBe('function');
          
          // Verify current business is valid
          expect(['hotel', 'arriendos']).toContain(result.current.currentBusiness);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should toggle correctly regardless of current state', () => {
    fc.assert(
      fc.property(
        businessContextArbitrary,
        (currentBusiness) => {
          const { result } = renderHook(() => useBusinessContext(), {
            wrapper: BusinessProvider,
          });

          // Set to specific business
          act(() => {
            result.current.setBusiness(currentBusiness);
          });

          const beforeToggle = result.current.currentBusiness;

          // Toggle
          act(() => {
            result.current.toggleBusiness();
          });

          const afterToggle = result.current.currentBusiness;

          // Verify toggle switched to opposite business
          expect(beforeToggle).not.toBe(afterToggle);
          expect(['hotel', 'arriendos']).toContain(afterToggle);
          
          if (beforeToggle === 'hotel') {
            expect(afterToggle).toBe('arriendos');
          } else {
            expect(afterToggle).toBe('hotel');
          }

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should persist any valid business context to sessionStorage', () => {
    fc.assert(
      fc.property(
        businessContextArbitrary,
        (business) => {
          const { result } = renderHook(() => useBusinessContext(), {
            wrapper: BusinessProvider,
          });

          act(() => {
            result.current.setBusiness(business);
          });

          // Verify sessionStorage contains the correct value
          const storedValue = sessionStorage.getItem('hotel-arriendos-business-context');
          expect(storedValue).toBe(business);
          expect(['hotel', 'arriendos']).toContain(storedValue as string);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should restore context from sessionStorage for any valid stored value', async () => {
    await fc.assert(
      fc.asyncProperty(
        businessContextArbitrary,
        async (storedBusiness) => {
          // Pre-populate sessionStorage
          sessionStorage.setItem('hotel-arriendos-business-context', storedBusiness);

          // Create new provider instance (simulates page load)
          const { result } = renderHook(() => useBusinessContext(), {
            wrapper: BusinessProvider,
          });

          // Wait for initialization
          await waitFor(() => {
            expect(result.current.currentBusiness).toBe(storedBusiness);
          });

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });
});

