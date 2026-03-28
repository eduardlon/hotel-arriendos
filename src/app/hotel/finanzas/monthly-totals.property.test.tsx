import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import FinanzasPage from './page';
import * as dataAccess from '@/lib/data-access';
import type { HotelTransaction } from '@/types';
import { formatCurrency } from '@/lib/format';

/**
 * **Feature: hotel-arriendos, Property 13: Monthly Financial Totals**
 *
 * For any set of transactions spanning multiple months, the monthly income and
 * expense totals should only include transactions from the current month.
 *
 * **Validates: Requirements 6.3**
 */

vi.mock('@/lib/data-access', () => ({
  isCachePrimed: vi.fn(() => false),
  getHotelTransactions: vi.fn(),
  createHotelTransaction: vi.fn(),
}));

vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await vi.importActual<typeof import('@/tests/utils/framer-motion-mock')>(
    '@/tests/utils/framer-motion-mock'
  );
  return createFramerMotionMock();
});

describe('Property 13: Monthly Financial Totals', () => {
  const transactionArb = fc.record({
    type: fc.constantFrom<'ingreso' | 'gasto'>('ingreso', 'gasto'),
    amount: fc.float({ min: 1, max: 1000000, noNaN: true }).map((value) => Math.round(value)),
    inCurrentMonth: fc.boolean(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate monthly totals using only current month transactions', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(transactionArb, { minLength: 1, maxLength: 12 }), async (data) => {
        vi.useFakeTimers();
        const testDate = new Date('2024-06-15');
        vi.setSystemTime(testDate);

        const currentMonthDate = new Date('2024-06-10');
        const otherMonthDate = new Date('2024-05-10');

        const transactions: HotelTransaction[] = data.map((item, index) => ({
          id: `trans-${index}`,
          type: item.type,
          amount: item.amount,
          category: 'Prueba',
          date: item.inCurrentMonth ? currentMonthDate : otherMonthDate,
          description: `Transacción ${index}`,
        }));

        const expectedIncome = transactions
          .filter((t) => t.type === 'ingreso' && t.date.getMonth() === testDate.getMonth())
          .reduce((sum, t) => sum + t.amount, 0);

        const expectedExpenses = transactions
          .filter((t) => t.type === 'gasto' && t.date.getMonth() === testDate.getMonth())
          .reduce((sum, t) => sum + t.amount, 0);

        vi.mocked(dataAccess.getHotelTransactions).mockResolvedValue(transactions);

        const { unmount, container } = render(<FinanzasPage />);

        try {
          const waitForSection = waitFor(() => {
            expect(screen.getByText('Ingresos del Mes')).toBeInTheDocument();
          });
          await vi.runAllTimersAsync();
          await waitForSection;

          const incomeCard = screen.getByText('Ingresos del Mes').closest('div');
          const expenseCard = screen.getByText('Gastos del Mes').closest('div');

          expect(incomeCard).toBeInTheDocument();
          expect(expenseCard).toBeInTheDocument();

          const formattedIncome = formatCurrency(expectedIncome);
          const formattedExpenses = formatCurrency(expectedExpenses);

          const waitForTotals = waitFor(() => {
            expect(incomeCard).toHaveTextContent(formattedIncome);
            expect(expenseCard).toHaveTextContent(formattedExpenses);
          });
          await vi.runAllTimersAsync();
          await waitForTotals;

          return true;
        } finally {
          vi.useRealTimers();
          unmount();
          container.remove();
        }
      }),
      { numRuns: 100 }
    );
  }, 120000);
});




