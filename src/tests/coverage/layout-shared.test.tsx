import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AppShell from '@/components/layout/AppShell';
import OfflineBanner from '@/components/shared/OfflineBanner';
import RentalStats from '@/components/arriendos/RentalStats';
import RootLayout from '@/app/layout';
import type { Payment, Property, Tenant } from '@/types';
import { BusinessProvider } from '@/context/BusinessContext';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/hotel/dashboard',
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('next/font/google', () => ({
  Inter: () => ({ className: 'inter' }),
}));

vi.mock('@/components/chatbot/ChatPanel', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="chat-panel" /> : null),
}));

describe('Layout and shared coverage', () => {
  it('renders AppShell and toggles chat panel', () => {
    render(
      <BusinessProvider>
        <AppShell>
          <div>Contenido</div>
        </AppShell>
      </BusinessProvider>
    );

    expect(screen.getByText('Contenido')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /abrir chatbot/i });
    fireEvent.click(button);

    expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
  });

  it('renders OfflineBanner when offline', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      configurable: true,
    });

    render(<OfflineBanner />);

    await waitFor(() => {
      expect(screen.getByText(/estás sin conexión/i)).toBeInTheDocument();
    });
  });

  it('renders RentalStats with computed values', () => {
    const properties: Property[] = [
      { id: 'prop-1', address: 'Calle 1', type: 'apartamento', status: 'ocupada', monthlyRent: 400000 },
    ];
    const tenants: Tenant[] = [
      { id: 'ten-1', name: 'Ana', phone: '555', email: 'ana@example.com', propertyId: 'prop-1', deposit: 100000 },
    ];
    const payments: Payment[] = [
      {
        id: 'pay-1',
        tenantId: 'ten-1',
        propertyId: 'prop-1',
        amount: 400000,
        dueDate: new Date(),
        status: 'pagado',
      },
    ];

    render(<RentalStats properties={properties} tenants={tenants} payments={payments} />);

    expect(screen.getByText('Propiedades')).toBeInTheDocument();
    expect(screen.getByText('Inquilinos Activos')).toBeInTheDocument();
    expect(screen.getByText('Arriendo Cobrado')).toBeInTheDocument();
    expect(screen.getByText('Arriendo Pendiente')).toBeInTheDocument();
  });

  it('creates the root layout element', () => {
    const element = RootLayout({ children: <div>Child</div> });
    expect(element.type).toBe('html');
  });
});
