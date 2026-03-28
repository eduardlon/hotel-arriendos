import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import GastosPage from '@/app/arriendos/gastos/page';
import InquilinosPage from '@/app/arriendos/inquilinos/page';
import PagosPage from '@/app/arriendos/pagos/page';
import PropiedadesPage from '@/app/arriendos/propiedades/page';
import RecordatoriosPage from '@/app/arriendos/recordatorios/page';
import * as dataAccess from '@/lib/data-access';
import type { Expense, Payment, Property, Reminder, Tenant } from '@/types';

vi.mock('@/lib/data-access', () => ({
  isCachePrimed: vi.fn(() => false),
  getExpenses: vi.fn(),
  createExpense: vi.fn(),
  getProperties: vi.fn(),
  getTenants: vi.fn(),
  getPayments: vi.fn(),
  createTenant: vi.fn(),
  updateTenant: vi.fn(),
  deleteTenant: vi.fn(),
  updateProperty: vi.fn(),
  createPayment: vi.fn(),
  createProperty: vi.fn(),
  updateProperty: vi.fn(),
  deleteProperty: vi.fn(),
  getReminders: vi.fn(),
  createReminder: vi.fn(),
  updateReminder: vi.fn(),
}));

const properties: Property[] = [
  {
    id: 'prop-1',
    address: 'Calle 1 #123',
    type: 'apartamento',
    status: 'ocupada',
    monthlyRent: 500000,
    currentTenantId: 'ten-1',
  },
  {
    id: 'prop-2',
    address: 'Carrera 8 #45',
    type: 'casa',
    status: 'disponible',
    monthlyRent: 600000,
  },
];

const tenants: Tenant[] = [
  {
    id: 'ten-1',
    name: 'Ana Gómez',
    phone: '555-1234',
    email: 'ana@example.com',
    propertyId: 'prop-1',
    contractStart: new Date('2023-01-01'),
    contractEnd: new Date('2024-01-01'),
    deposit: 100000,
  },
];

const payments: Payment[] = [
  {
    id: 'pay-1',
    tenantId: 'ten-1',
    propertyId: 'prop-1',
    amount: 500000,
    dueDate: new Date(),
    status: 'pagado',
    method: 'transferencia',
  },
  {
    id: 'pay-2',
    tenantId: 'ten-1',
    propertyId: 'prop-1',
    amount: 500000,
    dueDate: new Date('2020-01-01'),
    status: 'pendiente',
  },
];

const expenses: Expense[] = [
  {
    id: 'exp-1',
    propertyId: 'prop-1',
    amount: 45000,
    category: 'servicios',
    date: new Date('2024-01-10'),
    description: 'Agua',
  },
];

const reminders: Reminder[] = [
  {
    id: 'rem-1',
    type: 'pago',
    date: new Date('2024-02-01'),
    description: 'Pago de arriendo',
    propertyId: 'prop-1',
    tenantId: 'ten-1',
    status: 'pendiente',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(dataAccess.getProperties).mockResolvedValue(properties);
  vi.mocked(dataAccess.getTenants).mockResolvedValue(tenants);
  vi.mocked(dataAccess.getPayments).mockResolvedValue(payments);
  vi.mocked(dataAccess.getExpenses).mockResolvedValue(expenses);
  vi.mocked(dataAccess.getReminders).mockResolvedValue(reminders);
});

describe('Arriendos pages smoke coverage', () => {
  it('renders Gastos page and submits a new expense', async () => {
    vi.mocked(dataAccess.createExpense).mockResolvedValue({
      ...expenses[0],
      id: 'exp-2',
    });

    render(<GastosPage />);

    await waitFor(() => {
      expect(screen.getByText('Gastos')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /registrar gasto/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const modal = within(screen.getByRole('dialog'));
    fireEvent.change(modal.getByLabelText(/propiedad/i), { target: { value: properties[0].id } });
    fireEvent.change(modal.getByLabelText(/monto/i), { target: { value: '75000' } });
    fireEvent.change(modal.getByLabelText(/descrip/i), { target: { value: 'Electricidad' } });

    const form = screen.getByRole('dialog').querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(dataAccess.createExpense).toHaveBeenCalled();
    });
  });

  it('renders Inquilinos page and creates a tenant', async () => {
    vi.mocked(dataAccess.createTenant).mockResolvedValue({
      ...tenants[0],
      id: 'ten-2',
      name: 'Carlos Soto',
    });

    render(<InquilinosPage />);

    await waitFor(() => {
      expect(screen.getByText('Inquilinos')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /nuevo inquilino/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const modal = within(screen.getByRole('dialog'));
    fireEvent.change(modal.getByLabelText(/^nombre/i), { target: { value: 'Carlos Soto' } });
    fireEvent.change(modal.getByLabelText(/tel[eé]fono/i), { target: { value: '555-9999' } });
    fireEvent.change(modal.getByLabelText(/correo/i), { target: { value: 'carlos@example.com' } });
    fireEvent.change(modal.getByLabelText(/propiedad asociada/i), { target: { value: properties[1].id } });
    fireEvent.change(modal.getByLabelText(/inicio de contrato/i), { target: { value: '2024-01-01' } });
    fireEvent.change(modal.getByLabelText(/t[ée]rmino de contrato/i), { target: { value: '2024-12-31' } });
    fireEvent.change(modal.getByLabelText(/dep[oó]sito/i), { target: { value: '150000' } });

    const form = screen.getByRole('dialog').querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(dataAccess.createTenant).toHaveBeenCalled();
    });
  });

  it('renders Pagos page and registers a payment', async () => {
    vi.mocked(dataAccess.createPayment).mockResolvedValue({
      ...payments[0],
      id: 'pay-3',
    });

    render(<PagosPage />);

    await waitFor(() => {
      expect(screen.getByText('Pagos')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /registrar pago/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const modal = within(screen.getByRole('dialog'));
    fireEvent.change(modal.getByLabelText(/inquilino/i), { target: { value: tenants[0].id } });
    fireEvent.change(modal.getByLabelText(/^propiedad/i), { target: { value: properties[0].id } });
    fireEvent.change(modal.getByLabelText(/monto/i), { target: { value: '500000' } });
    fireEvent.change(modal.getByLabelText(/fecha de vencimiento/i), { target: { value: '2024-05-10' } });
    fireEvent.change(modal.getByLabelText(/estado/i), { target: { value: 'pagado' } });
    fireEvent.change(modal.getByLabelText(/medio de pago/i), { target: { value: 'efectivo' } });

    const form = screen.getByRole('dialog').querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(dataAccess.createPayment).toHaveBeenCalled();
    });
  });

  it('renders Propiedades page, opens detail modal, and creates a property', async () => {
    vi.mocked(dataAccess.getPayments).mockResolvedValue(payments);
    vi.mocked(dataAccess.getExpenses).mockResolvedValue(expenses);
    vi.mocked(dataAccess.createProperty).mockResolvedValue({
      ...properties[0],
      id: 'prop-3',
      address: 'Avenida 99 #10',
      currentTenantId: 'ten-1',
    });
    vi.mocked(dataAccess.updateTenant).mockResolvedValue({
      ...tenants[0],
      propertyId: 'prop-3',
    });

    render(<PropiedadesPage />);

    await waitFor(() => {
      expect(screen.getByText('Propiedades')).toBeInTheDocument();
    });

    const detailsButtons = screen.getAllByRole('button', { name: /ver detalles/i });
    const detailsButton = detailsButtons.find((button) => button.tagName === 'BUTTON');
    expect(detailsButton).toBeDefined();
    if (detailsButton) {
      fireEvent.click(detailsButton);
    }

    await waitFor(() => {
      expect(screen.getAllByText(/información general/i).length).toBeGreaterThan(0);
    });

    const closeButtons = screen.getAllByRole('button', { name: /cerrar/i });
    fireEvent.click(closeButtons[0]);

    fireEvent.click(screen.getByRole('button', { name: /nueva propiedad/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const modal = within(screen.getByRole('dialog'));
    fireEvent.change(modal.getByLabelText(/direcci[oó]n/i), { target: { value: 'Avenida 99 #10' } });
    fireEvent.change(modal.getByLabelText(/tipo/i), { target: { value: 'casa' } });
    fireEvent.change(modal.getByLabelText(/estado/i), { target: { value: 'ocupada' } });
    fireEvent.change(modal.getByLabelText(/arriendo mensual/i), { target: { value: '650000' } });
    fireEvent.change(modal.getByLabelText(/inquilino/i), { target: { value: tenants[0].id } });

    const form = screen.getByRole('dialog').querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(dataAccess.createProperty).toHaveBeenCalled();
      expect(dataAccess.updateTenant).toHaveBeenCalled();
    });
  });

  it('renders Recordatorios page, creates reminder, and marks completed', async () => {
    vi.mocked(dataAccess.createReminder).mockResolvedValue({
      ...reminders[0],
      id: 'rem-2',
    });
    vi.mocked(dataAccess.updateReminder).mockResolvedValue({
      ...reminders[0],
      status: 'completado',
    });

    render(<RecordatoriosPage />);

    await waitFor(() => {
      expect(screen.getByText('Recordatorios')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /nuevo recordatorio/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const modal = within(screen.getByRole('dialog'));
    fireEvent.change(modal.getByLabelText(/tipo/i), { target: { value: 'pago' } });
    fireEvent.change(modal.getByLabelText(/fecha/i), { target: { value: '2024-05-01' } });
    fireEvent.change(modal.getByLabelText(/descrip/i), { target: { value: 'Renovación' } });
    fireEvent.change(modal.getByLabelText(/propiedad/i), { target: { value: properties[0].id } });
    fireEvent.change(modal.getByLabelText(/inquilino/i), { target: { value: tenants[0].id } });

    const form = screen.getByRole('dialog').querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(dataAccess.createReminder).toHaveBeenCalled();
    });

    const completeButtons = screen.getAllByRole('button', { name: /marcar como completado/i });
    fireEvent.click(completeButtons[0]);

    await waitFor(() => {
      expect(dataAccess.updateReminder).toHaveBeenCalled();
    });
  });
});

