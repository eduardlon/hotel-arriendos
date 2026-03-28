import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmployeeCard from './EmployeeCard';
import type { Employee } from '@/types';

describe('EmployeeCard', () => {
  const mockEmployee: Employee = {
    id: 'emp-001',
    name: 'María González',
    role: 'limpieza',
    shift: 'mañana',
    photo: '/images/employees/maria.jpg',
    phone: '+56912345678',
    email: 'maria.gonzalez@hotel.cl',
    hireDate: new Date('2022-03-15'),
  };

  it('should display employee name', () => {
    render(<EmployeeCard employee={mockEmployee} />);
    expect(screen.getByText('María González')).toBeInTheDocument();
  });

  it('should display employee role in Spanish', () => {
    render(<EmployeeCard employee={mockEmployee} />);
    expect(screen.getByText('Limpieza')).toBeInTheDocument();
  });

  it('should display employee shift in Spanish', () => {
    render(<EmployeeCard employee={mockEmployee} />);
    expect(screen.getByText('Mañana')).toBeInTheDocument();
  });

  it('should display employee photo when provided', () => {
    render(<EmployeeCard employee={mockEmployee} />);
    const img = screen.getByAltText('María González');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/employees/maria.jpg');
  });

  it('should display placeholder when photo is not provided', () => {
    const employeeWithoutPhoto = { ...mockEmployee, photo: undefined };
    render(<EmployeeCard employee={employeeWithoutPhoto} />);
    // Placeholder should be rendered (User icon)
    expect(screen.queryByAltText('María González')).not.toBeInTheDocument();
  });

  it('should call onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<EmployeeCard employee={mockEmployee} onClick={handleClick} />);
    
    await user.click(screen.getByText('María González'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should display all role types correctly', () => {
    const roles: Array<Employee['role']> = ['recepcionista', 'limpieza', 'mantenimiento', 'gerente'];
    const expectedLabels = ['Recepcionista', 'Limpieza', 'Mantenimiento', 'Gerente'];

    roles.forEach((role, index) => {
      const employee = { ...mockEmployee, role };
      const { unmount } = render(<EmployeeCard employee={employee} />);
      expect(screen.getByText(expectedLabels[index])).toBeInTheDocument();
      unmount();
    });
  });

  it('should display all shift types correctly', () => {
    const shifts: Array<Employee['shift']> = ['mañana', 'tarde', 'noche'];
    const expectedLabels = ['Mañana', 'Tarde', 'Noche'];

    shifts.forEach((shift, index) => {
      const employee = { ...mockEmployee, shift };
      const { unmount } = render(<EmployeeCard employee={employee} />);
      expect(screen.getByText(expectedLabels[index])).toBeInTheDocument();
      unmount();
    });
  });
});
