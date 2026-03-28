import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

vi.unmock('@/components/shared/Toast');

describe('ToastProvider', () => {
  it('shows and auto-dismisses a toast', async () => {
    vi.useFakeTimers();
    vi.resetModules();

    const { ToastProvider, useToast } = await import('@/components/shared/Toast');

    const Trigger = () => {
      const { addToast } = useToast();
      return (
        <button type="button" onClick={() => addToast('Hola', 'success')}>
          Add
        </button>
      );
    };

    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Add'));
    });
    expect(screen.getByText('Hola')).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });
    expect(screen.queryByText('Hola')).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
