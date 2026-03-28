'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ChatButton from '@/components/chatbot/ChatButton';
import ChatPanel from '@/components/chatbot/ChatPanel';
import { ToastProvider } from '@/components/shared/Toast';
import OfflineBanner from '@/components/shared/OfflineBanner';
import styles from './AppShell.module.css';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const pathname = usePathname();

  return (
    <ToastProvider>
      <div className={styles.shell}>
        <Sidebar />
        <Header />
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            className={styles.main}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <OfflineBanner />
            {children}
          </motion.main>
        </AnimatePresence>
        <ChatButton isOpen={isChatOpen} onClick={() => setIsChatOpen((prev) => !prev)} />
        <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </ToastProvider>
  );
}
