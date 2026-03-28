import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { __resetData, createProperty, createTenant, updateProperty, updateTenant } from '@/lib/data-access';
import type { Property, Tenant } from '@/types';

/**
 * **Feature: hotel-arriendos, Property 18: Tenant-Property Assignment**
 */

describe('Property 18: Tenant-Property Assignment', () => {
  it('should reflect assignments on both tenant and property', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 30 }),
        fc.string({ minLength: 3, maxLength: 20 }),
        async (address, name) => {
          __resetData();
          const property = await createProperty({
            address,
            type: 'apartamento',
            status: 'disponible',
            monthlyRent: 300000,
          });
          const tenant = await createTenant({
            name,
            phone: '12345678',
            email: `test-${Math.random().toString(36).slice(2, 6)}@test.com`,
            deposit: 300000,
          });

          const updatedProperty = await updateProperty(property.id, { currentTenantId: tenant.id });
          const updatedTenant = await updateTenant(tenant.id, { propertyId: property.id });

          expect(updatedProperty?.currentTenantId).toBe(tenant.id);
          expect(updatedTenant?.propertyId).toBe(property.id);
        }
      ),
      { numRuns: 10 }
    );
  });
});
