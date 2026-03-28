import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecordatoriosPage from '@/app/arriendos/recordatorios/page';
import ArriendosDashboard from '@/app/arriendos/dashboard/page';
import type { Reminder, Property, Tenant, Payment } from '@/types';

const addToast = vi.fn();

vi.mock('@/components/shared/Toast', () => ({
  useToast: () => ({ addToast }),
}));

vi.mock('@/lib/data-access', () => ({
  isCachePrimed: vi.fn(() => false),
  getReminders: vi.fn(),
  createReminder: vi.fn(),
  updateReminder: vi.fn(),
  getProperties: vi.fn(),
  getTenants: vi.fn(),
  getPayments: vi.fn(),
}));

vi.mock('@/components/shared/Chart', () => ({
  default: () => <div data-testid="chart" />,
}));

vi.mock('@/components/shared/DataTable', () => ({
  default: ({ data, emptyMessage }: { data: any[]; emptyMessage: string }) => (
    <div data-testid="data-table">{data.length ? `Rows ${data.length}` : emptyMessage}</div>
  ),
}));

vi.mock('@/components/arriendos/RentalStats', () => ({
  default: () => <div data-testid="rental-stats" />,
}));

describe('Property 31, 32, 34: Reminders Display, Status Update, Filtering', () => {
  const reminders: Reminder[] = [
    {
      id: 'rem-1',
      type: 'pago',
      date: new Date('2024-02-01'),
      description: 'Cobrar arriendo',
      status: 'pendiente',
    },
    {
      id: 'rem-2',
      type: 'renovacion',
      date: new Date('2024-03-01'),
      description: 'Renovar contrato',
      status: 'completado',
    },
  ];

  beforeEach(async () => {
    const dataAccess = await import('@/lib/data-access');
    vi.mocked(dataAccess.getReminders).mockResolvedValue(reminders);
    vi.mocked(dataAccess.getProperties).mockResolvedValue([]);
    vi.mocked(dataAccess.getTenants).mockResolvedValue([]);
    vi.mocked(dataAccess.updateReminder).mockResolvedValue({ ...reminders[0], status: 'completado' });
  });

  it('should display reminder descriptions and dates', async () => {
    render(<RecordatoriosPage />);
    await waitFor(() => {
      expect(screen.getByText('Cobrar arriendo')).toBeInTheDocument();
    });
  });

  it('should allow marking a reminder as completed', async () => {
    const user = userEvent.setup();
    render(<RecordatoriosPage />);

    const completeButton = await screen.findByRole('button', { name: /marcar como completado/i });
    await user.click(completeButton);

    const dataAccess = await import('@/lib/data-access');
    await waitFor(() => {
      expect(dataAccess.updateReminder).toHaveBeenCalled();
    });
  });

  it('should filter reminders by status', async () => {
    const user = userEvent.setup();
    render(<RecordatoriosPage />);

    const filter = await screen.findByLabelText(/filtrar por estado/i);
    await user.selectOptions(filter, 'completado');

    expect(screen.queryByText('Cobrar arriendo')).not.toBeInTheDocument();
    expect(screen.getByText('Renovar contrato')).toBeInTheDocument();
  });
});

describe('Property 33: Reminder Dashboard Display', () => {
  it('should show due reminders on the dashboard', async () => {
    const dataAccess = await import('@/lib/data-access');
    vi.mocked(dataAccess.getProperties).mockResolvedValue([]);
    vi.mocked(dataAccess.getTenants).mockResolvedValue([]);
    vi.mocked(dataAccess.getPayments).mockResolvedValue([]);
    vi.mocked(dataAccess.getReminders).mockResolvedValue([
      {
        id: 'rem-1',
        type: 'pago',
        date: new Date('2020-01-01'),
        description: 'Recordatorio vencido',
        status: 'pendiente',
      },
    ]);

    const component = await ArriendosDashboard();
    render(component);

    expect(screen.getByText('Recordatorio vencido')).toBeInTheDocument();
  });
});


