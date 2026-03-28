import { describe, it, expect, vi } from 'vitest';
import { getChatbotResponse } from '@/lib/chatbot';
import type { Room, Payment, Tenant, Property } from '@/types';

vi.mock('@/lib/data-access', () => ({
  getRooms: vi.fn(),
  getPayments: vi.fn(),
  getTenants: vi.fn(),
  getProperties: vi.fn(),
}));

/**
 * **Feature: hotel-arriendos, Property 35-38: Chatbot Logic**
 */

describe('Chatbot Properties', () => {
  it('should answer data queries about occupied rooms', async () => {
    const dataAccess = await import('@/lib/data-access');
    const rooms: Room[] = [
      { id: 'r1', number: '101', type: 'individual', floor: 1, price: 50000, status: 'ocupada' },
      { id: 'r2', number: '102', type: 'doble', floor: 1, price: 60000, status: 'disponible' },
    ];
    vi.mocked(dataAccess.getRooms).mockResolvedValue(rooms);

    const response = await getChatbotResponse('¿Cuántas habitaciones están ocupadas?');
    expect(response.message).toContain('1');
  });

  it('should suggest navigation for navigation intents', async () => {
    const response = await getChatbotResponse('Quiero ir a pagos');
    expect(response.suggestion?.route).toBe('/arriendos/pagos');
  });

  it('should respond in Spanish for add guidance', async () => {
    const response = await getChatbotResponse('¿Cómo agregar una propiedad?');
    expect(response.message.toLowerCase()).toContain('propiedad');
    expect(response.suggestion?.route).toBe('/arriendos/propiedades');
  });

  it('should answer who owes rent using payments', async () => {
    const dataAccess = await import('@/lib/data-access');
    const payments: Payment[] = [
      { id: 'pay-1', tenantId: 'tenant-1', propertyId: 'prop-1', amount: 400000, dueDate: new Date(), status: 'pendiente' },
    ];
    const tenants: Tenant[] = [
      { id: 'tenant-1', name: 'Ana', phone: '123', email: 'ana@test.com', deposit: 400000 },
    ];
    vi.mocked(dataAccess.getPayments).mockResolvedValue(payments);
    vi.mocked(dataAccess.getTenants).mockResolvedValue(tenants);

    const response = await getChatbotResponse('¿Quién debe arriendo?');
    expect(response.message).toContain('Ana');
  });
});
