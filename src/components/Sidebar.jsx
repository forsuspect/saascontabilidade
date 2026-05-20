import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  UserCheck, 
  Calendar, 
  Kanban, 
  FileText, 
  Sliders, 
  LogOut,
  Atom
} from 'lucide-react';

const SidebarContainer = styled(motion.aside)`
  width: 280px;
  height: 100vh;
  background: rgba(10, 10, 12, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-glow);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.5);

  @media (max-width: 1024px) {
    width: 80px;
  }

  @media (max-width: 640px) {
    display: none; // Hidden on mobile, mobile drawer will open
  }
`;

const LogoSection = styled.div`
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  background: linear-gradient(180deg, rgba(139, 30, 47, 0.08) 0%, transparent 100%);
`;

const LogoText = styled.h1`
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  background: linear-gradient(90deg, #f8fafc 0%, var(--wine-red-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const LogoIcon = styled(motion.div)`
  color: var(--wine-red-light);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavList = styled.nav`
  flex-grow: 1;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  
  /* Scrollbar override */
  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 8px;
  color: var(--text-gray);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(139, 30, 47, 0.15) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 0;
  }

  svg {
    position: relative;
    z-index: 1;
    transition: transform 0.3s ease, color 0.3s ease;
  }

  span {
    position: relative;
    z-index: 1;
  }

  &:hover {
    color: var(--text-white);
    background: rgba(255, 255, 255, 0.02);
    
    svg {
      transform: scale(1.1);
      color: var(--wine-red-light);
    }
  }

  &.active {
    color: var(--text-white);
    background: rgba(139, 30, 47, 0.1);
    border: 1px solid rgba(139, 30, 47, 0.25);
    box-shadow: 0 0 15px -3px rgba(139, 30, 47, 0.15);

    &::before {
      opacity: 1;
    }

    svg {
      color: var(--wine-red-light);
      filter: drop-shadow(0 0 5px rgba(180, 43, 64, 0.5));
    }
  }

  @media (max-width: 1024px) {
    justify-content: center;
    padding: 14px;
    span {
      display: none;
    }
  }
`;

const ProfileSection = styled.div`
  padding: 20px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  background: rgba(14, 14, 18, 0.4);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 1024px) {
    justify-content: center;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--wine-red) 0%, #1e293b 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-white);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
`;

const UserText = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-white);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.span`
  font-size: 0.75rem;
  color: var(--text-wine);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  width: 100%;
  border-radius: 6px;
  color: var(--text-gray);
  font-size: 0.85rem;
  font-weight: 500;
  
  &:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.05);
    
    svg {
      transform: translateX(2px);
    }
  }

  @media (max-width: 1024px) {
    justify-content: center;
    span {
      display: none;
    }
  }
`;

const Sidebar = () => {
  const { profile, logout } = useAuth();
  
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['developer', 'owner', 'employee', 'client'] },
    { path: '/clientes', label: 'Clientes', icon: Users, roles: ['developer', 'owner', 'employee'] },
    { path: '/financeiro', label: 'Financeiro', icon: DollarSign, roles: ['developer', 'owner'] },
    { path: '/agenda', label: 'Agenda', icon: Calendar, roles: ['developer', 'owner', 'employee'] },
    { path: '/tarefas', label: 'Tarefas', icon: Kanban, roles: ['developer', 'owner', 'employee'] },
    { path: '/documentos', label: 'Documentos', icon: FileText, roles: ['developer', 'owner', 'employee', 'client'] },
    { path: '/administracao', label: 'Administração', icon: Sliders, roles: ['developer', 'owner'] },
  ];

  const filteredItems = menuItems.filter(item => 
    profile && item.roles.includes(profile.role)
  );

  const getInitials = (name) => {
    if (!name) return 'SA';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <SidebarContainer
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <LogoSection>
        <LogoIcon
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        >
          <Atom size={24} />
        </LogoIcon>
        <LogoText>AETHERIS</LogoText>
      </LogoSection>

      <NavList>
        {filteredItems.map(item => {
          const IconComponent = item.icon;
          return (
            <StyledNavLink key={item.path} to={item.path} end={item.path === '/'}>
              <IconComponent size={20} />
              <span>{item.label}</span>
            </StyledNavLink>
          );
        })}
      </NavList>

      {profile && (
        <ProfileSection>
          <UserInfo>
            <Avatar>{getInitials(profile.full_name)}</Avatar>
            <UserText>
              <UserName>{profile.full_name}</UserName>
              <UserRole>
                {profile.role === 'developer' ? 'Desenvolvedor' : 
                 profile.role === 'owner' ? 'Proprietário' : 
                 profile.role === 'client' ? 'Cliente' : 
                 profile.role === 'employee' ? 'Colaborador' : 
                 profile.role === 'admin' ? 'Administrador' : 'Gerente'}
              </UserRole>
            </UserText>
          </UserInfo>
          <LogoutButton onClick={logout}>
            <LogOut size={16} />
            <span>Encerrar Sessão</span>
          </LogoutButton>
        </ProfileSection>
      )}
    </SidebarContainer>
  );
};

export default Sidebar;
