import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';
import { BusinessProvider } from '@/context/BusinessContext';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  usePathname: () => '/hotel/dashboard',
}));

describe('Sidebar Component', () => {
  beforeEach(() => {
    // Reset viewport to desktop size
    global.innerWidth = 1024;
  });

  describe('Context-Aware Navigation (Requirements 1.3, 14.4, 15.6)', () => {
    it('should display hotel navigation items when business context is hotel', () => {
      render(
        <BusinessProvider>
          <Sidebar />
        </BusinessProvider>
      );

      // Hotel-specific menu items
      expect(screen.getByText('Habitaciones')).toBeInTheDocument();
      expect(screen.getByText('Empleados')).toBeInTheDocument();
      expect(screen.getByText('Limpieza')).toBeInTheDocument();
      expect(screen.getByText('Finanzas')).toBeInTheDocument();

      // Should not show arriendos items
      expect(screen.queryByText('Propiedades')).not.toBeInTheDocument();
      expect(screen.queryByText('Inquilinos')).not.toBeInTheDocument();
    });

    it('should display all required hotel navigation items', () => {
      render(
        <BusinessProvider>
          <Sidebar />
        </BusinessProvider>
      );

      const expectedItems = [
        'Dashboard',
        'Habitaciones',
        'Empleados',
        'Limpieza',
        'Finanzas',
      ];

      expectedItems.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it('should use lucide-react icons for menu items', () => {
      const { container } = render(
        <BusinessProvider>
          <Sidebar />
        </BusinessProvider>
      );

      // Check that SVG icons are present (lucide-react renders as SVG)
      const icons = container.querySelectorAll('.nav-icon');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Active Route Highlighting', () => {
    it('should highlight the active route', () => {
      render(
        <BusinessProvider>
          <Sidebar />
        </BusinessProvider>
      );

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('nav-item-active');
    });

    it('should not highlight inactive routes', () => {
      render(
        <BusinessProvider>
          <Sidebar />
        </BusinessProvider>
      );

      const habitacionesLink = screen.getByText('Habitaciones').closest('a');
      expect(habitacionesLink).not.toHaveClass('nav-item-active');
    });
  });

  describe('Glassmorphism Styling', () => {
    it('should apply glassmorphism effect to sidebar', () => {
      const { container } = render(
        <BusinessProvider>
          <Sidebar />
        </BusinessProvider>
      );

      const sidebar = container.querySelector('.sidebar');
      expect(sidebar).toBeInTheDocument();
      
      // Check that sidebar has glassmorphism styles applied via CSS
      const styles = window.getComputedStyle(sidebar!);
      expect(styles.backdropFilter).toBeTruthy();
    });
  });

  describe('Responsive Behavior (Requirement 14.4)', () => {
    it('should render hamburger menu button for mobile', () => {
      const { container } = render(
        <BusinessProvider>
          <Sidebar />
        </BusinessProvider>
      );

      const hamburgerButton = container.querySelector('.mobile-menu-button');
      expect(hamburgerButton).toBeInTheDocument();
    });

    it('should toggle mobile menu when hamburger is clicked', () => {
      const { container } = render(
        <BusinessProvider>
          <Sidebar />
        </BusinessProvider>
      );

      const hamburgerButton = container.querySelector('.mobile-menu-button') as HTMLElement;
      const sidebar = container.querySelector('.sidebar');

      // Initially closed
      expect(sidebar).not.toHaveClass('sidebar-open');

      // Click to open
      fireEvent.click(hamburgerButton);
      expect(sidebar).toHaveClass('sidebar-open');

      // Click to close
      fireEvent.click(hamburgerButton);
      expect(sidebar).not.toHaveClass('sidebar-open');
    });

    it('should close mobile menu when overlay is clicked', () => {
      const { container } = render(
        <BusinessProvider>
          <Sidebar />
        </BusinessProvider>
      );

      const hamburgerButton = container.querySelector('.mobile-menu-button') as HTMLElement;
      
      // Open menu
      fireEvent.click(hamburgerButton);
      
      const overlay = container.querySelector('.mobile-overlay') as HTMLElement;
      expect(overlay).toBeInTheDocument();

      // Click overlay to close
      fireEvent.click(overlay);
      
      const sidebar = container.querySelector('.sidebar');
      expect(sidebar).not.toHaveClass('sidebar-open');
    });

    it('should close mobile menu when a nav item is clicked', () => {
      const { container } = render(
        <BusinessProvider>
          <Sidebar />
        </BusinessProvider>
      );

      const hamburgerButton = container.querySelector('.mobile-menu-button') as HTMLElement;
      
      // Open menu
      fireEvent.click(hamburgerButton);
      
      const sidebar = container.querySelector('.sidebar');
      expect(sidebar).toHaveClass('sidebar-open');

      // Click a nav item
      const navItem = screen.getByText('Habitaciones');
      fireEvent.click(navItem);

      // Menu should close
      expect(sidebar).not.toHaveClass('sidebar-open');
    });
  });

  describe('Navigation Links', () => {
    it('should render correct href for each hotel menu item', () => {
      render(
        <BusinessProvider>
          <Sidebar />
        </BusinessProvider>
      );

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveAttribute('href', '/hotel/dashboard');

      const habitacionesLink = screen.getByText('Habitaciones').closest('a');
      expect(habitacionesLink).toHaveAttribute('href', '/hotel/habitaciones');

      const empleadosLink = screen.getByText('Empleados').closest('a');
      expect(empleadosLink).toHaveAttribute('href', '/hotel/empleados');

      const limpiezaLink = screen.getByText('Limpieza').closest('a');
      expect(limpiezaLink).toHaveAttribute('href', '/hotel/limpieza');

      const finanzasLink = screen.getByText('Finanzas').closest('a');
      expect(finanzasLink).toHaveAttribute('href', '/hotel/finanzas');
    });
  });

  describe('Spanish Language Support (Requirement 18.1)', () => {
    it('should display all labels in Spanish', () => {
      render(
        <BusinessProvider>
          <Sidebar />
        </BusinessProvider>
      );

      // Verify Spanish labels
      expect(screen.getByText('Habitaciones')).toBeInTheDocument();
      expect(screen.getByText('Empleados')).toBeInTheDocument();
      expect(screen.getByText('Limpieza')).toBeInTheDocument();
      expect(screen.getByText('Finanzas')).toBeInTheDocument();
    });
  });
});
