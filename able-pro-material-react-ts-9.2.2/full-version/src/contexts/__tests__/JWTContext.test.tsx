import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { JWTProvider } from 'contexts/JWTContext';
import JWTContext from 'contexts/JWTContext';
import React, { useContext } from 'react';

vi.mock('services/auth', () => {
  return {
    login: async () => ({ token: 'fake.jwt.token', user: { id: 'u2', role: 'admin', name: 'Admin User' } }),
    logout: async () => {},
    getCurrentUser: async () => ({ id: 'u2', role: 'admin', name: 'Admin User' })
  };
});

function Consume() {
  const ctx = useContext(JWTContext)!;
  return (
    <div>
      <span data-testid="logged">{ctx.isLoggedIn ? 'yes' : 'no'}</span>
      <button onClick={() => ctx.login('a','b')}>login</button>
    </div>
  );
}

describe('JWTContext admin', () => {
  it('logs in and sets state', async () => {
    render(<JWTProvider><Consume /></JWTProvider>);
    expect(screen.getByTestId('logged').textContent).toBe('no');
    await act(async () => { screen.getByText('login').click(); });
    expect(screen.getByTestId('logged').textContent).toBe('yes');
  });
});
