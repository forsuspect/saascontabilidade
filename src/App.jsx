import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { logSystemAction } from './services/dbService';

// Components & Layout
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobilePerfInit from './components/MobilePerfInit';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Finance from './pages/Finance';
import Calendar from './pages/Calendar';
import Kanban from './pages/Kanban';
import Documents from './pages/Documents';
import Admin from './pages/Admin';

const LayoutShell = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-pure);
  color: var(--text-white);
  position: relative;
`;

const ContentArea = styled.div`
  flex-grow: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 10;
  
  @media (max-width: 1024px) {
    margin-left: 80px;
  }
  
  @media (max-width: 640px) {
    margin-left: 0;
  }
`;

const InnerPadding = styled.main`
  padding: 40px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 640px) {
    padding: 20px;
  }
`;

const LoadingScreen = styled.div`
  min-height: 100vh;
  background: #000000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-white);
`;

const GlobalFooter = styled.footer`
  text-align: center;
  padding: 24px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  margin-top: auto;
  
  a {
    color: var(--wine-red-light);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s ease;
    
    &:hover {
      color: #fff;
    }
  }
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(139, 30, 47, 0.1);
  border-top-color: var(--wine-red-light);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Helper: Guard for Authenticated Users
const AuthenticatedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <LoadingScreen>
        <Spinner />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Verificando Assinatura...</span>
      </LoadingScreen>
    );
  }
  const location = useLocation();

  if (!isAuthenticated) {
    // Record unauthorized access attempt on protected routes
    logSystemAction('AUTH_DENIED', `Acesso interceptado na rota privada: ${location.pathname}`, 'anonymous', 'visitante', 'visitante').catch(() => {});
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Helper: Guard for Roles
const RoleRoute = ({ children, allowedRoles }) => {
  const { profile, hasPermission } = useAuth();
  const toast = useToast();
  const location = useLocation();
  
  if (!profile) {
    logSystemAction('AUTH_DENIED', `Acesso público interceptado no módulo restrito.`, 'anonymous', 'visitante', 'visitante').catch(() => {});
    return <Navigate to="/login" replace />;
  }
  
  if (!hasPermission(allowedRoles)) {
    // Notify user of unauthorized access attempt
    logSystemAction('AUTH_DENIED', `Tentativa de acesso não autorizado ao módulo restrito: ${location.pathname}`, profile.id, profile.role, profile.username).catch(() => {});
    setTimeout(() => {
      toast.error('Você não possui privilégios de acesso para este módulo.', 'Acesso Negado');
    }, 100);
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const NavigationWrapper = () => {
  return (
    <LayoutShell>
      <div className="animated-grid" />
      <Sidebar />
      <ContentArea>
        <Header />
        <InnerPadding>
          <Routes>
            <Route path="/" element={<Dashboard />} />
                        <Route 
              path="/clientes" 
              element={
                <RoleRoute allowedRoles={['developer', 'owner', 'employee']}>
                  <Clients />
                </RoleRoute>
              } 
            />
            
            <Route 
              path="/financeiro" 
              element={
                <RoleRoute allowedRoles={['developer', 'owner']}>
                  <Finance />
                </RoleRoute>
              } 
            />

            <Route 
              path="/agenda" 
              element={
                <RoleRoute allowedRoles={['developer', 'owner', 'employee']}>
                  <Calendar />
                </RoleRoute>
              } 
            />

            <Route 
              path="/tarefas" 
              element={
                <RoleRoute allowedRoles={['developer', 'owner', 'employee']}>
                  <Kanban />
                </RoleRoute>
              } 
            />

            <Route path="/documentos" element={<Documents />} />
            
            <Route 
              path="/administracao" 
              element={
                <RoleRoute allowedRoles={['developer', 'owner']}>
                  <Admin />
                </RoleRoute>
              } 
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </InnerPadding>
        <GlobalFooter>
          Desenvolvido por <a href="https://automize-one.vercel.app/" target="_blank" rel="noopener noreferrer">Automize</a>
        </GlobalFooter>
      </ContentArea>
    </LayoutShell>
  );
};

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <LoadingScreen>
        <Spinner />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Iniciando Sistema...</span>
      </LoadingScreen>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/*" 
        element={
          <AuthenticatedRoute>
            <NavigationWrapper />
          </AuthenticatedRoute>
        } 
      />
    </Routes>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <MobilePerfInit />
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
