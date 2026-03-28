/**
 * Unit Tests for Data Access Layer
 * 
 * Tests CRUD operations for all entities to ensure the data access layer
 * functions correctly with in-memory state management.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  // Room operations
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  // Employee operations
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  // Cleaning record operations
  getCleaningRecords,
  getCleaningRecordsByRoomId,
  getCleaningRecordsByEmployeeId,
  createCleaningRecord,
  updateCleaningRecord,
  deleteCleaningRecord,
  // Hotel transaction operations
  getHotelTransactions,
  getHotelTransactionById,
  createHotelTransaction,
  updateHotelTransaction,
  deleteHotelTransaction,
  // Property operations
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  // Tenant operations
  getTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
  // Payment operations
  getPayments,
  getPaymentById,
  getPaymentsByTenantId,
  getPaymentsByPropertyId,
  createPayment,
  updatePayment,
  deletePayment,
  // Expense operations
  getExpenses,
  getExpenseById,
  getExpensesByPropertyId,
  createExpense,
  updateExpense,
  deleteExpense,
  // Reminder operations
  getReminders,
  getReminderById,
  getRemindersByPropertyId,
  getRemindersByTenantId,
  createReminder,
  updateReminder,
  deleteReminder,
} from './data-access';

describe('Data Access Layer - Room Operations', () => {
  it('should get all rooms', async () => {
    const rooms = await getRooms();
    expect(rooms).toBeDefined();
    expect(Array.isArray(rooms)).toBe(true);
    expect(rooms.length).toBeGreaterThan(0);
  });

  it('should get a room by ID', async () => {
    const rooms = await getRooms();
    const firstRoom = rooms[0];
    const room = await getRoomById(firstRoom.id);
    expect(room).toBeDefined();
    expect(room?.id).toBe(firstRoom.id);
  });

  it('should create a new room', async () => {
    const newRoomData = {
      number: '999',
      type: 'individual' as const,
      floor: 9,
      price: 50000,
      status: 'disponible' as const,
    };
    const newRoom = await createRoom(newRoomData);
    expect(newRoom).toBeDefined();
    expect(newRoom.id).toBeDefined();
    expect(newRoom.number).toBe('999');
  });

  it('should update a room', async () => {
    const rooms = await getRooms();
    const roomToUpdate = rooms[0];
    const updatedRoom = await updateRoom(roomToUpdate.id, { price: 60000 });
    expect(updatedRoom).toBeDefined();
    expect(updatedRoom?.price).toBe(60000);
  });

  it('should delete a room', async () => {
    const newRoom = await createRoom({
      number: '888',
      type: 'doble' as const,
      floor: 8,
      price: 70000,
      status: 'disponible' as const,
    });
    const deleted = await deleteRoom(newRoom.id);
    expect(deleted).toBe(true);
    const room = await getRoomById(newRoom.id);
    expect(room).toBeNull();
  });
});

describe('Data Access Layer - Employee Operations', () => {
  it('should get all employees', async () => {
    const employees = await getEmployees();
    expect(employees).toBeDefined();
    expect(Array.isArray(employees)).toBe(true);
    expect(employees.length).toBeGreaterThan(0);
  });

  it('should create a new employee', async () => {
    const newEmployeeData = {
      name: 'Test Employee',
      role: 'limpieza' as const,
      shift: 'mañana' as const,
      phone: '+56912345678',
      email: 'test@hotel.cl',
      hireDate: new Date(),
    };
    const newEmployee = await createEmployee(newEmployeeData);
    expect(newEmployee).toBeDefined();
    expect(newEmployee.id).toBeDefined();
    expect(newEmployee.name).toBe('Test Employee');
  });
});

describe('Data Access Layer - Cleaning Record Operations', () => {
  it('should get all cleaning records', async () => {
    const records = await getCleaningRecords();
    expect(records).toBeDefined();
    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toBeGreaterThan(0);
  });

  it('should get cleaning records by room ID', async () => {
    const rooms = await getRooms();
    const roomId = rooms[0].id;
    const records = await getCleaningRecordsByRoomId(roomId);
    expect(Array.isArray(records)).toBe(true);
    records.forEach((record) => {
      expect(record.roomId).toBe(roomId);
    });
  });

  it('should get cleaning records by employee ID', async () => {
    const employees = await getEmployees();
    const employeeId = employees[0].id;
    const records = await getCleaningRecordsByEmployeeId(employeeId);
    expect(Array.isArray(records)).toBe(true);
    records.forEach((record) => {
      expect(record.employeeId).toBe(employeeId);
    });
  });
});

describe('Data Access Layer - Hotel Transaction Operations', () => {
  it('should get all hotel transactions', async () => {
    const transactions = await getHotelTransactions();
    expect(transactions).toBeDefined();
    expect(Array.isArray(transactions)).toBe(true);
    expect(transactions.length).toBeGreaterThan(0);
  });

  it('should create a new hotel transaction', async () => {
    const newTransactionData = {
      type: 'ingreso' as const,
      amount: 100000,
      category: 'Hospedaje',
      date: new Date(),
      description: 'Test transaction',
    };
    const newTransaction = await createHotelTransaction(newTransactionData);
    expect(newTransaction).toBeDefined();
    expect(newTransaction.id).toBeDefined();
    expect(newTransaction.amount).toBe(100000);
  });
});

describe('Data Access Layer - Property Operations', () => {
  it('should get all properties', async () => {
    const properties = await getProperties();
    expect(properties).toBeDefined();
    expect(Array.isArray(properties)).toBe(true);
    expect(properties.length).toBeGreaterThan(0);
  });

  it('should create a new property', async () => {
    const newPropertyData = {
      address: 'Test Address 123',
      type: 'apartamento' as const,
      status: 'disponible' as const,
      monthlyRent: 500000,
    };
    const newProperty = await createProperty(newPropertyData);
    expect(newProperty).toBeDefined();
    expect(newProperty.id).toBeDefined();
    expect(newProperty.address).toBe('Test Address 123');
  });
});

describe('Data Access Layer - Tenant Operations', () => {
  it('should get all tenants', async () => {
    const tenants = await getTenants();
    expect(tenants).toBeDefined();
    expect(Array.isArray(tenants)).toBe(true);
    expect(tenants.length).toBeGreaterThan(0);
  });

  it('should create a new tenant', async () => {
    const newTenantData = {
      name: 'Test Tenant',
      phone: '+56912345678',
      email: 'test@email.cl',
      deposit: 500000,
    };
    const newTenant = await createTenant(newTenantData);
    expect(newTenant).toBeDefined();
    expect(newTenant.id).toBeDefined();
    expect(newTenant.name).toBe('Test Tenant');
  });
});

describe('Data Access Layer - Payment Operations', () => {
  it('should get all payments', async () => {
    const payments = await getPayments();
    expect(payments).toBeDefined();
    expect(Array.isArray(payments)).toBe(true);
    expect(payments.length).toBeGreaterThan(0);
  });

  it('should get payments by tenant ID', async () => {
    const tenants = await getTenants();
    const tenantId = tenants[0].id;
    const payments = await getPaymentsByTenantId(tenantId);
    expect(Array.isArray(payments)).toBe(true);
    payments.forEach((payment) => {
      expect(payment.tenantId).toBe(tenantId);
    });
  });

  it('should get payments by property ID', async () => {
    const properties = await getProperties();
    const propertyId = properties[0].id;
    const payments = await getPaymentsByPropertyId(propertyId);
    expect(Array.isArray(payments)).toBe(true);
    payments.forEach((payment) => {
      expect(payment.propertyId).toBe(propertyId);
    });
  });
});

describe('Data Access Layer - Expense Operations', () => {
  it('should get all expenses', async () => {
    const expenses = await getExpenses();
    expect(expenses).toBeDefined();
    expect(Array.isArray(expenses)).toBe(true);
    expect(expenses.length).toBeGreaterThan(0);
  });

  it('should get expenses by property ID', async () => {
    const properties = await getProperties();
    const propertyId = properties[0].id;
    const expenses = await getExpensesByPropertyId(propertyId);
    expect(Array.isArray(expenses)).toBe(true);
    expenses.forEach((expense) => {
      expect(expense.propertyId).toBe(propertyId);
    });
  });
});

describe('Data Access Layer - Reminder Operations', () => {
  it('should get all reminders', async () => {
    const reminders = await getReminders();
    expect(reminders).toBeDefined();
    expect(Array.isArray(reminders)).toBe(true);
    expect(reminders.length).toBeGreaterThan(0);
  });

  it('should create a new reminder', async () => {
    const newReminderData = {
      type: 'pago' as const,
      date: new Date(),
      description: 'Test reminder',
      status: 'pendiente' as const,
    };
    const newReminder = await createReminder(newReminderData);
    expect(newReminder).toBeDefined();
    expect(newReminder.id).toBeDefined();
    expect(newReminder.description).toBe('Test reminder');
  });
});
