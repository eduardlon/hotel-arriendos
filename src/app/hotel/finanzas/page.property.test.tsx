import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import FinanzasPage from './page';
import * as dataAccess from '@/lib/data-access';
import type { HotelTransaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/format';

/**
 * **Feature: hotel-arriendos, Property 12: Hotel Financial Transaction Management**
 * 
 * For any valid financial entry (income or expense with amount, category, date, description),
 * submitting the entry should save it to the system and update all financial displays including
 * the transaction table and monthly totals.
 * 
 * **Validates: Requirements 6.5**
 */

// Mock data access functions
vi.mock('@/lib/data-access', () => ({
  isCachePrimed: vi.fn(() => false),
  getHotelTransactions: vi.fn(),
  createHotelTransaction: vi.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await vi.importActual<typeof import('@/tests/utils/framer-motion-mock')>(
    '@/tests/utils/framer-motion-mock'
  );
  return createFramerMotionMock();
});

const waitForWithTimers = async (
  callback: Parameters<typeof waitFor>[0],
  options?: Parameters<typeof waitFor>[1]
) => {
  const waitPromise = waitFor(callback, options);
  await vi.runAllTimersAsync();
  await waitPromise;
};

const normalizeText = (value: string) => value.replace(/\s+/g, ' ').trim();

describe('Property 12: Hotel Financial Transaction Management', () => {
  // Arbitrary generators for transaction data
  const transactionTypeArbitrary = fc.constantFrom<'ingreso' | 'gasto'>('ingreso', 'gasto');

  const amountArbitrary = fc.float({ min: 1, max: 1000000, noNaN: true }).map(p => 
    Math.round(p * 100) / 100
  );

  const categoryArbitrary = fc.oneof(
    fc.constantFrom(
      'Hospedaje',
      'Servicios básicos',
      'Mantenimiento',
      'Reparaciones',
      'Suministros',
      'Salarios',
      'Impuestos',
      'Otros'
    ),
    fc.string({ minLength: 3, maxLength: 30 }).filter(s => s.trim().length > 0)
  );

  const dateArbitrary = fc.date({
    min: new Date('2020-01-01'),
    max: new Date('2030-12-31'),
    noInvalidDate: true,
  });

  const descriptionArbitrary = fc.string({ minLength: 5, maxLength: 200 }).filter(s => s.trim().length >= 5);

  const transactionDataArbitrary = fc.record({
    type: transactionTypeArbitrary,
    amount: amountArbitrary,
    category: categoryArbitrary,
    date: dateArbitrary,
    description: descriptionArbitrary,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save any valid financial entry and update the transaction table', async () => {
    await fc.assert(
      fc.asyncProperty(
        transactionDataArbitrary,
        async (transactionData) => {
          // Clear all mocks before each iteration
          vi.clearAllMocks();
          // Start with empty transactions
          vi.mocked(dataAccess.getHotelTransactions).mockResolvedValue([]);
          
          // Mock createHotelTransaction to return the created transaction with an ID
          const createdTransaction: HotelTransaction = {
            id: `trans-${Date.now()}`,
            ...transactionData,
          };
          vi.mocked(dataAccess.createHotelTransaction).mockResolvedValue(createdTransaction);

          const { unmount, container } = render(<FinanzasPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              const buttons = screen.queryAllByRole('button', { name: /registrar transacci/i });
              expect(buttons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });

            // Open create modal
            const createButtons = screen.getAllByRole('button', { name: /registrar transacci/i });
            fireEvent.click(createButtons[0]);

            await waitFor(() => {
              expect(screen.getByRole('dialog')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Fill form with generated data
            const typeSelect = screen.getByLabelText(/tipo de transacci/i);
            if ((typeSelect as HTMLSelectElement).value !== transactionData.type) {
              fireEvent.change(typeSelect, { target: { value: transactionData.type } });
            }

            const amountInput = screen.getByRole('spinbutton', { name: /monto/i });
            fireEvent.change(amountInput, { target: { value: transactionData.amount.toString() } });

            const categoryInput = screen.getByLabelText(/categoría/i, { selector: 'input' });
            fireEvent.change(categoryInput, { target: { value: transactionData.category } });

            const dateInput = screen.getByLabelText(/fecha/i, { selector: 'input' });
            const formattedDate = transactionData.date.toISOString().split('T')[0];
            fireEvent.change(dateInput, { target: { value: formattedDate } });

            const descriptionInput = screen.getByLabelText(/descripción/i, { selector: 'textarea' });
            fireEvent.change(descriptionInput, { target: { value: transactionData.description } });

            // Submit form
            await waitFor(() => {
              expect((amountInput as HTMLInputElement).value).toBe(transactionData.amount.toString());
              expect((categoryInput as HTMLInputElement).value).toBe(transactionData.category);
              expect((dateInput as HTMLInputElement).value).toBe(formattedDate);
              expect((descriptionInput as HTMLTextAreaElement).value).toBe(transactionData.description);
            }, { timeout: 3000 });

            const submitButton = screen.getByRole('button', { name: /guardar transacci/i });
            const form = submitButton.closest('form');
            if (!form) {
              throw new Error('No se encontro el formulario de transacciones');
            }
            fireEvent.submit(form);

            // Verify createHotelTransaction was called with correct data
            await waitFor(() => {
              expect(dataAccess.createHotelTransaction).toHaveBeenCalled();
            }, { timeout: 3000 });

            const createdPayload = vi.mocked(dataAccess.createHotelTransaction).mock.calls[0]?.[0];
            expect(createdPayload).toMatchObject({
              type: transactionData.type,
              amount: transactionData.amount,
              category: transactionData.category,
              description: transactionData.description,
            });
            expect(createdPayload?.date).toBeInstanceOf(Date);
            expect(createdPayload?.date?.toISOString().split('T')[0]).toBe(formattedDate);

            // Verify UI reflects the new transaction in the table
            const table = screen.getByRole('table');
            const tableBody = table.querySelector('tbody') ?? table;
            const tableQueries = within(tableBody);

            await waitFor(() => {
              expect(tableQueries.getByText(normalizeText(transactionData.description))).toBeInTheDocument();
            }, { timeout: 3000 });

            // Verify category is displayed
            expect(tableQueries.getByText(normalizeText(transactionData.category))).toBeInTheDocument();

            return true;
          } finally {
            unmount();
            container.remove();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 240000);

  it('should update monthly totals when adding income transactions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(transactionDataArbitrary, { minLength: 1, maxLength: 5 }),
        async (transactionsData) => {
          // Clear all mocks before each iteration
          vi.clearAllMocks();
          
          // Use fake timers to control the current date
          vi.useFakeTimers();
          const testDate = new Date('2024-06-15');
          vi.setSystemTime(testDate);
// Filter to only income transactions in current month
          const currentMonthIncome = transactionsData
            .filter(t => t.type === 'ingreso')
            .map(t => ({
              ...t,
              date: new Date('2024-06-10'), // Same month as test date
            }));

          if (currentMonthIncome.length === 0) {
            vi.useRealTimers();
            return true; // Skip if no income transactions
          }

          // Start with these transactions already in the system
          const existingTransactions: HotelTransaction[] = currentMonthIncome.map((t, i) => ({
            id: `trans-existing-${i}`,
            ...t,
          }));

          vi.mocked(dataAccess.getHotelTransactions).mockResolvedValue(existingTransactions);

          const { unmount, container } = render(<FinanzasPage />);

          try {
            // Wait for page to load
            await waitForWithTimers(() => {
              expect(screen.getByText('Ingresos del Mes')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Calculate expected income total
            const expectedIncome = currentMonthIncome.reduce((sum, t) => sum + t.amount, 0);

            // Verify the income stat card shows the correct total
            const incomeCard = screen.getByText('Ingresos del Mes').closest('div');
            expect(incomeCard).toBeInTheDocument();
            
            // The value should be formatted with Spanish locale
            const formattedIncome = formatCurrency(expectedIncome);
            await waitForWithTimers(() => {
              expect(incomeCard).toHaveTextContent(formattedIncome);
            }, { timeout: 3000 });

            return true;
          } finally {
            vi.useRealTimers();
            unmount();
            container.remove();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 240000);

  it('should update monthly totals when adding expense transactions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(transactionDataArbitrary, { minLength: 1, maxLength: 5 }),
        async (transactionsData) => {
          // Clear all mocks before each iteration
          vi.clearAllMocks();
          
          // Use fake timers to control the current date
          vi.useFakeTimers();
          const testDate = new Date('2024-06-15');
          vi.setSystemTime(testDate);
// Filter to only expense transactions in current month
          const currentMonthExpenses = transactionsData
            .filter(t => t.type === 'gasto')
            .map(t => ({
              ...t,
              date: new Date('2024-06-10'), // Same month as test date
            }));

          if (currentMonthExpenses.length === 0) {
            vi.useRealTimers();
            return true; // Skip if no expense transactions
          }

          // Start with these transactions already in the system
          const existingTransactions: HotelTransaction[] = currentMonthExpenses.map((t, i) => ({
            id: `trans-existing-${i}`,
            ...t,
          }));

          vi.mocked(dataAccess.getHotelTransactions).mockResolvedValue(existingTransactions);

          const { unmount, container } = render(<FinanzasPage />);

          try {
            // Wait for page to load
            await waitForWithTimers(() => {
              expect(screen.getByText('Gastos del Mes')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Calculate expected expense total
            const expectedExpenses = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

            // Verify the expense stat card shows the correct total
            const expenseCard = screen.getByText('Gastos del Mes').closest('div');
            expect(expenseCard).toBeInTheDocument();
            
            // The value should be formatted with Spanish locale
            const formattedExpenses = formatCurrency(expectedExpenses);
            await waitForWithTimers(() => {
              expect(expenseCard).toHaveTextContent(formattedExpenses);
            }, { timeout: 3000 });

            return true;
          } finally {
            vi.useRealTimers();
            unmount();
            container.remove();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 240000);

  it('should correctly calculate net balance from income and expenses', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(transactionDataArbitrary, { minLength: 2, maxLength: 10 }),
        async (transactionsData) => {
          // Clear all mocks before each iteration
          vi.clearAllMocks();
          
          // Use fake timers to control the current date
          vi.useFakeTimers();
          const testDate = new Date('2024-06-15');
          vi.setSystemTime(testDate);
// Ensure we have at least one income and one expense
          const hasIncome = transactionsData.some(t => t.type === 'ingreso');
          const hasExpense = transactionsData.some(t => t.type === 'gasto');
          
          if (!hasIncome || !hasExpense) {
            vi.useRealTimers();
            return true; // Skip if we don't have both types
          }

          // Set all transactions to current month
          const currentMonthTransactions = transactionsData.map(t => ({
            ...t,
            date: new Date('2024-06-10'),
          }));

          const existingTransactions: HotelTransaction[] = currentMonthTransactions.map((t, i) => ({
            id: `trans-${i}`,
            ...t,
          }));

          vi.mocked(dataAccess.getHotelTransactions).mockResolvedValue(existingTransactions);

          const { unmount, container } = render(<FinanzasPage />);

          try {
            // Wait for page to load
            await waitForWithTimers(() => {
              expect(screen.getByText('Balance Neto')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Calculate expected totals
            const expectedIncome = currentMonthTransactions
              .filter(t => t.type === 'ingreso')
              .reduce((sum, t) => sum + t.amount, 0);
            
            const expectedExpenses = currentMonthTransactions
              .filter(t => t.type === 'gasto')
              .reduce((sum, t) => sum + t.amount, 0);
            
            const expectedNet = expectedIncome - expectedExpenses;

            // Verify the net balance stat card shows the correct total
            const netCard = screen.getByText('Balance Neto').closest('div');
            expect(netCard).toBeInTheDocument();
            
            // The value should be formatted with Spanish locale
            const formattedNet = formatCurrency(expectedNet);
            await waitForWithTimers(() => {
              expect(netCard).toHaveTextContent(formattedNet);
            }, { timeout: 3000 });

            return true;
          } finally {
            vi.useRealTimers();
            unmount();
            container.remove();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 240000);

  it('should display all transaction attributes in the table', async () => {
    await fc.assert(
      fc.asyncProperty(
        transactionDataArbitrary,
        async (transactionData) => {
          // Clear all mocks before each iteration
          vi.clearAllMocks();
// Create a transaction with the generated data
          const transaction: HotelTransaction = {
            id: 'trans-test',
            ...transactionData,
          };

          vi.mocked(dataAccess.getHotelTransactions).mockResolvedValue([transaction]);

          const { unmount, container } = render(<FinanzasPage />);

          try {
            // Wait for page to load
            await waitFor(() => {
              expect(screen.getByText('Historial de Transacciones')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Verify all transaction attributes are displayed in the table
            const table = screen.getByRole('table');
            const tableBody = table.querySelector('tbody') ?? table;
            const tableQueries = within(tableBody);

            await waitFor(() => {
              // Description
              expect(tableQueries.getByText(normalizeText(transactionData.description))).toBeInTheDocument();
              
              // Category
              expect(tableQueries.getByText(normalizeText(transactionData.category))).toBeInTheDocument();
              
              // Type badge (Ingreso or Gasto)
              const typeBadge = transactionData.type === 'ingreso' ? 'Ingreso' : 'Gasto';
              expect(tableQueries.getByText(typeBadge)).toBeInTheDocument();
              
              // Amount (formatted)
              const formattedAmount = formatCurrency(transactionData.amount);
              expect(tableQueries.getByText(formattedAmount)).toBeInTheDocument();
              
              // Date (formatted in Spanish locale)
              const formattedDate = formatDate(transactionData.date);
              expect(tableQueries.getByText(formattedDate)).toBeInTheDocument();
            }, { timeout: 3000 });

            return true;
          } finally {
            unmount();
            container.remove();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 240000);
});





