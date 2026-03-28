import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmployeeCard from './EmployeeCard';
import { mockEmployees } from '@/data/hotel-mock';

describe('EmployeeCard Integration', () => {
  it('should render all mock employees correctly', () => {
    mockEmployees.forEach((employee) => {
      const { unmount } = render(<EmployeeCard employee={employee} />);
      
      // Verify name is displayed
      expect(screen.getByText(employee.name)).toBeInTheDocument();
      
      // Verify role is displayed in Spanish
      const roleLabels: Record<typeof employee.role, string> = {
        recepcionista: 'Recepcionista',
        limpieza: 'Limpieza',
        mantenimiento: 'Mantenimiento',
        gerente: 'Gerente',
      };
      expect(screen.getByText(roleLabels[employee.role])).toBeInTheDocument();
      
      // Verify shift is displayed in Spanish
      const shiftLabels: Record<typeof employee.shift, string> = {
        mañana: 'Mañana',
        tarde: 'Tarde',
        noche: 'Noche',
      };
      expect(screen.getByText(shiftLabels[employee.shift])).toBeInTheDocument();
      
      unmount();
    });
  });

  it('should handle employees with and without photos', () => {
    const employeesWithPhotos = mockEmployees.filter(e => e.photo);
    const employeesWithoutPhotos = mockEmployees.filter(e => !e.photo);

    // Verify we have both types in mock data
    expect(employeesWithPhotos.length).toBeGreaterThan(0);
    expect(employeesWithoutPhotos.length).toBeGreaterThan(0);

    // Test employees with photos
    employeesWithPhotos.forEach((employee) => {
      const { unmount } = render(<EmployeeCard employee={employee} />);
      const img = screen.getByAltText(employee.name);
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', employee.photo);
      unmount();
    });

    // Test employees without photos
    employeesWithoutPhotos.forEach((employee) => {
      const { unmount } = render(<EmployeeCard employee={employee} />);
      // Should not have an img with alt text
      expect(screen.queryByAltText(employee.name)).not.toBeInTheDocument();
      unmount();
    });
  });

  it('should display all different roles from mock data', () => {
    const roles = new Set(mockEmployees.map(e => e.role));
    
    // Verify we have multiple roles in mock data
    expect(roles.size).toBeGreaterThan(1);
    
    roles.forEach((role) => {
      const employee = mockEmployees.find(e => e.role === role);
      if (employee) {
        const { unmount } = render(<EmployeeCard employee={employee} />);
        
        const roleLabels: Record<typeof role, string> = {
          recepcionista: 'Recepcionista',
          limpieza: 'Limpieza',
          mantenimiento: 'Mantenimiento',
          gerente: 'Gerente',
        };
        
        expect(screen.getByText(roleLabels[role])).toBeInTheDocument();
        unmount();
      }
    });
  });

  it('should display all different shifts from mock data', () => {
    const shifts = new Set(mockEmployees.map(e => e.shift));
    
    // Verify we have multiple shifts in mock data
    expect(shifts.size).toBeGreaterThan(1);
    
    shifts.forEach((shift) => {
      const employee = mockEmployees.find(e => e.shift === shift);
      if (employee) {
        const { unmount } = render(<EmployeeCard employee={employee} />);
        
        const shiftLabels: Record<typeof shift, string> = {
          mañana: 'Mañana',
          tarde: 'Tarde',
          noche: 'Noche',
        };
        
        expect(screen.getByText(shiftLabels[shift])).toBeInTheDocument();
        unmount();
      }
    });
  });
});
