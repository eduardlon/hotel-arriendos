import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import BusinessSwitcher from './BusinessSwitcher';
import { useBusinessContext } from '@/context/BusinessContext';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock BusinessContext
vi.mock('@/context/BusinessContext', () => ({
  useBusinessContext: vi.fn(),
}));

describe('BusinessSwitcher Component', () => {
  const mockPush = vi.fn();
  const mockToggleBusiness = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
  });

  it('should render with Hotel label when current business is hotel', () => {
    (useBusinessContext as ReturnType<typeof vi.fn>).mockReturnValue({
      currentBusiness: 'hotel',
      toggleBusiness: mockToggleBusiness,
    });

    render(<BusinessSwitcher />);

    expect(screen.getByText('Hotel')).toBeInTheDocument();
    expect(screen.getByLabelText('Cambiar a Arriendos')).toBeInTheDocument();
  });

  it('should render with Arriendos label when current business is arriendos', () => {
    (useBusinessContext as ReturnType<typeof vi.fn>).mockReturnValue({
      currentBusiness: 'arriendos',
      toggleBusiness: mockToggleBusiness,
    });

    render(<BusinessSwitcher />);

    expect(screen.getByText('Arriendos')).toBeInTheDocument();
    expect(screen.getByLabelText('Cambiar a Hotel')).toBeInTheDocument();
  });

  it('should toggle business context and redirect to arriendos dashboard when clicked from hotel', () => {
    (useBusinessContext as ReturnType<typeof vi.fn>).mockReturnValue({
      currentBusiness: 'hotel',
      toggleBusiness: mockToggleBusiness,
    });

    render(<BusinessSwitcher />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockToggleBusiness).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/arriendos/dashboard');
  });

  it('should toggle business context and redirect to hotel dashboard when clicked from arriendos', () => {
    (useBusinessContext as ReturnType<typeof vi.fn>).mockReturnValue({
      currentBusiness: 'arriendos',
      toggleBusiness: mockToggleBusiness,
    });

    render(<BusinessSwitcher />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockToggleBusiness).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/hotel/dashboard');
  });

  it('should display HomeIcon when current business is hotel', () => {
    (useBusinessContext as ReturnType<typeof vi.fn>).mockReturnValue({
      currentBusiness: 'hotel',
      toggleBusiness: mockToggleBusiness,
    });

    const { container } = render(<BusinessSwitcher />);

    // Check that the icon is rendered (lucide-react icons have a specific class)
    const icon = container.querySelector('.business-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should display Building2 icon when current business is arriendos', () => {
    (useBusinessContext as ReturnType<typeof vi.fn>).mockReturnValue({
      currentBusiness: 'arriendos',
      toggleBusiness: mockToggleBusiness,
    });

    const { container } = render(<BusinessSwitcher />);

    // Check that the icon is rendered
    const icon = container.querySelector('.business-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    (useBusinessContext as ReturnType<typeof vi.fn>).mockReturnValue({
      currentBusiness: 'hotel',
      toggleBusiness: mockToggleBusiness,
    });

    render(<BusinessSwitcher />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Cambiar a Arriendos');
  });
});
