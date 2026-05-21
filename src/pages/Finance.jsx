import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { mobileGlassFix, mobileSolidPanel } from '../styles/glass';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Trash2, 
  FileDown, 
  Plus, 
  Calendar as CalendarIcon, 
  Tags,
  ShieldAlert
} from 'lucide-react';

const FinanceContainer = styled.div`
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

const KPIHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  grid-column: 1 / -1;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const KPIBox = styled.div`
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

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
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

const InputGroup = styled.div`
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

const TransactionsTableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  table {
    min-width: 600px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;

  th {
    padding: 12px 16px;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }

  td {
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.02);
  }

  tr:hover {
    background: rgba(255, 255, 255, 0.01);
  }
`;

const TypeIndicator = styled.span`
  color: ${props => props.$type === 'income' ? '#10b981' : '#ef4444'};
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const FormatBRL = (val) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

import ConfirmModal from '../components/ConfirmModal';

const Finance = () => {
  const { profile } = useAuth();
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'income',
    category: 'Honorários',
    date: new Date().toISOString().split('T')[0]
  });

  const canDelete = profile && profile.role === 'admin';

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await dbService.financial.getAll(profile);
      setTransactions(data);
    } catch (err) {
      toast.error('Erro ao buscar transações financeiras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.amount || Number(formData.amount) <= 0) {
      toast.error('Preencha as informações da transação corretamente.');
      return;
    }

    try {
      const created = await dbService.financial.create({
        description: formData.description,
        amount: Number(formData.amount),
        type: formData.type,
        category: formData.category,
        date: formData.date
      }, profile);
      
      setTransactions(prev => [created, ...prev]);
      setFormData({
        description: '',
        amount: '',
        type: 'income',
        category: 'Honorários',
        date: new Date().toISOString().split('T')[0]
      });
      toast.success('Transação lançada com sucesso.');
    } catch (err) {
      toast.error('Erro ao registrar transação financeira.');
    }
  };

  const handleDelete = (id, desc, amount) => {
    setConfirmState({
      isOpen: true,
      title: 'Excluir Lançamento',
      message: `Excluir permanentemente o lançamento "${desc}" no valor de ${FormatBRL(amount)}?`,
      onConfirm: async () => {
        try {
          await dbService.financial.delete(id, desc, amount, profile);
          setTransactions(prev => prev.filter(t => t.id !== id));
          toast.success('Transação excluída.');
        } catch (err) {
          toast.error('Erro ao excluir transação.');
        } finally {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleExport = () => {
    // Generate simple CSV report
    const headers = ['Descrição,Valor,Tipo,Categoria,Data\n'];
    const rows = transactions.map(t => 
      `"${t.description}",${t.amount},"${t.type === 'income' ? 'Entrada' : 'Saída'}","${t.category}",${t.date}\n`
    );
    
    const blob = new Blob([headers.concat(rows).join('')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Aetheris_Relatorio_Financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    toast.success('Relatório CSV exportado com sucesso.');
  };

  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const netFlow = income - expense;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Financial KPIs */}
      <KPIHeader>
        <KPIBox>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Faturamento (Entradas)</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-display)' }}>{FormatBRL(income)}</span>
          </div>
          <TrendingUp size={24} style={{ color: '#10b981' }} />
        </KPIBox>
        <KPIBox>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Despesas (Saídas)</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ef4444', fontFamily: 'var(--font-display)' }}>{FormatBRL(expense)}</span>
          </div>
          <TrendingDown size={24} style={{ color: '#ef4444' }} />
        </KPIBox>
        <KPIBox>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fluxo Caixa Líquido</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: netFlow >= 0 ? 'var(--text-white)' : '#ef4444', fontFamily: 'var(--font-display)' }}>{FormatBRL(netFlow)}</span>
          </div>
          <DollarSign size={24} style={{ color: netFlow >= 0 ? 'var(--wine-red-light)' : '#ef4444' }} />
        </KPIBox>
      </KPIHeader>

      <FinanceContainer>
        {/* Left Column - Form */}
        <FormPanel>
          <FormTitle>
            <Plus size={18} style={{ color: 'var(--wine-red-light)' }} />
            Lançamento Financeiro
          </FormTitle>

          <form onSubmit={handleSubmit}>
            <InputGroup>
              <label>Descrição do Lançamento</label>
              <input 
                type="text" 
                required 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Ex: Mensalidade Cliente X"
              />
            </InputGroup>

            <InputGroup>
              <label>Valor (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                required 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0,00"
              />
            </InputGroup>

            <InputGroup>
              <label>Fluxo</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="income">Entrada / Receita</option>
                <option value="expense">Saída / Despesa</option>
              </select>
            </InputGroup>

            <InputGroup>
              <label>Categoria</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Serviços Contábeis">Serviços Contábeis</option>
                <option value="Consultoria">Consultoria</option>
                <option value="Infraestrutura/Software">Infraestrutura/Software</option>
                <option value="Escritório">Escritório</option>
                <option value="Salários/Encargos">Salários/Encargos</option>
                <option value="Tributos/Impostos">Tributos/Impostos</option>
                <option value="Outros">Outros</option>
              </select>
            </InputGroup>

            <InputGroup>
              <label>Data de Competência</label>
              <input 
                type="date" 
                required 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </InputGroup>

            <SubmitBtn type="submit">
              <DollarSign size={16} />
              Confirmar Lançamento
            </SubmitBtn>
          </form>
        </FormPanel>

        {/* Right Column - Table */}
        <ListPanel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Extrato Geral</h3>
            <button 
              onClick={handleExport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 6,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                color: 'var(--text-gray-light)',
                fontSize: '0.8rem'
              }}
            >
              <FileDown size={14} />
              Exportar CSV
            </button>
          </div>

          <TransactionsTableContainer>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Buscando fluxo de caixa...</div>
            ) : transactions.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum lançamento financeiro registrado.</div>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Fluxo</th>
                    <th>Valor</th>
                    {canDelete && <th>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{t.date}</td>
                      <td style={{ fontWeight: 500 }}>{t.description}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '4px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.04)' }}>
                          {t.category}
                        </span>
                      </td>
                      <td>
                        <TypeIndicator $type={t.type}>
                          {t.type === 'income' ? '+' : '-'}
                        </TypeIndicator>
                      </td>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: t.type === 'income' ? '#10b981' : '#f8fafc' }}>
                        {FormatBRL(t.amount)}
                      </td>
                      {canDelete && (
                        <td>
                          <button 
                            onClick={() => handleDelete(t.id, t.description, t.amount)} 
                            style={{ color: '#ef4444', padding: 4 }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </TransactionsTableContainer>
        </ListPanel>
      </FinanceContainer>

      <ConfirmModal 
        {...confirmState} 
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))} 
      />
    </div>
  );
};

export default Finance;
