/**
 * Data Models for Hotel-Arriendos Application
 * 
 * These TypeScript interfaces mirror the future database schema
 * and provide type safety throughout the application.
 */

// ============================================================================
// Hotel Module Data Models
// ============================================================================

/**
 * Represents a hotel room with its attributes and current status.
 * 
 * @property id - Unique identifier for the room
 * @property number - Room number (e.g., "101", "205")
 * @property type - Type of room (individual, double, suite, family)
 * @property floor - Floor number where the room is located
 * @property price - Nightly rate for the room
 * @property status - Current availability status
 * @property assignedEmployeeId - ID of employee assigned for cleaning (optional)
 * @property lastCleaned - Timestamp of last cleaning (optional)
 */
export interface Room {
  id: string;
  number: string;
  type: 'individual' | 'doble' | 'suite' | 'familiar';
  floor: number;
  price: number;
  status: 'disponible' | 'ocupada' | 'limpieza' | 'mantenimiento';
  assignedEmployeeId?: string;
  lastCleaned?: Date;
}

/**
 * Represents a hotel employee with their role and contact information.
 * 
 * @property id - Unique identifier for the employee
 * @property name - Full name of the employee
 * @property role - Job role (receptionist, cleaning, maintenance, manager)
 * @property shift - Work shift (morning, afternoon, night)
 * @property photo - URL to employee photo (optional)
 * @property phone - Contact phone number
 * @property email - Contact email address
 * @property hireDate - Date when employee was hired
 */
export interface Employee {
  id: string;
  name: string;
  role: 'recepcionista' | 'limpieza' | 'mantenimiento' | 'gerente';
  shift: 'mañana' | 'tarde' | 'noche';
  photo?: string;
  phone: string;
  email: string;
  hireDate: Date;
}

/**
 * Represents a cleaning record documenting room maintenance.
 * 
 * @property id - Unique identifier for the cleaning record
 * @property roomId - ID of the room that was cleaned
 * @property employeeId - ID of the employee who performed the cleaning
 * @property date - Date when cleaning was performed
 * @property startTime - Time when cleaning started (HH:MM format)
 * @property endTime - Time when cleaning ended (HH:MM format)
 * @property notes - Additional notes about the cleaning (optional)
 */
export interface CleaningRecord {
  id: string;
  roomId: string;
  employeeId: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string;
}

/**
 * Represents the configured shift schedule for cleaning assignments.
 * 
 * @property dayStart - Start time for day shift (HH:MM)
 * @property dayEnd - End time for day shift (HH:MM)
 * @property nightStart - Start time for night shift (HH:MM)
 * @property nightEnd - End time for night shift (HH:MM)
 * @property cleaningsPerDay - Maximum cleanings allowed per day
 */
export interface ShiftConfig {
  dayStart: string;
  dayEnd: string;
  nightStart: string;
  nightEnd: string;
  cleaningsPerDay: number;
}

/**
 * Represents a financial transaction for the hotel business.
 * 
 * @property id - Unique identifier for the transaction
 * @property type - Type of transaction (income or expense)
 * @property amount - Transaction amount in currency
 * @property category - Category of the transaction
 * @property date - Date when transaction occurred
 * @property description - Description of the transaction
 * @property roomId - Associated room ID (optional, for room-specific transactions)
 */
export interface HotelTransaction {
  id: string;
  type: 'ingreso' | 'gasto';
  amount: number;
  category: string;
  date: Date;
  description: string;
  roomId?: string;
}

// ============================================================================
// Arriendos Module Data Models
// ============================================================================

/**
 * Represents a rental property (apartment or house).
 * 
 * @property id - Unique identifier for the property
 * @property address - Full address of the property
 * @property type - Type of property (apartment or house)
 * @property image - URL to property image (optional)
 * @property status - Current availability status
 * @property monthlyRent - Monthly rental amount
 * @property currentTenantId - ID of current tenant (optional)
 */
export interface Property {
  id: string;
  address: string;
  type: 'apartamento' | 'casa';
  image?: string;
  status: 'disponible' | 'ocupada' | 'mantenimiento';
  monthlyRent: number;
  currentTenantId?: string;
}

/**
 * Represents a tenant renting a property.
 * 
 * @property id - Unique identifier for the tenant
 * @property name - Full name of the tenant
 * @property phone - Contact phone number
 * @property email - Contact email address
 * @property propertyId - ID of the property being rented (optional)
 * @property contractStart - Contract start date (optional)
 * @property contractEnd - Contract end date (optional)
 * @property deposit - Security deposit amount
 */
export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  propertyId?: string;
  contractStart?: Date;
  contractEnd?: Date;
  deposit: number;
}

/**
 * Represents a rent payment transaction.
 * 
 * @property id - Unique identifier for the payment
 * @property tenantId - ID of the tenant making the payment
 * @property propertyId - ID of the property the payment is for
 * @property amount - Payment amount
 * @property dueDate - Date when payment is due
 * @property paidDate - Date when payment was made (optional)
 * @property status - Current payment status
 * @property method - Payment method used (optional)
 */
export interface Payment {
  id: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pagado' | 'pendiente' | 'vencido';
  method?: 'efectivo' | 'transferencia' | 'cheque';
}

/**
 * Represents an expense associated with a property.
 * 
 * @property id - Unique identifier for the expense
 * @property propertyId - ID of the property the expense is for
 * @property amount - Expense amount
 * @property category - Category of expense (repairs, services, taxes, other)
 * @property date - Date when expense occurred
 * @property description - Description of the expense
 * @property receipt - URL to receipt image (optional)
 */
export interface Expense {
  id: string;
  propertyId: string;
  amount: number;
  category: 'reparaciones' | 'servicios' | 'impuestos' | 'otros';
  date: Date;
  description: string;
  receipt?: string;
}

/**
 * Represents a reminder for payments, maintenance, or contract renewals.
 * 
 * @property id - Unique identifier for the reminder
 * @property type - Type of reminder (payment, maintenance, renewal)
 * @property date - Date when reminder is due
 * @property description - Description of what needs to be done
 * @property propertyId - Associated property ID (optional)
 * @property tenantId - Associated tenant ID (optional)
 * @property status - Current status of the reminder
 */
export interface Reminder {
  id: string;
  type: 'pago' | 'mantenimiento' | 'renovacion' | 'novedad';
  date: Date;
  description: string;
  propertyId?: string;
  tenantId?: string;
  status: 'pendiente' | 'completado';
}

// ============================================================================
// Shared Types
// ============================================================================

/**
 * Represents the current business context (Hotel or Arriendos).
 */
export type BusinessContext = 'hotel' | 'arriendos';

/**
 * Represents a user of the application (future implementation).
 * 
 * @property id - Unique identifier for the user
 * @property name - Full name of the user
 * @property email - User's email address
 * @property role - User's role (admin, employee, viewer)
 * @property businessAccess - Array of business contexts the user can access
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'empleado' | 'visor';
  businessAccess: BusinessContext[];
}

