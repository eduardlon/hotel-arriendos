'use client';

import { useRouter } from 'next/navigation';
import { Building2, Home as HomeIcon } from 'lucide-react';
import { useBusinessContext } from '@/context/BusinessContext';
import styles from './BusinessSwitcher.module.css';

export default function BusinessSwitcher() {
  const { currentBusiness, toggleBusiness } = useBusinessContext();
  const router = useRouter();

  const switchTo = (target: 'hotel' | 'arriendos') => {
    if (target === currentBusiness) return;
    toggleBusiness();
    router.push(`/${target}/dashboard`);
  };

  return (
    <div className={styles.switcher} role="group" aria-label="Cambiar negocio">
      <button
        type="button"
        className={styles.option}
        data-active={currentBusiness === 'hotel'}
        onClick={() => switchTo('hotel')}
        aria-pressed={currentBusiness === 'hotel'}
      >
        <HomeIcon className={styles.icon} />
        <span>Hotel</span>
      </button>
      <button
        type="button"
        className={styles.option}
        data-active={currentBusiness === 'arriendos'}
        onClick={() => switchTo('arriendos')}
        aria-pressed={currentBusiness === 'arriendos'}
      >
        <Building2 className={styles.icon} />
        <span>Arriendos</span>
      </button>
    </div>
  );
}
