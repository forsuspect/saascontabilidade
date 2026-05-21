import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  Shield, 
  Terminal, 
  Users as UsersIcon, 
  Settings as SettingsIcon, 
  Trash2, 
  Search, 
  RefreshCw,
  Sliders,
  Database,
  Lock,
  UserPlus,
  Edit2
} from 'lucide-react';

const AdminWorkspace = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  width: 100%;
  min-width: 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const TabMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(18, 18, 22, 0.45);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  padding: 16px;
  height: fit-content;
  min-width: 0;
  width: 100%;

  @media (max-width: 768px) {
    padding: 12px;
  }

  ${mobileGlassFix}
  ${mobileSolidPanel}
`;

const TabBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: ${props => props.$active ? 'var(--text-white)' : 'var(--text-gray)'};
  background: ${props => props.$active ? 'rgba(139, 30, 47, 0.12)' : 'transparent'};
  border: 1px solid ${props => props.$active ? 'rgba(139, 30, 47, 0.25)' : 'transparent'};
  font-size: 0.9rem;
  font-weight: 500;
  text-align: left;
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-white);
    background: rgba(255, 255, 255, 0.02);
  }
`;

const ContentPanel = styled.div`
  background: rgba(18, 18, 22, 0.45);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  min-height: 480px;
  min-width: 0;
  width: 100%;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 12px;
  }

  ${mobileGlassFix}
  ${mobileSolidPanel}
`;

const ViewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  padding-bottom: 16px;
  gap: 16px;
  min-width: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 20px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-shrink: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
`;

const ViewTitle = styled.h3`
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-white);
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
    flex-wrap: wrap;
  }
`;

const LogTerminal = styled.div`
  background: #050507;
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 16px;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-gray-light);
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.8);
`;

const LogRow = styled.div`
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  padding-bottom: 8px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.02);
`;

const LogMeta = styled.span`
  color: var(--text-wine);
  margin-right: 10px;
`;

const ActionButton = styled.button`
  background: ${props => props.$danger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)'};
  color: ${props => props.$danger ? '#ef4444' : 'var(--text-gray-light)'};
  border: 1px solid ${props => props.$danger ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.05)'};
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: ${props => props.$danger ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)'};
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 12px 16px;
    font-size: 0.85rem;
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  
  input {
    width: 240px;
    max-width: 100%;
    background: rgba(10, 10, 12, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 8px 12px 8px 36px;
    border-radius: 6px;
    color: var(--text-white);
    font-size: 0.85rem;
    box-sizing: border-box;
  }

  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
  }

  @media (max-width: 768px) {
    width: 100%;

    input {
      width: 100%;
    }
  }
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const UserItem = styled.div`
  background: rgba(28, 28, 35, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  min-width: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const UserBadge = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid currentColor;
  
  background: ${props => {
    switch (props.$role) {
      case 'developer': return 'rgba(244, 63, 94, 0.12)';
      case 'admin': return 'rgba(239, 68, 68, 0.12)';
      case 'owner': return 'rgba(245, 158, 11, 0.12)';
      case 'employee': return 'rgba(59, 130, 246, 0.12)';
      case 'client': return 'rgba(16, 185, 129, 0.12)';
      case 'manager': return 'rgba(139, 92, 246, 0.12)';
      default: return 'rgba(255, 255, 255, 0.05)';
    }
  }};
  
  color: ${props => {
    switch (props.$role) {
      case 'developer': return '#f43f5e';
      case 'admin': return '#ef4444';
      case 'owner': return '#fbbf24';
      case 'employee': return '#3b82f6';
      case 'client': return '#10b981';
      case 'manager': return '#a78bfa';
      default: return 'var(--text-gray-light)';
    }
  }};
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255,255,255,0.03);
`;

const SettingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const RegisterForm = styled.form`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  min-width: 0;
  width: 100%;

  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 20px;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  min-width: 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  label {
    font-size: 0.75rem;
    color: var(--text-gray-light);
    text-transform: uppercase;
    font-weight: 600;
  }

  input, select {
    width: 100%;
    min-width: 0;
    background: rgba(14, 14, 18, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 10px 14px;
    color: var(--text-white);
    font-size: 0.85rem;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;

    &:focus {
      border-color: var(--wine-red-light);
    }
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    gap: 10px;
    margin-top: 4px;
  }
`;

const RegisterTitle = styled.h4`
  font-family: var(--font-display);
  color: var(--text-white);
  font-size: 0.95rem;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 4px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;

  ${mobileGlassFix}
`;

const ModalContent = styled.div`
  background: rgba(18, 18, 22, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-x: hidden;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 20px 16px;
    border-radius: 12px;
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.05);
    transition: .4s;
    border-radius: 20px;
  }

  span:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
    background-color: var(--text-gray-light);
    transition: .4s;
    border-radius: 50%;
  }

  input:checked + span {
    background-color: var(--wine-red);
    border-color: var(--wine-red-light);
  }

  input:checked + span:before {
    transform: translateX(22px);
    background-color: var(--text-white);
  }
`;

import ConfirmModal from '../components/ConfirmModal';
import { mobileGlassFix, mobileSolidPanel } from '../styles/glass';

const Admin = () => {
  const { profile } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('logs');
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // User creation states
  const [newFullname, setNewFullname] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('employee');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Settings mock toggles
  const [config, setConfig] = useState({
    mfaRequired: true,
    autoBackup: true,
    auditActive: true
  });

  // User editing states
  const [editingUser, setEditingUser] = useState(null);
  const [editFullname, setEditFullname] = useState('');
  const [editRole, setEditRole] = useState('employee');
  const [editPassword, setEditPassword] = useState('');

  const handleStartEdit = (usr) => {
    if (['developer', 'owner'].includes(usr.role) && profile?.role !== 'developer') {
      toast.error('Acesso negado. Apenas desenvolvedores podem alterar dados de contas nível Dev ou Proprietário.');
      return;
    }
    setEditingUser(usr);
    setEditFullname(usr.full_name);
    setEditRole(usr.role);
    setEditPassword('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFullname || !editRole) {
      toast.error('Preencha o nome e o cargo do usuário.');
      return;
    }
    if (['developer', 'owner'].includes(editRole) && profile?.role !== 'developer') {
      toast.error('Acesso negado. Apenas desenvolvedores podem atribuir cargos de nível Dev ou Proprietário.');
      return;
    }
    try {
      await dbService.admin.updateUser(editingUser.id, editFullname, editRole, editPassword || null, profile);
      toast.success('Usuário atualizado com sucesso.');
      setEditingUser(null);
      // Re-fetch users list
      const userData = await dbService.admin.getUsers();
      setUsers(userData);
    } catch (err) {
      toast.error(err.message || 'Erro ao editar usuário.');
    }
  };

  const handleDeleteUser = (id, username) => {
    const usrObj = users.find(u => u.id === id);
    if (usrObj && ['developer', 'owner'].includes(usrObj.role) && profile?.role !== 'developer') {
      toast.error('Operação recusada. Administradores não podem excluir acessos de nível Dev ou Proprietário.');
      return;
    }
    
    setConfirmState({
      isOpen: true,
      title: 'Excluir Acesso',
      message: `Tem certeza que deseja remover permanentemente o acesso do usuário @${username}?`,
      onConfirm: async () => {
        try {
          await dbService.admin.deleteUser(id, username, profile);
          toast.success(`Usuário @${username} removido.`);
          // Re-fetch users list
          const userData = await dbService.admin.getUsers();
          setUsers(userData);
        } catch (err) {
          toast.error('Erro ao remover usuário.');
        }
      }
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newFullname || !newUsername || !newPassword || !newRole) {
      toast.error('Preencha todos os campos para cadastrar o usuário.');
      return;
    }
    
    if (['developer', 'owner'].includes(newRole) && profile?.role !== 'developer') {
      toast.error('Apenas desenvolvedores podem criar novas contas nível Dev ou Proprietário.');
      return;
    }
    
    try {
      await dbService.auth.createUser(newUsername, newPassword, newFullname, newRole, profile);
      toast.success(`Usuário @${newUsername} cadastrado com sucesso.`);
      setNewFullname('');
      setNewUsername('');
      setNewPassword('');
      setNewRole('employee');
      setShowCreateForm(false);
      
      // Re-fetch users list
      const userData = await dbService.admin.getUsers();
      setUsers(userData);
    } catch (err) {
      toast.error(err.message || 'Erro ao cadastrar novo usuário.');
    }
  };

  const fetchLogsAndUsers = async () => {
    try {
      setLoading(true);
      if (activeTab === 'logs') {
        const logData = await dbService.admin.getLogs();
        setLogs(logData);
      } else if (activeTab === 'users') {
        const userData = await dbService.admin.getUsers();
        setUsers(userData);
      }
    } catch (err) {
      toast.error('Erro ao ler base administrativa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsAndUsers();
  }, [activeTab]);

  const handleClearLogs = () => {
    setConfirmState({
      isOpen: true,
      title: 'Limpar Logs de Auditoria',
      message: 'Tem certeza que deseja apagar permanentemente todos os logs de auditoria do sistema?',
      onConfirm: async () => {
        try {
          await dbService.admin.clearLogs(profile);
          setLogs([]);
          toast.success('Logs esvaziados com sucesso.');
        } catch (err) {
          toast.error('Erro ao esvaziar logs.');
        } finally {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredUsers = users.filter(usr => {
    if (profile?.role !== 'developer' && usr.role === 'developer') return false;
    
    return usr.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
           usr.full_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <AdminWorkspace>
      {/* Left Menu Tabs */}
      <TabMenu>
        <TabBtn $active={activeTab === 'logs'} onClick={() => { setActiveTab('logs'); setSearchTerm(''); }}>
          <Terminal size={16} />
          Logs de Auditoria
        </TabBtn>
        <TabBtn $active={activeTab === 'users'} onClick={() => { setActiveTab('users'); setSearchTerm(''); }}>
          <UsersIcon size={16} />
          Controle de Usuários
        </TabBtn>
        {profile?.role === 'developer' && (
          <TabBtn $active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setSearchTerm(''); }}>
            <SettingsIcon size={16} />
            Configurações
          </TabBtn>
        )}
      </TabMenu>

      {/* Right Tab Content */}
      <ContentPanel>
        {activeTab === 'logs' && (
          <>
            <ViewHeader>
              <ViewTitle>
                <Terminal size={18} style={{ color: 'var(--wine-red-light)' }} />
                Auditoria de Eventos do Sistema
              </ViewTitle>

              <HeaderActions>
                <SearchBox>
                  <Search size={14} />
                  <input 
                    type="text" 
                    placeholder="Filtrar logs..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchBox>
                <ActionButton onClick={fetchLogsAndUsers}>
                  <RefreshCw size={14} /> Atualizar
                </ActionButton>
                <ActionButton $danger onClick={handleClearLogs}>
                  <Trash2 size={14} /> Limpar Logs
                </ActionButton>
              </HeaderActions>
            </ViewHeader>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Varrendo banco de logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum log encontrado.</div>
            ) : (
              <LogTerminal>
                {filteredLogs.map(log => (
                  <LogRow key={log.id}>
                    <div>
                      <LogMeta>[{new Date(log.created_at).toLocaleString()}]</LogMeta>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>{log.action}</span>
                    </div>
                    <span style={{ color: 'var(--text-gray-light)', marginTop: 2 }}>{log.details}</span>
                  </LogRow>
                ))}
              </LogTerminal>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <>
            <ViewHeader>
              <ViewTitle>
                <UsersIcon size={18} style={{ color: 'var(--wine-red-light)' }} />
                Níveis de Acesso e Contas Ativas
              </ViewTitle>

              <HeaderActions>
                <SearchBox>
                  <Search size={14} />
                  <input 
                    type="text" 
                    placeholder="Pesquisar usuários..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchBox>
                <ActionButton onClick={() => setShowCreateForm(!showCreateForm)} style={{ background: showCreateForm ? 'rgba(255, 255, 255, 0.05)' : 'rgba(139, 30, 47, 0.15)', borderColor: 'rgba(139, 30, 47, 0.3)', color: 'var(--text-white)' }}>
                  <UserPlus size={14} /> {showCreateForm ? 'Fechar Formulário' : 'Novo Usuário'}
                </ActionButton>
              </HeaderActions>
            </ViewHeader>

            {showCreateForm && (
              <RegisterForm onSubmit={handleCreateUser}>
                <RegisterTitle>Cadastrar Novo Acesso</RegisterTitle>
                <FormRow>
                  <FormField>
                    <label>Nome Completo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Kauã Dev" 
                      value={newFullname} 
                      onChange={(e) => setNewFullname(e.target.value)} 
                      required 
                    />
                  </FormField>
                  <FormField>
                    <label>Nome de Usuário (Login)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: kauadev" 
                      value={newUsername} 
                      onChange={(e) => setNewUsername(e.target.value)} 
                      required 
                    />
                  </FormField>
                  <FormField>
                    <label>Senha de Acesso</label>
                    <input 
                      type="password" 
                      placeholder="Ex: dev@2024" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      required 
                    />
                  </FormField>
                  <FormField>
                    <label>Hierarquia</label>
                    <select 
                      value={newRole} 
                      onChange={(e) => setNewRole(e.target.value)}
                      required
                    >
                      {profile?.role === 'developer' && <option value="developer">Dev</option>}
                      <option value="owner">Proprietário</option>
                      <option value="employee">Colaborador</option>
                      <option value="client">Cliente</option>
                    </select>
                  </FormField>
                </FormRow>
                <FormActions>
                  <ActionButton type="button" onClick={() => setShowCreateForm(false)}>Cancelar</ActionButton>
                  <ActionButton type="submit" style={{ background: 'var(--wine-red-light)', color: 'var(--text-white)', borderColor: 'rgba(139,30,47,0.3)' }}>Salvar Usuário</ActionButton>
                </FormActions>
              </RegisterForm>
            )}

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Lendo lista de perfis...</div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum usuário cadastrado.</div>
            ) : (
              <UserList>
                {filteredUsers.map(usr => (
                  <UserItem key={usr.id}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-white)' }}>{usr.full_name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>@{usr.username}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <UserBadge $role={usr.role}>
                        {usr.role === 'developer' ? 'Dev' :
                         usr.role === 'owner' ? 'Proprietário' :
                         usr.role === 'employee' ? 'Colaborador' :
                         usr.role === 'client' ? 'Cliente' : usr.role}
                      </UserBadge>
                      <button 
                        onClick={() => handleStartEdit(usr)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-gray)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
                        title="Editar Usuário"
                      >
                        <Edit2 size={14} />
                      </button>
                      {profile?.username !== usr.username && (
                        <button 
                          onClick={() => handleDeleteUser(usr.id, usr.username)}
                          style={{ background: 'transparent', border: 'none', color: 'rgba(239, 68, 68, 0.6)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
                          title="Excluir Usuário"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </UserItem>
                ))}
              </UserList>
            )}
          </>
        )}

        {activeTab === 'settings' && (
          <>
            <ViewHeader>
              <ViewTitle>
                <Sliders size={18} style={{ color: 'var(--wine-red-light)' }} />
                Parâmetros Gerais do Sistema
              </ViewTitle>
            </ViewHeader>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SettingRow>
                <SettingInfo>
                  <span style={{ fontWeight: 600, color: 'var(--text-white)' }}>Controle RLS Ativo</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Obriga a aplicação das diretivas de segurança Row-Level Security no banco de dados.</span>
                </SettingInfo>
                <ToggleSwitch>
                  <input 
                    type="checkbox" 
                    checked={config.auditActive}
                    onChange={(e) => {
                      if (profile?.role !== 'developer') {
                        toast.error('Configuração restrita. Apenas desenvolvedores podem alterar o RLS do Core.');
                        return;
                      }
                      setConfig({...config, auditActive: e.target.checked});
                      toast.success(`Segurança RLS ${e.target.checked ? 'ativada' : 'desativada'}.`);
                    }}
                  />
                  <span></span>
                </ToggleSwitch>
              </SettingRow>

              <SettingRow>
                <SettingInfo>
                  <span style={{ fontWeight: 600, color: 'var(--text-white)' }}>Backup Diário Automático</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sincroniza cópias do PostgreSQL de forma automatizada no Cloud Storage.</span>
                </SettingInfo>
                <ToggleSwitch>
                  <input 
                    type="checkbox" 
                    checked={config.autoBackup}
                    onChange={(e) => {
                      if (profile?.role !== 'developer') {
                        toast.error('Configuração restrita. Apenas desenvolvedores podem alterar as rotinas de backup do Core.');
                        return;
                      }
                      setConfig({...config, autoBackup: e.target.checked});
                      toast.success(`Backups automáticos ${e.target.checked ? 'ativados' : 'desativados'}.`);
                    }}
                  />
                  <span></span>
                </ToggleSwitch>
              </SettingRow>

              <SettingRow>
                <SettingInfo>
                  <span style={{ fontWeight: 600, color: 'var(--text-white)' }}>Exigir Duplo Fator (MFA)</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Restringe logins fora da rede interna para usuários sem validação móvel.</span>
                </SettingInfo>
                <ToggleSwitch>
                  <input 
                    type="checkbox" 
                    checked={config.mfaRequired}
                    onChange={(e) => {
                      if (profile?.role !== 'developer') {
                        toast.error('Configuração restrita. Apenas desenvolvedores podem alterar políticas de MFA.');
                        return;
                      }
                      setConfig({...config, mfaRequired: e.target.checked});
                      toast.success(`MFA global ${e.target.checked ? 'ativado' : 'desativado'}.`);
                    }}
                  />
                  <span></span>
                </ToggleSwitch>
              </SettingRow>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 30, background: 'rgba(139,30,47,0.06)', border: '1px solid rgba(139,30,47,0.2)', padding: 16, borderRadius: 8, alignItems: 'center' }}>
                <Lock size={20} style={{ color: 'var(--wine-red-light)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-wine)' }}>Qualquer alteração nestes parâmetros gera uma entrada de auditoria automática em nosso Core (Apenas Desenvolvedores).</span>
              </div>
            </div>
          </>
        )}
      </ContentPanel>

      {editingUser && (
        <ModalOverlay onClick={() => setEditingUser(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-white)', fontSize: '1.2rem' }}>
                Editar Usuário @{editingUser.username}
              </h3>
              <button 
                onClick={() => setEditingUser(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-gray)', cursor: 'pointer', fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <FormField>
                <label>Nome Completo</label>
                <input 
                  type="text" 
                  value={editFullname} 
                  onChange={(e) => setEditFullname(e.target.value)} 
                  required 
                />
              </FormField>
              
              <FormField>
                <label>Hierarquia</label>
                <select 
                  value={editRole} 
                  onChange={(e) => setEditRole(e.target.value)}
                  required
                >
                  {profile?.role === 'developer' && <option value="developer">Dev</option>}
                  <option value="owner">Proprietário</option>
                  <option value="employee">Colaborador</option>
                  <option value="client">Cliente</option>
                </select>
              </FormField>
              
              <FormField>
                <label>Alterar Senha (Opcional)</label>
                <input 
                  type="password" 
                  placeholder="Deixe em branco para manter a atual" 
                  value={editPassword} 
                  onChange={(e) => setEditPassword(e.target.value)} 
                />
              </FormField>
              
              <FormActions style={{ marginTop: 10 }}>
                <ActionButton type="button" onClick={() => setEditingUser(null)}>Cancelar</ActionButton>
                <ActionButton type="submit" style={{ background: 'var(--wine-red-light)', color: 'var(--text-white)', borderColor: 'rgba(139,30,47,0.3)' }}>
                  Salvar Alterações
                </ActionButton>
              </FormActions>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}

      <ConfirmModal 
        {...confirmState} 
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))} 
      />
    </AdminWorkspace>
  );
};

export default Admin;
