import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FinanzasPage from './page';
import * as dataAccess from '@/lib/data-access';
import type { HotelTransaction } from '@/types';

// Mock data access functions
vi.mock('@/lib/data-access', () => ({
  isCachePrimed: vi.fn(() => false),
  getHotelTransactions: vi.fn(),
  createHotelTransaction: vi.fn(),
}));

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await vi.importActual<typeof import('@/tests/utils/framer-motion-mock')>(
    '@/tests/utils/framer-motion-mock'
  );
  return createFramerMotionMock();
});

const mockTransactions: HotelTransaction[] = [
  {
    id: 'trans-001',
    type: 'ingreso',
    amount: 65000,
    category: 'Hospedaje',
    date: new Date('2024-01-15'),
    description: 'Pago habitación 102',
  },
  {
    id: 'trans-002',
    type: 'gasto',
    amount: 45000,
    category: 'Servicios básicos',
    date: new Date('2024-01-14'),
    description: 'Pago cuenta de electricidad',
  },
  {
    id: 'trans-003',
    type: 'ingreso',
    amount: 120000,
    category: 'Hospedaje',
    date: new Date('2024-01-13'),
    description: 'Pago habitación 103',
  },
];

describe('FinanzasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dataAccess.getHotelTransactions).mockResolvedValue(mockTransactions);
  });

  it('should render the page title and subtitle', async () => {
    render(<FinanzasPage />);

    await waitFor(() => {
      expect(screen.getByText('Finanzas del Hotel')).toBeInTheDocument();
    });

    expect(screen.getByText('Gestión de ingresos y gastos')).toBeInTheDocument();
  });

  it('should display the add transaction button', async () => {
    render(<FinanzasPage />);

    await waitFor(() => {
      expect(screen.getByText('Registrar Transacción')).toBeInTheDocument();
    });
  });

  it('should display monthly stats cards', async () => {
    render(<FinanzasPage />);

    await waitFor(() => {
      expect(screen.getByText('Ingresos del Mes')).toBeInTheDocument();
    });

    expect(screen.getByText('Gastos del Mes')).toBeInTheDocument();
    expect(screen.getByText('Balance Neto')).toBeInTheDocument();
  });

  it('should display the income vs expenses chart section', async () => {
    render(<FinanzasPage />);

    await waitFor(() => {
      expect(screen.getByText('Ingresos vs Gastos Mensuales')).toBeInTheDocument();
    });
  });

  it('should display the transactions table section', async () => {
    render(<FinanzasPage />);

    await waitFor(() => {
      expect(screen.getByText('Historial de Transacciones')).toBeInTheDocument();
    });
  });

  it('should display date filter inputs', async () => {
    render(<FinanzasPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Desde/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Hasta/i)).toBeInTheDocument();
  });

  it('should load and display transactions', async () => {
    render(<FinanzasPage />);

    await waitFor(() => {
      expect(screen.getByText('Pago habitación 102')).toBeInTheDocument();
    });

    expect(screen.getByText('Pago cuenta de electricidad')).toBeInTheDocument();
    expect(screen.getByText('Pago habitación 103')).toBeInTheDocument();
  });

  it('should open modal when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<FinanzasPage />);

    await waitFor(() => {
      expect(screen.getByText('Registrar Transacción')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Registrar Transacción');
    await user.click(addButton);

    // Modal should open with form fields
    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Transacción/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('spinbutton', { name: /Monto/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Categoría/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i, { selector: 'textarea' })).toBeInTheDocument();
  });

  it('should validate required fields when submitting form', async () => {
    const user = userEvent.setup();
    render(<FinanzasPage />);

    await waitFor(() => {
      expect(screen.getByText('Registrar Transacción')).toBeInTheDocument();
    });

    // Open modal
    const addButton = screen.getByText('Registrar Transacción');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Guardar Transacción')).toBeInTheDocument();
    });

    // Try to submit without filling fields
    const submitButton = screen.getByText('Guardar Transacción');
    await user.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('El monto debe ser mayor que cero')).toBeInTheDocument();
    });

    expect(screen.getByText('La categoría es obligatoria')).toBeInTheDocument();
    expect(screen.getByText('La descripción es obligatoria')).toBeInTheDocument();
  });

  it('should create a new transaction when form is submitted with valid data', async () => {
    const user = userEvent.setup();
    const newTransaction: HotelTransaction = {
      id: 'trans-004',
      type: 'ingreso',
      amount: 80000,
      category: 'Hospedaje',
      date: new Date('2024-01-16'),
      description: 'Pago habitación 201',
    };

    vi.mocked(dataAccess.createHotelTransaction).mockResolvedValue(newTransaction);

    render(<FinanzasPage />);

    await waitFor(() => {
      expect(screen.getByText('Registrar Transacción')).toBeInTheDocument();
    });

    // Open modal
    const addButton = screen.getByText('Registrar Transacción');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('spinbutton', { name: /Monto/i })).toBeInTheDocument();
    });

    // Fill form
    const amountInput = screen.getByRole('spinbutton', { name: /Monto/i });
    const categoryInput = screen.getByLabelText(/Categoría/i, { selector: 'input' });
    const descriptionInput = screen.getByLabelText(/Descripción/i, { selector: 'textarea' });

    await user.type(amountInput, '80000');
    await user.type(categoryInput, 'Hospedaje');
    await user.type(descriptionInput, 'Pago habitación 201');

    // Submit form
    const submitButton = screen.getByText('Guardar Transacción');
    await user.click(submitButton);

    // Verify createHotelTransaction was called
    await waitFor(() => {
      expect(dataAccess.createHotelTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ingreso',
          amount: 80000,
          category: 'Hospedaje',
          description: 'Pago habitación 201',
        })
      );
    });
  });

  it('should filter transactions by date range', async () => {
    const user = userEvent.setup();
    render(<FinanzasPage />);

    await waitFor(() => {
      expect(screen.getByText('Pago habitación 102')).toBeInTheDocument();
    });

    // All transactions should be visible initially
    expect(screen.getByText('Pago habitación 103')).toBeInTheDocument();
    expect(screen.getByText('Pago cuenta de electricidad')).toBeInTheDocument();

    // Apply date filter
    const startDateInput = screen.getByLabelText(/Desde/i);
    await user.type(startDateInput, '2024-01-14');

    // Should filter out transactions before 2024-01-14
    await waitFor(() => {
      expect(screen.queryByText('Pago habitación 103')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Pago habitación 102')).toBeInTheDocument();
    expect(screen.getByText('Pago cuenta de electricidad')).toBeInTheDocument();
  });

  it('should display clear filters button when filters are applied', async () => {
    const user = userEvent.setup();
    render(<FinanzasPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Desde/i)).toBeInTheDocument();
    });

    // No clear button initially
    expect(screen.queryByText('Limpiar filtros')).not.toBeInTheDocument();

    // Apply filter
    const startDateInput = screen.getByLabelText(/Desde/i);
    await user.type(startDateInput, '2024-01-14');

    // Clear button should appear
    await waitFor(() => {
      expect(screen.getByText('Limpiar filtros')).toBeInTheDocument();
    });
  });

  it('should calculate monthly totals correctly', async () => {
    // Mock current date to be in January 2024
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-16'));

    render(<FinanzasPage />);

    const waitPromise = waitFor(() => {
      expect(screen.getByText('Ingresos del Mes')).toBeInTheDocument();
    });

    await vi.runAllTimersAsync();
    await waitPromise;

    // Income: 65000 + 120000 = 185000
    // Expenses: 45000
    // Net: 140000
    const incomeCard = screen.getByText('Ingresos del Mes').closest('div');
    const expensesCard = screen.getByText('Gastos del Mes').closest('div');
    const netCard = screen.getByText('Balance Neto').closest('div');

    expect(incomeCard).toHaveTextContent('$185.000');
    expect(expensesCard).toHaveTextContent('$45.000');
    expect(netCard).toHaveTextContent('$140.000');

    vi.useRealTimers();
  });
});




