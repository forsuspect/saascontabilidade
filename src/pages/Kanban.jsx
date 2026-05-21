import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft,
  X,
  User,
  CheckCircle2,
  FileText
} from 'lucide-react';

const KanbanBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  height: calc(100vh - 180px);
  overflow: hidden;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    height: auto;
    overflow-y: visible;
  }
`;

const Column = styled.div`
  background: rgba(18, 18, 22, 0.45);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 16px;

  @media (max-width: 1024px) {
    height: 400px;
  }
`;

const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
`;

const ColumnTitle = styled.h3`
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-white);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TaskCount = styled.span`
  background: rgba(255, 255, 255, 0.04);
  font-size: 0.75rem;
  font-family: var(--font-mono);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text-muted);
`;

const CardsContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 4px;
`;

const TaskCard = styled(motion.div)`
  background: rgba(28, 28, 35, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  position: relative;

  &:hover {
    border-color: rgba(139, 30, 47, 0.2);
  }
`;

const PriorityBadge = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
  background: ${props => {
    if (props.$priority === 'high') return 'rgba(239, 68, 68, 0.15)';
    if (props.$priority === 'medium') return 'rgba(245, 158, 11, 0.15)';
    return 'rgba(16, 185, 129, 0.15)';
  }};
  color: ${props => {
    if (props.$priority === 'high') return '#ef4444';
    if (props.$priority === 'medium') return '#f59e0b';
    return '#10b981';
  }};
`;

const CardTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-white);
  line-height: 1.4;
`;

const CardDesc = styled.p`
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.4;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  padding-top: 10px;
  margin-top: 4px;
`;

const NavigationGroup = styled.div`
  display: flex;
  gap: 6px;
`;

const QuickNavBtn = styled.button`
  color: var(--text-muted);
  padding: 4px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);

  &:hover {
    color: var(--text-white);
    background: rgba(139, 30, 47, 0.15);
    border-color: rgba(139, 30, 47, 0.3);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled(motion.div)`
  background: #0c0c10;
  border: 1px solid rgba(139, 30, 47, 0.3);
  border-radius: 16px;
  padding: 30px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
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

  input, select, textarea {
    background: rgba(14, 14, 18, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 10px 14px;
    color: var(--text-white);
  }
`;

const ActionBtn = styled.button`
  background: var(--wine-red);
  color: var(--text-white);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: var(--wine-red-light);
    box-shadow: 0 0 12px var(--wine-glow);
  }
`;

import ConfirmModal from '../components/ConfirmModal';

const Kanban = () => {
  const { profile } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    assignedTo: ''
  });

  const fetchTasksAndUsers = async () => {
    try {
      setLoading(true);
      const allTasks = await dbService.tasks.getAll(profile);
      const allUsers = await dbService.admin.getUsers();
      setTasks(allTasks);
      setUsers(allUsers);
    } catch (err) {
      toast.error('Erro ao coletar dados do quadro Kanban.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndUsers();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const created = await dbService.tasks.create({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: newTask.status,
        due_date: newTask.dueDate || null,
        assigned_to: newTask.assignedTo || null
      }, profile);

      setTasks(prev => [...prev, created]);
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', assignedTo: '' });
      toast.success('Tarefa adicionada com sucesso.');
    } catch (err) {
      toast.error('Erro ao criar tarefa.');
    }
  };

  const handleMoveStatus = async (id, title, currentStatus, direction) => {
    const statuses = ['todo', 'in_progress', 'review', 'done'];
    const currentIndex = statuses.indexOf(currentStatus);
    let nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= statuses.length) return;
    const nextStatus = statuses[nextIndex];

    try {
      const updated = await dbService.tasks.update(id, { status: nextStatus }, profile);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    } catch (err) {
      toast.error('Erro ao atualizar status da tarefa.');
    }
  };

  const handleDeleteTask = (id, title) => {
    setConfirmState({
      isOpen: true,
      title: 'Excluir Tarefa',
      message: `Apagar tarefa "${title}"?`,
      onConfirm: async () => {
        try {
          await dbService.tasks.delete(id, title, profile);
          setTasks(prev => prev.filter(t => t.id !== id));
          toast.success('Tarefa apagada com sucesso.');
        } catch (err) {
          toast.error('Erro ao deletar tarefa.');
        } finally {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const getUserName = (userId) => {
    const matched = users.find(u => u.id === userId);
    return matched ? matched.full_name : 'Não Atribuído';
  };

  const columns = [
    { id: 'todo', title: 'A Fazer', glow: 'rgba(255,255,255,0.02)' },
    { id: 'in_progress', title: 'Em Progresso', glow: 'rgba(59, 130, 246, 0.05)' },
    { id: 'review', title: 'Em Revisão', glow: 'rgba(245, 158, 11, 0.05)' },
    { id: 'done', title: 'Concluído', glow: 'rgba(16, 185, 129, 0.05)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
      {/* Top action block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)' }}>Central de distribuição de pendências contábeis e fiscais.</p>
        <ActionBtn onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Nova Tarefa
        </ActionBtn>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Sincronizando tarefas contábeis...</div>
      ) : (
        <KanbanBoard>
          {columns.map(col => {
            const columnTasks = tasks.filter(t => t.status === col.id);
            return (
              <Column key={col.id} style={{ background: `linear-gradient(180deg, ${col.glow} 0%, rgba(18, 18, 22, 0.45) 100%)` }}>
                <ColumnHeader>
                  <ColumnTitle>{col.title}</ColumnTitle>
                  <TaskCount>{columnTasks.length}</TaskCount>
                </ColumnHeader>

                <CardsContainer>
                  <AnimatePresence mode="popLayout">
                    {columnTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <PriorityBadge $priority={task.priority}>{task.priority}</PriorityBadge>
                          <button onClick={() => handleDeleteTask(task.id, task.title)} style={{ color: 'var(--text-muted)' }}>
                            <Trash2 size={12} />
                          </button>
                        </div>

                        <CardTitle>{task.title}</CardTitle>
                        {task.description && <CardDesc>{task.description}</CardDesc>}

                        {task.due_date && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-wine)' }}>
                            <CalendarIcon size={12} />
                            <span>Vence {task.due_date}</span>
                          </div>
                        )}

                        <CardFooter>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-gray)' }}>
                            <User size={12} />
                            <span>{getUserName(task.assigned_to)}</span>
                          </div>

                          <NavigationGroup>
                            {col.id !== 'todo' && (
                              <QuickNavBtn onClick={() => handleMoveStatus(task.id, task.title, task.status, -1)}>
                                <ArrowLeft size={12} />
                              </QuickNavBtn>
                            )}
                            {col.id !== 'done' && (
                              <QuickNavBtn onClick={() => handleMoveStatus(task.id, task.title, task.status, 1)}>
                                <ArrowRight size={12} />
                              </QuickNavBtn>
                            )}
                          </NavigationGroup>
                        </CardFooter>
                      </TaskCard>
                    ))}
                  </AnimatePresence>
                </CardsContainer>
              </Column>
            );
          })}
        </KanbanBoard>
      )}

      {/* New Task Modal */}
      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Nova Tarefa Operacional</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              <FormGroup>
                <label>Título da Tarefa</label>
                <input 
                  type="text" 
                  required 
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Ex: Emitir Notas Fiscais Acme"
                />
              </FormGroup>

              <FormGroup>
                <label>Detalhamento / Descrição</label>
                <textarea 
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Instruções para o executor..."
                  rows={3}
                />
              </FormGroup>

              <FormGroup>
                <label>Prioridade</label>
                <select 
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta (Urgente)</option>
                </select>
              </FormGroup>

              <FormGroup>
                <label>Responsável Atribuído</label>
                <select 
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                >
                  <option value="">Selecione um executor...</option>
                  {users
                    .filter(u => profile?.role === 'developer' ? true : u.role !== 'developer')
                    .map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} (@{u.username})</option>
                  ))}
                </select>
              </FormGroup>

              <FormGroup>
                <label>Prazo Limite</label>
                <input 
                  type="date" 
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </FormGroup>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}>Cancelar</button>
                <ActionBtn type="submit">Adicionar ao Quadro</ActionBtn>
              </div>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}

      <ConfirmModal 
        {...confirmState} 
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))} 
      />
    </div>
  );
};

export default Kanban;
