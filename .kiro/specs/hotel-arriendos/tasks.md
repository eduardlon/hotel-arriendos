# Implementation Plan: Hotel-Arriendos

## Overview

This implementation plan breaks down the Hotel-Arriendos dual-business management system into discrete, incremental coding tasks. The application will be built using Next.js 15 with TypeScript, custom CSS, and a comprehensive set of UI components. Each task builds on previous work, with property-based tests integrated throughout to validate correctness properties early.

The implementation follows a layered approach: foundation (project setup, design system, data layer), core layout (navigation, business context), Hotel module, Arriendos module, shared features (chatbot), and final integration.

## Tasks

- [x] 1. Project setup and foundation
  - [x] 1.1 Initialize Next.js 15 project with TypeScript and App Router
    - Run `npx create-next-app@latest ./ --typescript --app --no-tailwind`
    - Install dependencies: `framer-motion`, `lucide-react`, `recharts`, `date-fns`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tabs`, `clsx`
    - Install dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@vitejs/plugin-react`, `jsdom`, `fast-check`
    - Configure Vitest in `vitest.config.ts`
    - _Requirements: 16.1, 16.2_

  - [x] 1.2 Create project directory structure
    - Create folder structure: `src/app`, `src/components/{layout,hotel,arriendos,shared,chatbot}`, `src/context`, `src/data`, `src/lib`
    - Create placeholder files for main routes: `app/hotel/dashboard/page.tsx`, `app/arriendos/dashboard/page.tsx`
    - _Requirements: 16.1_

  - [x] 1.3 Implement design system in globals.css
    - Define CSS custom properties for colors (neutral grays, whites, blue accent #2563eb, green accent #059669)
    - Import Inter font from Google Fonts
    - Define spacing scale, typography styles, and animation utilities
    - Create glassmorphism utility classes
    - Define responsive breakpoints (768px, 1024px)
    - _Requirements: 15.1, 15.2, 15.5, 14.1, 14.2, 14.3_

  - [x] 1.4 Create TypeScript interfaces for all data models
    - Define interfaces in `src/types/index.ts`: `Room`, `Employee`, `CleaningRecord`, `HotelTransaction`, `Property`, `Tenant`, `Payment`, `Expense`, `Reminder`
    - Include all required fields with proper types
    - Add JSDoc comments for clarity
    - _Requirements: 16.1, 16.3, 16.4_

  - [x] 1.5 Write property test for entity unique identifiers
    - **Property 39: Entity Unique Identifiers**
    - **Validates: Requirements 16.3**

- [x] 2. Data layer and mock data
  - [x] 2.1 Create hotel mock data
    - Implement `src/data/hotel-mock.ts` with at least 12 rooms, 5 employees, 30 cleaning records, 20 financial transactions
    - Ensure varied types, statuses, and realistic relationships
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

  - [x] 2.2 Create arriendos mock data
    - Implement `src/data/arriendos-mock.ts` with at least 8 properties, 10 tenants, 40 payments, 15 expenses, 5 reminders
    - Ensure varied types, statuses, and realistic relationships
    - _Requirements: 17.5, 17.6, 17.7, 17.8, 17.9_

  - [x] 2.3 Implement data access layer functions
    - Create `src/lib/data-access.ts` with CRUD functions for all entities (getRooms, createRoom, updateRoom, deleteRoom, etc.)
    - Use in-memory state management with mock data
    - Structure functions to be easily replaceable with API calls
    - _Requirements: 16.2_

  - [x] 2.4 Write property test for entity relationship foreign keys
    - **Property 40: Entity Relationship Foreign Keys**
    - **Validates: Requirements 16.4**

- [x] 3. Business context and core layout
  - [x] 3.1 Implement BusinessContext provider
    - Create `src/context/BusinessContext.tsx` with context for current business ('hotel' | 'arriendos')
    - Implement toggle function and sessionStorage persistence
    - _Requirements: 1.2, 1.5_

  - [x] 3.2 Create root layout with providers
    - Implement `src/app/layout.tsx` with BusinessContext provider, Inter font, and metadata
    - Include global styles import
    - _Requirements: 15.2_

  - [x] 3.3 Implement Sidebar component
    - Create `src/components/layout/Sidebar.tsx` with context-aware navigation
    - Implement glassmorphism styling and active route highlighting
    - Add responsive behavior (collapse to hamburger on mobile)
    - Use lucide-react icons for menu items
    - _Requirements: 1.3, 14.4, 15.6_

  - [x] 3.4 Implement Header component
    - Create `src/components/layout/Header.tsx` with page title display
    - Fixed positioning at top
    - _Requirements: 1.1_

  - [x] 3.5 Implement BusinessSwitcher component
    - Create `src/components/layout/BusinessSwitcher.tsx` with toggle button
    - Implement context update and redirect logic
    - Add icon rotation animation (150ms)
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 3.6 Write property test for business context switching
    - **Property 1: Business Context Switching**
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5**

  - [x] 3.7 Create home page redirect
    - Implement `src/app/page.tsx` to redirect to `/hotel/dashboard`
    - _Requirements: 1.4_

- [x] 4. Shared UI components
  - [x] 4.1 Implement StatCard component
    - Create `src/components/shared/StatCard.tsx` with title, value, icon, optional trend
    - Add animated counter on mount using framer-motion
    - _Requirements: 2.1, 7.1_

  - [x] 4.2 Implement Modal component
    - Create `src/components/shared/Modal.tsx` using Radix Dialog
    - Implement backdrop, ESC key, focus trap
    - Add fade-in backdrop and scale-in content animations
    - _Requirements: 3.2, 4.2, 8.2, 9.2_

  - [x] 4.3 Implement DataTable component
    - Create `src/components/shared/DataTable.tsx` with sortable columns, filters, pagination
    - Support 20 items per page
    - Include empty state handling
    - _Requirements: 6.1, 9.1, 10.1_

  - [x] 4.4 Implement Chart component
    - Create `src/components/shared/Chart.tsx` as wrapper for Recharts
    - Support bar, line, and pie chart types
    - Implement responsive sizing and Spanish tooltips
    - _Requirements: 2.2, 6.2, 7.2, 11.5_

  - [x] 4.5 Implement EmptyState component
    - Create `src/components/shared/EmptyState.tsx` with message and optional action button
    - Use lucide-react icons
    - _Requirements: 20.5_

  - [x] 4.6 Write property test for empty state display
    - **Property 45: Empty State Display**
    - **Validates: Requirements 20.5**

- [x] 5. Hotel module - Dashboard
  - [x] 5.1 Implement HotelStats component
    - Create `src/components/hotel/HotelStats.tsx` with 4 stat cards (occupied, available, income, expenses)
    - Calculate values from room and transaction data
    - _Requirements: 2.1_

  - [x] 5.2 Implement hotel dashboard page
    - Create `src/app/hotel/dashboard/page.tsx` with HotelStats, occupancy chart, recent cleaning records, rooms needing cleaning
    - Ensure page loads within 500ms
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 5.3 Write unit tests for hotel dashboard
    - Test stat cards display correct values
    - Test chart renders with occupancy data
    - Test recent cleaning records list
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 6. Hotel module - Room management
  - [x] 6.1 Implement RoomCard component
    - Create `src/components/hotel/RoomCard.tsx` with color coding by status
    - Display room number, type, floor, price
    - Add scale-on-hover animation
    - _Requirements: 3.1_

  - [x] 6.2 Implement RoomGrid component
    - Create `src/components/hotel/RoomGrid.tsx` with responsive grid (4/2/1 columns)
    - Implement client-side filtering by status and floor
    - _Requirements: 3.1, 3.6_

  - [x] 6.3 Implement room CRUD operations
    - Create `src/app/hotel/habitaciones/page.tsx` with RoomGrid and create button
    - Implement modal forms for create/edit with validation
    - Implement delete functionality
    - Add employee assignment dropdown
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.7_

  - [x] 6.4 Write property test for room CRUD operations
    - **Property 2: Room CRUD Operations**
    - **Validates: Requirements 3.4, 3.5**

  - [x] 6.5 Write property test for room display and status
    - **Property 3: Room Display and Status**
    - **Validates: Requirements 3.1**

  - [x] 6.6 Write property test for room filtering
    - **Property 4: Room Filtering**
    - **Validates: Requirements 3.6**

  - [x] 6.7 Write property test for employee-room assignment
    - **Property 5: Employee-Room Assignment**
    - **Validates: Requirements 3.7**

- [x] 7. Hotel module - Employee management
  - [x] 7.1 Implement EmployeeCard component
    - Create `src/components/hotel/EmployeeCard.tsx` with photo, name, role, shift
    - Add click handler to open detail view
    - _Requirements: 4.1_

  - [x] 7.2 Implement employee CRUD operations
    - Create `src/app/hotel/empleados/page.tsx` with employee cards grid and create button
    - Implement modal forms for create/edit with validation
    - Implement delete functionality
    - _Requirements: 4.2, 4.3, 4.4_

  - [x] 7.3 Implement employee detail view with cleaning history
    - Add detail modal showing employee info and cleaning history table
    - Display dates, rooms cleaned, and times
    - _Requirements: 4.5_

  - [x] 7.4 Write property test for employee CRUD operations
    - **Property 6: Employee CRUD Operations**
    - **Validates: Requirements 4.3, 4.4**

  - [x] 7.5 Write property test for employee display with attributes
    - **Property 7: Employee Display with Attributes**
    - **Validates: Requirements 4.1**

  - [x] 7.6 Write property test for employee cleaning history
    - **Property 8: Employee Cleaning History**
    - **Validates: Requirements 4.5**

- [x] 8. Hotel module - Cleaning schedule and tracking
  - [x] 8.1 Implement CleaningSchedule component
    - Create `src/components/hotel/CleaningSchedule.tsx` with weekly calendar view
    - Display cleaning assignments by day and room
    - Show employee assignments
    - _Requirements: 5.1_

  - [x] 8.2 Implement cleaning configuration and tracking
    - Create `src/app/hotel/limpieza/page.tsx` with CleaningSchedule and status panel
    - Implement cleaning day configuration per room
    - Add "mark as complete" button that creates CleaningRecord and updates room status
    - Display status panel with counts (clean, pending, in process)
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 8.3 Write property test for cleaning record creation
    - **Property 9: Cleaning Record Creation**
    - **Validates: Requirements 5.3, 5.5**

  - [x] 8.4 Write property test for cleaning status aggregation
    - **Property 10: Cleaning Status Aggregation**
    - **Validates: Requirements 5.4**

  - [x] 8.5 Write property test for cleaning history display
    - **Property 11: Cleaning History Display**
    - **Validates: Requirements 5.6**

- [x] 9. Hotel module - Financial tracking
  - [x] 9.1 Implement hotel financial page
    - Create `src/app/hotel/finanzas/page.tsx` with transaction table, income vs expenses chart, monthly totals
    - Implement date filters
    - Add form to register new income/expense with validation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 9.2 Write property test for hotel financial transaction management
    - **Property 12: Hotel Financial Transaction Management**
    - **Validates: Requirements 6.5**

  - [x] 9.3 Write property test for monthly financial totals
    - **Property 13: Monthly Financial Totals**
    - **Validates: Requirements 6.3**

  - [x] 9.4 Write property test for expense categorization
    - **Property 14: Expense Categorization**
    - **Validates: Requirements 6.6, 11.4**

- [x] 10. Checkpoint - Hotel module complete
  - Ensure all Hotel module tests pass, verify navigation works, ask the user if questions arise.

- [x] 11. Arriendos module - Dashboard
  - [x] 11.1 Implement RentalStats component
    - Create `src/components/arriendos/RentalStats.tsx` with 4 stat cards (properties, tenants, collected, pending)
    - Calculate values from property, tenant, and payment data
    - Format currency values
    - _Requirements: 7.1_

  - [x] 11.2 Implement arriendos dashboard page
    - Create `src/app/arriendos/dashboard/page.tsx` with RentalStats, income by property chart, contract expirations, pending payments
    - Ensure page loads within 500ms
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 11.3 Write unit tests for arriendos dashboard
    - Test stat cards display correct values
    - Test income chart renders
    - Test contract expirations list
    - Test pending payments list
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 12. Arriendos module - Property management
  - [x] 12.1 Implement PropertyCard component
    - Create `src/components/arriendos/PropertyCard.tsx` with image, address, type, status badge
    - Add image zoom-on-hover animation
    - _Requirements: 8.1_

  - [x] 12.2 Implement property CRUD operations
    - Create `src/app/arriendos/propiedades/page.tsx` with property cards grid and create button
    - Implement modal forms for create/edit with validation
    - Implement delete functionality
    - Add tenant assignment dropdown
    - _Requirements: 8.2, 8.3, 8.4, 8.6_

  - [x] 12.3 Implement property detail view
    - Add detail modal showing current tenant, payment history, and associated expenses
    - _Requirements: 8.5_

  - [x] 12.4 Write property test for property CRUD operations
    - **Property 15: Property CRUD Operations**
    - **Validates: Requirements 8.3, 8.4**

  - [x] 12.5 Write property test for property display with attributes
    - **Property 16: Property Display with Attributes**
    - **Validates: Requirements 8.1**

  - [x] 12.6 Write property test for property detail view
    - **Property 17: Property Detail View**
    - **Validates: Requirements 8.5**

  - [x] 12.7 Write property test for tenant-property assignment
    - **Property 18: Tenant-Property Assignment**
    - **Validates: Requirements 8.6, 9.6**

- [x] 13. Arriendos module - Tenant management
  - [x] 13.1 Implement TenantCard component
    - Create `src/components/arriendos/TenantCard.tsx` as table row with name, contact, property, contract dates
    - Add click handler for detail view
    - _Requirements: 9.1_

  - [x] 13.2 Implement tenant CRUD operations
    - Create `src/app/arriendos/inquilinos/page.tsx` with tenant table and create button
    - Implement modal forms for create/edit with validation
    - Implement delete functionality
    - Add property association dropdown
    - _Requirements: 9.2, 9.3, 9.4, 9.6_

  - [x] 13.3 Implement tenant detail view
    - Add detail modal showing associated property, contract info, and payment history
    - _Requirements: 9.5_

  - [x] 13.4 Write property test for tenant CRUD operations
    - **Property 19: Tenant CRUD Operations**
    - **Validates: Requirements 9.3, 9.4**

  - [x] 13.5 Write property test for tenant display with attributes
    - **Property 20: Tenant Display with Attributes**
    - **Validates: Requirements 9.1**

  - [x] 13.6 Write property test for tenant detail view
    - **Property 21: Tenant Detail View**
    - **Validates: Requirements 9.5**

- [x] 14. Arriendos module - Payment tracking
  - [x] 14.1 Implement PaymentTable component
    - Create `src/components/arriendos/PaymentTable.tsx` with sortable columns and status badges
    - Implement filters by status and property
    - _Requirements: 10.1, 10.4_

  - [x] 14.2 Implement payment CRUD and receipt generation
    - Create `src/app/arriendos/pagos/page.tsx` with PaymentTable and register button
    - Implement modal form for registering payments with validation
    - Add receipt generation button (creates printable receipt)
    - Implement automatic overdue status calculation
    - _Requirements: 10.2, 10.3, 10.5, 10.6_

  - [x] 14.3 Write property test for payment CRUD operations
    - **Property 22: Payment CRUD Operations**
    - **Validates: Requirements 10.3**

  - [x] 14.4 Write property test for payment display with attributes
    - **Property 23: Payment Display with Attributes**
    - **Validates: Requirements 10.1**

  - [x] 14.5 Write property test for payment filtering
    - **Property 24: Payment Filtering**
    - **Validates: Requirements 10.4**

  - [x] 14.6 Write property test for payment receipt generation
    - **Property 25: Payment Receipt Generation**
    - **Validates: Requirements 10.5**

  - [x] 14.7 Write property test for automatic payment status calculation
    - **Property 26: Automatic Payment Status Calculation**
    - **Validates: Requirements 10.6**

- [x] 15. Arriendos module - Expense tracking
  - [x] 15.1 Implement ExpenseTracker component
    - Create `src/components/arriendos/ExpenseTracker.tsx` with expense list and category chart
    - Display expenses grouped by category
    - Calculate totals per property
    - _Requirements: 11.1, 11.5, 11.6_

  - [x] 15.2 Implement expense management page
    - Create `src/app/arriendos/gastos/page.tsx` with ExpenseTracker and add button
    - Implement modal form for adding expenses with validation
    - _Requirements: 11.2, 11.3, 11.4_

  - [x] 15.3 Write property test for property expense display
    - **Property 27: Property Expense Display**
    - **Validates: Requirements 11.1**

  - [x] 15.4 Write property test for expense CRUD operations
    - **Property 28: Expense CRUD Operations**
    - **Validates: Requirements 11.3**

  - [x] 15.5 Write property test for property expense totals
    - **Property 29: Property Expense Totals**
    - **Validates: Requirements 11.6**

- [x] 16. Arriendos module - Reminders and alerts
  - [x] 16.1 Implement reminders page
    - Create `src/app/arriendos/recordatorios/page.tsx` with reminder list and create button
    - Implement modal form for creating reminders with validation
    - Add mark-as-completed functionality
    - Implement filter by status (pending/completed)
    - Display due reminders prominently on dashboard
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 16.2 Write property test for reminder CRUD operations
    - **Property 30: Reminder CRUD Operations**
    - **Validates: Requirements 12.3**

  - [x] 16.3 Write property test for reminder display with attributes
    - **Property 31: Reminder Display with Attributes**
    - **Validates: Requirements 12.1**

  - [x] 16.4 Write property test for reminder status update
    - **Property 32: Reminder Status Update**
    - **Validates: Requirements 12.4**

  - [x] 16.5 Write property test for reminder dashboard display
    - **Property 33: Reminder Dashboard Display**
    - **Validates: Requirements 12.5**

  - [x] 16.6 Write property test for reminder filtering
    - **Property 34: Reminder Filtering**
    - **Validates: Requirements 12.6**

- [x] 17. Checkpoint - Arriendos module complete
  - Ensure all Arriendos module tests pass, verify navigation works, ask the user if questions arise.

- [x] 18. Chatbot implementation
  - [x] 18.1 Implement ChatButton component
    - Create `src/components/chatbot/ChatButton.tsx` as floating action button
    - Fixed position bottom-right
    - Add pulse animation
    - _Requirements: 13.1_

  - [x] 18.2 Implement ChatPanel component
    - Create `src/components/chatbot/ChatPanel.tsx` with slide-in animation
    - Implement message history display
    - Add input field and send button
    - _Requirements: 13.2_

  - [x] 18.3 Implement chatbot logic
    - Create keyword-based response matching in Spanish
    - Implement data queries (count rooms, check payments, etc.)
    - Implement navigation suggestions
    - Implement add guidance
    - Ensure responses within 1 second
    - _Requirements: 13.3, 13.4, 13.5, 13.6, 13.7_

  - [x] 18.4 Write property test for chatbot data queries
    - **Property 35: Chatbot Data Queries**
    - **Validates: Requirements 13.4**

  - [x] 18.5 Write property test for chatbot navigation assistance
    - **Property 36: Chatbot Navigation Assistance**
    - **Validates: Requirements 13.5**

  - [x] 18.6 Write property test for chatbot Spanish language support
    - **Property 37: Chatbot Spanish Language Support**
    - **Validates: Requirements 13.6, 18.5**

  - [x] 18.7 Write property test for chatbot add guidance
    - **Property 38: Chatbot Add Guidance**
    - **Validates: Requirements 13.7**

- [x] 19. Spanish language and localization
  - [x] 19.1 Audit all UI text for Spanish compliance
    - Review all labels, buttons, navigation items, error messages
    - Ensure proper Spanish terminology (Arriendos, not Rentals)
    - _Requirements: 18.1, 18.2, 18.4_

  - [x] 19.2 Implement Spanish date formatting
    - Configure date-fns with Spanish locale
    - Apply to all date displays throughout the app
    - _Requirements: 18.3_

  - [x] 19.3 Write property test for Spanish UI text
    - **Property 42: Spanish UI Text**
    - **Validates: Requirements 18.1, 18.2, 18.4**

  - [x] 19.4 Write property test for Spanish date formatting
    - **Property 43: Spanish Date Formatting**
    - **Validates: Requirements 18.3**

- [x] 20. Responsive design and animations
  - [x] 20.1 Implement responsive layouts for all pages
    - Verify desktop (>1024px), tablet (768-1024px), mobile (<768px) layouts
    - Test sidebar collapse on mobile
    - Ensure readability across all screen sizes
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [x] 20.2 Implement animations and transitions
    - Add hover animations to interactive elements (150ms)
    - Add page transition animations
    - Ensure smooth micro-interactions
    - _Requirements: 15.3, 15.4_

  - [x] 20.3 Add loading states and optimistic UI
    - Implement loading indicators for data operations
    - Implement optimistic UI updates for CRUD operations
    - Ensure UI updates within 200ms
    - _Requirements: 20.2, 20.3, 20.4_

  - [x] 20.4 Write property test for optimistic UI updates
    - **Property 44: Optimistic UI Updates**
    - **Validates: Requirements 20.4**

- [x] 21. Data validation and error handling
  - [x] 21.1 Implement comprehensive form validation
    - Add validation for all form inputs (required fields, data types, value ranges)
    - Display Spanish error messages inline
    - Prevent submission of invalid data
    - _Requirements: 16.5_

  - [x] 21.2 Implement error states and messages
    - Add toast notifications for operation failures
    - Implement retry options for failed operations
    - Add offline indicators
    - _Requirements: 20.2_

  - [x] 21.3 Write property test for data input validation
    - **Property 41: Data Input Validation**
    - **Validates: Requirements 16.5**

- [x] 22. Final integration and polish
  - [x] 22.1 Wire all components together
    - Verify all navigation links work correctly
    - Verify business context switching updates all dependent components
    - Verify data flows correctly between components
    - _Requirements: 1.2, 1.3, 1.4_

  - [x] 22.2 Performance optimization
    - Verify page load times <500ms
    - Verify data operation UI updates <200ms
    - Optimize bundle size if needed
    - _Requirements: 2.5, 7.5, 20.1, 20.3_

  - [x] 22.3 Accessibility audit
    - Verify keyboard navigation works
    - Verify focus management in modals
    - Verify ARIA labels where needed
    - _Requirements: 14.5_

  - [x] 22.4 Run full test suite
    - Execute all unit tests
    - Execute all property tests (100 iterations each)
    - Verify >80% code coverage
    - Verify 100% property coverage

- [x] 23. Final checkpoint - Complete application
  - Ensure all tests pass, verify all features work end-to-end, ask the user for final review.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property tests are integrated throughout to catch errors early
- Checkpoints ensure incremental validation at major milestones
- All Spanish language requirements are addressed in task 19
- Responsive design is verified in task 20
- Performance requirements are validated in task 22

