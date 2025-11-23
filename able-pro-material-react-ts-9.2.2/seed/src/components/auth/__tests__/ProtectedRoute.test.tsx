import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from 'components/auth/ProtectedRoute';
import JWTContext from 'contexts/JWTContext';

const baseCtx = {
  isLoggedIn: false,
  isInitialized: true,
  user: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {}
};

describe('ProtectedRoute seed', () => {
  it('redirects anonymous user to login', () => {
    render(
      <JWTContext.Provider value={baseCtx as any}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route element={<ProtectedRoute />}> <Route path="/protected" element={<div>Protected</div>} /> </Route>
            <Route path="/auth/login" element={<div>LoginPage</div>} />
          </Routes>
        </MemoryRouter>
      </JWTContext.Provider>
    );
    expect(screen.getByText('LoginPage')).toBeInTheDocument();
  });
  it('renders content when logged in', () => {
    const ctx = { ...baseCtx, isLoggedIn: true, user: { id: 'u1' } };
    render(
      <JWTContext.Provider value={ctx as any}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route element={<ProtectedRoute />}> <Route path="/protected" element={<div>Protected</div>} /> </Route>
            <Route path="/auth/login" element={<div>LoginPage</div>} />
          </Routes>
        </MemoryRouter>
      </JWTContext.Provider>
    );
    expect(screen.getByText('Protected')).toBeInTheDocument();
  });
});
