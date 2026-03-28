import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import Sidebar from '@/components/layout/Sidebar';
import { BusinessProvider } from '@/context/BusinessContext';
import { formatDate } from '@/lib/format';

vi.mock('next/navigation', () => ({
  usePathname: () => '/hotel/dashboard',
}));

/**
 * **Feature: hotel-arriendos, Property 42: Spanish UI Text**
 * **Feature: hotel-arriendos, Property 43: Spanish Date Formatting**
 */

describe('Localization Properties', () => {
  it('should render Spanish labels for navigation items', () => {
    const labels = ['Dashboard', 'Habitaciones', 'Empleados', 'Limpieza', 'Finanzas'];
    fc.assert(
      fc.property(fc.constantFrom(...labels), (label) => {
        const { unmount } = render(
          <BusinessProvider>
            <Sidebar />
          </BusinessProvider>
        );
        try {
          expect(screen.getByText(label)).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: 10 }
    );
  });

  it('should format dates using Spanish locale format', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31'), noInvalidDate: true }),
        (date) => {
          const formatted = formatDate(date);
          expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
        }
      ),
      { numRuns: 20 }
    );
  });
});
