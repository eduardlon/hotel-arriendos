import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import PropertyCard from '@/components/arriendos/PropertyCard';
import TenantCard from '@/components/arriendos/TenantCard';
import PaymentTable from '@/components/arriendos/PaymentTable';
import ExpenseTracker from '@/components/arriendos/ExpenseTracker';
import type { Property, Tenant, Payment, Expense } from '@/types';

/**
 * **Feature: hotel-arriendos, Property 16, 20, 23, 27: Display Attributes**
 */

vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await vi.importActual<typeof import('@/tests/utils/framer-motion-mock')>(
    '@/tests/utils/framer-motion-mock'
  );
  return createFramerMotionMock();
});

vi.mock('@/components/shared/Chart', () => ({
  default: () => <div data-testid="chart" />,
}));

describe('Property 16: Property Display with Attributes', () => {
  it('should render address, type, and status for any property', () => {
    fc.assert(
      fc.property(
        fc.record({
          address: fc
            .string({ minLength: 5, maxLength: 40 })
            .map((value) => value.replace(/\s+/g, ' ').trim())
            .filter((value) => value.length >= 5),
          type: fc.constantFrom<Property['type']>('apartamento', 'casa'),
          status: fc.constantFrom<Property['status']>('disponible', 'ocupada', 'mantenimiento'),
          monthlyRent: fc.integer({ min: 200000, max: 900000 }),
        }),
        (propertyData) => {
          const property: Property = { id: 'prop-1', ...propertyData };
          const { unmount } = render(<PropertyCard property={property} />);
          try {
            expect(screen.getAllByText(property.address).length).toBeGreaterThan(0);
            expect(screen.getAllByText(property.type).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/Disponible|Ocupada|Mantenimiento/).length).toBeGreaterThan(0);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});

describe('Property 20: Tenant Display with Attributes', () => {
  it('should render tenant row with required fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc
            .string({ minLength: 3, maxLength: 30 })
            .map((value) => value.replace(/\s+/g, ' ').trim())
            .filter((value) => value.length >= 3),
          phone: fc
            .string({ minLength: 8, maxLength: 12 })
            .map((value) => value.replace(/\s+/g, ' ').trim())
            .filter((value) => value.length >= 8),
          email: fc.emailAddress(),
          deposit: fc.integer({ min: 100000, max: 800000 }),
        }),
        (tenantData) => {
          const tenant: Tenant = { id: 'tenant-1', ...tenantData };
          const property: Property = {
            id: 'prop-1',
            address: 'Calle 1',
            type: 'apartamento',
            status: 'ocupada',
            monthlyRent: 300000,
          };
          const { unmount } = render(
            <table>
              <tbody>
                <TenantCard tenant={tenant} property={property} />
              </tbody>
            </table>
          );
          try {
            expect(screen.getAllByText(tenant.name).length).toBeGreaterThan(0);
            expect(screen.getAllByText(tenant.phone).length).toBeGreaterThan(0);
            expect(screen.getAllByText(tenant.email).length).toBeGreaterThan(0);
            expect(screen.getAllByText(property.address).length).toBeGreaterThan(0);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});

describe('Property 23: Payment Display with Attributes', () => {
  it('should display payment rows with tenant, property, amount, and status', () => {
    const payments: Payment[] = [
      {
        id: 'pay-1',
        tenantId: 'tenant-1',
        propertyId: 'prop-1',
        amount: 400000,
        dueDate: new Date('2024-03-01'),
        status: 'pendiente',
      },
    ];
    const tenants: Tenant[] = [
      {
        id: 'tenant-1',
        name: 'Ana',
        phone: '123',
        email: 'ana@test.com',
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

    render(
      <PaymentTable payments={payments} tenants={tenants} properties={properties} />
    );

    expect(screen.getAllByText('Ana').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Calle 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pendiente/i).length).toBeGreaterThan(0);
  });
});

describe('Property 27: Property Expense Display', () => {
  it('should show expenses for a property', () => {
    const expenses: Expense[] = [
      {
        id: 'exp-1',
        propertyId: 'prop-1',
        amount: 50000,
        category: 'reparaciones',
        date: new Date('2024-02-01'),
        description: 'Reparación',
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

    render(<ExpenseTracker expenses={expenses} properties={properties} propertyId="prop-1" />);

    expect(screen.getAllByText('Reparación').length).toBeGreaterThan(0);
  });
});



