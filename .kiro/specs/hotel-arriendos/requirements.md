# Requirements Document

## Introduction

This document specifies the requirements for a comprehensive web application to manage two distinct businesses: a Hotel and Arriendos (rental properties). The application will provide business-specific dashboards, management tools, financial tracking, and an intelligent chatbot assistant. The system will be built using Next.js with a professional, minimalist UI, initially using simulated data with a structure ready for future Supabase integration. All content will be presented in Spanish.

## Glossary

- **Application**: The complete web application managing both Hotel and Arriendos businesses
- **Business_Context**: The currently active business module (Hotel or Arriendos)
- **Hotel_Module**: The subsystem managing hotel operations including rooms, employees, cleaning, and finances
- **Arriendos_Module**: The subsystem managing rental properties, tenants, payments, and expenses
- **Room**: A hotel room with attributes including number, type, floor, price, and status
- **Room_Status**: The current state of a room (available, occupied, cleaning, maintenance)
- **Employee**: A hotel staff member with role, shift, and cleaning history
- **Cleaning_Record**: A log entry documenting who cleaned which room and when
- **Property**: A rental unit (apartment or house) managed in the Arriendos module
- **Tenant**: A person renting a property with contact information and contract details
- **Payment**: A rent payment transaction with amount, date, and status
- **Payment_Status**: The state of a payment (paid, pending, overdue)
- **Expense**: A financial outlay categorized by type and associated with a business or property
- **Reminder**: A scheduled alert for payments, maintenance, or contract renewals
- **Chatbot**: An intelligent assistant that answers questions and helps navigate the application
- **Business_Switcher**: The UI component allowing users to toggle between Hotel and Arriendos modules
- **Dashboard**: A summary view displaying key metrics and recent activity for a business
- **User**: A person interacting with the application (admin or employee)

## Requirements

### Requirement 1: Business Context Management

**User Story:** As a user, I want to switch between Hotel and Arriendos business contexts, so that I can manage both businesses from a single application.

#### Acceptance Criteria

1. THE Application SHALL provide a Business_Switcher component in the header
2. WHEN the User clicks the Business_Switcher, THE Application SHALL toggle the Business_Context between Hotel and Arriendos
3. WHEN the Business_Context changes, THE Application SHALL update the sidebar navigation to display context-appropriate menu items
4. WHEN the Business_Context changes, THE Application SHALL redirect the User to the dashboard of the selected business
5. THE Application SHALL persist the selected Business_Context across page navigations within the same session

### Requirement 2: Hotel Dashboard

**User Story:** As a hotel manager, I want to view a dashboard with key hotel metrics, so that I can quickly assess the current state of operations.

#### Acceptance Criteria

1. THE Hotel_Module SHALL display a dashboard with four stat cards showing occupied rooms count, available rooms count, monthly income total, and monthly expenses total
2. THE Hotel_Module SHALL display a chart showing room occupancy trends for the current month
3. THE Hotel_Module SHALL display a list of the most recent cleaning records
4. THE Hotel_Module SHALL display a list of rooms requiring cleaning on the current day
5. WHEN the User navigates to the Hotel dashboard, THE Application SHALL load and display all dashboard data within 500 milliseconds

### Requirement 3: Room Management

**User Story:** As a hotel manager, I want to create, view, update, and delete rooms, so that I can maintain an accurate inventory of hotel accommodations.

#### Acceptance Criteria

1. THE Hotel_Module SHALL display all rooms in a visual grid with color coding based on Room_Status
2. WHEN the User clicks a create button, THE Hotel_Module SHALL display a modal form to add a new Room with fields for number, type, floor, price, and status
3. WHEN the User clicks an existing Room, THE Hotel_Module SHALL display a modal form to edit the Room attributes
4. WHEN the User submits a valid room form, THE Hotel_Module SHALL save the Room data and update the display
5. WHEN the User deletes a Room, THE Hotel_Module SHALL remove the Room from the system and update the display
6. THE Hotel_Module SHALL provide filters to view rooms by Room_Status and floor
7. THE Hotel_Module SHALL allow assignment of an Employee to a Room for cleaning responsibility

### Requirement 4: Employee Management

**User Story:** As a hotel manager, I want to manage employee records, so that I can track staff information and their cleaning activities.

#### Acceptance Criteria

1. THE Hotel_Module SHALL display all employees as cards showing photo, name, role, and shift
2. WHEN the User clicks a create button, THE Hotel_Module SHALL display a form to add a new Employee with fields for name, role, shift, and photo
3. WHEN the User clicks an existing Employee, THE Hotel_Module SHALL display a form to edit the Employee attributes
4. WHEN the User deletes an Employee, THE Hotel_Module SHALL remove the Employee from the system
5. WHEN the User views an Employee detail, THE Hotel_Module SHALL display the Employee cleaning history with dates, rooms, and times

### Requirement 5: Cleaning Schedule and Tracking

**User Story:** As a hotel manager, I want to schedule and track room cleaning activities, so that I can ensure all rooms are properly maintained and know who cleaned each room.

#### Acceptance Criteria

1. THE Hotel_Module SHALL display a weekly calendar view of cleaning schedules
2. THE Hotel_Module SHALL allow the User to configure cleaning days for each Room
3. WHEN an Employee completes a cleaning task, THE Hotel_Module SHALL record a Cleaning_Record with the Employee identifier, Room identifier, and timestamp
4. THE Hotel_Module SHALL display a panel showing current cleaning status with counts of clean rooms, pending rooms, and rooms in process
5. WHEN the User clicks a complete button for a cleaning task, THE Hotel_Module SHALL create a Cleaning_Record and update the Room_Status
6. THE Hotel_Module SHALL display which Employee cleaned which Room and at what time in the cleaning history

### Requirement 6: Hotel Financial Tracking

**User Story:** As a hotel manager, I want to track income and expenses, so that I can monitor the financial health of the hotel business.

#### Acceptance Criteria

1. THE Hotel_Module SHALL display a table of all income and expense transactions with date filters
2. THE Hotel_Module SHALL display a bar chart comparing monthly income versus expenses
3. THE Hotel_Module SHALL calculate and display monthly totals for income and expenses
4. WHEN the User clicks an add button, THE Hotel_Module SHALL display a form to register a new income or Expense entry with fields for amount, category, date, and description
5. WHEN the User submits a valid financial entry, THE Hotel_Module SHALL save the transaction and update all financial displays
6. THE Hotel_Module SHALL categorize expenses by type including utilities, maintenance, repairs, and improvements

### Requirement 7: Arriendos Dashboard

**User Story:** As a property manager, I want to view a dashboard with key rental metrics, so that I can quickly assess the state of my rental business.

#### Acceptance Criteria

1. THE Arriendos_Module SHALL display a dashboard with four stat cards showing total properties count, active tenants count, rent collected amount, and pending rent amount
2. THE Arriendos_Module SHALL display a chart showing income by Property
3. THE Arriendos_Module SHALL display a list of upcoming contract expiration dates
4. THE Arriendos_Module SHALL display a list of pending payments with Tenant and Property information
5. WHEN the User navigates to the Arriendos dashboard, THE Application SHALL load and display all dashboard data within 500 milliseconds

### Requirement 8: Property Management

**User Story:** As a property manager, I want to create, view, update, and delete rental properties, so that I can maintain an accurate inventory of my rental units.

#### Acceptance Criteria

1. THE Arriendos_Module SHALL display all properties as cards showing image, address, type, and status
2. WHEN the User clicks a create button, THE Arriendos_Module SHALL display a form to add a new Property with fields for address, type (apartment or house), image, and status
3. WHEN the User clicks an existing Property, THE Arriendos_Module SHALL display a form to edit the Property attributes
4. WHEN the User deletes a Property, THE Arriendos_Module SHALL remove the Property from the system
5. WHEN the User views a Property detail, THE Arriendos_Module SHALL display the current Tenant, payment history, and associated expenses
6. THE Arriendos_Module SHALL allow assignment of a Tenant to a Property

### Requirement 9: Tenant Management

**User Story:** As a property manager, I want to manage tenant records, so that I can track contact information, contracts, and payment history.

#### Acceptance Criteria

1. THE Arriendos_Module SHALL display all tenants in a table with contact information
2. WHEN the User clicks a create button, THE Arriendos_Module SHALL display a form to add a new Tenant with fields for name, contact information, and contract details
3. WHEN the User clicks an existing Tenant, THE Arriendos_Module SHALL display a form to edit the Tenant attributes
4. WHEN the User deletes a Tenant, THE Arriendos_Module SHALL remove the Tenant from the system
5. WHEN the User views a Tenant detail, THE Arriendos_Module SHALL display the associated Property, contract information, and payment history
6. THE Arriendos_Module SHALL allow association of a Tenant with a Property

### Requirement 10: Payment Tracking

**User Story:** As a property manager, I want to track rent payments, so that I can monitor which tenants have paid and which payments are overdue.

#### Acceptance Criteria

1. THE Arriendos_Module SHALL display a table of all payments showing Tenant, Property, amount, date, and Payment_Status
2. WHEN the User clicks a register button, THE Arriendos_Module SHALL display a form to record a new Payment with fields for Tenant, Property, amount, date, and status
3. WHEN the User submits a valid payment form, THE Arriendos_Module SHALL save the Payment and update the payment table
4. THE Arriendos_Module SHALL provide filters to view payments by Payment_Status and Property
5. WHEN the User selects a Payment, THE Arriendos_Module SHALL provide an option to generate a receipt
6. THE Arriendos_Module SHALL automatically calculate Payment_Status as overdue when the payment date is past and status is pending

### Requirement 11: Property Expense Tracking

**User Story:** As a property manager, I want to track expenses for each property, so that I can monitor maintenance costs and calculate net income.

#### Acceptance Criteria

1. THE Arriendos_Module SHALL display a list of expenses associated with each Property
2. WHEN the User clicks an add button, THE Arriendos_Module SHALL display a form to register a new Expense with fields for Property, amount, category, date, and description
3. WHEN the User submits a valid expense form, THE Arriendos_Module SHALL save the Expense and update the expense display
4. THE Arriendos_Module SHALL categorize expenses by type including repairs, services, and taxes
5. THE Arriendos_Module SHALL display a chart showing expenses by category
6. THE Arriendos_Module SHALL calculate total expenses per Property for financial reporting

### Requirement 12: Reminders and Alerts

**User Story:** As a property manager, I want to create and manage reminders, so that I don't miss important deadlines for payments, maintenance, or contract renewals.

#### Acceptance Criteria

1. THE Arriendos_Module SHALL display a list of all reminders with description, date, and status
2. WHEN the User clicks a create button, THE Arriendos_Module SHALL display a form to add a new Reminder with fields for type (payment, maintenance, contract renewal), date, description, and associated Property or Tenant
3. WHEN the User submits a valid reminder form, THE Arriendos_Module SHALL save the Reminder and update the reminder list
4. THE Arriendos_Module SHALL allow the User to mark a Reminder as completed
5. WHEN a Reminder date arrives, THE Arriendos_Module SHALL display the Reminder prominently on the dashboard
6. THE Arriendos_Module SHALL filter reminders by status (pending or completed)

### Requirement 13: Intelligent Chatbot

**User Story:** As a user, I want to interact with an intelligent chatbot, so that I can quickly get answers to questions and navigate the application efficiently.

#### Acceptance Criteria

1. THE Application SHALL display a floating Chatbot button in the lower right corner of all pages
2. WHEN the User clicks the Chatbot button, THE Application SHALL expand a chat panel
3. WHEN the User types a question in the chat panel, THE Chatbot SHALL analyze the question and provide a relevant response within 1 second
4. THE Chatbot SHALL answer questions about current data such as "how many rooms are occupied" or "who owes rent"
5. THE Chatbot SHALL provide navigation assistance by suggesting relevant pages based on User queries
6. THE Chatbot SHALL support Spanish language input and output
7. WHEN the User asks about adding information, THE Chatbot SHALL guide the User to the appropriate form or page

### Requirement 14: Responsive Design

**User Story:** As a user, I want the application to work well on different screen sizes, so that I can access it from desktop, tablet, or mobile devices.

#### Acceptance Criteria

1. THE Application SHALL display correctly on desktop screens with width greater than 1024 pixels
2. THE Application SHALL display correctly on tablet screens with width between 768 and 1024 pixels
3. THE Application SHALL display correctly on mobile screens with width less than 768 pixels
4. WHEN the screen width is less than 768 pixels, THE Application SHALL collapse the sidebar into a hamburger menu
5. THE Application SHALL maintain readability and usability across all supported screen sizes

### Requirement 15: Visual Design and Animations

**User Story:** As a user, I want a professional and pleasant visual experience, so that the application is enjoyable to use.

#### Acceptance Criteria

1. THE Application SHALL use a minimalist color palette with neutral grays, whites, and subtle accent colors
2. THE Application SHALL use the Inter font family for all text
3. WHEN the User hovers over interactive elements, THE Application SHALL display a smooth hover animation within 150 milliseconds
4. WHEN the User navigates between pages, THE Application SHALL display a smooth page transition animation
5. THE Application SHALL use consistent spacing, typography, and component styling throughout all modules
6. THE Application SHALL display icons from the lucide-react library for all UI actions

### Requirement 16: Data Structure for Future Integration

**User Story:** As a developer, I want the data structure to be ready for database integration, so that I can easily connect to Supabase in the future.

#### Acceptance Criteria

1. THE Application SHALL use TypeScript interfaces that mirror database table structures for all data entities
2. THE Application SHALL implement data access functions that can be replaced with API calls without changing component code
3. THE Application SHALL use unique identifiers for all entities (rooms, employees, properties, tenants, payments, expenses)
4. THE Application SHALL structure relationships between entities using foreign key patterns (e.g., Tenant references Property)
5. THE Application SHALL validate all data inputs according to database constraints (required fields, data types, value ranges)

### Requirement 17: Simulated Data

**User Story:** As a developer, I want comprehensive simulated data, so that I can demonstrate all features without requiring a backend.

#### Acceptance Criteria

1. THE Application SHALL provide simulated data for at least 12 hotel rooms with varied types, floors, and statuses
2. THE Application SHALL provide simulated data for at least 5 hotel employees with different roles and shifts
3. THE Application SHALL provide simulated data for at least 30 cleaning records spanning multiple weeks
4. THE Application SHALL provide simulated data for at least 20 hotel financial transactions
5. THE Application SHALL provide simulated data for at least 8 rental properties with varied types and addresses
6. THE Application SHALL provide simulated data for at least 10 tenants with complete contact information
7. THE Application SHALL provide simulated data for at least 40 payment records with varied statuses
8. THE Application SHALL provide simulated data for at least 15 property expenses across different categories
9. THE Application SHALL provide simulated data for at least 5 reminders with different types and dates

### Requirement 18: Spanish Language Support

**User Story:** As a Spanish-speaking user, I want all interface text in Spanish, so that I can use the application in my native language.

#### Acceptance Criteria

1. THE Application SHALL display all UI labels, buttons, and navigation items in Spanish
2. THE Application SHALL display all error messages and validation feedback in Spanish
3. THE Application SHALL format dates using Spanish locale conventions
4. THE Application SHALL use Spanish terminology for all business concepts (e.g., "Arriendos" not "Rentals")
5. THE Chatbot SHALL communicate exclusively in Spanish

### Requirement 19: Authentication and Authorization (Future)

**User Story:** As an admin, I want to control access to the application, so that only authorized users can view and modify business data.

#### Acceptance Criteria

1. THE Application SHALL provide a structure for user authentication that can be implemented with Supabase Auth
2. THE Application SHALL define role-based access patterns (admin, employee, viewer)
3. WHERE authentication is implemented, THE Application SHALL restrict access to sensitive financial data based on user role
4. WHERE authentication is implemented, THE Application SHALL allow employees to view only their assigned tasks and cleaning records
5. WHERE authentication is implemented, THE Application SHALL require admin role for creating, updating, or deleting employees, properties, and tenants

### Requirement 20: Performance and Loading States

**User Story:** As a user, I want the application to feel fast and responsive, so that I can work efficiently.

#### Acceptance Criteria

1. WHEN the User navigates to any page, THE Application SHALL display the page content within 500 milliseconds
2. WHEN the Application is loading data, THE Application SHALL display a loading indicator
3. WHEN a data operation completes, THE Application SHALL update the UI within 200 milliseconds
4. THE Application SHALL implement optimistic UI updates for create, update, and delete operations
5. THE Application SHALL display empty state messages when no data is available for a given view
