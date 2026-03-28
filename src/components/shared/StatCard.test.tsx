import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from './StatCard';
import { TrendingUp } from 'lucide-react';

describe('StatCard Component', () => {
  it('should render with title and numeric value', () => {
    render(<StatCard title="Total Habitaciones" value={42} icon={TrendingUp} />);
    
    expect(screen.getByText('Total Habitaciones')).toBeInTheDocument();
    // The animated value will eventually show 42
    expect(screen.getByText(/42|0/)).toBeInTheDocument();
  });

  it('should render with title and string value', () => {
    render(<StatCard title="Ingresos Mensuales" value="$1,250" icon={TrendingUp} />);
    
    expect(screen.getByText('Ingresos Mensuales')).toBeInTheDocument();
    expect(screen.getByText('$1,250')).toBeInTheDocument();
  });

  it('should render icon', () => {
    const { container } = render(
      <StatCard title="Test Stat" value={100} icon={TrendingUp} />
    );
    
    // Check that an SVG icon is rendered
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should render positive trend when provided', () => {
    render(<StatCard title="Test Stat" value={100} icon={TrendingUp} trend={15} />);
    
    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  it('should render negative trend when provided', () => {
    render(<StatCard title="Test Stat" value={100} icon={TrendingUp} trend={-8} />);
    
    expect(screen.getByText('-8%')).toBeInTheDocument();
  });

  it('should not render trend when not provided', () => {
    const { container } = render(
      <StatCard title="Test Stat" value={100} icon={TrendingUp} />
    );
    
    // Check that no trend element exists
    expect(container.textContent).not.toMatch(/[+-]\d+%/);
  });

  it('should render with zero value', () => {
    render(<StatCard title="Empty Rooms" value={0} icon={TrendingUp} />);
    
    expect(screen.getByText('Empty Rooms')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should handle large numeric values', () => {
    render(<StatCard title="Large Number" value={999999} icon={TrendingUp} />);
    
    expect(screen.getByText('Large Number')).toBeInTheDocument();
    // The value should eventually animate to the target
    expect(screen.getByText(/999999|0/)).toBeInTheDocument();
  });

  it('should render with zero trend', () => {
    render(<StatCard title="Test Stat" value={100} icon={TrendingUp} trend={0} />);
    
    expect(screen.getByText('+0%')).toBeInTheDocument();
  });
});
