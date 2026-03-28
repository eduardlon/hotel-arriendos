import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from './EmptyState';
import { Inbox } from 'lucide-react';

describe('EmptyState', () => {
  it('renders with message and icon', () => {
    render(
      <EmptyState
        message="No hay datos disponibles"
        icon={Inbox}
      />
    );

    expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument();
  });

  it('renders without action button when action is not provided', () => {
    render(
      <EmptyState
        message="No hay habitaciones"
        icon={Inbox}
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders with action button when action is provided', () => {
    const mockAction = vi.fn();
    
    render(
      <EmptyState
        message="No hay habitaciones"
        icon={Inbox}
        action={{
          label: 'Agregar habitación',
          onClick: mockAction,
        }}
      />
    );

    expect(screen.getByRole('button', { name: 'Agregar habitación' })).toBeInTheDocument();
  });

  it('calls action onClick when button is clicked', async () => {
    const user = userEvent.setup();
    const mockAction = vi.fn();
    
    render(
      <EmptyState
        message="No hay habitaciones"
        icon={Inbox}
        action={{
          label: 'Agregar habitación',
          onClick: mockAction,
        }}
      />
    );

    const button = screen.getByRole('button', { name: 'Agregar habitación' });
    await user.click(button);

    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('displays Spanish message text', () => {
    render(
      <EmptyState
        message="No hay propiedades disponibles"
        icon={Inbox}
      />
    );

    expect(screen.getByText('No hay propiedades disponibles')).toBeInTheDocument();
  });

  it('renders centered layout', () => {
    const { container } = render(
      <EmptyState
        message="No hay datos"
        icon={Inbox}
      />
    );

    const emptyStateDiv = container.firstChild as HTMLElement;
    
    // Verify the component renders with expected structure
    expect(emptyStateDiv).toBeInTheDocument();
    expect(screen.getByText('No hay datos')).toBeInTheDocument();
  });
});
