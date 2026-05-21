import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { cardEnter } from '../utils/motion';
import { mobileGlassFix, mobileSolidPanel } from '../styles/glass';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  Users, 
  Trash2, 
  Plus, 
  UserCheck, 
  Calendar as CalendarIcon, 
  DollarSign, 
  ShieldAlert,
  X,
  Shield,
  Briefcase
} from 'lucide-react';

const HRGrid = styled.div`
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const FormPanel = styled.div`
  background: rgba(18, 18, 22, 0.45);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 24px;
  height: fit-content;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

  ${mobileGlassFix}
  ${mobileSolidPanel}
`;

const ListPanel = styled.div`
  background: rgba(18, 18, 22, 0.45);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

  ${mobileGlassFix}
  ${mobileSolidPanel}
`;

const HeaderStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  grid-column: 1 / -1;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: rgba(28, 28, 35, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
`;

const FormTitle = styled.h3`
  font-family: var(--font-display);
  font-size: 1.1rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;

  label {
    font-size: 0.75rem;
    color: var(--text-gray);
    text-transform: uppercase;
    font-weight: 600;
  }

  input, select {
    background: rgba(14, 14, 18, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 10px 14px;
    color: var(--text-white);
  }
`;

const SubmitBtn = styled.button`
  background: var(--wine-red);
  color: var(--text-white);
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  font-family: var(--font-display);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid rgba(255,255,255,0.05);
  margin-top: 10px;

  &:hover {
    background: var(--wine-red-light);
    box-shadow: 0 0 15px var(--wine-glow-strong);
  }
`;

const EmployeeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const EmployeeCard = styled(motion.div)`
  background: rgba(28, 28, 35, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);

  &:hover {
    border-color: rgba(139, 30, 47, 0.25);
    box-shadow: 0 0 20px rgba(139, 30, 47, 0.08);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--wine-red) 0%, #1e293b 100%);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--text-white);
  font-size: 1rem;
`;

const Badge = styled.span`
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

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-gray-light);
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  padding-top: 12px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-gray-light);

  svg {
    color: var(--text-muted);
  }
`;

const DeleteBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  color: var(--text-muted);
  padding: 4px;
  border-radius: 4px;

  &:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.05);
  }
`;

const FormatBRL = (val) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

import ConfirmModal from '../components/ConfirmModal';

const Employees = () => {
  const { registerUser, profile } = useAuth();
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    role: 'employee',
    salary: '',
    position: 'Analista Contábil',
    admissionDate: new Date().toISOString().split('T')[0]
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await dbService.employees.getAll();
      setEmployees(data);
    } catch (err) {
      toast.error('Erro ao buscar folha de colaboradores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.username.trim() || !formData.password.trim() || !formData.salary) {
      toast.error('Preencha todos os campos do formulário.');
      return;
    }

    try {
      // 1. Create System Account (Creates Profile & local auth details)
      const data = await registerUser(
        formData.username, 
        formData.password, 
        formData.fullName, 
        formData.role
      );

      // 2. Fetch updated database to include extra employee information (handled by Postgres trigger on full mode, or dbService on demo)
      await fetchEmployees();
      
      // Update employee record if extra info (salary, position, date) needs syncing (specifically in Supabase full mode)
      if (dbService.isSupabaseActive()) {
        const matchingEmp = employees.find(e => e.username === formData.username);
        if (matchingEmp) {
          await dbService.employees.update(matchingEmp.id, {
            salary: Number(formData.salary),
            position: formData.position,
            admission_date: formData.admissionDate
          }, profile);
          await fetchEmployees();
        }
      }

      setFormData({
        fullName: '',
        username: '',
        password: '',
        role: 'employee',
        salary: '',
        position: 'Analista Contábil',
        admissionDate: new Date().toISOString().split('T')[0]
      });
      
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id, name) => {
    setConfirmState({
      isOpen: true,
      title: 'Excluir Colaborador',
      message: `Apagar colaborador "${name}" permanentemente? Isso irá apagar também o login de sistema deste usuário.`,
      onConfirm: async () => {
        try {
          await dbService.employees.delete(id, name, profile);
          setEmployees(prev => prev.filter(e => e.id !== id));
          toast.success('Colaborador removido com sucesso.');
        } catch (err) {
          toast.error('Erro ao remover colaborador.');
        } finally {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const getInitials = (name) => {
    if (!name) return 'SA';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const avgSalary = employees.reduce((acc, curr) => acc + Number(curr.salary || 0), 0) / (employees.length || 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* HR Stats */}
      <HeaderStats>
        <StatCard>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Colaboradores Ativos</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-white)', fontFamily: 'var(--font-display)' }}>{employees.length}</span>
          </div>
          <Users size={24} style={{ color: 'var(--wine-red-light)' }} />
        </StatCard>
        <StatCard>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Média Salarial</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-white)', fontFamily: 'var(--font-display)' }}>{FormatBRL(avgSalary)}</span>
          </div>
          <DollarSign size={24} style={{ color: '#10b981' }} />
        </StatCard>
        <StatCard>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Carga Operacional</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-white)', fontFamily: 'var(--font-display)' }}>Total Sincronizado</span>
          </div>
          <UserCheck size={24} style={{ color: '#3b82f6' }} />
        </StatCard>
      </HeaderStats>

      <HRGrid>
        {/* Left Column - Form */}
        <FormPanel>
          <FormTitle>
            <Plus size={18} style={{ color: 'var(--wine-red-light)' }} />
            Cadastrar Colaborador
          </FormTitle>

          <form onSubmit={handleSubmit}>
            <FormGroup>
              <label>Nome Completo</label>
              <input 
                type="text" 
                required 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="Ex: Rafael Silva"
              />
            </FormGroup>

            <FormGroup>
              <label>Usuário de Login (Sem Email)</label>
              <input 
                type="text" 
                required 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="Ex: rafael.silva"
              />
            </FormGroup>

            <FormGroup>
              <label>Senha de Login</label>
              <input 
                type="password" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Mínimo 6 caracteres"
              />
            </FormGroup>

            <FormGroup>
              <label>Nível de Acesso (Permissões)</label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="employee">Funcionário (Básico)</option>
                <option value="manager">Gerente (Médio)</option>
                <option value="admin">Administrador (Total)</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>Cargo / Função</label>
              <input 
                type="text" 
                required 
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                placeholder="Ex: Analista Contábil"
              />
            </FormGroup>

            <FormGroup>
              <label>Salário Inicial (R$)</label>
              <input 
                type="number" 
                required 
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                placeholder="0,00"
              />
            </FormGroup>

            <FormGroup>
              <label>Data de Admissão</label>
              <input 
                type="date" 
                required 
                value={formData.admissionDate}
                onChange={(e) => setFormData({...formData, admissionDate: e.target.value})}
              />
            </FormGroup>

            <SubmitBtn type="submit">
              <UserCheck size={16} />
              Confirmar Contratação
            </SubmitBtn>
          </form>
        </FormPanel>

        {/* Right Column - Cards List */}
        <ListPanel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Fichas de Colaboradores</h3>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Buscando equipe...</div>
          ) : employees.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Sem colaboradores na equipe.</div>
          ) : (
            <EmployeeGrid>
              {employees.map(emp => (
                <EmployeeCard
                  key={emp.id}
                  {...cardEnter()}
                >
                  <CardHeader>
                    <Avatar>{getInitials(emp.full_name)}</Avatar>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={emp.full_name}>
                        {emp.full_name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>@{emp.username}</span>
                    </div>
                  </CardHeader>

                  <CardBody>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Badge $role={emp.role}>
                        {emp.role === 'developer' ? 'Dev' :
                         emp.role === 'admin' ? 'Admin' :
                         emp.role === 'owner' ? 'Proprietário' :
                         emp.role === 'employee' ? 'Colaborador' :
                         emp.role === 'client' ? 'Cliente' :
                         emp.role === 'manager' ? 'Gerente' : emp.role}
                      </Badge>
                      <span style={{ fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.02)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-muted)' }}>Ativo</span>
                    </div>
                    
                    <InfoRow style={{ marginTop: 8 }}>
                      <Briefcase size={14} />
                      <span>{emp.position || 'Função indefinida'}</span>
                    </InfoRow>

                    <InfoRow>
                      <DollarSign size={14} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{FormatBRL(emp.salary || 0)} / mês</span>
                    </InfoRow>

                    <InfoRow>
                      <CalendarIcon size={14} />
                      <span>Admitido em {emp.admission_date}</span>
                    </InfoRow>
                  </CardBody>

                  <DeleteBtn onClick={() => handleDelete(emp.id, emp.full_name)}>
                    <Trash2 size={14} />
                  </DeleteBtn>
                </EmployeeCard>
              ))}
            </EmployeeGrid>
          )}
        </ListPanel>
      </HRGrid>

      <ConfirmModal 
        {...confirmState} 
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))} 
      />
    </div>
  );
};

export default Employees;
