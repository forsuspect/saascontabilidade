import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  UserCheck,
  FileText
} from 'lucide-react';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 30px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const KPIBlock = styled(motion.div)`
  background: rgba(18, 18, 22, 0.45);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: ${props => props.$color || 'var(--wine-red)'};
  }
`;

const KPIHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: var(--text-gray);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
`;

const KPIValue = styled.div`
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-white);
  margin-bottom: 6px;
`;

const KPIDesc = styled.div`
  font-size: 0.8rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.$bg || 'rgba(139, 30, 47, 0.1)'};
  color: ${props => props.$color || 'var(--wine-red-light)'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MainContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  background: rgba(18, 18, 22, 0.45);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PanelTitle = styled.h3`
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-white);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChartContainer = styled.div`
  height: 300px;
  width: 100%;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-top: 20px;
`;

const LogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
`;

const LogItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  font-size: 0.8rem;
`;

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.75rem;
`;

const LogDetails = styled.div`
  color: var(--text-gray-light);
`;

const SkeletonKPI = styled.div`
  height: 120px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.03) 25%, rgba(255, 255, 255, 0.06) 50%, rgba(255, 255, 255, 0.03) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 16px;

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const FormatBRL = (val) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

const Dashboard = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    clientsCount: 0,
    balance: 0,
    income: 0,
    expense: 0,
    tasksPending: 0,
    eventsCount: 0,
    financialHistory: [],
    recentLogs: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all resources concurrently
        const clients = await dbService.clients.getAll(profile);
        const financials = await dbService.financial.getAll(profile);
        const tasks = await dbService.tasks.getAll(profile);
        const events = await dbService.events.getAll(profile);
        
        let logs = [];
        if (['admin', 'developer', 'owner'].includes(profile?.role)) {
          logs = await dbService.admin.getLogs();
        }

        // Calculations
        const activeClients = clients.filter(c => c.status === 'active').length;
        
        const income = financials.filter(f => f.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const expense = financials.filter(f => f.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const balance = income - expense;

        const pendingTasks = tasks.filter(t => t.status !== 'done').length;
        const upcomingEvents = events.filter(e => new Date(e.start_time) >= new Date()).length;

        // Group financials by month or simple history
        const financialHistory = [...financials].reverse().slice(0, 7); // latest 7 entries for chart

        setStats({
          clientsCount: activeClients,
          balance,
          income,
          expense,
          tasksPending: pendingTasks,
          eventsCount: upcomingEvents,
          financialHistory,
          recentLogs: logs.slice(0, 6)
        });
      } catch (err) {
        console.error("Erro ao coletar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <DashboardGrid>
          <SkeletonKPI />
          <SkeletonKPI />
          <SkeletonKPI />
          <SkeletonKPI />
        </DashboardGrid>
        <MainContentGrid>
          <SkeletonKPI style={{ height: 350 }} />
          <SkeletonKPI style={{ height: 350 }} />
        </MainContentGrid>
      </div>
    );
  }

  // Draw custom SVG chart lines
  const maxVal = Math.max(...stats.financialHistory.map(f => Number(f.amount)), 5000);
  const chartPoints = stats.financialHistory.map((item, idx) => {
    const x = (idx / (stats.financialHistory.length - 1)) * 100;
    const y = 100 - (Number(item.amount) / maxVal) * 80; // 80% height padding
    return { x, y, ...item };
  });

  const pathDefinition = chartPoints.reduce((acc, point, idx) => {
    return idx === 0 ? `M 10,${point.y}%` : `${acc} L ${(idx * 15 + 10)}%,${point.y}%`;
  }, '');

  if (profile?.role === 'client') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
      >
        {/* Welcome Area */}
        <Panel style={{ background: 'linear-gradient(135deg, rgba(139, 30, 47, 0.08) 0%, rgba(18, 18, 22, 0.45) 100%)', border: '1px solid rgba(139, 30, 47, 0.2)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-white)', marginBottom: 8 }}>Olá, {profile.full_name}!</h2>
          <p style={{ color: 'var(--text-gray-light)', fontSize: '0.95rem' }}>Bem-vindo ao seu portal de contabilidade Aetheris. Aqui você pode visualizar seus documentos compartilhados e gerenciar compromissos.</p>
        </Panel>

        <DashboardGrid>
          <KPIBlock $color="var(--wine-red-light)" whileHover={{ y: -3 }}>
            <KPIHeader>
              <span>Meus Documentos</span>
              <IconWrapper>
                <FileText size={18} />
              </IconWrapper>
            </KPIHeader>
            <KPIValue>{stats.eventsCount + 2 /* mock docs count */}</KPIValue>
            <KPIDesc>Arquivos disponíveis para download</KPIDesc>
          </KPIBlock>

          <KPIBlock $color="#3b82f6" whileHover={{ y: -3 }}>
            <KPIHeader>
              <span>Agenda / Reuniões</span>
              <IconWrapper $bg="rgba(59, 130, 246, 0.1)" $color="#3b82f6">
                <CalendarIcon size={18} />
              </IconWrapper>
            </KPIHeader>
            <KPIValue>{stats.eventsCount}</KPIValue>
            <KPIDesc>Compromissos agendados com a assessoria</KPIDesc>
          </KPIBlock>
        </DashboardGrid>

        <MainContentGrid style={{ gridTemplateColumns: '1fr' }}>
          <Panel>
            <PanelTitle style={{ marginBottom: 16 }}>Área do Cliente Aetheris</PanelTitle>
            <p style={{ color: 'var(--text-gray-light)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Para enviar novos arquivos, impostos, guias de recolhimento ou agendar uma reunião extraordinária, utilize o menu de navegação lateral para acessar **Documentos** ou **Agenda**.
            </p>
          </Panel>
        </MainContentGrid>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <DashboardGrid>
        <KPIBlock 
          $color="var(--wine-red-light)"
          whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(139, 30, 47, 0.15)' }}
        >
          <KPIHeader>
            <span>Clientes Ativos</span>
            <IconWrapper $bg="rgba(139, 30, 47, 0.1)" $color="var(--wine-red-light)">
              <Users size={18} />
            </IconWrapper>
          </KPIHeader>
          <KPIValue>{stats.clientsCount}</KPIValue>
          <KPIDesc>Base de dados sincronizada</KPIDesc>
        </KPIBlock>

        <KPIBlock 
          $color="#10b981"
          whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(16, 185, 129, 0.15)' }}
        >
          <KPIHeader>
            <span>Faturamento Bruto</span>
            <IconWrapper $bg="rgba(16, 185, 129, 0.1)" $color="#10b981">
              <TrendingUp size={18} />
            </IconWrapper>
          </KPIHeader>
          <KPIValue>{FormatBRL(stats.income)}</KPIValue>
          <KPIDesc style={{ color: '#10b981' }}>
            <ArrowUpRight size={14} /> Entrada acumulada
          </KPIDesc>
        </KPIBlock>

        <KPIBlock 
          $color="#ef4444"
          whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(239, 68, 68, 0.15)' }}
        >
          <KPIHeader>
            <span>Despesas Operacionais</span>
            <IconWrapper $bg="rgba(239, 68, 68, 0.1)" $color="#ef4444">
              <TrendingDown size={18} />
            </IconWrapper>
          </KPIHeader>
          <KPIValue>{FormatBRL(stats.expense)}</KPIValue>
          <KPIDesc style={{ color: '#ef4444' }}>
            <ArrowDownRight size={14} /> Saídas e tributos
          </KPIDesc>
        </KPIBlock>

        <KPIBlock 
          $color="#3b82f6"
          whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(59, 130, 246, 0.15)' }}
        >
          <KPIHeader>
            <span>Saldo em Caixa</span>
            <IconWrapper $bg="rgba(59, 130, 246, 0.1)" $color="#3b82f6">
              <DollarSign size={18} />
            </IconWrapper>
          </KPIHeader>
          <KPIValue style={{ color: stats.balance >= 0 ? '#f8fafc' : '#ef4444' }}>
            {FormatBRL(stats.balance)}
          </KPIValue>
          <KPIDesc>Disponibilidade imediata</KPIDesc>
        </KPIBlock>
      </DashboardGrid>

      <MainContentGrid>
        <Panel>
          <PanelHeader>
            <PanelTitle>
              <Activity size={18} style={{ color: 'var(--wine-red-light)' }} />
              Fluxo Histórico Quântico (Transações Recentes)
            </PanelTitle>
          </PanelHeader>
          
          {stats.financialHistory.length === 0 ? (
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justify: 'center', color: 'var(--text-muted)' }}>
              Sem transações financeiras registradas.
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Visual SVG holographic lines chart */}
              <svg width="100%" height="240" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--wine-red-light)" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="var(--wine-red-light)" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                
                {/* Horizontal grid lines */}
                {[0, 25, 50, 75, 100].map((yVal, i) => (
                  <line 
                    key={i} 
                    x1="0" 
                    y1={`${yVal}%`} 
                    x2="100%" 
                    y2={`${yVal}%`} 
                    stroke="rgba(255, 255, 255, 0.03)" 
                    strokeWidth="1" 
                  />
                ))}

                {/* Draw points & connecting line */}
                <path
                  d={pathDefinition}
                  fill="none"
                  stroke="var(--wine-red-light)"
                  strokeWidth="3"
                  filter="drop-shadow(0px 0px 8px var(--wine-red-light))"
                />

                {/* Fill Area */}
                {chartPoints.length > 0 && (
                  <path
                    d={`${pathDefinition} L ${(chartPoints.length - 1) * 15 + 10}%,100% L 10%,100% Z`}
                    fill="url(#chartGlow)"
                  />
                )}

                {/* Data point glow circles */}
                {chartPoints.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={`${idx * 15 + 10}%`}
                    cy={`${pt.y}%`}
                    r="5"
                    fill={pt.type === 'income' ? '#10b981' : '#ef4444'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
              
              {/* Chart labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 10px 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {stats.financialHistory.map((pt, i) => (
                  <div key={i} style={{ width: '12%', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={pt.description}>
                    {pt.description.substring(0, 10)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>

        <Panel style={{ display: 'flex', flexDirection: 'column' }}>
          <PanelHeader>
            <PanelTitle>
              <CheckSquare size={18} style={{ color: 'var(--wine-red-light)' }} />
              Status de Operações
            </PanelTitle>
          </PanelHeader>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flexGrow: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
                <span>Tarefas Pendentes</span>
              </div>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{stats.tasksPending}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
                <span>Agenda / Compromissos</span>
              </div>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{stats.eventsCount}</span>
            </div>

            {['admin', 'developer', 'owner'].includes(profile?.role) && (
              <>
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: 16 }}>
                  <PanelTitle style={{ fontSize: '0.9rem', marginBottom: 12 }}>
                    <UserCheck size={14} /> Audit Log Recente
                  </PanelTitle>
                  <LogList>
                    {stats.recentLogs.length === 0 ? (
                      <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sem atividades registradas.</div>
                    ) : (
                      stats.recentLogs.map(log => (
                        <LogItem key={log.id}>
                          <LogHeader>
                            <span>{log.action}</span>
                            <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                          </LogHeader>
                          <LogDetails>{log.details}</LogDetails>
                        </LogItem>
                      ))
                    )}
                  </LogList>
                </div>
              </>
            )}
          </div>
        </Panel>
      </MainContentGrid>
    </motion.div>
  );
};

export default Dashboard;
