import { getRooms, getPayments, getTenants, getProperties } from '@/lib/data-access';
import { formatCurrency } from '@/lib/format';

export interface ChatbotResponse {
  message: string;
  suggestion?: {
    label: string;
    route: string;
  };
}

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const navigationHints = [
  { keywords: ['habitacion', 'habitaciones'], route: '/hotel/habitaciones', label: 'Ir a Habitaciones' },
  { keywords: ['empleado', 'empleados'], route: '/hotel/empleados', label: 'Ir a Empleados' },
  { keywords: ['limpieza'], route: '/hotel/limpieza', label: 'Ir a Limpieza' },
  { keywords: ['finanzas', 'finanza'], route: '/hotel/finanzas', label: 'Ir a Finanzas' },
  { keywords: ['propiedad', 'propiedades'], route: '/arriendos/propiedades', label: 'Ir a Propiedades' },
  { keywords: ['inquilino', 'inquilinos'], route: '/arriendos/inquilinos', label: 'Ir a Inquilinos' },
  { keywords: ['pago', 'pagos'], route: '/arriendos/pagos', label: 'Ir a Pagos' },
  { keywords: ['gasto', 'gastos'], route: '/arriendos/gastos', label: 'Ir a Gastos' },
  { keywords: ['recordatorio', 'recordatorios'], route: '/arriendos/recordatorios', label: 'Ir a Recordatorios' },
  { keywords: ['dashboard', 'resumen'], route: '/hotel/dashboard', label: 'Ir al Dashboard' },
];

const addGuides = [
  {
    keywords: ['habitacion', 'habitaciones'],
    message: 'Para agregar una habitación, ve a Habitaciones y presiona "Nueva Habitación".',
    route: '/hotel/habitaciones',
    label: 'Abrir Habitaciones',
  },
  {
    keywords: ['empleado', 'empleados'],
    message: 'Para agregar un empleado, entra a Empleados y pulsa "Nuevo Empleado".',
    route: '/hotel/empleados',
    label: 'Abrir Empleados',
  },
  {
    keywords: ['propiedad', 'propiedades'],
    message: 'Para agregar una propiedad, ve a Propiedades y presiona "Nueva Propiedad".',
    route: '/arriendos/propiedades',
    label: 'Abrir Propiedades',
  },
  {
    keywords: ['inquilino', 'inquilinos'],
    message: 'Para agregar un inquilino, entra a Inquilinos y pulsa "Nuevo Inquilino".',
    route: '/arriendos/inquilinos',
    label: 'Abrir Inquilinos',
  },
  {
    keywords: ['pago', 'pagos'],
    message: 'Para registrar un pago, ve a Pagos y selecciona "Registrar pago".',
    route: '/arriendos/pagos',
    label: 'Abrir Pagos',
  },
  {
    keywords: ['gasto', 'gastos'],
    message: 'Para registrar un gasto, ve a Gastos y pulsa "Registrar gasto".',
    route: '/arriendos/gastos',
    label: 'Abrir Gastos',
  },
  {
    keywords: ['recordatorio', 'recordatorios'],
    message: 'Para crear un recordatorio, entra a Recordatorios y presiona "Nuevo recordatorio".',
    route: '/arriendos/recordatorios',
    label: 'Abrir Recordatorios',
  },
];

export const getChatbotResponse = async (input: string): Promise<ChatbotResponse> => {
  const text = normalizeText(input);

  const isNavIntent =
    text.includes('ir') ||
    text.includes('abrir') ||
    text.includes('ver') ||
    text.includes('mostrar') ||
    text.includes('navegar') ||
    text.includes('llevar');

  const isAddIntent =
    text.includes('agregar') ||
    text.includes('crear') ||
    text.includes('registrar') ||
    text.includes('nuevo') ||
    text.includes('anadir');

  if (text.includes('habitacion') && text.includes('ocupad')) {
    const rooms = await getRooms();
    const occupied = rooms.filter((room) => room.status === 'ocupada').length;
    return {
      message: `Actualmente hay ${occupied} habitaciones ocupadas.`,
      suggestion: { label: 'Ver habitaciones', route: '/hotel/habitaciones' },
    };
  }

  if (text.includes('habitacion') && text.includes('disponib')) {
    const rooms = await getRooms();
    const available = rooms.filter((room) => room.status === 'disponible').length;
    return {
      message: `Hay ${available} habitaciones disponibles en este momento.`,
      suggestion: { label: 'Ver habitaciones', route: '/hotel/habitaciones' },
    };
  }

  if (text.includes('propiedad') && text.includes('disponib')) {
    const properties = await getProperties();
    const available = properties.filter((property) => property.status === 'disponible').length;
    return {
      message: `Hay ${available} propiedades disponibles para arriendo.`,
      suggestion: { label: 'Ver propiedades', route: '/arriendos/propiedades' },
    };
  }

  if (text.includes('inquilino') && text.includes('activo')) {
    const tenants = await getTenants();
    const active = tenants.filter((tenant) => Boolean(tenant.propertyId)).length;
    return {
      message: `Tienes ${active} inquilinos activos actualmente.`,
      suggestion: { label: 'Ver inquilinos', route: '/arriendos/inquilinos' },
    };
  }

  if (text.includes('debe') || text.includes('pendient') || text.includes('vencid')) {
    const [payments, tenants] = await Promise.all([getPayments(), getTenants()]);
    const pending = payments.filter((payment) => payment.status !== 'pagado');
    if (pending.length === 0) {
      return { message: 'No hay pagos pendientes ni vencidos en este momento.' };
    }

    const debtorNames = Array.from(
      new Set(
        pending
          .map((payment) => tenants.find((tenant) => tenant.id === payment.tenantId)?.name)
          .filter(Boolean)
      )
    );

    return {
      message: `Hay ${pending.length} pagos pendientes. Deben: ${debtorNames.join(', ')}.`,
      suggestion: { label: 'Revisar pagos', route: '/arriendos/pagos' },
    };
  }

  if (text.includes('ingresos') || text.includes('cobrado')) {
    const payments = await getPayments();
    const total = payments
      .filter((payment) => payment.status === 'pagado')
      .reduce((sum, payment) => sum + payment.amount, 0);
    return {
      message: `El total cobrado registrado es ${formatCurrency(total)}.`,
      suggestion: { label: 'Ver pagos', route: '/arriendos/pagos' },
    };
  }

  if (isAddIntent) {
    const guide = addGuides.find((item) => item.keywords.some((keyword) => text.includes(keyword)));
    if (guide) {
      return {
        message: guide.message,
        suggestion: { label: guide.label, route: guide.route },
      };
    }
  }

  if (isNavIntent) {
    const nav = navigationHints.find((hint) => hint.keywords.some((keyword) => text.includes(keyword)));
    if (nav) {
      return {
        message: `Claro, te llevo a ${nav.label.replace('Ir a ', '').toLowerCase()}.`,
        suggestion: { label: nav.label, route: nav.route },
      };
    }
  }

  return {
    message:
      'Puedo ayudarte con habitaciones, empleados, pagos, propiedades o recordatorios. Pregúntame algo como "¿cuántas habitaciones están ocupadas?".',
  };
};
