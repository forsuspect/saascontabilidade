import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { overlayFade, drawerSlide } from '../utils/motion';
import { mobileGlassFix } from '../styles/glass';
import { 
  Bell, 
  Menu, 
  X, 
  Database, 
  Clock, 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  UserCheck, 
  Calendar as CalendarIcon, 
  Kanban, 
  FileText, 
  Sliders,
  LogOut
} from 'lucide-react';

const HeaderContainer = styled.header`
  height: 80px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  position: sticky;
  top: 0;
  z-index: 90;
  width: 100%;

  @media (max-width: 640px) {
    padding: 0 20px;
  }

  ${mobileGlassFix}
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MobileMenuBtn = styled.button`
  display: none;
  color: var(--text-white);
  padding: 6px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);

  @media (max-width: 640px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const PageTitle = styled.h2`
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--text-white);
  text-transform: capitalize;

  @media (max-width: 640px) {
    font-size: 1.15rem;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const DemoBadge = styled(motion.div)`
  background: rgba(139, 30, 47, 0.15);
  border: 1px solid rgba(139, 30, 47, 0.4);
  color: var(--text-wine);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 0 10px rgba(139, 30, 47, 0.15);

  svg {
    color: var(--wine-red-light);
  }

  @media (max-width: 768px) {
    span {
      display: none;
    }
    padding: 6px;
    border-radius: 50%;
  }
`;

const LiveBadge = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;

  span::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;
    margin-right: 6px;
    box-shadow: 0 0 8px #10b981;
  }

  @media (max-width: 768px) {
    span {
      display: none;
    }
    padding: 6px;
    border-radius: 50%;
  }
`;

const NotificationBtn = styled.button`
  position: relative;
  color: var(--text-gray);
  padding: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);

  &:hover {
    color: var(--text-white);
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  background: var(--wine-red-light);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--wine-red-light);
`;

// Mobile navigation drawer overlay
const MobileOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 999;
  display: flex;
  justify-content: flex-end;

  ${mobileGlassFix}
`;

const MobileDrawer = styled(motion.div)`
  width: 280px;
  height: 100%;
  background: #0a0a0c;
  border-left: 1px solid var(--border-glow);
  padding: 30px 24px;
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const DrawerTitle = styled.h3`
  font-family: var(--font-display);
  font-size: 1.2rem;
  background: linear-gradient(90deg, #f8fafc, var(--wine-red-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const DrawerList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
`;

const DrawerLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: var(--text-gray);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.02);

  &.active {
    background: rgba(139, 30, 47, 0.1);
    color: var(--text-white);
    border-color: rgba(139, 30, 47, 0.25);
  }
`;

const DrawerFooter = styled.div`
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
`;

const Header = () => {
  const location = useLocation();
  const { isDemoMode, profile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Derive clean page title from pathname
  const getPathTitle = () => {
    const path = location.pathname.substring(1);
    if (!path) return 'Dashboard';
    if (path === 'financeiro') return 'Painel Financeiro';
    if (path === 'funcionarios') return 'Gestão de Funcionários';
    if (path === 'administracao') return 'Administração Geral';
    return path;
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['developer', 'owner', 'employee', 'client'] },
    { path: '/clientes', label: 'Clientes', icon: Users, roles: ['developer', 'owner', 'employee'] },
    { path: '/financeiro', label: 'Financeiro', icon: DollarSign, roles: ['developer', 'owner'] },
    { path: '/agenda', label: 'Agenda', icon: CalendarIcon, roles: ['developer', 'owner', 'employee'] },
    { path: '/tarefas', label: 'Tarefas', icon: Kanban, roles: ['developer', 'owner', 'employee'] },
    { path: '/documentos', label: 'Documentos', icon: FileText, roles: ['developer', 'owner', 'employee', 'client'] },
    { path: '/administracao', label: 'Administração', icon: Sliders, roles: ['developer', 'owner'] },
  ];

  const filteredItems = menuItems.filter(item => 
    profile && item.roles.includes(profile.role)
  );

  return (
    <>
      <HeaderContainer>
        <LeftSection>
          <MobileMenuBtn onClick={() => setMenuOpen(true)}>
            <Menu size={20} />
          </MobileMenuBtn>
          <PageTitle>{getPathTitle()}</PageTitle>
        </LeftSection>

        <RightSection>
          <NotificationBtn>
            <Bell size={18} />
            <NotificationBadge />
          </NotificationBtn>
        </RightSection>
      </HeaderContainer>

      <AnimatePresence>
        {menuOpen && (
          <MobileOverlay
            {...overlayFade()}
            onClick={() => setMenuOpen(false)}
          >
            <MobileDrawer
              {...drawerSlide(280)}
              onClick={(e) => e.stopPropagation()}
            >
              <DrawerHeader>
                <DrawerTitle>Aetheris SaaS</DrawerTitle>
                <button onClick={() => setMenuOpen(false)} style={{ color: '#64748b' }}>
                  <X size={20} />
                </button>
              </DrawerHeader>

              <DrawerList>
                {filteredItems.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || 
                                   (item.path !== '/' && location.pathname.startsWith(item.path));
                  return (
                    <DrawerLink
                      key={item.path}
                      to={item.path}
                      className={isActive ? 'active' : ''}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </DrawerLink>
                  );
                })}
              </DrawerList>

              <DrawerFooter>
                <button 
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    color: '#ef4444',
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    background: 'rgba(239, 68, 68, 0.05)'
                  }}
                >
                  <LogOut size={16} />
                  <span>Sair do Sistema</span>
                </button>
              </DrawerFooter>
            </MobileDrawer>
          </MobileOverlay>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
