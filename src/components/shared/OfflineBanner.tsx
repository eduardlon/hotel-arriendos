'use client';

import { useEffect, useState } from 'react';
import styles from './OfflineBanner.module.css';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);
    updateStatus();
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className={styles.banner}>
      Estás sin conexión. Algunos cambios se guardarán cuando vuelvas a estar en línea.
    </div>
  );
}
