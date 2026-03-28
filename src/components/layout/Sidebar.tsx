'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useBusinessContext } from '@/context/BusinessContext';
import { getNavItems } from '@/lib/navigation';
import BusinessSwitcher from './BusinessSwitcher';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { currentBusiness } = useBusinessContext();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = getNavItems(currentBusiness);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <button
        onClick={toggleMobileMenu}
        className={styles.mobileToggle}
        aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {isMobileMenuOpen ? <X className={styles.toggleIcon} /> : <Menu className={styles.toggleIcon} />}
      </button>

      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>HA</div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>Hotel Arriendos</span>
            <span className={styles.brandSubtitle}>Gestión centralizada</span>
          </div>
        </div>

        <div className={styles.switcherWrap}>
          <span className={styles.switcherLabel}>Negocio</span>
          <BusinessSwitcher />
        </div>

        <nav className={styles.nav} aria-label="Secciones">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={styles.navItem}
                data-active={isActive}
                aria-current={isActive ? 'page' : undefined}
                onClick={closeMobileMenu}
              >
                <span className={styles.navIconWrap}>
                  <Icon className={styles.navIcon} />
                </span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <span className={styles.footerText}>Panel operativo</span>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div className={styles.overlay} onClick={closeMobileMenu} aria-hidden="true" />
      )}
    </>
  );
}
