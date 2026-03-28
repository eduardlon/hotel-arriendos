'use client';

import { MessageCircle } from 'lucide-react';
import styles from './ChatButton.module.css';

interface ChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export default function ChatButton({ onClick, isOpen }: ChatButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${!isOpen ? styles.pulse : ''}`}
      onClick={onClick}
      aria-label={isOpen ? 'Cerrar chatbot' : 'Abrir chatbot'}
    >
      <MessageCircle size={24} />
    </button>
  );
}
