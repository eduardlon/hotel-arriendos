import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, renderHook, act, waitFor } from '@testing-library/react';
import { BusinessProvider, useBusinessContext } from './BusinessContext';
import React from 'react';

describe('BusinessContext', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('BusinessProvider', () => {
    it('should render children', () => {
      render(
        <BusinessProvider>
          <div>Test Content</div>
        </BusinessProvider>
      );
      expect(screen.getByText('Test Content')).toBeDefined();
    });

    it('should initialize with hotel as default business', () => {
      const { result } = renderHook(() => useBusinessContext(), {
        wrapper: BusinessProvider,
      });

      expect(result.current.currentBusiness).toBe('hotel');
    });

    it('should load business context from sessionStorage on mount', async () => {
      sessionStorage.setItem('hotel-arriendos-business-context', 'arriendos');

      const { result } = renderHook(() => useBusinessContext(), {
        wrapper: BusinessProvider,
      });

      await waitFor(() => {
        expect(result.current.currentBusiness).toBe('arriendos');
      });
    });

    it('should persist business context to sessionStorage when changed', async () => {
      const { result } = renderHook(() => useBusinessContext(), {
        wrapper: BusinessProvider,
      });

      act(() => {
        result.current.setBusiness('arriendos');
      });

      await waitFor(() => {
        expect(sessionStorage.getItem('hotel-arriendos-business-context')).toBe('arriendos');
      });
    });

    it('should toggle between hotel and arriendos', () => {
      const { result } = renderHook(() => useBusinessContext(), {
        wrapper: BusinessProvider,
      });

      expect(result.current.currentBusiness).toBe('hotel');

      act(() => {
        result.current.toggleBusiness();
      });

      expect(result.current.currentBusiness).toBe('arriendos');

      act(() => {
        result.current.toggleBusiness();
      });

      expect(result.current.currentBusiness).toBe('hotel');
    });

    it('should set business to specific value using setBusiness', () => {
      const { result } = renderHook(() => useBusinessContext(), {
        wrapper: BusinessProvider,
      });

      act(() => {
        result.current.setBusiness('arriendos');
      });

      expect(result.current.currentBusiness).toBe('arriendos');

      act(() => {
        result.current.setBusiness('hotel');
      });

      expect(result.current.currentBusiness).toBe('hotel');
    });

    it('should ignore invalid values in sessionStorage', async () => {
      sessionStorage.setItem('hotel-arriendos-business-context', 'invalid');

      const { result } = renderHook(() => useBusinessContext(), {
        wrapper: BusinessProvider,
      });

      await waitFor(() => {
        expect(result.current.currentBusiness).toBe('hotel');
      });
    });
  });

  describe('useBusinessContext', () => {
    it('should throw error when used outside BusinessProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useBusinessContext());
      }).toThrow('useBusinessContext must be used within a BusinessProvider');

      consoleError.mockRestore();
    });

    it('should return context value when used within BusinessProvider', () => {
      const { result } = renderHook(() => useBusinessContext(), {
        wrapper: BusinessProvider,
      });

      expect(result.current).toHaveProperty('currentBusiness');
      expect(result.current).toHaveProperty('toggleBusiness');
      expect(result.current).toHaveProperty('setBusiness');
    });
  });

  describe('sessionStorage persistence', () => {
    it('should persist across multiple renders', async () => {
      const { result: result1 } = renderHook(() => useBusinessContext(), {
        wrapper: BusinessProvider,
      });

      act(() => {
        result1.current.setBusiness('arriendos');
      });

      await waitFor(() => {
        expect(sessionStorage.getItem('hotel-arriendos-business-context')).toBe('arriendos');
      });

      // Simulate new render (e.g., page refresh)
      const { result: result2 } = renderHook(() => useBusinessContext(), {
        wrapper: BusinessProvider,
      });

      await waitFor(() => {
        expect(result2.current.currentBusiness).toBe('arriendos');
      });
    });
  });
});
