/**
 * Unit Tests for Arriendos Dashboard Page
 * 
 * **Validates: Requirements 7.1, 7.2, 7.3, 7.4**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArriendosDashboard from './page';
import type { Property, Tenant, Payment, Reminder } from '@/types';

vi.mock('@/lib/data-access', () => ({
  isCachePrimed: vi.fn(() => false),
  getProperties: vi.fn(),
  getTenants: vi.fn(),
  getPayments: vi.fn(),
  getReminders: vi.fn(),
}));

vi.mock('@/components/shared/Chart', () => ({
  default: ({ data }: { data: any[] }) => (
    <div data-testid="income-chart">Chart {data.length}</div>
  ),
}));

vi.mock('@/components/shared/DataTable', () => ({
  default: ({ data, emptyMessage }: { data: any[]; emptyMessage: string }) => (
    <div data-testid="data-table">{data.length ? `Rows ${data.length}` : emptyMessage}</div>
  ),
}));

vi.mock('@/components/arriendos/RentalStats', () => ({
  default: ({ properties, tenants, payments }: { properties: Property[]; tenants: Tenant[]; payments: Payment[] }) => (
    <div data-testid="rental-stats">
      Stats {properties.length} {tenants.length} {payments.length}
    </div>
  ),
}));

describe('ArriendosDashboard', () => {
  const mockProperties: Property[] = [
    {
      id: 'prop-1',
      address: 'Calle 1',
      type: 'apartamento',
      status: 'ocupada',
      monthlyRent: 400000,
    },
  ];
  const mockTenants: Tenant[] = [
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
  const mockPayments: Payment[] = [
    {
      id: 'pay-1',
      tenantId: 'tenant-1',
      propertyId: 'prop-1',
      amount: 400000,
      dueDate: new Date('2024-03-01'),
      status: 'pendiente',
    },
  ];
  const mockReminders: Reminder[] = [
    {
      id: 'rem-1',
      type: 'pago',
      date: new Date('2024-02-01'),
      description: 'Cobrar arriendo',
      status: 'pendiente',
    },
  ];

  beforeEach(async () => {
    const dataAccess = await import('@/lib/data-access');
    vi.mocked(dataAccess.getProperties).mockResolvedValue(mockProperties);
    vi.mocked(dataAccess.getTenants).mockResolvedValue(mockTenants);
    vi.mocked(dataAccess.getPayments).mockResolvedValue(mockPayments);
    vi.mocked(dataAccess.getReminders).mockResolvedValue(mockReminders);
  });

  it('should render the dashboard title', async () => {
    const component = await ArriendosDashboard();
    render(component);
    expect(screen.getByText('Dashboard Arriendos')).toBeDefined();
  });

  it('should render RentalStats component', async () => {
    const component = await ArriendosDashboard();
    render(component);
    expect(screen.getByTestId('rental-stats')).toBeInTheDocument();
  });

  it('should render income by property chart', async () => {
    const component = await ArriendosDashboard();
    render(component);
    expect(screen.getByTestId('income-chart')).toBeInTheDocument();
  });

  it('should render data tables for contracts and pending payments', async () => {
    const component = await ArriendosDashboard();
    render(component);
    const tables = screen.getAllByTestId('data-table');
    expect(tables.length).toBeGreaterThan(0);
  });
});

