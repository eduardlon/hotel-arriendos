'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBusinessContext } from '@/context/BusinessContext';
import { getNavItems } from '@/lib/navigation';
import styles from './Header.module.css';

const pageTitles: Record<string, string> = {
  '/hotel/dashboard': 'Dashboard Hotel',
  '/hotel/habitaciones': 'Habitaciones',
  '/hotel/empleados': 'Empleados',
  '/hotel/limpieza': 'Limpieza',
  '/hotel/finanzas': 'Finanzas',
  '/arriendos/dashboard': 'Dashboard Arriendos',
  '/arriendos/propiedades': 'Propiedades',
  '/arriendos/inquilinos': 'Inquilinos',
  '/arriendos/pagos': 'Pagos',
  '/arriendos/gastos': 'Gastos',
  '/arriendos/recordatorios': 'Recordatorios',
};

export default function Header() {
  const pathname = usePathname();
  const { currentBusiness } = useBusinessContext();
  const pageTitle = pageTitles[pathname] || 'Hotel-Arriendos';
  const navItems = getNavItems(currentBusiness);

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <div>
          <p className={styles.eyebrow}>Panel de control</p>
          <h1 className={styles.title}>{pageTitle}</h1>
        </div>
        <span className={styles.businessBadge}>
          {currentBusiness === 'hotel' ? 'Hotel' : 'Arriendos'}
        </span>
      </div>

      <nav className={styles.sectionBar} aria-label="Navegación rápida">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={styles.sectionItem}
              data-active={isActive}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
