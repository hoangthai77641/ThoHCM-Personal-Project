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

describe('ProtectedRoute admin', () => {
  it('redirects anonymous user to login', () => {
    render(
      <JWTContext.Provider value={baseCtx as any}>
        <MemoryRouter initialEntries={['/admin/services']}> 
          <Routes>
            <Route element={<ProtectedRoute roles={['admin']} />}> <Route path="/admin/services" element={<div>AdminServices</div>} /> </Route>
            <Route path="/auth/login" element={<div>LoginPage</div>} />
            <Route path="/maintenance/404" element={<div>NotFound</div>} />
          </Routes>
        </MemoryRouter>
      </JWTContext.Provider>
    );
    expect(screen.getByText('LoginPage')).toBeInTheDocument();
  });
  it('blocks wrong role', () => {
    const ctx = { ...baseCtx, isLoggedIn: true, user: { id: 'u1', role: 'customer' } };
    render(
      <JWTContext.Provider value={ctx as any}>
        <MemoryRouter initialEntries={['/admin/services']}> 
          <Routes>
            <Route element={<ProtectedRoute roles={['admin']} />}> <Route path="/admin/services" element={<div>AdminServices</div>} /> </Route>
            <Route path="/auth/login" element={<div>LoginPage</div>} />
            <Route path="/maintenance/404" element={<div>NotFound</div>} />
          </Routes>
        </MemoryRouter>
      </JWTContext.Provider>
    );
    expect(screen.getByText('NotFound')).toBeInTheDocument();
  });
  it('allows correct role', () => {
    const ctx = { ...baseCtx, isLoggedIn: true, user: { id: 'u1', role: 'admin' } };
    render(
      <JWTContext.Provider value={ctx as any}>
        <MemoryRouter initialEntries={['/admin/services']}> 
          <Routes>
            <Route element={<ProtectedRoute roles={['admin']} />}> <Route path="/admin/services" element={<div>AdminServices</div>} /> </Route>
            <Route path="/auth/login" element={<div>LoginPage</div>} />
            <Route path="/maintenance/404" element={<div>NotFound</div>} />
          </Routes>
        </MemoryRouter>
      </JWTContext.Provider>
    );
    expect(screen.getByText('AdminServices')).toBeInTheDocument();
  });
});
