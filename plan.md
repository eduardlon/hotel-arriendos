Hotel & Arriendos – App Web Completa
Aplicación web completa en Next.js latest para gestionar dos negocios: un Hotel y Arriendos (propiedades en alquiler). UI profesional, minimalista, con datos simulados. Inspirada en Landlordy para la sección de arriendos.

User Review Required
IMPORTANT

Este proyecto es grande. La implementación inicial usará datos simulados con la estructura lista para luego conectar a Supabase. ¿Estás de acuerdo con empezar así?

NOTE

La app será toda en español. El diseño será minimalista con colores neutros (grises, blancos, acentos sutiles).

Proposed Changes
1. Setup del Proyecto
[NEW] Next.js App con App Router
Inicializar con npx -y create-next-app@latest ./ (TypeScript, App Router, Tailwind deshabilitado)
Instalar dependencias clave:
framer-motion – animaciones fluidas
lucide-react – iconos modernos
recharts – gráficos de dashboard
date-fns – manejo de fechas en español
@radix-ui/react-dialog, @radix-ui/react-dropdown-menu, @radix-ui/react-tabs – componentes accesibles
clsx – utilidad para clases CSS
[NEW] Estructura de Carpetas
src/
├── app/
│   ├── layout.tsx              # Layout global con sidebar
│   ├── page.tsx                # Redirect a /hotel/dashboard
│   ├── globals.css             # Design tokens y estilos globales
│   ├── hotel/
│   │   ├── dashboard/page.tsx
│   │   ├── habitaciones/page.tsx
│   │   ├── empleados/page.tsx
│   │   ├── limpieza/page.tsx
│   │   └── finanzas/page.tsx
│   └── arriendos/
│       ├── dashboard/page.tsx
│       ├── propiedades/page.tsx
│       ├── inquilinos/page.tsx
│       ├── pagos/page.tsx
│       ├── gastos/page.tsx
│       └── recordatorios/page.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx         # Navegación lateral animada
│   │   ├── Header.tsx          # Header con business switcher
│   │   └── BusinessSwitcher.tsx # Toggle Hotel ↔ Arriendos
│   ├── hotel/
│   │   ├── RoomCard.tsx
│   │   ├── RoomGrid.tsx
│   │   ├── CleaningSchedule.tsx
│   │   ├── EmployeeCard.tsx
│   │   └── HotelStats.tsx
│   ├── arriendos/
│   │   ├── PropertyCard.tsx
│   │   ├── TenantCard.tsx
│   │   ├── PaymentTable.tsx
│   │   ├── ExpenseTracker.tsx
│   │   └── RentalStats.tsx
│   ├── shared/
│   │   ├── StatCard.tsx
│   │   ├── Modal.tsx
│   │   ├── DataTable.tsx
│   │   ├── Chart.tsx
│   │   └── EmptyState.tsx
│   └── chatbot/
│       ├── ChatButton.tsx
│       └── ChatPanel.tsx
├── data/
│   ├── hotel-mock.ts           # Datos simulados hotel
│   └── arriendos-mock.ts       # Datos simulados arriendos
├── context/
│   └── BusinessContext.tsx      # Context para business activo
└── lib/
    └── utils.ts                # Utilidades compartidas
2. Módulo Hotel
[NEW] src/app/hotel/dashboard/page.tsx
Dashboard con:

4 stat cards (habitaciones ocupadas, disponibles, ingresos del mes, gastos)
Gráfico de ocupación mensual (Recharts)
Lista de últimas limpiezas realizadas
Habitaciones que necesitan limpieza hoy
[NEW] src/app/hotel/habitaciones/page.tsx
Grid visual de habitaciones con colores por estado (disponible, ocupada, limpieza, mantenimiento)
Modal para crear/editar habitación (número, tipo, piso, precio, estado)
Filtros por estado y piso
Asignación de empleado encargado
[NEW] src/app/hotel/empleados/page.tsx
Cards de empleados con foto, rol, turno
CRUD de empleados
Ver historial de limpiezas realizadas
[NEW] src/app/hotel/limpieza/page.tsx
Calendario semanal de limpieza
Selector de días de aseo por habitación
Registro de limpiezas: quién, qué habitación, a qué hora
Panel con estado actual: limpias / pendientes / en proceso
Botón para marcar limpieza como completada
[NEW] src/app/hotel/finanzas/page.tsx
Tabla de ingresos y gastos con filtros por fecha
Gráfico de flujo de caja (barras: ingresos vs gastos)
Resumen mensual con totales
Formulario para registrar nuevo gasto/ingreso
3. Módulo Arriendos (estilo Landlordy)
[NEW] src/app/arriendos/dashboard/page.tsx
Stat cards (propiedades, inquilinos activos, arriendo cobrado, pendiente)
Gráfico de ingresos por propiedad
Próximos vencimientos de contratos
Pagos pendientes
[NEW] src/app/arriendos/propiedades/page.tsx
Cards de propiedades con imagen, dirección, tipo (apartamento/casa), estado
CRUD de propiedades
Detalle con inquilino actual, historial de pagos, gastos
[NEW] src/app/arriendos/inquilinos/page.tsx
Tabla de inquilinos con datos de contacto
CRUD de inquilinos
Asociar inquilino a propiedad
Ver contrato y pagos
[NEW] src/app/arriendos/pagos/page.tsx
Tabla de pagos: inquilino, propiedad, monto, fecha, estado (pagado/pendiente/vencido)
Registrar pago (modal)
Filtrar por estado y propiedad
Generar recibo
[NEW] src/app/arriendos/gastos/page.tsx
Registro de gastos por propiedad (reparaciones, servicios, impuestos)
Categorización de gastos
Gráfico de gastos por categoría
[NEW] src/app/arriendos/recordatorios/page.tsx
Lista de recordatorios configurables
Crear recordatorios de cobro, mantenimiento, renovación de contrato
Estado: pendiente, completado
4. Funcionalidades Transversales
[NEW] src/components/layout/BusinessSwitcher.tsx
Toggle animado con ícono y nombre del negocio
Cambio de contexto completo (sidebar, rutas, datos)
Animación de transición suave
[NEW] src/components/chatbot/ChatPanel.tsx
Botón flotante en esquina inferior derecha
Panel expandible con chat
Respuestas simuladas basadas en keywords de los datos
Búsqueda inteligente: "¿cuántas habitaciones están ocupadas?", "¿quién debe arriendo?"
[NEW] src/data/hotel-mock.ts
Datos simulados completos:

12 habitaciones (diferentes tipos, pisos, estados)
5 empleados (nombres, roles, turnos)
30+ registros de limpieza
20+ transacciones financieras
[NEW] src/data/arriendos-mock.ts
Datos simulados completos:

8 propiedades (apartamentos y casas)
10 inquilinos
40+ pagos históricos
15+ gastos por propiedad
5+ recordatorios
5. Diseño y Estilo
[NEW] src/app/globals.css
Design tokens con CSS custom properties
Paleta minimalista: fondos #fafafa/#f5f5f5, textos #1a1a1a/#4a4a4a, acentos #2563eb (azul) y #059669 (verde)
Tipografía Inter (Google Fonts)
Animaciones: hover en cards, transiciones de página, micro-interacciones
Sistema de grid responsive
Glassmorphism sutil para sidebar y modales
Verification Plan
Verificación Visual (Browser)
Ejecutar npm run dev en el directorio del proyecto
Abrir http://localhost:3000 en el navegador
Verificar las siguientes rutas y funcionalidades:
Business Switcher: Cambiar entre Hotel y Arriendos
Hotel Dashboard: Ver stats, gráficos y lista de limpieza
Habitaciones: Ver grid, crear habitación, cambiar estados
Limpieza: Ver calendario, registrar limpieza
Arriendos Dashboard: Ver stats y pagos pendientes
Propiedades: Ver cards, crear propiedad
Inquilinos: Ver tabla, crear inquilino
Chatbot: Abrir panel, hacer preguntas
Verificar responsividad en diferentes tamaños de pantalla
Build Check
Ejecutar npm run build para verificar que no hay errores de TypeScript ni de compilación
Agent
Model quota reached
Your plan's baseline quota will refresh on 3/26/2026, 7:51:20 PM.

hotel-arriendos


Model
AI may make mistakes. Double-check all generated code.

Hotel & Arriendos – App Web Completa
Fase 1: Planificación
 Investigar funcionalidades Landlordy y gestión hotelera
 Crear plan de implementación detallado
 Revisión y aprobación del usuario
Fase 2: Setup del Proyecto
 Inicializar proyecto Next.js 15 con App Router
 Configurar estructura de carpetas, dependencias y theming
 Configurar layout global con sidebar y business switcher
Fase 3: Módulo Hotel
 Dashboard Hotel (resumen habitaciones, ingresos, gastos, limpieza)
 Gestión de Habitaciones (CRUD, estados, asignación)
 Gestión de Empleados (crear, asignar, roles)
 Módulo de Limpieza (registro, horarios, panel de scheduling)
 Gastos e Ingresos del Hotel
Fase 4: Módulo Arriendos (estilo Landlordy)
 Dashboard Arriendos (resumen propiedades, pagos, balance)
 Gestión de Propiedades (apartamentos, casas – CRUD)
 Gestión de Inquilinos (datos, contratos, historial)
 Pagos de Arriendo (registro, tracking, recibos)
 Gastos y Mantenimiento de propiedades
 Recordatorios y Alertas
Fase 5: Funcionalidades Transversales
 Business Switcher (Hotel ↔ Arriendos)
 Chatbot inteligente
 Datos simulados completos
 Tema minimalista, animaciones, iconos
Fase 6: Verificación
 Verificación visual en navegador
 Verificación de navegación y funcionalidad
 Walkthrough final
Agent
Model quota reached
Your plan's baseline quota will refresh on 3/26/2026, 7:51:20 PM.

hotel-arriendos


Model
AI may make mistakes. Double-check all generated code.