'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getChatbotResponse, type ChatbotResponse } from '@/lib/chatbot';
import styles from './ChatPanel.module.css';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestion?: {
    label: string;
    route: string;
  };
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hola, soy tu asistente. ¿En qué puedo ayudarte con el hotel o los arriendos?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response: ChatbotResponse = await getChatbotResponse(trimmed);
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        suggestion: response.suggestion,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (route: string) => {
    router.push(route);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.panel}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <div className={styles.header}>
            <span className={styles.title}>Asistente</span>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Cerrar chat"
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.messages}>
            {messages.map((message) => (
              <div key={message.id} className={`${styles.message} ${styles[message.role]}`}>
                <p>{message.content}</p>
                {message.suggestion && (
                  <button
                    type="button"
                    className={styles.suggestion}
                    onClick={() => handleSuggestionClick(message.suggestion!.route)}
                  >
                    {message.suggestion.label}
                  </button>
                )}
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <p>Pensando...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputRow}>
            <input
              type="text"
              className={styles.input}
              placeholder="Escribe tu pregunta..."
              value={input}
              aria-label="Escribir mensaje"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSend();
                }
              }}
            />
            <button
              type="button"
              className={styles.sendButton}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              Enviar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
