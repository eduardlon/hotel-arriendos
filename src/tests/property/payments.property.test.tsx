import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentTable from '@/components/arriendos/PaymentTable';
import PagosPage from '@/app/arriendos/pagos/page';
import type { Payment, Tenant, Property } from '@/types';

const addToast = vi.fn();

vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await vi.importActual<typeof import('@/tests/utils/framer-motion-mock')>(
    '@/tests/utils/framer-motion-mock'
  );
  return createFramerMotionMock();
});

vi.mock('@/components/shared/Toast', () => ({
  useToast: () => ({ addToast }),
}));

vi.mock('@/lib/data-access', () => ({
  isCachePrimed: vi.fn(() => false),
  getPayments: vi.fn(),
  getTenants: vi.fn(),
  getProperties: vi.fn(),
  createPayment: vi.fn(),
}));

describe('Property 24: Payment Filtering', () => {
  it('should filter payments by status and property', async () => {
    const payments: Payment[] = [
      {
        id: 'pay-1',
        tenantId: 'tenant-1',
        propertyId: 'prop-1',
        amount: 400000,
        dueDate: new Date('2024-03-01'),
        status: 'pendiente',
      },
      {
        id: 'pay-2',
        tenantId: 'tenant-2',
        propertyId: 'prop-2',
        amount: 500000,
        dueDate: new Date('2024-03-01'),
        status: 'pagado',
      },
    ];
    const tenants: Tenant[] = [
      { id: 'tenant-1', name: 'Ana', phone: '123', email: 'a@test.com', deposit: 400000 },
      { id: 'tenant-2', name: 'Luis', phone: '456', email: 'l@test.com', deposit: 500000 },
    ];
    const properties: Property[] = [
      { id: 'prop-1', address: 'Calle 1', type: 'apartamento', status: 'ocupada', monthlyRent: 400000 },
      { id: 'prop-2', address: 'Calle 2', type: 'casa', status: 'ocupada', monthlyRent: 500000 },
    ];

    const user = userEvent.setup({ delay: null });
    render(<PaymentTable payments={payments} tenants={tenants} properties={properties} />);

    const statusSelect = screen.getByLabelText(/estado/i, { selector: 'select' });
    await user.selectOptions(statusSelect, 'pendiente');
    await waitFor(() => {
      const table = screen.getByRole('table');
      const tableQueries = within(table);
      expect(tableQueries.getAllByText('Ana').length).toBeGreaterThan(0);
      expect(tableQueries.queryByText('Luis')).not.toBeInTheDocument();
    });

    const propertySelect = screen.getByLabelText(/propiedad/i, { selector: 'select' });
    await user.selectOptions(propertySelect, 'prop-1');
    await waitFor(() => {
      const table = screen.getByRole('table');
      const tableQueries = within(table);
      expect(tableQueries.getAllByText('Calle 1').length).toBeGreaterThan(0);
      expect(tableQueries.queryByText('Calle 2')).not.toBeInTheDocument();
    });
  });
});

describe('Property 25: Payment Receipt Generation', () => {
  it('should call receipt handler when clicking Recibo', async () => {
    const payments: Payment[] = [
      {
        id: 'pay-1',
        tenantId: 'tenant-1',
        propertyId: 'prop-1',
        amount: 400000,
        dueDate: new Date('2024-03-01'),
        status: 'pagado',
      },
    ];
    const tenants: Tenant[] = [
      { id: 'tenant-1', name: 'Ana', phone: '123', email: 'a@test.com', deposit: 400000 },
    ];
    const properties: Property[] = [
      { id: 'prop-1', address: 'Calle 1', type: 'apartamento', status: 'ocupada', monthlyRent: 400000 },
    ];

    const onGenerateReceipt = vi.fn();
    const user = userEvent.setup();
    render(
      <PaymentTable
        payments={payments}
        tenants={tenants}
        properties={properties}
        onGenerateReceipt={onGenerateReceipt}
      />
    );

    await user.click(screen.getByRole('button', { name: /recibo/i }));
    expect(onGenerateReceipt).toHaveBeenCalledWith(payments[0]);
  });
});

describe('Property 26: Automatic Payment Status Calculation', () => {
  it('should show payments as vencido when due date has passed', async () => {
    const dataAccess = await import('@/lib/data-access');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    vi.mocked(dataAccess.getPayments).mockResolvedValue([
      {
        id: 'pay-1',
        tenantId: 'tenant-1',
        propertyId: 'prop-1',
        amount: 400000,
        dueDate: yesterday,
        status: 'pendiente',
      },
    ]);
    vi.mocked(dataAccess.getTenants).mockResolvedValue([
      { id: 'tenant-1', name: 'Ana', phone: '123', email: 'a@test.com', deposit: 400000 },
    ]);
    vi.mocked(dataAccess.getProperties).mockResolvedValue([
      { id: 'prop-1', address: 'Calle 1', type: 'apartamento', status: 'ocupada', monthlyRent: 400000 },
    ]);

    render(<PagosPage />);

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText(/vencido/i)).toBeInTheDocument();
    });
  });
});




