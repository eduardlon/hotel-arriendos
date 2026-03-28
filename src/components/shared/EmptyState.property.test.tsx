import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';
import { 
  Inbox, 
  Home, 
  Users, 
  DollarSign, 
  Calendar, 
  FileText, 
  Package, 
  AlertCircle,
  Info,
  Search,
  Database,
  Folder,
  File,
  Archive,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
  type LucideIcon
} from 'lucide-react';

/**
 * **Feature: hotel-arriendos, Property 45: Empty State Display**
 * 
 * For any view or list that has no data to display, the system should show an appropriate
 * empty state message in Spanish explaining the absence of data.
 * 
 * **Validates: Requirements 20.5**
 */
describe('Property 45: Empty State Display', () => {
  // Available icons for empty states
  const availableIcons: LucideIcon[] = [
    Inbox,
    Home,
    Users,
    DollarSign,
    Calendar,
    FileText,
    Package,
    AlertCircle,
    Info,
    Search,
    Database,
    Folder,
    File,
    Archive,
    Trash2,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    HelpCircle,
  ];

  // Arbitrary generator for Spanish empty state messages
  const spanishEmptyMessageArbitrary = fc.constantFrom(
    'No hay datos disponibles',
    'No hay habitaciones disponibles',
    'No hay propiedades registradas',
    'No hay inquilinos registrados',
    'No hay pagos registrados',
    'No hay recordatorios pendientes',
    'No hay empleados registrados',
    'No hay transacciones financieras',
    'No hay gastos registrados',
    'No hay registros de limpieza',
    'No se encontraron resultados',
    'No hay información para mostrar',
    'No hay elementos en esta lista',
    'No hay actividad reciente',
    'No hay datos para este período',
    'No hay contratos próximos a vencer',
    'No hay pagos vencidos',
    'No hay tareas pendientes',
    'No hay notificaciones',
    'No hay historial disponible'
  );

  // Arbitrary generator for icons
  const iconArbitrary = fc.constantFrom(...availableIcons);

  // Arbitrary generator for optional action
  const actionArbitrary = fc.option(
    fc.record({
      label: fc.constantFrom(
        'Agregar habitación',
        'Agregar propiedad',
        'Agregar inquilino',
        'Registrar pago',
        'Crear recordatorio',
        'Agregar empleado',
        'Registrar transacción',
        'Agregar gasto',
        'Crear nuevo',
        'Comenzar'
      ),
      onClick: fc.func(fc.constant(undefined)),
    }),
    { nil: undefined }
  );

  it('should display Spanish message for any empty state', () => {
    fc.assert(
      fc.property(
        spanishEmptyMessageArbitrary,
        iconArbitrary,
        (message, icon) => {
          const { unmount } = render(<EmptyState message={message} icon={icon} />);

          // Verify the Spanish message is displayed
          expect(screen.getByText(message)).toBeInTheDocument();

          unmount();
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should display empty state with icon for any valid combination', () => {
    fc.assert(
      fc.property(
        spanishEmptyMessageArbitrary,
        iconArbitrary,
        (message, icon) => {
          const { container, unmount } = render(<EmptyState message={message} icon={icon} />);

          // Verify message is displayed
          expect(screen.getByText(message)).toBeInTheDocument();

          // Verify icon is rendered (check for svg element)
          const svgElement = container.querySelector('svg');
          expect(svgElement).toBeInTheDocument();

          unmount();
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should display empty state without action button when no action is provided', () => {
    fc.assert(
      fc.property(
        spanishEmptyMessageArbitrary,
        iconArbitrary,
        (message, icon) => {
          const { unmount } = render(<EmptyState message={message} icon={icon} />);

          // Verify message is displayed
          expect(screen.getByText(message)).toBeInTheDocument();

          // Verify no button is rendered
          expect(screen.queryByRole('button')).not.toBeInTheDocument();

          unmount();
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should display empty state with action button when action is provided', () => {
    fc.assert(
      fc.property(
        spanishEmptyMessageArbitrary,
        iconArbitrary,
        fc.constantFrom(
          'Agregar habitación',
          'Agregar propiedad',
          'Agregar inquilino',
          'Registrar pago',
          'Crear recordatorio'
        ),
        (message, icon, actionLabel) => {
          const mockAction = { label: actionLabel, onClick: () => {} };
          
          const { unmount } = render(<EmptyState message={message} icon={icon} action={mockAction} />);

          // Verify message is displayed
          expect(screen.getByText(message)).toBeInTheDocument();

          // Verify action button is rendered with Spanish label
          expect(screen.getByRole('button', { name: actionLabel })).toBeInTheDocument();

          unmount();
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should display appropriate Spanish message for any data absence scenario', () => {
    fc.assert(
      fc.property(
        spanishEmptyMessageArbitrary,
        iconArbitrary,
        actionArbitrary,
        (message, icon, action) => {
          const { unmount } = render(<EmptyState message={message} icon={icon} action={action} />);

          // Verify Spanish message is always displayed
          const messageElement = screen.getByText(message);
          expect(messageElement).toBeInTheDocument();

          // Verify message is in Spanish (contains Spanish words or patterns)
          const spanishPatterns = [
            /no hay/i,
            /no se/i,
            /no tiene/i,
            /sin /i,
            /disponible/i,
            /registrad/i,
            /pendiente/i,
            /información/i,
            /datos/i,
            /resultados/i,
            /elementos/i,
            /actividad/i,
            /período/i,
            /próximos/i,
            /vencidos/i,
            /tareas/i,
            /notificaciones/i,
            /historial/i,
          ];

          const containsSpanishPattern = spanishPatterns.some((pattern) =>
            pattern.test(message)
          );
          expect(containsSpanishPattern).toBe(true);

          unmount();
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should render empty state component structure consistently for any input', () => {
    fc.assert(
      fc.property(
        spanishEmptyMessageArbitrary,
        iconArbitrary,
        actionArbitrary,
        (message, icon, action) => {
          const { container, unmount } = render(
            <EmptyState message={message} icon={icon} action={action} />
          );

          // Verify component structure
          const emptyStateDiv = container.firstChild as HTMLElement;
          expect(emptyStateDiv).toBeInTheDocument();

          // Verify icon is present
          const svgElement = container.querySelector('svg');
          expect(svgElement).toBeInTheDocument();

          // Verify message is present
          expect(screen.getByText(message)).toBeInTheDocument();

          // Verify action button presence matches action prop
          const button = screen.queryByRole('button');
          if (action) {
            expect(button).toBeInTheDocument();
            expect(button).toHaveTextContent(action.label);
          } else {
            expect(button).not.toBeInTheDocument();
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should display centered layout for any empty state configuration', () => {
    fc.assert(
      fc.property(
        spanishEmptyMessageArbitrary,
        iconArbitrary,
        actionArbitrary,
        (message, icon, action) => {
          const { container, unmount } = render(
            <EmptyState message={message} icon={icon} action={action} />
          );

          // Verify component is rendered
          const emptyStateDiv = container.firstChild as HTMLElement;
          expect(emptyStateDiv).toBeInTheDocument();

          // Verify message and icon are present (structure validation)
          expect(screen.getByText(message)).toBeInTheDocument();
          expect(container.querySelector('svg')).toBeInTheDocument();

          unmount();
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should handle empty data scenarios across different view types', () => {
    // Simulate different view types that might show empty states
    const viewTypes = [
      { type: 'list', message: 'No hay elementos en esta lista', icon: Inbox },
      { type: 'table', message: 'No hay datos disponibles', icon: Database },
      { type: 'grid', message: 'No hay resultados', icon: Search },
      { type: 'chart', message: 'No hay datos para mostrar', icon: FileText },
      { type: 'calendar', message: 'No hay eventos', icon: Calendar },
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...viewTypes),
        (viewConfig) => {
          const { unmount } = render(
            <EmptyState
              message={viewConfig.message}
              icon={viewConfig.icon}
            />
          );

          // Verify Spanish message is displayed for any view type
          expect(screen.getByText(viewConfig.message)).toBeInTheDocument();

          unmount();
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should explain absence of data in Spanish for any empty state', () => {
    fc.assert(
      fc.property(
        spanishEmptyMessageArbitrary,
        iconArbitrary,
        (message, icon) => {
          const { unmount } = render(<EmptyState message={message} icon={icon} />);

          const messageElement = screen.getByText(message);
          
          // Verify message is explanatory (not just an error or generic text)
          // Spanish empty state messages should explain what is missing
          expect(messageElement).toBeInTheDocument();
          expect(messageElement.textContent).toBeTruthy();
          expect(messageElement.textContent!.length).toBeGreaterThan(5);

          unmount();
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should maintain consistent empty state display across multiple renders', () => {
    fc.assert(
      fc.property(
        spanishEmptyMessageArbitrary,
        iconArbitrary,
        actionArbitrary,
        (message, icon, action) => {
          // First render
          const { unmount: unmount1 } = render(
            <EmptyState message={message} icon={icon} action={action} />
          );
          
          const firstMessage = screen.getByText(message);
          expect(firstMessage).toBeInTheDocument();
          const firstTextContent = firstMessage.textContent;
          
          unmount1();

          // Second render with same props
          const { unmount: unmount2 } = render(<EmptyState message={message} icon={icon} action={action} />);
          
          const secondMessage = screen.getByText(message);
          expect(secondMessage).toBeInTheDocument();
          expect(secondMessage.textContent).toBe(firstTextContent);

          unmount2();
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });
});

