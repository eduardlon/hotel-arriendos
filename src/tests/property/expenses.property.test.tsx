import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import ExpenseTracker from '@/components/arriendos/ExpenseTracker';
import type { Expense, Property } from '@/types';
import { formatCurrency } from '@/lib/format';

vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await vi.importActual<typeof import('@/tests/utils/framer-motion-mock')>(
    '@/tests/utils/framer-motion-mock'
  );
  return createFramerMotionMock();
});

vi.mock('@/components/shared/Chart', () => ({
  default: () => <div data-testid="chart" />,
}));

/**
 * **Feature: hotel-arriendos, Property 29: Property Expense Totals**
 */

describe('Property 29: Property Expense Totals', () => {
  it('should calculate total expenses for any property', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 10000, max: 200000 }), { minLength: 1, maxLength: 5 }), (amounts) => {
        const expenses: Expense[] = amounts.map((amount, index) => ({
          id: `exp-${index}`,
          propertyId: 'prop-1',
          amount,
          category: 'servicios',
          date: new Date('2024-01-01'),
          description: 'Test',
        }));
        const properties: Property[] = [
          { id: 'prop-1', address: 'Calle 1', type: 'apartamento', status: 'ocupada', monthlyRent: 400000 },
        ];

        const { unmount } = render(
          <ExpenseTracker expenses={expenses} properties={properties} propertyId="prop-1" />
        );

        const total = amounts.reduce((sum, value) => sum + value, 0);
        try {
          const matches = screen.getAllByText(formatCurrency(total));
          expect(matches.length).toBeGreaterThan(0);
        } finally {
          unmount();
        }
      }),
      { numRuns: 20 }
    );
  });
});



