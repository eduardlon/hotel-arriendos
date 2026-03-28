import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  __resetData,
  createProperty,
  updateProperty,
  deleteProperty,
  createTenant,
  updateTenant,
  deleteTenant,
  createPayment,
  updatePayment,
  deletePayment,
  createExpense,
  updateExpense,
  deleteExpense,
  createReminder,
  updateReminder,
  deleteReminder,
} from '@/lib/data-access';
import type { Property, Tenant, Payment, Expense, Reminder } from '@/types';

/**
 * **Feature: hotel-arriendos, Property 15, 19, 22, 28, 30: CRUD Operations**
 */

describe('Property 15: Property CRUD Operations', () => {
  const propertyArb = fc.record({
    address: fc.string({ minLength: 5, maxLength: 50 }),
    type: fc.constantFrom<Property['type']>('apartamento', 'casa'),
    status: fc.constantFrom<Property['status']>('disponible', 'ocupada', 'mantenimiento'),
    monthlyRent: fc.integer({ min: 200000, max: 1500000 }),
  });

  it('should create, update, and delete properties for any valid data', async () => {
    await fc.assert(
      fc.asyncProperty(propertyArb, async (propertyData) => {
        __resetData();
        const created = await createProperty(propertyData);
        expect(created.id).toBeDefined();

        const updated = await updateProperty(created.id, { status: 'ocupada' });
        expect(updated?.status).toBe('ocupada');

        const deleted = await deleteProperty(created.id);
        expect(deleted).toBe(true);
      }),
      { numRuns: 20 }
    );
  });
});

describe('Property 19: Tenant CRUD Operations', () => {
  const tenantArb = fc.record({
    name: fc.string({ minLength: 3, maxLength: 40 }),
    phone: fc.string({ minLength: 8, maxLength: 15 }),
    email: fc.emailAddress(),
    deposit: fc.integer({ min: 100000, max: 800000 }),
  });

  it('should create, update, and delete tenants for any valid data', async () => {
    await fc.assert(
      fc.asyncProperty(tenantArb, async (tenantData) => {
        __resetData();
        const created = await createTenant(tenantData);
        expect(created.id).toBeDefined();

        const updated = await updateTenant(created.id, { phone: '99999999' });
        expect(updated?.phone).toBe('99999999');

        const deleted = await deleteTenant(created.id);
        expect(deleted).toBe(true);
      }),
      { numRuns: 20 }
    );
  });
});

describe('Property 22: Payment CRUD Operations', () => {
  const paymentArb = fc.record({
    tenantId: fc.string({ minLength: 3, maxLength: 10 }),
    propertyId: fc.string({ minLength: 3, maxLength: 10 }),
    amount: fc.integer({ min: 200000, max: 1500000 }),
    dueDate: fc.date({ min: new Date('2023-01-01'), max: new Date('2025-12-31') }),
    status: fc.constantFrom<Payment['status']>('pagado', 'pendiente', 'vencido'),
  });

  it('should create, update, and delete payments for any valid data', async () => {
    await fc.assert(
      fc.asyncProperty(paymentArb, async (paymentData) => {
        __resetData();
        const created = await createPayment(paymentData);
        expect(created.id).toBeDefined();

        const updated = await updatePayment(created.id, { status: 'pagado' });
        expect(updated?.status).toBe('pagado');

        const deleted = await deletePayment(created.id);
        expect(deleted).toBe(true);
      }),
      { numRuns: 20 }
    );
  });
});

describe('Property 28: Expense CRUD Operations', () => {
  const expenseArb = fc.record({
    propertyId: fc.string({ minLength: 3, maxLength: 10 }),
    amount: fc.integer({ min: 50000, max: 300000 }),
    category: fc.constantFrom<Expense['category']>('reparaciones', 'servicios', 'impuestos', 'otros'),
    date: fc.date({ min: new Date('2023-01-01'), max: new Date('2025-12-31') }),
    description: fc.string({ minLength: 5, maxLength: 80 }),
  });

  it('should create, update, and delete expenses for any valid data', async () => {
    await fc.assert(
      fc.asyncProperty(expenseArb, async (expenseData) => {
        __resetData();
        const created = await createExpense(expenseData);
        expect(created.id).toBeDefined();

        const updated = await updateExpense(created.id, { category: 'otros' });
        expect(updated?.category).toBe('otros');

        const deleted = await deleteExpense(created.id);
        expect(deleted).toBe(true);
      }),
      { numRuns: 20 }
    );
  });
});

describe('Property 30: Reminder CRUD Operations', () => {
  const reminderArb = fc.record({
    type: fc.constantFrom<Reminder['type']>('pago', 'mantenimiento', 'renovacion', 'novedad'),
    date: fc.date({ min: new Date('2023-01-01'), max: new Date('2025-12-31') }),
    description: fc.string({ minLength: 5, maxLength: 120 }),
    status: fc.constantFrom<Reminder['status']>('pendiente', 'completado'),
  });

  it('should create, update, and delete reminders for any valid data', async () => {
    await fc.assert(
      fc.asyncProperty(reminderArb, async (reminderData) => {
        __resetData();
        const created = await createReminder(reminderData);
        expect(created.id).toBeDefined();

        const updated = await updateReminder(created.id, { status: 'completado' });
        expect(updated?.status).toBe('completado');

        const deleted = await deleteReminder(created.id);
        expect(deleted).toBe(true);
      }),
      { numRuns: 20 }
    );
  });
});

