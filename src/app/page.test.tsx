import { describe, it, expect, vi } from 'vitest';
import { redirect } from 'next/navigation';
import Home from './page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Home Page', () => {
  it('redirects to /hotel/dashboard', () => {
    Home();
    expect(redirect).toHaveBeenCalledWith('/hotel/dashboard');
  });
});
