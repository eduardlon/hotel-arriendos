# Design Document: Hotel-Arriendos

## Overview

The Hotel-Arriendos application is a dual-business management system built with Next.js 15 that enables users to manage both a hotel and rental properties (arriendos) from a single unified interface. The application features context-aware navigation, comprehensive dashboards, CRUD operations for all business entities, financial tracking, and an intelligent Spanish-language chatbot assistant.

The system uses a business context pattern where users can seamlessly switch between Hotel and Arriendos modules, with each module providing specialized functionality while sharing common UI components and design patterns. The application is built with a minimalist, professional aesthetic using neutral colors, smooth animations, and glassmorphism effects.

Initially, the application will use simulated data with TypeScript interfaces structured to mirror future Supabase database tables, enabling straightforward backend integration without requiring component refactoring.

### Key Design Goals

- **Dual Business Context**: Seamless switching between Hotel and Arriendos with context-aware UI
- **Professional UX**: Minimalist design with smooth animations and intuitive navigation
- **Spanish-First**: All content, labels, and interactions in Spanish
- **Future-Ready Data Layer**: TypeScript interfaces that mirror database schemas
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Performance**: Fast page loads (<500ms) with optimistic UI updates

## Architecture

### High-Level Architecture

The application follows a layered architecture pattern:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (Pages, Components, Layouts, Animations)               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Business Logic Layer                   │
│  (Context Providers, Data Access Functions, Utilities)  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      Data Layer                          │
│  (Mock Data, TypeScript Interfaces, Future API Layer)   │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: Next.js 15 with App Router and TypeScript
- **Styling**: Custom CSS with design tokens (no Tailwind)
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Icons**: lucide-react for consistent iconography
- **Charts**: Recharts for dashboard visualizations
- **Date Handling**: date-fns with Spanish locale
- **UI Components**: Radix UI primitives (Dialog, Dropdown, Tabs)
- **Utilities**: clsx for conditional class names

### Application Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Redirect to /hotel/dashboard
│   ├── globals.css              # Design tokens and global styles
│   ├── hotel/                   # Hotel module routes
│   │   ├── dashboard/
│   │   ├── habitaciones/
│   │   ├── empleados/
│   │   ├── limpieza/
│   │   └── finanzas/
│   └── arriendos/               # Arriendos module routes
│       ├── dashboard/
│       ├── propiedades/
│       ├── inquilinos/
│       ├── pagos/
│       ├── gastos/
│       └── recordatorios/
├── components/
│   ├── layout/                  # Layout components
│   ├── hotel/                   # Hotel-specific components
│   ├── arriendos/               # Arriendos-specific components
│   ├── shared/                  # Reusable components
│   └── chatbot/                 # Chatbot components
├── context/
│   └── BusinessContext.tsx      # Business context provider
├── data/
│   ├── hotel-mock.ts           # Hotel simulated data
│   └── arriendos-mock.ts       # Arriendos simulated data
└── lib/
    └── utils.ts                # Shared utilities
```

### Design Patterns

1. **Context Pattern**: React Context API manages global business state (Hotel vs Arriendos)
2. **Compound Components**: Complex UI elements like modals and dropdowns use composition
3. **Data Access Layer**: All data operations go through dedicated functions that can be swapped for API calls
4. **Optimistic UI**: Immediate UI updates with rollback on error
5. **Responsive Design**: Mobile-first CSS with breakpoints at 768px and 1024px

## Components and Interfaces

### Core Layout Components

#### Sidebar Component
- **Purpose**: Primary navigation for current business context
- **Props**: `businessContext: 'hotel' | 'arriendos'`
- **Behavior**: 
  - Displays context-specific menu items
  - Highlights active route
  - Collapses to hamburger menu on mobile (<768px)
  - Uses glassmorphism effect (backdrop-filter: blur)
- **Animation**: Slide-in transition on mount, smooth hover states

#### Header Component
- **Purpose**: Top bar with business switcher and user actions
- **Props**: None (reads from BusinessContext)
- **Behavior**:
  - Fixed position at top
  - Contains BusinessSwitcher component
  - Displays current page title
- **Animation**: Fade-in on page navigation

#### BusinessSwitcher Component
- **Purpose**: Toggle between Hotel and Arriendos contexts
- **Props**: None (manages BusinessContext)
- **Behavior**:
  - Updates BusinessContext on click
  - Redirects to appropriate dashboard
  - Persists selection in sessionStorage
- **Animation**: Icon rotation and color transition (150ms)

### Hotel Module Components

#### RoomCard Component
- **Purpose**: Display individual room information
- **Props**: `room: Room`
- **Behavior**:
  - Color-coded by status (available: green, occupied: blue, cleaning: yellow, maintenance: red)
  - Click opens edit modal
  - Shows room number, type, floor, price
- **Animation**: Scale on hover, smooth color transitions

#### RoomGrid Component
- **Purpose**: Display all rooms in responsive grid
- **Props**: `rooms: Room[], filters: RoomFilters`
- **Behavior**:
  - Responsive grid (4 cols desktop, 2 cols tablet, 1 col mobile)
  - Client-side filtering by status and floor
  - Empty state when no rooms match filters

#### CleaningSchedule Component
- **Purpose**: Weekly calendar view of cleaning tasks
- **Props**: `schedule: CleaningRecord[], rooms: Room[]`
- **Behavior**:
  - 7-day week view
  - Drag-and-drop to assign cleaning days (future enhancement)
  - Shows employee assignments
  - Mark tasks as complete

#### EmployeeCard Component
- **Purpose**: Display employee information
- **Props**: `employee: Employee`
- **Behavior**:
  - Shows photo, name, role, shift
  - Click opens detail view with cleaning history
  - Edit and delete actions

#### HotelStats Component
- **Purpose**: Dashboard statistics display
- **Props**: `stats: HotelStatistics`
- **Behavior**:
  - 4 stat cards in responsive grid
  - Animated number counters on mount
  - Icons for each metric

### Arriendos Module Components

#### PropertyCard Component
- **Purpose**: Display rental property information
- **Props**: `property: Property`
- **Behavior**:
  - Shows image, address, type, status
  - Click opens detail view
  - Badge for occupied/available status
- **Animation**: Image zoom on hover

#### TenantCard Component
- **Purpose**: Display tenant information in table row
- **Props**: `tenant: Tenant`
- **Behavior**:
  - Shows name, contact, property, contract dates
  - Click opens detail modal
  - Quick actions for payments and contact

#### PaymentTable Component
- **Purpose**: Display and filter payment records
- **Props**: `payments: Payment[], filters: PaymentFilters`
- **Behavior**:
  - Sortable columns
  - Filter by status and property
  - Status badges (paid: green, pending: yellow, overdue: red)
  - Generate receipt action

#### ExpenseTracker Component
- **Purpose**: Display and categorize property expenses
- **Props**: `expenses: Expense[], propertyId?: string`
- **Behavior**:
  - List view with category grouping
  - Add expense modal
  - Chart showing expenses by category
  - Total calculations per property

#### RentalStats Component
- **Purpose**: Dashboard statistics for arriendos
- **Props**: `stats: RentalStatistics`
- **Behavior**:
  - 4 stat cards (properties, tenants, collected, pending)
  - Animated counters
  - Currency formatting

### Shared Components

#### StatCard Component
- **Purpose**: Reusable metric display card
- **Props**: `title: string, value: number | string, icon: LucideIcon, trend?: number`
- **Behavior**:
  - Displays metric with icon
  - Optional trend indicator
  - Animated value counter
- **Animation**: Fade-in and count-up on mount

#### Modal Component
- **Purpose**: Reusable modal dialog
- **Props**: `isOpen: boolean, onClose: () => void, title: string, children: ReactNode`
- **Behavior**:
  - Radix Dialog primitive
  - Backdrop click to close
  - ESC key to close
  - Focus trap
- **Animation**: Fade-in backdrop, scale-in content

#### DataTable Component
- **Purpose**: Reusable table with sorting and filtering
- **Props**: `columns: Column[], data: any[], filters?: Filter[]`
- **Behavior**:
  - Client-side sorting
  - Filter controls
  - Pagination (20 items per page)
  - Empty state

#### Chart Component
- **Purpose**: Wrapper for Recharts visualizations
- **Props**: `type: 'bar' | 'line' | 'pie', data: ChartData[], config: ChartConfig`
- **Behavior**:
  - Responsive sizing
  - Consistent color palette
  - Tooltips with Spanish formatting
  - Loading state

#### EmptyState Component
- **Purpose**: Display when no data is available
- **Props**: `message: string, action?: { label: string, onClick: () => void }`
- **Behavior**:
  - Centered layout with icon
  - Optional call-to-action button
  - Friendly Spanish messaging

### Chatbot Components

#### ChatButton Component
- **Purpose**: Floating action button to open chat
- **Props**: None
- **Behavior**:
  - Fixed position bottom-right
  - Pulse animation to draw attention
  - Badge for unread messages (future)
- **Animation**: Scale on hover, pulse periodically

#### ChatPanel Component
- **Purpose**: Expandable chat interface
- **Props**: `isOpen: boolean, onClose: () => void`
- **Behavior**:
  - Slide-in from bottom-right
  - Message history
  - Input field with send button
  - Keyword-based response matching
  - Context-aware suggestions
- **Animation**: Slide-in/out, message fade-in

## Data Models

### Hotel Module Data Models

#### Room Interface
```typescript
interface Room {
  id: string;
  number: string;
  type: 'individual' | 'doble' | 'suite' | 'familiar';
  floor: number;
  price: number;
  status: 'disponible' | 'ocupada' | 'limpieza' | 'mantenimiento';
  assignedEmployeeId?: string;
  lastCleaned?: Date;
}
```

#### Employee Interface
```typescript
interface Employee {
  id: string;
  name: string;
  role: 'recepcionista' | 'limpieza' | 'mantenimiento' | 'gerente';
  shift: 'mañana' | 'tarde' | 'noche';
  photo?: string;
  phone: string;
  email: string;
  hireDate: Date;
}
```

#### CleaningRecord Interface
```typescript
interface CleaningRecord {
  id: string;
  roomId: string;
  employeeId: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string;
}
```

#### HotelTransaction Interface
```typescript
interface HotelTransaction {
  id: string;
  type: 'ingreso' | 'gasto';
  amount: number;
  category: string;
  date: Date;
  description: string;
  roomId?: string;
}
```

### Arriendos Module Data Models

#### Property Interface
```typescript
interface Property {
  id: string;
  address: string;
  type: 'apartamento' | 'casa';
  image?: string;
  status: 'disponible' | 'ocupada' | 'mantenimiento';
  monthlyRent: number;
  currentTenantId?: string;
}
```

#### Tenant Interface
```typescript
interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  propertyId?: string;
  contractStart?: Date;
  contractEnd?: Date;
  deposit: number;
}
```

#### Payment Interface
```typescript
interface Payment {
  id: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pagado' | 'pendiente' | 'vencido';
  method?: 'efectivo' | 'transferencia' | 'cheque';
}
```

#### Expense Interface
```typescript
interface Expense {
  id: string;
  propertyId: string;
  amount: number;
  category: 'reparaciones' | 'servicios' | 'impuestos' | 'otros';
  date: Date;
  description: string;
  receipt?: string;
}
```

#### Reminder Interface
```typescript
interface Reminder {
  id: string;
  type: 'pago' | 'mantenimiento' | 'renovacion';
  date: Date;
  description: string;
  propertyId?: string;
  tenantId?: string;
  status: 'pendiente' | 'completado';
}
```

### Shared Data Models

#### BusinessContext Type
```typescript
type BusinessContext = 'hotel' | 'arriendos';
```

#### User Interface (Future)
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'empleado' | 'visor';
  businessAccess: BusinessContext[];
}
```

### Data Access Layer

All data operations will be abstracted through dedicated functions:

```typescript
// Hotel data access
export const getRooms = (): Room[] => { /* returns mock data */ };
export const createRoom = (room: Omit<Room, 'id'>): Room => { /* creates room */ };
export const updateRoom = (id: string, updates: Partial<Room>): Room => { /* updates room */ };
export const deleteRoom = (id: string): void => { /* deletes room */ };

// Arriendos data access
export const getProperties = (): Property[] => { /* returns mock data */ };
export const createProperty = (property: Omit<Property, 'id'>): Property => { /* creates property */ };
// ... similar patterns for all entities
```

These functions will initially return/manipulate mock data but can be replaced with API calls without changing component code.


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Business Context Switching

*For any* business context (Hotel or Arriendos), when the user toggles the business switcher, the application should update the context, redirect to the appropriate dashboard, update the sidebar navigation with context-specific menu items, and persist the selection across page navigations within the session.

**Validates: Requirements 1.2, 1.3, 1.4, 1.5**

### Property 2: Room CRUD Operations

*For any* valid room data (number, type, floor, price, status), creating a room should add it to the system, updating a room should modify its attributes, and deleting a room should remove it from the system, with all operations immediately reflected in the UI.

**Validates: Requirements 3.4, 3.5**

### Property 3: Room Display and Status

*For any* set of rooms, the room grid should display all rooms with color coding that correctly corresponds to each room's status (disponible, ocupada, limpieza, mantenimiento).

**Validates: Requirements 3.1**

### Property 4: Room Filtering

*For any* combination of room status and floor filters, the filtered room grid should display only rooms that match all selected filter criteria.

**Validates: Requirements 3.6**

### Property 5: Employee-Room Assignment

*For any* employee and any room, the system should allow assignment of that employee to that room for cleaning responsibility, and the assignment should be reflected in both the room and employee data.

**Validates: Requirements 3.7**

### Property 6: Employee CRUD Operations

*For any* valid employee data (name, role, shift, contact information), creating an employee should add them to the system, updating an employee should modify their attributes, and deleting an employee should remove them from the system.

**Validates: Requirements 4.3, 4.4**

### Property 7: Employee Display with Attributes

*For any* employee, their card display should show all required attributes including photo, name, role, and shift.

**Validates: Requirements 4.1**

### Property 8: Employee Cleaning History

*For any* employee, their detail view should display their complete cleaning history including all dates, rooms cleaned, and times.

**Validates: Requirements 4.5**

### Property 9: Cleaning Record Creation

*For any* cleaning task completion, the system should create a cleaning record with the employee ID, room ID, and timestamp, and update the room status accordingly.

**Validates: Requirements 5.3, 5.5**

### Property 10: Cleaning Status Aggregation

*For any* set of rooms, the cleaning status panel should display counts that accurately reflect the number of clean rooms, pending rooms, and rooms in process based on room statuses.

**Validates: Requirements 5.4**

### Property 11: Cleaning History Display

*For any* cleaning record, the cleaning history should display which employee cleaned which room and at what time.

**Validates: Requirements 5.6**

### Property 12: Hotel Financial Transaction Management

*For any* valid financial entry (income or expense with amount, category, date, description), submitting the entry should save it to the system and update all financial displays including the transaction table and monthly totals.

**Validates: Requirements 6.5**

### Property 13: Monthly Financial Totals

*For any* set of hotel transactions, the monthly totals should accurately sum all income transactions and all expense transactions for the current month.

**Validates: Requirements 6.3**

### Property 14: Expense Categorization

*For any* expense transaction, the system should categorize it by its specified type (utilities, maintenance, repairs, improvements for hotel; reparaciones, servicios, impuestos for arriendos).

**Validates: Requirements 6.6, 11.4**

### Property 15: Property CRUD Operations

*For any* valid property data (address, type, image, status, monthly rent), creating a property should add it to the system, updating a property should modify its attributes, and deleting a property should remove it from the system.

**Validates: Requirements 8.3, 8.4**

### Property 16: Property Display with Attributes

*For any* property, its card display should show all required attributes including image, address, type, and status.

**Validates: Requirements 8.1**

### Property 17: Property Detail View

*For any* property, its detail view should display the current tenant (if any), complete payment history, and all associated expenses.

**Validates: Requirements 8.5**

### Property 18: Tenant-Property Assignment

*For any* tenant and any property, the system should allow assignment of that tenant to that property, and the assignment should be reflected in both the tenant and property data.

**Validates: Requirements 8.6, 9.6**

### Property 19: Tenant CRUD Operations

*For any* valid tenant data (name, contact information, contract details), creating a tenant should add them to the system, updating a tenant should modify their attributes, and deleting a tenant should remove them from the system.

**Validates: Requirements 9.3, 9.4**

### Property 20: Tenant Display with Attributes

*For any* tenant, their table row should display all required attributes including name, contact information, associated property, and contract dates.

**Validates: Requirements 9.1**

### Property 21: Tenant Detail View

*For any* tenant, their detail view should display the associated property, complete contract information, and payment history.

**Validates: Requirements 9.5**

### Property 22: Payment CRUD Operations

*For any* valid payment data (tenant, property, amount, date, status), submitting a payment should save it to the system and update the payment table display.

**Validates: Requirements 10.3**

### Property 23: Payment Display with Attributes

*For any* payment, its table row should display all required attributes including tenant, property, amount, date, and payment status.

**Validates: Requirements 10.1**

### Property 24: Payment Filtering

*For any* combination of payment status and property filters, the filtered payment table should display only payments that match all selected filter criteria.

**Validates: Requirements 10.4**

### Property 25: Payment Receipt Generation

*For any* payment, the system should provide an option to generate a receipt for that payment.

**Validates: Requirements 10.5**

### Property 26: Automatic Payment Status Calculation

*For any* payment with status "pendiente" and a due date in the past, the system should automatically calculate and display the payment status as "vencido" (overdue).

**Validates: Requirements 10.6**

### Property 27: Property Expense Display

*For any* property, the system should display a list of all expenses associated with that property.

**Validates: Requirements 11.1**

### Property 28: Expense CRUD Operations

*For any* valid expense data (property, amount, category, date, description), submitting an expense should save it to the system and update the expense display.

**Validates: Requirements 11.3**

### Property 29: Property Expense Totals

*For any* property, the system should calculate the total expenses by summing all expense amounts associated with that property.

**Validates: Requirements 11.6**

### Property 30: Reminder CRUD Operations

*For any* valid reminder data (type, date, description, associated property or tenant), submitting a reminder should save it to the system and update the reminder list.

**Validates: Requirements 12.3**

### Property 31: Reminder Display with Attributes

*For any* reminder, its list item should display all required attributes including description, date, and status.

**Validates: Requirements 12.1**

### Property 32: Reminder Status Update

*For any* reminder, the system should allow marking it as completed, and the status change should be reflected in the reminder list.

**Validates: Requirements 12.4**

### Property 33: Reminder Dashboard Display

*For any* reminder with a date that is today or in the past and status "pendiente", the reminder should be displayed prominently on the dashboard.

**Validates: Requirements 12.5**

### Property 34: Reminder Filtering

*For any* reminder status filter (pendiente or completado), the filtered reminder list should display only reminders that match the selected status.

**Validates: Requirements 12.6**

### Property 35: Chatbot Data Queries

*For any* data-related question asked to the chatbot (e.g., "¿cuántas habitaciones están ocupadas?", "¿quién debe arriendo?"), the chatbot should analyze the current data and provide an accurate response based on the actual system state.

**Validates: Requirements 13.4**

### Property 36: Chatbot Navigation Assistance

*For any* navigation-related query asked to the chatbot, the chatbot should suggest relevant pages or sections of the application that match the user's intent.

**Validates: Requirements 13.5**

### Property 37: Chatbot Spanish Language Support

*For any* question asked to the chatbot in Spanish, the chatbot should respond exclusively in Spanish with proper grammar and terminology.

**Validates: Requirements 13.6, 18.5**

### Property 38: Chatbot Add Guidance

*For any* query about adding information (e.g., "¿cómo agrego una habitación?"), the chatbot should guide the user to the appropriate form or page for that action.

**Validates: Requirements 13.7**

### Property 39: Entity Unique Identifiers

*For any* entity instance (room, employee, property, tenant, payment, expense, reminder), the entity should have a unique identifier that distinguishes it from all other entities of the same type.

**Validates: Requirements 16.3**

### Property 40: Entity Relationship Foreign Keys

*For any* relationship between entities (e.g., tenant references property, payment references tenant and property), the relationship should use proper foreign key patterns with valid identifiers.

**Validates: Requirements 16.4**

### Property 41: Data Input Validation

*For any* data input form, submitting invalid data (missing required fields, incorrect data types, out-of-range values) should be rejected with appropriate validation feedback, while valid data should be accepted and saved.

**Validates: Requirements 16.5**

### Property 42: Spanish UI Text

*For any* UI element (label, button, navigation item, error message), the displayed text should be in Spanish using appropriate terminology for the business domain.

**Validates: Requirements 18.1, 18.2, 18.4**

### Property 43: Spanish Date Formatting

*For any* date displayed in the application, the date should be formatted according to Spanish locale conventions (e.g., "DD/MM/YYYY" or "D de MMMM de YYYY").

**Validates: Requirements 18.3**

### Property 44: Optimistic UI Updates

*For any* create, update, or delete operation, the UI should update immediately to reflect the change before server confirmation, providing instant feedback to the user.

**Validates: Requirements 20.4**

### Property 45: Empty State Display

*For any* view or list that has no data to display, the system should show an appropriate empty state message in Spanish explaining the absence of data.

**Validates: Requirements 20.5**

## Error Handling

### Client-Side Validation

All form inputs will be validated on the client side before submission:

- **Required Fields**: Display Spanish error messages for missing required fields
- **Data Types**: Validate numeric inputs (prices, amounts), email formats, phone formats
- **Value Ranges**: Ensure positive values for prices and amounts, valid date ranges for contracts
- **Unique Constraints**: Check for duplicate room numbers, property addresses

### Error States

The application will handle various error scenarios:

1. **Form Validation Errors**: Display inline error messages in Spanish below invalid fields
2. **Data Operation Failures**: Show toast notifications with error details
3. **Empty States**: Display friendly messages when no data is available
4. **Loading Failures**: Show retry options if data fails to load
5. **Network Errors**: Display offline indicators and queue operations for retry

### Error Messages

All error messages will be in Spanish and user-friendly:

- "Este campo es obligatorio" (This field is required)
- "El formato del correo electrónico no es válido" (Email format is invalid)
- "El monto debe ser mayor que cero" (Amount must be greater than zero)
- "Ya existe una habitación con este número" (A room with this number already exists)
- "No se pudo guardar los cambios. Por favor, intenta de nuevo." (Could not save changes. Please try again.)

### Graceful Degradation

- If charts fail to render, display data in table format
- If images fail to load, show placeholder with property/employee initials
- If chatbot is unavailable, provide direct navigation links

## Testing Strategy

### Dual Testing Approach

The application will use both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, error conditions, and integration points
- **Property Tests**: Verify universal properties across all inputs through randomization

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs and validate specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Unit Testing

Unit tests will focus on:

1. **Specific Examples**: 
   - Dashboard displays correct stat cards (Requirements 2.1, 7.1)
   - Create button opens modal with required fields (Requirements 3.2, 4.2, 8.2, 9.2, 10.2, 11.2, 12.2)
   - Clicking room/employee/property opens edit form (Requirements 3.3, 4.3, 8.3, 9.3)
   - Business switcher component exists in header (Requirement 1.1)
   - Chatbot button appears and opens panel (Requirements 13.1, 13.2)
   - Loading indicators display during data operations (Requirement 20.2)
   - Sidebar collapses on mobile (Requirement 14.4)
   - Inter font is applied (Requirement 15.2)
   - TypeScript interfaces exist for all entities (Requirement 16.1)
   - Data access functions are used (Requirement 16.2)
   - Mock data meets minimum requirements (Requirements 17.1-17.9)

2. **Edge Cases**:
   - Empty data sets display appropriate empty states
   - Maximum length inputs are handled correctly
   - Boundary values for dates and amounts
   - Special characters in text inputs

3. **Error Conditions**:
   - Invalid form submissions show validation errors
   - Missing required fields are caught
   - Out-of-range values are rejected

4. **Integration Points**:
   - Context provider correctly updates all consumers
   - Data access functions integrate with components
   - Chart components receive and display data correctly

### Property-Based Testing

Property-based testing will be implemented using **fast-check** (for TypeScript/JavaScript), configured to run a minimum of 100 iterations per test to ensure comprehensive input coverage through randomization.

Each property test will:
- Reference its corresponding design document property
- Use the tag format: **Feature: hotel-arriendos, Property {number}: {property_text}**
- Generate random valid inputs to test universal properties
- Verify that the property holds across all generated inputs

Property tests will cover:

1. **CRUD Operations** (Properties 2, 6, 15, 19, 22, 28, 30):
   - Generate random valid entity data
   - Verify create/update/delete operations work correctly
   - Verify UI updates reflect changes

2. **Display Properties** (Properties 3, 7, 16, 20, 23, 31):
   - Generate random entities
   - Verify all required attributes are displayed
   - Verify correct formatting and styling

3. **Filtering and Searching** (Properties 4, 24, 34):
   - Generate random data sets and filter criteria
   - Verify filtered results match criteria
   - Verify no false positives or negatives

4. **Calculations** (Properties 10, 13, 26, 29):
   - Generate random transaction/payment/expense data
   - Verify totals and aggregations are correct
   - Verify status calculations are accurate

5. **Relationships** (Properties 5, 18, 40):
   - Generate random entity pairs
   - Verify assignments and associations work
   - Verify foreign key integrity

6. **Validation** (Property 41):
   - Generate random valid and invalid inputs
   - Verify valid inputs are accepted
   - Verify invalid inputs are rejected with appropriate messages

7. **Language Support** (Properties 37, 42, 43):
   - Generate random UI elements and dates
   - Verify Spanish text is used
   - Verify Spanish locale formatting

8. **Business Logic** (Properties 1, 9, 11, 26, 33, 35, 36, 38):
   - Generate random scenarios
   - Verify business rules are enforced
   - Verify chatbot responses are accurate

### Test Organization

```
tests/
├── unit/
│   ├── components/
│   │   ├── layout/
│   │   ├── hotel/
│   │   ├── arriendos/
│   │   └── shared/
│   ├── data/
│   └── lib/
└── property/
    ├── hotel-crud.property.test.ts
    ├── arriendos-crud.property.test.ts
    ├── calculations.property.test.ts
    ├── filtering.property.test.ts
    ├── validation.property.test.ts
    ├── language.property.test.ts
    └── business-logic.property.test.ts
```

### Testing Tools

- **Test Runner**: Vitest (fast, TypeScript-native)
- **Component Testing**: React Testing Library
- **Property-Based Testing**: fast-check
- **Mocking**: Vitest mocks for data access functions
- **Coverage**: Aim for >80% code coverage, 100% property coverage

### Continuous Integration

All tests will run on every commit:
1. Lint and type-check
2. Run unit tests
3. Run property tests (100 iterations each)
4. Generate coverage report
5. Build verification

