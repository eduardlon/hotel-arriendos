import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { createExpense, __resetData } from '@/lib/data-access';
import type { Expense } from '@/types';

/**
 * **Feature: hotel-arriendos, Property 14: Expense Categorization**
 * 
 * **Validates: Requirements 6.6, 11.4**
 */

describe('Property 14: Expense Categorization', () => {
  const categoryArb = fc.constantFrom<Expense['category']>('reparaciones', 'servicios', 'impuestos', 'otros');

  it('should preserve expense categories for any valid category', async () => {
    await fc.assert(
      fc.asyncProperty(categoryArb, async (category) => {
        __resetData();
        const expense = await createExpense({
          propertyId: 'prop-test',
          amount: 50000,
          category,
          date: new Date(),
          description: 'Test',
        });
        expect(expense.category).toBe(category);
      }),
      { numRuns: 20 }
    );
  });
});
