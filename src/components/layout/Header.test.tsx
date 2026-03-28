import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';
import { useBusinessContext } from '@/context/BusinessContext';
import { usePathname, useRouter } from 'next/navigation';

// Mock the context and navigation hooks
vi.mock('@/context/BusinessContext');
vi.mock('next/navigation');

describe('Header Component', () => {
  const mockToggleBusiness = vi.fn();
  const mockPush = vi.fn();
  const mockUsePathname = vi.mocked(usePathname);
  const mockUseRouter = vi.mocked(useRouter);
  const mockUseBusinessContext = vi.mocked(useBusinessContext);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue('/hotel/dashboard');
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    } as any);
    mockUseBusinessContext.mockReturnValue({
      currentBusiness: 'hotel',
      toggleBusiness: mockToggleBusiness,
      setBusiness: vi.fn(),
    });
  });

  it('renders the header component', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('displays the correct page title for hotel dashboard', () => {
    mockUsePathname.mockReturnValue('/hotel/dashboard');
    render(<Header />);
    expect(screen.getByText('Dashboard Hotel')).toBeInTheDocument();
  });

  it('displays the correct page title for arriendos dashboard', () => {
    mockUsePathname.mockReturnValue('/arriendos/dashboard');
    render(<Header />);
    expect(screen.getByText('Dashboard Arriendos')).toBeInTheDocument();
  });

  it('displays the correct page title for habitaciones', () => {
    mockUsePathname.mockReturnValue('/hotel/habitaciones');
    render(<Header />);
    expect(screen.getByText('Habitaciones')).toBeInTheDocument();
  });

  it('displays the correct page title for propiedades', () => {
    mockUsePathname.mockReturnValue('/arriendos/propiedades');
    render(<Header />);
    expect(screen.getByText('Propiedades')).toBeInTheDocument();
  });

  it('displays default title for unknown routes', () => {
    mockUsePathname.mockReturnValue('/unknown/route');
    render(<Header />);
    expect(screen.getByText('Hotel-Arriendos')).toBeInTheDocument();
  });

  it('displays business switcher button with Hotel label when in hotel context', () => {
    mockUseBusinessContext.mockReturnValue({
      currentBusiness: 'hotel',
      toggleBusiness: mockToggleBusiness,
      setBusiness: vi.fn(),
    });
    render(<Header />);
    expect(screen.getByText('Hotel')).toBeInTheDocument();
  });

  it('displays business switcher button with Arriendos label when in arriendos context', () => {
    mockUseBusinessContext.mockReturnValue({
      currentBusiness: 'arriendos',
      toggleBusiness: mockToggleBusiness,
      setBusiness: vi.fn(),
    });
    render(<Header />);
    expect(screen.getByText('Arriendos')).toBeInTheDocument();
  });

  it('calls toggleBusiness when business switcher button is clicked', () => {
    render(<Header />);
    
    const switcherButton = screen.getByRole('button', { name: /cambiar a/i });
    fireEvent.click(switcherButton);
    
    expect(mockToggleBusiness).toHaveBeenCalledTimes(1);
  });

  it('has correct aria-label for business switcher when in hotel context', () => {
    mockUseBusinessContext.mockReturnValue({
      currentBusiness: 'hotel',
      toggleBusiness: mockToggleBusiness,
      setBusiness: vi.fn(),
    });
    render(<Header />);
    
    const switcherButton = screen.getByRole('button', { name: 'Cambiar a Arriendos' });
    expect(switcherButton).toBeInTheDocument();
  });

  it('has correct aria-label for business switcher when in arriendos context', () => {
    mockUseBusinessContext.mockReturnValue({
      currentBusiness: 'arriendos',
      toggleBusiness: mockToggleBusiness,
      setBusiness: vi.fn(),
    });
    render(<Header />);
    
    const switcherButton = screen.getByRole('button', { name: 'Cambiar a Hotel' });
    expect(switcherButton).toBeInTheDocument();
  });

  it('displays the correct icon for hotel context', () => {
    mockUseBusinessContext.mockReturnValue({
      currentBusiness: 'hotel',
      toggleBusiness: mockToggleBusiness,
      setBusiness: vi.fn(),
    });
    render(<Header />);
    
    // Check that the button contains an svg (icon)
    const switcherButton = screen.getByRole('button', { name: /cambiar a/i });
    const icon = switcherButton.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('displays the correct icon for arriendos context', () => {
    mockUseBusinessContext.mockReturnValue({
      currentBusiness: 'arriendos',
      toggleBusiness: mockToggleBusiness,
      setBusiness: vi.fn(),
    });
    render(<Header />);
    
    // Check that the button contains an svg (icon)
    const switcherButton = screen.getByRole('button', { name: /cambiar a/i });
    const icon = switcherButton.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
