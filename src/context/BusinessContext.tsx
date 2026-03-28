'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BusinessContext as BusinessContextType } from '@/types';

interface BusinessContextValue {
  currentBusiness: BusinessContextType;
  toggleBusiness: () => void;
  setBusiness: (business: BusinessContextType) => void;
}

const BusinessContext = createContext<BusinessContextValue | undefined>(undefined);

const STORAGE_KEY = 'hotel-arriendos-business-context';

interface BusinessProviderProps {
  children: ReactNode;
}

export function BusinessProvider({ children }: BusinessProviderProps) {
  const [currentBusiness, setCurrentBusiness] = useState<BusinessContextType>('hotel');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'hotel' || stored === 'arriendos') {
      setCurrentBusiness(stored);
    }
    setIsInitialized(true);
  }, []);

  // Persist to sessionStorage on change
  useEffect(() => {
    if (isInitialized) {
      sessionStorage.setItem(STORAGE_KEY, currentBusiness);
    }
  }, [currentBusiness, isInitialized]);

  const toggleBusiness = () => {
    setCurrentBusiness(prev => prev === 'hotel' ? 'arriendos' : 'hotel');
  };

  const setBusiness = (business: BusinessContextType) => {
    setCurrentBusiness(business);
  };

  const value: BusinessContextValue = {
    currentBusiness,
    toggleBusiness,
    setBusiness,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusinessContext must be used within a BusinessProvider');
  }
  return context;
}
