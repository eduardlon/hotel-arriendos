import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatButton from '@/components/chatbot/ChatButton';
import ChatPanel from '@/components/chatbot/ChatPanel';
import { getChatbotResponse } from '@/lib/chatbot';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/lib/chatbot', () => ({
  getChatbotResponse: vi.fn(),
}));

beforeEach(() => {
  pushMock.mockReset();
  vi.mocked(getChatbotResponse).mockReset();
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
  }
});

describe('Chatbot components', () => {
  it('renders ChatButton and triggers click', () => {
    const onClick = vi.fn();
    render(<ChatButton isOpen={false} onClick={onClick} />);

    const button = screen.getByRole('button', { name: /abrir chatbot/i });
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalled();
  });

  it('renders ChatPanel, sends message, and handles suggestion click', async () => {
    vi.mocked(getChatbotResponse).mockResolvedValue({
      message: 'Hola, respuesta',
      suggestion: { label: 'Ir a pagos', route: '/arriendos/pagos' },
    });

    const onClose = vi.fn();
    render(<ChatPanel isOpen={true} onClose={onClose} />);

    fireEvent.change(screen.getByLabelText(/escribir mensaje/i), {
      target: { value: 'Hola' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByText('Hola, respuesta')).toBeInTheDocument();
    });

    const suggestion = screen.getByRole('button', { name: /ir a pagos/i });
    fireEvent.click(suggestion);

    expect(pushMock).toHaveBeenCalledWith('/arriendos/pagos');
    expect(onClose).toHaveBeenCalled();
  });
});
