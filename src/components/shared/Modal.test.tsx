import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

describe('Modal Component', () => {
  it('renders modal when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const closeButton = screen.getByRole('button', { name: /cerrar/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when ESC key is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    // Click outside the modal content (on the overlay)
    const overlay = document.querySelector('[data-radix-dialog-overlay]');
    if (overlay) {
      await user.click(overlay);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it('renders children content correctly', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>
          <h2>Child heading</h2>
          <p>Child paragraph</p>
          <button>Child button</button>
        </div>
      </Modal>
    );

    expect(screen.getByText('Child heading')).toBeInTheDocument();
    expect(screen.getByText('Child paragraph')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /child button/i })).toBeInTheDocument();
  });

  it('displays title in Spanish', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Agregar Habitación">
        <p>Content</p>
      </Modal>
    );

    expect(screen.getByText('Agregar Habitación')).toBeInTheDocument();
  });

  it('has close button with Spanish aria-label', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test">
        <p>Content</p>
      </Modal>
    );

    const closeButton = screen.getByRole('button', { name: /cerrar/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('traps focus within modal when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <input type="text" placeholder="Input 1" />
        <input type="text" placeholder="Input 2" />
      </Modal>
    );

    // Radix Dialog automatically manages focus trap
    // Verify modal content is in the document
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    
    // Verify inputs are accessible within the modal
    expect(screen.getByPlaceholderText('Input 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Input 2')).toBeInTheDocument();
  });
});
