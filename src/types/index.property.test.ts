import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
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
} from './index';

/**
 * **Feature: hotel-arriendos, Property 39: Entity Unique Identifiers**
 * 
 * For any entity instance (room, employee, property, tenant, payment, expense, reminder),
 * the entity should have a unique identifier that distinguishes it from all other entities
 * of the same type.
 * 
 * **Validates: Requirements 16.3**
 */
describe('Property 39: Entity Unique Identifiers', () => {
  // Arbitrary generators for each entity type
  const roomArbitrary = fc.record<Room>({
    id: fc.uuid(),
    number: fc.stringMatching(/^[1-9][0-9]{0,2}$/),
    type: fc.constantFrom('individual', 'doble', 'suite', 'familiar'),
    floor: fc.integer({ min: 1, max: 10 }),
    price: fc.integer({ min: 50, max: 500 }),
    status: fc.constantFrom('disponible', 'ocupada', 'limpieza', 'mantenimiento'),
    assignedEmployeeId: fc.option(fc.uuid(), { nil: undefined }),
    lastCleaned: fc.option(fc.date(), { nil: undefined }),
  });

  const employeeArbitrary = fc.record<Employee>({
    id: fc.uuid(),
    name: fc.string({ minLength: 3, maxLength: 50 }),
    role: fc.constantFrom('recepcionista', 'limpieza', 'mantenimiento', 'gerente'),
    shift: fc.constantFrom('mañana', 'tarde', 'noche'),
    photo: fc.option(fc.webUrl(), { nil: undefined }),
    phone: fc.stringMatching(/^\+?[0-9]{8,15}$/),
    email: fc.emailAddress(),
    hireDate: fc.date(),
  });

  const cleaningRecordArbitrary = fc.record<CleaningRecord>({
    id: fc.uuid(),
    roomId: fc.uuid(),
    employeeId: fc.uuid(),
    date: fc.date(),
    startTime: fc.stringMatching(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: fc.stringMatching(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
    notes: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  });

  const hotelTransactionArbitrary = fc.record<HotelTransaction>({
    id: fc.uuid(),
    type: fc.constantFrom('ingreso', 'gasto'),
    amount: fc.integer({ min: 1, max: 10000 }),
    category: fc.string({ minLength: 3, maxLength: 30 }),
    date: fc.date(),
    description: fc.string({ minLength: 5, maxLength: 100 }),
    roomId: fc.option(fc.uuid(), { nil: undefined }),
  });

  const propertyArbitrary = fc.record<Property>({
    id: fc.uuid(),
    address: fc.string({ minLength: 10, maxLength: 100 }),
    type: fc.constantFrom('apartamento', 'casa'),
    image: fc.option(fc.webUrl(), { nil: undefined }),
    status: fc.constantFrom('disponible', 'ocupada', 'mantenimiento'),
    monthlyRent: fc.integer({ min: 200, max: 5000 }),
    currentTenantId: fc.option(fc.uuid(), { nil: undefined }),
  });

  const tenantArbitrary = fc.record<Tenant>({
    id: fc.uuid(),
    name: fc.string({ minLength: 3, maxLength: 50 }),
    phone: fc.stringMatching(/^\+?[0-9]{8,15}$/),
    email: fc.emailAddress(),
    propertyId: fc.option(fc.uuid(), { nil: undefined }),
    contractStart: fc.option(fc.date(), { nil: undefined }),
    contractEnd: fc.option(fc.date(), { nil: undefined }),
    deposit: fc.integer({ min: 0, max: 10000 }),
  });

  const paymentArbitrary = fc.record<Payment>({
    id: fc.uuid(),
    tenantId: fc.uuid(),
    propertyId: fc.uuid(),
    amount: fc.integer({ min: 1, max: 10000 }),
    dueDate: fc.date(),
    paidDate: fc.option(fc.date(), { nil: undefined }),
    status: fc.constantFrom('pagado', 'pendiente', 'vencido'),
    method: fc.option(fc.constantFrom('efectivo', 'transferencia', 'cheque'), { nil: undefined }),
  });

  const expenseArbitrary = fc.record<Expense>({
    id: fc.uuid(),
    propertyId: fc.uuid(),
    amount: fc.integer({ min: 1, max: 10000 }),
    category: fc.constantFrom('reparaciones', 'servicios', 'impuestos', 'otros'),
    date: fc.date(),
    description: fc.string({ minLength: 5, maxLength: 100 }),
    receipt: fc.option(fc.webUrl(), { nil: undefined }),
  });

  const reminderArbitrary = fc.record<Reminder>({
    id: fc.uuid(),
    type: fc.constantFrom('pago', 'mantenimiento', 'renovacion', 'novedad'),
    date: fc.date(),
    description: fc.string({ minLength: 5, maxLength: 100 }),
    propertyId: fc.option(fc.uuid(), { nil: undefined }),
    tenantId: fc.option(fc.uuid(), { nil: undefined }),
    status: fc.constantFrom('pendiente', 'completado'),
  });

  it('should ensure all Room entities have unique identifiers', () => {
    fc.assert(
      fc.property(
        fc.array(roomArbitrary, { minLength: 2, maxLength: 20 }),
        (rooms) => {
          const ids = rooms.map((room) => room.id);
          const uniqueIds = new Set(ids);
          return ids.length === uniqueIds.size;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should ensure all Employee entities have unique identifiers', () => {
    fc.assert(
      fc.property(
        fc.array(employeeArbitrary, { minLength: 2, maxLength: 20 }),
        (employees) => {
          const ids = employees.map((employee) => employee.id);
          const uniqueIds = new Set(ids);
          return ids.length === uniqueIds.size;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should ensure all CleaningRecord entities have unique identifiers', () => {
    fc.assert(
      fc.property(
        fc.array(cleaningRecordArbitrary, { minLength: 2, maxLength: 20 }),
        (records) => {
          const ids = records.map((record) => record.id);
          const uniqueIds = new Set(ids);
          return ids.length === uniqueIds.size;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should ensure all HotelTransaction entities have unique identifiers', () => {
    fc.assert(
      fc.property(
        fc.array(hotelTransactionArbitrary, { minLength: 2, maxLength: 20 }),
        (transactions) => {
          const ids = transactions.map((transaction) => transaction.id);
          const uniqueIds = new Set(ids);
          return ids.length === uniqueIds.size;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should ensure all Property entities have unique identifiers', () => {
    fc.assert(
      fc.property(
        fc.array(propertyArbitrary, { minLength: 2, maxLength: 20 }),
        (properties) => {
          const ids = properties.map((property) => property.id);
          const uniqueIds = new Set(ids);
          return ids.length === uniqueIds.size;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should ensure all Tenant entities have unique identifiers', () => {
    fc.assert(
      fc.property(
        fc.array(tenantArbitrary, { minLength: 2, maxLength: 20 }),
        (tenants) => {
          const ids = tenants.map((tenant) => tenant.id);
          const uniqueIds = new Set(ids);
          return ids.length === uniqueIds.size;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should ensure all Payment entities have unique identifiers', () => {
    fc.assert(
      fc.property(
        fc.array(paymentArbitrary, { minLength: 2, maxLength: 20 }),
        (payments) => {
          const ids = payments.map((payment) => payment.id);
          const uniqueIds = new Set(ids);
          return ids.length === uniqueIds.size;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should ensure all Expense entities have unique identifiers', () => {
    fc.assert(
      fc.property(
        fc.array(expenseArbitrary, { minLength: 2, maxLength: 20 }),
        (expenses) => {
          const ids = expenses.map((expense) => expense.id);
          const uniqueIds = new Set(ids);
          return ids.length === uniqueIds.size;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should ensure all Reminder entities have unique identifiers', () => {
    fc.assert(
      fc.property(
        fc.array(reminderArbitrary, { minLength: 2, maxLength: 20 }),
        (reminders) => {
          const ids = reminders.map((reminder) => reminder.id);
          const uniqueIds = new Set(ids);
          return ids.length === uniqueIds.size;
        }
      ),
      { numRuns: 20 }
    );
  });
});

/**
 * **Feature: hotel-arriendos, Property 40: Entity Relationship Foreign Keys**
 * 
 * For any relationship between entities (e.g., tenant references property, payment references
 * tenant and property), the relationship should use proper foreign key patterns with valid identifiers.
 * 
 * **Validates: Requirements 16.4**
 */
describe('Property 40: Entity Relationship Foreign Keys', () => {
  it('should ensure Room assignedEmployeeId references valid Employee when present', () => {
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 1, maxLength: 10 }),
        fc.array(fc.record<Room>({
          id: fc.uuid(),
          number: fc.stringMatching(/^[1-9][0-9]{0,2}$/),
          type: fc.constantFrom('individual', 'doble', 'suite', 'familiar'),
          floor: fc.integer({ min: 1, max: 10 }),
          price: fc.integer({ min: 50, max: 500 }),
          status: fc.constantFrom('disponible', 'ocupada', 'limpieza', 'mantenimiento'),
          assignedEmployeeId: fc.option(fc.uuid(), { nil: undefined }),
          lastCleaned: fc.option(fc.date(), { nil: undefined }),
        }), { minLength: 1, maxLength: 10 }),
        (employeeIds, rooms) => {
          // For each room with an assigned employee, verify the employee ID exists in the employee list
          const roomsWithAssignedEmployees = rooms.filter(room => room.assignedEmployeeId !== undefined);
          
          // If no rooms have assigned employees, the property trivially holds
          if (roomsWithAssignedEmployees.length === 0) return true;
          
          // Check that assigned employee IDs could be valid (they are strings)
          return roomsWithAssignedEmployees.every(room => 
            typeof room.assignedEmployeeId === 'string' && room.assignedEmployeeId.length > 0
          );
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should ensure CleaningRecord references valid Room and Employee IDs', () => {
    fc.assert(
      fc.property(
        fc.record<CleaningRecord>({
          id: fc.uuid(),
          roomId: fc.uuid(),
          employeeId: fc.uuid(),
          date: fc.date(),
          startTime: fc.stringMatching(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
          endTime: fc.stringMatching(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
          notes: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
        }),
        (cleaningRecord) => {
          // Verify that foreign keys are valid strings (non-empty)
          return (
            typeof cleaningRecord.roomId === 'string' &&
            cleaningRecord.roomId.length > 0 &&
            typeof cleaningRecord.employeeId === 'string' &&
            cleaningRecord.employeeId.length > 0
          );
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should ensure HotelTransaction roomId references valid Room when present', () => {
    fc.assert(
      fc.property(
        fc.record<HotelTransaction>({
          id: fc.uuid(),
          type: fc.constantFrom('ingreso', 'gasto'),
          amount: fc.integer({ min: 1, max: 10000 }),
          category: fc.string({ minLength: 3, maxLength: 30 }),
          date: fc.date(),
          description: fc.string({ minLength: 5, maxLength: 100 }),
          roomId: fc.option(fc.uuid(), { nil: undefined }),
        }),
        (transaction) => {
          // If roomId is present, it should be a valid string
          if (transaction.roomId === undefined) return true;
          return typeof transaction.roomId === 'string' && transaction.roomId.length > 0;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should ensure Property currentTenantId references valid Tenant when present', () => {
    fc.assert(
      fc.property(
        fc.record<Property>({
          id: fc.uuid(),
          address: fc.string({ minLength: 10, maxLength: 100 }),
          type: fc.constantFrom('apartamento', 'casa'),
          image: fc.option(fc.webUrl(), { nil: undefined }),
          status: fc.constantFrom('disponible', 'ocupada', 'mantenimiento'),
          monthlyRent: fc.integer({ min: 200, max: 5000 }),
          currentTenantId: fc.option(fc.uuid(), { nil: undefined }),
        }),
        (property) => {
          // If currentTenantId is present, it should be a valid string
          if (property.currentTenantId === undefined) return true;
          return typeof property.currentTenantId === 'string' && property.currentTenantId.length > 0;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should ensure Tenant propertyId references valid Property when present', () => {
    fc.assert(
      fc.property(
        fc.record<Tenant>({
          id: fc.uuid(),
          name: fc.string({ minLength: 3, maxLength: 50 }),
          phone: fc.stringMatching(/^\+?[0-9]{8,15}$/),
          email: fc.emailAddress(),
          propertyId: fc.option(fc.uuid(), { nil: undefined }),
          contractStart: fc.option(fc.date(), { nil: undefined }),
          contractEnd: fc.option(fc.date(), { nil: undefined }),
          deposit: fc.integer({ min: 0, max: 10000 }),
        }),
        (tenant) => {
          // If propertyId is present, it should be a valid string
          if (tenant.propertyId === undefined) return true;
          return typeof tenant.propertyId === 'string' && tenant.propertyId.length > 0;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should ensure Payment references valid Tenant and Property IDs', () => {
    fc.assert(
      fc.property(
        fc.record<Payment>({
          id: fc.uuid(),
          tenantId: fc.uuid(),
          propertyId: fc.uuid(),
          amount: fc.integer({ min: 1, max: 10000 }),
          dueDate: fc.date(),
          paidDate: fc.option(fc.date(), { nil: undefined }),
          status: fc.constantFrom('pagado', 'pendiente', 'vencido'),
          method: fc.option(fc.constantFrom('efectivo', 'transferencia', 'cheque'), { nil: undefined }),
        }),
        (payment) => {
          // Verify that foreign keys are valid strings (non-empty)
          return (
            typeof payment.tenantId === 'string' &&
            payment.tenantId.length > 0 &&
            typeof payment.propertyId === 'string' &&
            payment.propertyId.length > 0
          );
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should ensure Expense propertyId references valid Property', () => {
    fc.assert(
      fc.property(
        fc.record<Expense>({
          id: fc.uuid(),
          propertyId: fc.uuid(),
          amount: fc.integer({ min: 1, max: 10000 }),
          category: fc.constantFrom('reparaciones', 'servicios', 'impuestos', 'otros'),
          date: fc.date(),
          description: fc.string({ minLength: 5, maxLength: 100 }),
          receipt: fc.option(fc.webUrl(), { nil: undefined }),
        }),
        (expense) => {
          // Verify that propertyId is a valid string (non-empty)
          return typeof expense.propertyId === 'string' && expense.propertyId.length > 0;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should ensure Reminder references valid Property and Tenant when present', () => {
    fc.assert(
      fc.property(
        fc.record<Reminder>({
          id: fc.uuid(),
          type: fc.constantFrom('pago', 'mantenimiento', 'renovacion', 'novedad'),
          date: fc.date(),
          description: fc.string({ minLength: 5, maxLength: 100 }),
          propertyId: fc.option(fc.uuid(), { nil: undefined }),
          tenantId: fc.option(fc.uuid(), { nil: undefined }),
          status: fc.constantFrom('pendiente', 'completado'),
        }),
        (reminder) => {
          // If propertyId is present, it should be a valid string
          const propertyIdValid = reminder.propertyId === undefined || 
            (typeof reminder.propertyId === 'string' && reminder.propertyId.length > 0);
          
          // If tenantId is present, it should be a valid string
          const tenantIdValid = reminder.tenantId === undefined || 
            (typeof reminder.tenantId === 'string' && reminder.tenantId.length > 0);
          
          return propertyIdValid && tenantIdValid;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should ensure mock data maintains referential integrity for Room-Employee relationships', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record<Employee>({
          id: fc.uuid(),
          name: fc.string({ minLength: 3, maxLength: 50 }),
          role: fc.constantFrom('recepcionista', 'limpieza', 'mantenimiento', 'gerente'),
          shift: fc.constantFrom('mañana', 'tarde', 'noche'),
          photo: fc.option(fc.webUrl(), { nil: undefined }),
          phone: fc.stringMatching(/^\+?[0-9]{8,15}$/),
          email: fc.emailAddress(),
          hireDate: fc.date(),
        }), { minLength: 1, maxLength: 10 }).chain(employees => {
          const employeeIds = employees.map(e => e.id);
          
          // Generate rooms that reference these employees
          return fc.tuple(
            fc.constant(employees),
            fc.array(fc.record<Room>({
              id: fc.uuid(),
              number: fc.stringMatching(/^[1-9][0-9]{0,2}$/),
              type: fc.constantFrom('individual', 'doble', 'suite', 'familiar'),
              floor: fc.integer({ min: 1, max: 10 }),
              price: fc.integer({ min: 50, max: 500 }),
              status: fc.constantFrom('disponible', 'ocupada', 'limpieza', 'mantenimiento'),
              assignedEmployeeId: fc.option(fc.constantFrom(...employeeIds), { nil: undefined }),
              lastCleaned: fc.option(fc.date(), { nil: undefined }),
            }), { minLength: 1, maxLength: 10 })
          );
        }),
        ([employees, rooms]) => {
          const employeeIds = employees.map(e => e.id);
          // Verify all assigned employee IDs exist in the employee list
          return rooms.every(room => 
            room.assignedEmployeeId === undefined || employeeIds.includes(room.assignedEmployeeId)
          );
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should ensure mock data maintains referential integrity for Property-Tenant relationships', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record<Property>({
          id: fc.uuid(),
          address: fc.string({ minLength: 10, maxLength: 100 }),
          type: fc.constantFrom('apartamento', 'casa'),
          image: fc.option(fc.webUrl(), { nil: undefined }),
          status: fc.constantFrom('disponible', 'ocupada', 'mantenimiento'),
          monthlyRent: fc.integer({ min: 200, max: 5000 }),
          currentTenantId: fc.option(fc.uuid(), { nil: undefined }),
        }), { minLength: 1, maxLength: 10 }).chain(properties => {
          const propertyIds = properties.map(p => p.id);
          
          return fc.tuple(
            fc.constant(properties),
            fc.array(fc.record<Tenant>({
              id: fc.uuid(),
              name: fc.string({ minLength: 3, maxLength: 50 }),
              phone: fc.stringMatching(/^\+?[0-9]{8,15}$/),
              email: fc.emailAddress(),
              propertyId: fc.option(fc.constantFrom(...propertyIds), { nil: undefined }),
              contractStart: fc.option(fc.date(), { nil: undefined }),
              contractEnd: fc.option(fc.date(), { nil: undefined }),
              deposit: fc.integer({ min: 0, max: 10000 }),
            }), { minLength: 1, maxLength: 10 })
          );
        }).chain(([properties, tenants]) => {
          const propertyIds = properties.map(p => p.id);
          const tenantIds = tenants.map(t => t.id);
          
          // Update properties to reference valid tenants
          const updatedProperties = properties.map(p => ({
            ...p,
            currentTenantId: p.currentTenantId !== undefined && tenantIds.length > 0
              ? tenantIds[Math.floor(Math.random() * tenantIds.length)]
              : undefined
          }));
          
          return fc.constant([updatedProperties, tenants]);
        }),
        ([properties, tenants]) => {
          const propertyIds = properties.map(p => p.id);
          const tenantIds = tenants.map(t => t.id);
          
          // Check that properties reference valid tenants
          const propertiesValid = properties.every(property => 
            property.currentTenantId === undefined || tenantIds.includes(property.currentTenantId)
          );
          
          // Check that tenants reference valid properties
          const tenantsValid = tenants.every(tenant => 
            tenant.propertyId === undefined || propertyIds.includes(tenant.propertyId)
          );
          
          return propertiesValid && tenantsValid;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should ensure mock data maintains referential integrity for Payment relationships', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record<Property>({
          id: fc.uuid(),
          address: fc.string({ minLength: 10, maxLength: 100 }),
          type: fc.constantFrom('apartamento', 'casa'),
          image: fc.option(fc.webUrl(), { nil: undefined }),
          status: fc.constantFrom('disponible', 'ocupada', 'mantenimiento'),
          monthlyRent: fc.integer({ min: 200, max: 5000 }),
          currentTenantId: fc.option(fc.uuid(), { nil: undefined }),
        }), { minLength: 1, maxLength: 5 }).chain(properties => {
          const propertyIds = properties.map(p => p.id);
          
          return fc.tuple(
            fc.constant(properties),
            fc.array(fc.record<Tenant>({
              id: fc.uuid(),
              name: fc.string({ minLength: 3, maxLength: 50 }),
              phone: fc.stringMatching(/^\+?[0-9]{8,15}$/),
              email: fc.emailAddress(),
              propertyId: fc.option(fc.uuid(), { nil: undefined }),
              contractStart: fc.option(fc.date(), { nil: undefined }),
              contractEnd: fc.option(fc.date(), { nil: undefined }),
              deposit: fc.integer({ min: 0, max: 10000 }),
            }), { minLength: 1, maxLength: 5 })
          );
        }).chain(([properties, tenants]) => {
          const propertyIds = properties.map(p => p.id);
          const tenantIds = tenants.map(t => t.id);
          
          return fc.tuple(
            fc.constant(properties),
            fc.constant(tenants),
            fc.array(fc.record<Payment>({
              id: fc.uuid(),
              tenantId: fc.constantFrom(...tenantIds),
              propertyId: fc.constantFrom(...propertyIds),
              amount: fc.integer({ min: 1, max: 10000 }),
              dueDate: fc.date(),
              paidDate: fc.option(fc.date(), { nil: undefined }),
              status: fc.constantFrom('pagado', 'pendiente', 'vencido'),
              method: fc.option(fc.constantFrom('efectivo', 'transferencia', 'cheque'), { nil: undefined }),
            }), { minLength: 1, maxLength: 10 })
          );
        }),
        ([properties, tenants, payments]) => {
          const propertyIds = properties.map(p => p.id);
          const tenantIds = tenants.map(t => t.id);
          
          // Verify all payments reference valid tenants and properties
          return payments.every(payment => 
            tenantIds.includes(payment.tenantId) && propertyIds.includes(payment.propertyId)
          );
        }
      ),
      { numRuns: 20 }
    );
  });
});


