/**
 * Data Access Layer
 * 
 * This module provides CRUD functions for all entities in the Hotel-Arriendos application.
 * Currently uses in-memory state management with mock data.
 * Functions are structured to be easily replaceable with API calls in the future.
 * 
 * **Validates: Requirements 16.2**
 */

import type {
  Room,
  Employee,
  CleaningRecord,
  HotelTransaction,
  Property,
  Tenant,
  Payment,
  Expense,
  Reminder,
  ShiftConfig,
} from '@/types';

import {
  mockRooms,
  mockEmployees,
  mockCleaningRecords,
  mockHotelTransactions,
} from '@/data/hotel-mock';

import {
  mockProperties,
  mockTenants,
  mockPayments,
  mockExpenses,
  mockReminders,
} from '@/data/arriendos-mock';

// ============================================================================
// In-Memory State Management
// ============================================================================

let rooms: Room[] = [...mockRooms];
let employees: Employee[] = [...mockEmployees];
let cleaningRecords: CleaningRecord[] = [...mockCleaningRecords];
let hotelTransactions: HotelTransaction[] = [...mockHotelTransactions];
let properties: Property[] = [...mockProperties];
let tenants: Tenant[] = [...mockTenants];
let payments: Payment[] = [...mockPayments];
let expenses: Expense[] = [...mockExpenses];
let reminders: Reminder[] = [...mockReminders];
const defaultShiftConfig: ShiftConfig = {
  dayStart: '06:00',
  dayEnd: '18:00',
  nightStart: '18:00',
  nightEnd: '06:00',
  cleaningsPerDay: 8,
};
let shiftConfig: ShiftConfig = { ...defaultShiftConfig };

// ============================================================================
// Simple Cache Tracking (to avoid reloading on navigation)
// ============================================================================

type CacheKey =
  | 'rooms'
  | 'employees'
  | 'cleaningRecords'
  | 'hotelTransactions'
  | 'properties'
  | 'tenants'
  | 'payments'
  | 'expenses'
  | 'reminders'
  | 'shiftConfig';

const cachePrimed: Record<CacheKey, boolean> = {
  rooms: false,
  employees: false,
  cleaningRecords: false,
  hotelTransactions: false,
  properties: false,
  tenants: false,
  payments: false,
  expenses: false,
  reminders: false,
  shiftConfig: false,
};

export const isCachePrimed = (...keys: CacheKey[]): boolean =>
  keys.every((key) => cachePrimed[key]);

const markCachePrimed = (key: CacheKey) => {
  cachePrimed[key] = true;
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a unique ID for new entities
 */
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Simulate async operation delay (for future API compatibility)
 */
const simulateDelay = async (ms: number = 50): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Simulate delay only once per entity type (performance boost for navigation).
 */
const simulateDelayOnce = async (key: CacheKey, ms: number = 50): Promise<void> => {
  if (cachePrimed[key]) return;
  await simulateDelay(ms);
  cachePrimed[key] = true;
};

// ============================================================================
// Room CRUD Operations
// ============================================================================

/**
 * Get all rooms
 */
export const getRooms = async (): Promise<Room[]> => {
  await simulateDelayOnce('rooms');
  return [...rooms];
};

/**
 * Get a single room by ID
 */
export const getRoomById = async (id: string): Promise<Room | null> => {
  await simulateDelayOnce('rooms');
  return rooms.find((room) => room.id === id) || null;
};

/**
 * Create a new room
 */
export const createRoom = async (roomData: Omit<Room, 'id'>): Promise<Room> => {
  await simulateDelayOnce('rooms');
  const newRoom: Room = {
    ...roomData,
    id: generateId('room'),
  };
  rooms.push(newRoom);
  markCachePrimed('rooms');
  return newRoom;
};

/**
 * Update an existing room
 */
export const updateRoom = async (
  id: string,
  updates: Partial<Omit<Room, 'id'>>
): Promise<Room | null> => {
  await simulateDelayOnce('rooms');
  const index = rooms.findIndex((room) => room.id === id);
  if (index === -1) return null;

  rooms[index] = { ...rooms[index], ...updates };
  markCachePrimed('rooms');
  return rooms[index];
};

/**
 * Delete a room
 */
export const deleteRoom = async (id: string): Promise<boolean> => {
  await simulateDelayOnce('rooms');
  const index = rooms.findIndex((room) => room.id === id);
  if (index === -1) return false;

  rooms.splice(index, 1);
  markCachePrimed('rooms');
  return true;
};

// ============================================================================
// Employee CRUD Operations
// ============================================================================

/**
 * Get all employees
 */
export const getEmployees = async (): Promise<Employee[]> => {
  await simulateDelayOnce('employees');
  return [...employees];
};

/**
 * Get a single employee by ID
 */
export const getEmployeeById = async (id: string): Promise<Employee | null> => {
  await simulateDelayOnce('employees');
  return employees.find((employee) => employee.id === id) || null;
};

/**
 * Create a new employee
 */
export const createEmployee = async (
  employeeData: Omit<Employee, 'id'>
): Promise<Employee> => {
  await simulateDelayOnce('employees');
  const newEmployee: Employee = {
    ...employeeData,
    id: generateId('emp'),
  };
  employees.push(newEmployee);
  markCachePrimed('employees');
  return newEmployee;
};

/**
 * Update an existing employee
 */
export const updateEmployee = async (
  id: string,
  updates: Partial<Omit<Employee, 'id'>>
): Promise<Employee | null> => {
  await simulateDelayOnce('employees');
  const index = employees.findIndex((employee) => employee.id === id);
  if (index === -1) return null;

  employees[index] = { ...employees[index], ...updates };
  markCachePrimed('employees');
  return employees[index];
};

/**
 * Delete an employee
 */
export const deleteEmployee = async (id: string): Promise<boolean> => {
  await simulateDelayOnce('employees');
  const index = employees.findIndex((employee) => employee.id === id);
  if (index === -1) return false;

  employees.splice(index, 1);
  markCachePrimed('employees');
  return true;
};

// ============================================================================
// Cleaning Record CRUD Operations
// ============================================================================

/**
 * Get all cleaning records
 */
export const getCleaningRecords = async (): Promise<CleaningRecord[]> => {
  await simulateDelayOnce('cleaningRecords');
  return [...cleaningRecords];
};

/**
 * Get cleaning records by room ID
 */
export const getCleaningRecordsByRoomId = async (
  roomId: string
): Promise<CleaningRecord[]> => {
  await simulateDelayOnce('cleaningRecords');
  return cleaningRecords.filter((record) => record.roomId === roomId);
};

/**
 * Get cleaning records by employee ID
 */
export const getCleaningRecordsByEmployeeId = async (
  employeeId: string
): Promise<CleaningRecord[]> => {
  await simulateDelayOnce('cleaningRecords');
  return cleaningRecords.filter((record) => record.employeeId === employeeId);
};

/**
 * Create a new cleaning record
 */
export const createCleaningRecord = async (
  recordData: Omit<CleaningRecord, 'id'>
): Promise<CleaningRecord> => {
  await simulateDelayOnce('cleaningRecords');
  const newRecord: CleaningRecord = {
    ...recordData,
    id: generateId('clean'),
  };
  cleaningRecords.push(newRecord);
  markCachePrimed('cleaningRecords');
  return newRecord;
};

/**
 * Update an existing cleaning record
 */
export const updateCleaningRecord = async (
  id: string,
  updates: Partial<Omit<CleaningRecord, 'id'>>
): Promise<CleaningRecord | null> => {
  await simulateDelayOnce('cleaningRecords');
  const index = cleaningRecords.findIndex((record) => record.id === id);
  if (index === -1) return null;

  cleaningRecords[index] = { ...cleaningRecords[index], ...updates };
  markCachePrimed('cleaningRecords');
  return cleaningRecords[index];
};

/**
 * Delete a cleaning record
 */
export const deleteCleaningRecord = async (id: string): Promise<boolean> => {
  await simulateDelayOnce('cleaningRecords');
  const index = cleaningRecords.findIndex((record) => record.id === id);
  if (index === -1) return false;

  cleaningRecords.splice(index, 1);
  markCachePrimed('cleaningRecords');
  return true;
};

// ============================================================================
// Shift Configuration Operations
// ============================================================================

/**
 * Get shift configuration
 */
export const getShiftConfig = async (): Promise<ShiftConfig> => {
  await simulateDelayOnce('shiftConfig');
  return { ...shiftConfig };
};

/**
 * Update shift configuration
 */
export const updateShiftConfig = async (
  updates: Partial<ShiftConfig>
): Promise<ShiftConfig> => {
  await simulateDelayOnce('shiftConfig');
  shiftConfig = { ...shiftConfig, ...updates };
  markCachePrimed('shiftConfig');
  return { ...shiftConfig };
};

// ============================================================================
// Hotel Transaction CRUD Operations
// ============================================================================

/**
 * Get all hotel transactions
 */
export const getHotelTransactions = async (): Promise<HotelTransaction[]> => {
  await simulateDelayOnce('hotelTransactions');
  return [...hotelTransactions];
};

/**
 * Get a single hotel transaction by ID
 */
export const getHotelTransactionById = async (
  id: string
): Promise<HotelTransaction | null> => {
  await simulateDelayOnce('hotelTransactions');
  return hotelTransactions.find((transaction) => transaction.id === id) || null;
};

/**
 * Create a new hotel transaction
 */
export const createHotelTransaction = async (
  transactionData: Omit<HotelTransaction, 'id'>
): Promise<HotelTransaction> => {
  await simulateDelayOnce('hotelTransactions');
  const newTransaction: HotelTransaction = {
    ...transactionData,
    id: generateId('trans'),
  };
  hotelTransactions.push(newTransaction);
  markCachePrimed('hotelTransactions');
  return newTransaction;
};

/**
 * Update an existing hotel transaction
 */
export const updateHotelTransaction = async (
  id: string,
  updates: Partial<Omit<HotelTransaction, 'id'>>
): Promise<HotelTransaction | null> => {
  await simulateDelayOnce('hotelTransactions');
  const index = hotelTransactions.findIndex(
    (transaction) => transaction.id === id
  );
  if (index === -1) return null;

  hotelTransactions[index] = { ...hotelTransactions[index], ...updates };
  markCachePrimed('hotelTransactions');
  return hotelTransactions[index];
};

/**
 * Delete a hotel transaction
 */
export const deleteHotelTransaction = async (id: string): Promise<boolean> => {
  await simulateDelayOnce('hotelTransactions');
  const index = hotelTransactions.findIndex(
    (transaction) => transaction.id === id
  );
  if (index === -1) return false;

  hotelTransactions.splice(index, 1);
  markCachePrimed('hotelTransactions');
  return true;
};

// ============================================================================
// Property CRUD Operations
// ============================================================================

/**
 * Get all properties
 */
export const getProperties = async (): Promise<Property[]> => {
  await simulateDelayOnce('properties');
  return [...properties];
};

/**
 * Get a single property by ID
 */
export const getPropertyById = async (id: string): Promise<Property | null> => {
  await simulateDelayOnce('properties');
  return properties.find((property) => property.id === id) || null;
};

/**
 * Create a new property
 */
export const createProperty = async (
  propertyData: Omit<Property, 'id'>
): Promise<Property> => {
  await simulateDelayOnce('properties');
  const newProperty: Property = {
    ...propertyData,
    id: generateId('prop'),
  };
  properties.push(newProperty);
  markCachePrimed('properties');
  return newProperty;
};

/**
 * Update an existing property
 */
export const updateProperty = async (
  id: string,
  updates: Partial<Omit<Property, 'id'>>
): Promise<Property | null> => {
  await simulateDelayOnce('properties');
  const index = properties.findIndex((property) => property.id === id);
  if (index === -1) return null;

  properties[index] = { ...properties[index], ...updates };
  markCachePrimed('properties');
  return properties[index];
};

/**
 * Delete a property
 */
export const deleteProperty = async (id: string): Promise<boolean> => {
  await simulateDelayOnce('properties');
  const index = properties.findIndex((property) => property.id === id);
  if (index === -1) return false;

  properties.splice(index, 1);
  markCachePrimed('properties');
  return true;
};

// ============================================================================
// Tenant CRUD Operations
// ============================================================================

/**
 * Get all tenants
 */
export const getTenants = async (): Promise<Tenant[]> => {
  await simulateDelayOnce('tenants');
  return [...tenants];
};

/**
 * Get a single tenant by ID
 */
export const getTenantById = async (id: string): Promise<Tenant | null> => {
  await simulateDelayOnce('tenants');
  return tenants.find((tenant) => tenant.id === id) || null;
};

/**
 * Create a new tenant
 */
export const createTenant = async (
  tenantData: Omit<Tenant, 'id'>
): Promise<Tenant> => {
  await simulateDelayOnce('tenants');
  const newTenant: Tenant = {
    ...tenantData,
    id: generateId('tenant'),
  };
  tenants.push(newTenant);
  markCachePrimed('tenants');
  return newTenant;
};

/**
 * Update an existing tenant
 */
export const updateTenant = async (
  id: string,
  updates: Partial<Omit<Tenant, 'id'>>
): Promise<Tenant | null> => {
  await simulateDelayOnce('tenants');
  const index = tenants.findIndex((tenant) => tenant.id === id);
  if (index === -1) return null;

  tenants[index] = { ...tenants[index], ...updates };
  markCachePrimed('tenants');
  return tenants[index];
};

/**
 * Delete a tenant
 */
export const deleteTenant = async (id: string): Promise<boolean> => {
  await simulateDelayOnce('tenants');
  const index = tenants.findIndex((tenant) => tenant.id === id);
  if (index === -1) return false;

  tenants.splice(index, 1);
  markCachePrimed('tenants');
  return true;
};

// ============================================================================
// Payment CRUD Operations
// ============================================================================

/**
 * Get all payments
 */
export const getPayments = async (): Promise<Payment[]> => {
  await simulateDelayOnce('payments');
  return [...payments];
};

/**
 * Get a single payment by ID
 */
export const getPaymentById = async (id: string): Promise<Payment | null> => {
  await simulateDelayOnce('payments');
  return payments.find((payment) => payment.id === id) || null;
};

/**
 * Get payments by tenant ID
 */
export const getPaymentsByTenantId = async (
  tenantId: string
): Promise<Payment[]> => {
  await simulateDelayOnce('payments');
  return payments.filter((payment) => payment.tenantId === tenantId);
};

/**
 * Get payments by property ID
 */
export const getPaymentsByPropertyId = async (
  propertyId: string
): Promise<Payment[]> => {
  await simulateDelayOnce('payments');
  return payments.filter((payment) => payment.propertyId === propertyId);
};

/**
 * Create a new payment
 */
export const createPayment = async (
  paymentData: Omit<Payment, 'id'>
): Promise<Payment> => {
  await simulateDelayOnce('payments');
  const newPayment: Payment = {
    ...paymentData,
    id: generateId('pay'),
  };
  payments.push(newPayment);
  markCachePrimed('payments');
  return newPayment;
};

/**
 * Update an existing payment
 */
export const updatePayment = async (
  id: string,
  updates: Partial<Omit<Payment, 'id'>>
): Promise<Payment | null> => {
  await simulateDelayOnce('payments');
  const index = payments.findIndex((payment) => payment.id === id);
  if (index === -1) return null;

  payments[index] = { ...payments[index], ...updates };
  markCachePrimed('payments');
  return payments[index];
};

/**
 * Delete a payment
 */
export const deletePayment = async (id: string): Promise<boolean> => {
  await simulateDelayOnce('payments');
  const index = payments.findIndex((payment) => payment.id === id);
  if (index === -1) return false;

  payments.splice(index, 1);
  markCachePrimed('payments');
  return true;
};

// ============================================================================
// Expense CRUD Operations
// ============================================================================

/**
 * Get all expenses
 */
export const getExpenses = async (): Promise<Expense[]> => {
  await simulateDelayOnce('expenses');
  return [...expenses];
};

/**
 * Get a single expense by ID
 */
export const getExpenseById = async (id: string): Promise<Expense | null> => {
  await simulateDelayOnce('expenses');
  return expenses.find((expense) => expense.id === id) || null;
};

/**
 * Get expenses by property ID
 */
export const getExpensesByPropertyId = async (
  propertyId: string
): Promise<Expense[]> => {
  await simulateDelayOnce('expenses');
  return expenses.filter((expense) => expense.propertyId === propertyId);
};

/**
 * Create a new expense
 */
export const createExpense = async (
  expenseData: Omit<Expense, 'id'>
): Promise<Expense> => {
  await simulateDelayOnce('expenses');
  const newExpense: Expense = {
    ...expenseData,
    id: generateId('exp'),
  };
  expenses.push(newExpense);
  markCachePrimed('expenses');
  return newExpense;
};

/**
 * Update an existing expense
 */
export const updateExpense = async (
  id: string,
  updates: Partial<Omit<Expense, 'id'>>
): Promise<Expense | null> => {
  await simulateDelayOnce('expenses');
  const index = expenses.findIndex((expense) => expense.id === id);
  if (index === -1) return null;

  expenses[index] = { ...expenses[index], ...updates };
  markCachePrimed('expenses');
  return expenses[index];
};

/**
 * Delete an expense
 */
export const deleteExpense = async (id: string): Promise<boolean> => {
  await simulateDelayOnce('expenses');
  const index = expenses.findIndex((expense) => expense.id === id);
  if (index === -1) return false;

  expenses.splice(index, 1);
  markCachePrimed('expenses');
  return true;
};

// ============================================================================
// Reminder CRUD Operations
// ============================================================================

/**
 * Get all reminders
 */
export const getReminders = async (): Promise<Reminder[]> => {
  await simulateDelayOnce('reminders');
  return [...reminders];
};

/**
 * Get a single reminder by ID
 */
export const getReminderById = async (id: string): Promise<Reminder | null> => {
  await simulateDelayOnce('reminders');
  return reminders.find((reminder) => reminder.id === id) || null;
};

/**
 * Get reminders by property ID
 */
export const getRemindersByPropertyId = async (
  propertyId: string
): Promise<Reminder[]> => {
  await simulateDelayOnce('reminders');
  return reminders.filter((reminder) => reminder.propertyId === propertyId);
};

/**
 * Get reminders by tenant ID
 */
export const getRemindersByTenantId = async (
  tenantId: string
): Promise<Reminder[]> => {
  await simulateDelayOnce('reminders');
  return reminders.filter((reminder) => reminder.tenantId === tenantId);
};

/**
 * Create a new reminder
 */
export const createReminder = async (
  reminderData: Omit<Reminder, 'id'>
): Promise<Reminder> => {
  await simulateDelayOnce('reminders');
  const newReminder: Reminder = {
    ...reminderData,
    id: generateId('rem'),
  };
  reminders.push(newReminder);
  markCachePrimed('reminders');
  return newReminder;
};

/**
 * Update an existing reminder
 */
export const updateReminder = async (
  id: string,
  updates: Partial<Omit<Reminder, 'id'>>
): Promise<Reminder | null> => {
  await simulateDelayOnce('reminders');
  const index = reminders.findIndex((reminder) => reminder.id === id);
  if (index === -1) return null;

  reminders[index] = { ...reminders[index], ...updates };
  markCachePrimed('reminders');
  return reminders[index];
};

/**
 * Delete a reminder
 */
export const deleteReminder = async (id: string): Promise<boolean> => {
  await simulateDelayOnce('reminders');
  const index = reminders.findIndex((reminder) => reminder.id === id);
  if (index === -1) return false;

  reminders.splice(index, 1);
  markCachePrimed('reminders');
  return true;
};

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Reset in-memory data to initial mock values.
 * Intended for tests only.
 */
export const __resetData = (): void => {
  rooms = [...mockRooms];
  employees = [...mockEmployees];
  cleaningRecords = [...mockCleaningRecords];
  hotelTransactions = [...mockHotelTransactions];
  properties = [...mockProperties];
  tenants = [...mockTenants];
  payments = [...mockPayments];
  expenses = [...mockExpenses];
  reminders = [...mockReminders];
  shiftConfig = { ...defaultShiftConfig };

  cachePrimed.rooms = false;
  cachePrimed.employees = false;
  cachePrimed.cleaningRecords = false;
  cachePrimed.hotelTransactions = false;
  cachePrimed.properties = false;
  cachePrimed.tenants = false;
  cachePrimed.payments = false;
  cachePrimed.expenses = false;
  cachePrimed.reminders = false;
  cachePrimed.shiftConfig = false;
};
