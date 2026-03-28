# Hotel & Arriendos - Plataforma de Gestión Dual

Una aplicación web moderna y completa construida con Next.js 15 para la gestión integral de dos modelos de negocio desde una misma plataforma: **Administración Hotelera** y **Gestión de Propiedades en Arriendo** (inspirada en herramientas como Landlordy).

## 🚀 Tecnologías Utilizadas

El proyecto está desarrollado con un stack moderno y enfocado en el rendimiento y la experiencia de usuario:

- **Framework Core:** [Next.js 15](https://nextjs.org/) (App Router) con React 19.
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) para tipado estático seguro.
- **Estilos y Diseño:** CSS Modules con Custom Properties (Tokens de Diseño) para una UI minimalista y personalizada. No se usa Tailwind por requerimiento, manteniendo control total sobre CSS.
- **Componentes Accesibles:** [Radix UI primitives](https://www.radix-ui.com/) (Dialogs, Dropdowns, Tabs, etc.).
- **Visualización de Datos:** [Recharts](https://recharts.org/) para gráficos interactivos en los dashboards.
- **Animaciones:** [Framer Motion](https://www.framer.com/motion/) para transiciones fluidas, layouts y micro-interacciones.
- **Iconografía:** [Lucide React](https://lucide.dev/).
- **Manejo de Fechas:** `date-fns`.
- **Testing:** Vitest y React Testing Library para componentes y funcionalidades.

## 🎨 Diseño y UX

- **Estética:** Minimalista, colores neutros (fondos grises/blancos con textos oscuros y acentos de color semánticos para estados: verde/disponible, rojo/ocupado, ámbar/limpieza).
- **Flujo:** La aplicación permite cambiar de contexto (Hotel ↔ Arriendos) instantáneamente mediante un "Business Switcher" global.
- **Vistas dinámicas:** Implementación de persistencia y toggles para cambiar entre "Vista de Cuadrícula (Grid)" y "Vista de Lista (Data Table)" tanto en las habitaciones como en las propiedades.

## 📦 Estructura del Proyecto

El proyecto sigue la arquitectura recomendada por Next.js App Router:

```text
src/
├── app/                  # Rutas principales (App Router)
│   ├── hotel/            # Módulo de Hotel (Dashboard, Habitaciones, Empleados, Limpieza, Finanzas)
│   └── arriendos/        # Módulo de Arriendos (Dashboard, Propiedades, Inquilinos, Pagos, Gastos)
├── components/           # Componentes UI reutilizables
│   ├── layout/           # Sidebar, Header, Business Switcher
│   ├── hotel/            # Componentes específicos del hotel
│   ├── arriendos/        # Componentes específicos de arriendos
│   ├── shared/           # DataTables, Modales, ViewToggles, Charts
│   └── chatbot/          # Chat flotante interactivo
├── context/              # Context API (e.g., BusinessContext para cambiar de app)
├── data/                 # Datos simulados (Mocks) para fase inicial
├── lib/                  # Utilidades compartidas
├── tests/                # Pruebas unitarias y de componentes (Vitest)
└── types/                # Definiciones de interfaces TypeScript globales
```

## ✅ Funcionalidades Implementadas (Fase Actual)

Actualmente la aplicación opera con **datos simulados** que preparan la estructura para una futura integración con una base de datos real (como Supabase).

### Módulo Hotel
- **Dashboard:** KPIs en tiempo real (habitaciones ocupadas, ingresos, necesidades de limpieza) y gráficos de ocupación.
- **Habitaciones:** Visualización en Grid o Lista, filtrado por estado, edición de estados y características.
- **Empleados:** Gestión del personal y roles del hotel.
- **Limpieza (Housekeeping):** Calendario de aseos, asignaciones y control de estados (limpio/sucio/en proceso).
- **Finanzas:** Flujo de caja específico del hotel.

### Módulo Arriendos
- **Dashboard:** Resumen de propiedades activas, pagos pendientes ingresos mes a mes.
- **Propiedades:** Listado en Grid/Lista de todo el portafolio (casas, apartamentos) y sus detalles.
- **Inquilinos & Pagos:** Seguimiento de personas, contratos, cánones vencidos y próximos pagos.
- **Gastos & Recordatorios:** Control de reparaciones y alertas de mantenimiento.

### Transversales
- **Business Switcher:** Interfaz intuitiva para alternar ambientes.
- **Chatbot Inteligente:** Panel interactivo para consultas rápidas sobre el estado del alojamiento o cuentas.

## 🛠️ Cómo Iniciar el Proyecto (Desarrollador)

Para el desarrollador que continúa con este proyecto:

1. **Clonar y prepararse:**
   ```bash
   git clone https://github.com/eduardlon/hotel-arriendos.git
   cd hotel-arriendos
   npm install
   ```

2. **Ejecutar en entorno de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

3. **Ejecutar Pruebas:**
   ```bash
   npm run test
   ```

4. **Próximos Pasos Proyectados:**
   - Reemplazar la data simulada en `/src/data/` por peticiones asincrónicas a un backend o BaaS (ej. Supabase).
   - Implementar el inicio de sesión / autenticación y protección de rutas.
   - Refinar componentes complejos y expandir la cobertura de tests.
