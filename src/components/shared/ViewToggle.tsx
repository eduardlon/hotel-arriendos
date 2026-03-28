'use client';

import { LayoutGrid, List } from 'lucide-react';
import styles from './ViewToggle.module.css';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className={styles.toggleContainer}>
      <button
        className={`${styles.toggleButton} ${view === 'grid' ? styles.active : ''}`}
        onClick={() => onViewChange('grid')}
        title="Vista de cuadrícula"
        type="button"
      >
        <LayoutGrid size={20} />
      </button>
      <button
        className={`${styles.toggleButton} ${view === 'list' ? styles.active : ''}`}
        onClick={() => onViewChange('list')}
        title="Vista de lista"
        type="button"
      >
        <List size={20} />
      </button>
    </div>
  );
}
