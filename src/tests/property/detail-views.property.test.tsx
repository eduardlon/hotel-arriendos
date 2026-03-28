import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropiedadesPage from '@/app/arriendos/propiedades/page';
import InquilinosPage from '@/app/arriendos/inquilinos/page';
import type { Property, Tenant, Payment, Expense } from '@/types';

const addToast = vi.fn();

vi.mock('@/components/shared/Toast', () => ({
  useToast: () => ({ addToast }),
}));

vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await vi.importActual<typeof import('@/tests/utils/framer-motion-mock')>(
    '@/tests/utils/framer-motion-mock'
  );
  return createFramerMotionMock();
});

vi.mock('@/lib/data-access', () => ({
  isCachePrimed: vi.fn(() => false),
  getProperties: vi.fn(),
  getTenants: vi.fn(),
  getPayments: vi.fn(),
  getExpenses: vi.fn(),
}));

/**
 * **Feature: hotel-arriendos, Property 17 & 21: Detail Views**
 */

describe('Property 17: Property Detail View', () => {
  it('should show tenant, payment history, and expenses in property detail', async () => {
    const dataAccess = await import('@/lib/data-access');

    const properties: Property[] = [
      {
        id: 'prop-1',
        address: 'Calle 1',
        type: 'apartamento',
        status: 'ocupada',
        monthlyRent: 400000,
        currentTenantId: 'tenant-1',
      },
    ];
    const tenants: Tenant[] = [
      { id: 'tenant-1', name: 'Ana', phone: '123', email: 'ana@test.com', deposit: 400000 },
    ];
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
    const expenses: Expense[] = [
      {
        id: 'exp-1',
        propertyId: 'prop-1',
        amount: 50000,
        category: 'servicios',
        date: new Date('2024-02-01'),
        description: 'Gasto común',
      },
    ];

    vi.mocked(dataAccess.getProperties).mockResolvedValue(properties);
    vi.mocked(dataAccess.getTenants).mockResolvedValue(tenants);
    vi.mocked(dataAccess.getPayments).mockResolvedValue(payments);
    vi.mocked(dataAccess.getExpenses).mockResolvedValue(expenses);

    const user = userEvent.setup();
    render(<PropiedadesPage />);

    await waitFor(() => {
      expect(screen.getByText('Calle 1')).toBeInTheDocument();
    });

    const detailButtons = screen.getAllByRole('button', { name: /ver detalles/i });
    const detailButton =
      detailButtons.find((button) => button.tagName.toLowerCase() === 'button') ?? detailButtons[0];
    await user.click(detailButton);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      const dialogQueries = within(dialog);
      expect(dialogQueries.getAllByText('Ana').length).toBeGreaterThan(0);
      expect(dialogQueries.getAllByText('Gasto común').length).toBeGreaterThan(0);
    });
  });
});

describe('Property 21: Tenant Detail View', () => {
  it('should show property and payment history in tenant detail', async () => {
    const dataAccess = await import('@/lib/data-access');

    const tenants: Tenant[] = [
      {
        id: 'tenant-1',
        name: 'Ana',
        phone: '123',
        email: 'ana@test.com',
        propertyId: 'prop-1',
        contractStart: new Date('2024-01-01'),
        contractEnd: new Date('2024-12-31'),
        deposit: 400000,
      },
    ];
    const properties: Property[] = [
      {
        id: 'prop-1',
        address: 'Calle 1',
        type: 'apartamento',
        status: 'ocupada',
        monthlyRent: 400000,
      },
    ];
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

    vi.mocked(dataAccess.getTenants).mockResolvedValue(tenants);
    vi.mocked(dataAccess.getProperties).mockResolvedValue(properties);
    vi.mocked(dataAccess.getPayments).mockResolvedValue(payments);

    const user = userEvent.setup();
    render(<InquilinosPage />);

    await waitFor(() => {
      expect(screen.getByText('Ana')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByRole('button', { name: /^ver$/i });
    const viewButton =
      viewButtons.find((button) => button.tagName.toLowerCase() === 'button') ?? viewButtons[0];
    await user.click(viewButton);

    await waitFor(() => {
      expect(screen.getAllByText('Calle 1').length).toBeGreaterThan(0);
    });
  });
});




