/**
 * EmployeeCard Component Usage Example
 * 
 * This file demonstrates how to use the EmployeeCard component.
 * It is not part of the application but serves as documentation.
 */

import EmployeeCard from './EmployeeCard';
import { mockEmployees } from '@/data/hotel-mock';

export default function EmployeeCardExample() {
  const handleEmployeeClick = (employeeId: string) => {
    console.log('Employee clicked:', employeeId);
    // In the actual implementation, this would open a detail modal
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '1rem',
      padding: '2rem'
    }}>
      {mockEmployees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          onClick={() => handleEmployeeClick(employee.id)}
        />
      ))}
    </div>
  );
}

/**
 * Usage Notes:
 * 
 * 1. The component displays employee information in a card format
 * 2. It shows photo (or placeholder), name, role, and shift
 * 3. The onClick handler is called when the card is clicked
 * 4. All text is displayed in Spanish
 * 5. The component uses framer-motion for hover animations
 * 
 * Props:
 * - employee: Employee object with all required fields
 * - onClick?: Optional click handler for opening detail view
 * 
 * Styling:
 * - Uses CSS modules for scoped styling
 * - Follows the same design patterns as RoomCard
 * - Responsive design with mobile adjustments
 * - Hover animation scales the card to 1.05
 * 
 * Requirements Validated:
 * - Requirement 4.1: Display employee photo, name, role, and shift
 * - Click handler for detail view (to be implemented in task 7.3)
 */
