import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { mobileGlassFix, mobileSolidPanel } from '../styles/glass';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Clock, 
  AlertCircle,
  Tag
} from 'lucide-react';

const CalendarWorkspace = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainPanel = styled.div`
  background: rgba(18, 18, 22, 0.45);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

  ${mobileGlassFix}
  ${mobileSolidPanel}
`;

const SidebarPanel = styled.div`
  background: rgba(18, 18, 22, 0.45);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 24px;
  height: fit-content;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 20px;

  ${mobileGlassFix}
  ${mobileSolidPanel}
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const MonthTitle = styled.h3`
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--text-white);
`;

const NavButton = styled.button`
  color: var(--text-gray);
  padding: 6px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);

  &:hover {
    color: var(--text-white);
    background: rgba(255, 255, 255, 0.05);
  }
`;

const MonthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
`;

const DayLabel = styled.div`
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 8px 0;
`;

const DayCell = styled.button`
  aspect-ratio: 1;
  background: ${props => {
    if (props.$isSelected) return 'rgba(139, 30, 47, 0.2)';
    if (props.$isToday) return 'rgba(255, 255, 255, 0.04)';
    return 'rgba(255, 255, 255, 0.01)';
  }};
  border: 1px solid ${props => {
    if (props.$isSelected) return 'var(--wine-red-light)';
    if (props.$isToday) return 'rgba(255, 255, 255, 0.15)';
    return 'rgba(255, 255, 255, 0.02)';
  }};
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(139, 30, 47, 0.1);
    border-color: rgba(139, 30, 47, 0.4);
  }
`;

const DayNumber = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.$isCurrentMonth ? 'var(--text-white)' : 'var(--text-muted)'};
`;

const EventDotContainer = styled.div`
  display: flex;
  gap: 4px;
  justify-content: center;
  width: 100%;
`;

const EventDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${props => {
    if (props.$cat === 'meeting') return '#3b82f6';
    if (props.$cat === 'financial') return '#10b981';
    if (props.$cat === 'deadline') return '#ef4444';
    return '#f59e0b';
  }};
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
`;

const EventCard = styled.div`
  background: rgba(14, 14, 18, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-left: 3px solid ${props => {
    if (props.$cat === 'meeting') return '#3b82f6';
    if (props.$cat === 'financial') return '#10b981';
    if (props.$cat === 'deadline') return '#ef4444';
    return '#f59e0b';
  }};
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;

  label {
    font-size: 0.7rem;
    color: var(--text-gray);
    text-transform: uppercase;
    font-weight: 600;
  }

  input, select, textarea {
    background: rgba(14, 14, 18, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 10px;
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

import ConfirmModal from '../components/ConfirmModal';

const Calendar = () => {
  const { profile } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: 'meeting',
    startTime: '',
    endTime: ''
  });

  const fetchEvents = async () => {
    try {
      const data = await dbService.events.getAll(profile);
      setEvents(data);
    } catch (err) {
      toast.error('Erro ao coletar compromissos da agenda.');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.startTime || !newEvent.endTime) {
      toast.error('Preencha as informações do compromisso corretamente.');
      return;
    }

    try {
      const created = await dbService.events.create({
        title: newEvent.title,
        description: newEvent.description,
        category: newEvent.category,
        start_time: new Date(newEvent.startTime).toISOString(),
        end_time: new Date(newEvent.endTime).toISOString()
      }, profile);

      setEvents(prev => [...prev, created]);
      setNewEvent({ title: '', description: '', category: 'meeting', startTime: '', endTime: '' });
      toast.success('Compromisso agendado com sucesso.');
    } catch (err) {
      toast.error('Erro ao agendar compromisso.');
    }
  };

  const handleDeleteEvent = (id, title) => {
    setConfirmState({
      isOpen: true,
      title: 'Excluir Compromisso',
      message: `Remover "${title}" da agenda?`,
      onConfirm: async () => {
        try {
          await dbService.events.delete(id, title, profile);
          setEvents(prev => prev.filter(e => e.id !== id));
          toast.success('Compromisso removido.');
        } catch (err) {
          toast.error('Erro ao remover compromisso.');
        } finally {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Helper to generate calendar grids
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevTotalDays - i),
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Next month padding to fill grid to multiple of 7
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const getEventsForDate = (date) => {
    return events.filter(evt => {
      const evtDate = new Date(evt.start_time);
      return evtDate.getDate() === date.getDate() &&
             evtDate.getMonth() === date.getMonth() &&
             evtDate.getFullYear() === date.getFullYear();
    });
  };

  const daysLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthsLabels = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const calendarDays = getDaysInMonth();
  const selectedDayEvents = getEventsForDate(selectedDate);

  return (
    <CalendarWorkspace>
      <MainPanel>
        <CalendarHeader>
          <MonthTitle>{monthsLabels[currentDate.getMonth()]} {currentDate.getFullYear()}</MonthTitle>
          <div style={{ display: 'flex', gap: 8 }}>
            <NavButton onClick={handlePrevMonth}><ChevronLeft size={16} /></NavButton>
            <NavButton onClick={handleNextMonth}><ChevronRight size={16} /></NavButton>
          </div>
        </CalendarHeader>

        <MonthGrid>
          {daysLabels.map(label => (
            <DayLabel key={label}>{label}</DayLabel>
          ))}

          {calendarDays.map((day, idx) => {
            const isToday = new Date().toDateString() === day.date.toDateString();
            const isSelected = selectedDate.toDateString() === day.date.toDateString();
            const dayEvents = getEventsForDate(day.date);

            return (
              <DayCell 
                key={idx}
                $isToday={isToday}
                $isSelected={isSelected}
                onClick={() => setSelectedDate(day.date)}
              >
                <DayNumber $isCurrentMonth={day.isCurrentMonth}>{day.date.getDate()}</DayNumber>
                <EventDotContainer>
                  {dayEvents.slice(0, 3).map((e, i) => (
                    <EventDot key={i} $cat={e.category} />
                  ))}
                </EventDotContainer>
              </DayCell>
            );
          })}
        </MonthGrid>

        {/* Detailed List under Grid */}
        <div style={{ marginTop: 30, borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: 20 }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} style={{ color: 'var(--wine-red-light)' }} />
            Compromissos para o dia {selectedDate.toLocaleDateString('pt-BR')}
          </h4>

          <EventList>
            {selectedDayEvents.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhum compromisso agendado para esta data.</div>
            ) : (
              selectedDayEvents.map(evt => (
                <EventCard key={evt.id} $cat={evt.category}>
                  <div>
                    <h5 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-white)' }}>{evt.title}</h5>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{evt.description}</p>
                    <div style={{ display: 'flex', gap: 10, fontSize: '0.75rem', color: 'var(--text-wine)', fontFamily: 'var(--font-mono)', marginTop: 6 }}>
                      <span>Início: {new Date(evt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>Término: {new Date(evt.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteEvent(evt.id, evt.title)} style={{ color: '#ef4444', padding: 6 }}>
                    <Trash2 size={14} />
                  </button>
                </EventCard>
              ))
            )}
          </EventList>
        </div>
      </MainPanel>

      {/* Right Sidebar - Form */}
      <SidebarPanel>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} style={{ color: 'var(--wine-red-light)' }} />
          Novo Agendamento
        </h4>

        <form onSubmit={handleCreateEvent}>
          <InputGroup>
            <label>Título do Evento</label>
            <input 
              type="text" 
              required 
              value={newEvent.title}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              placeholder="Ex: Auditoria Trimestral"
            />
          </InputGroup>

          <InputGroup>
            <label>Descrição</label>
            <textarea 
              value={newEvent.description}
              onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              placeholder="Notas ou pauta da reunião..."
              rows={3}
            />
          </InputGroup>

          <InputGroup>
            <label>Categoria</label>
            <select 
              value={newEvent.category}
              onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
            >
              <option value="meeting">Reunião / Meeting</option>
              <option value="financial">Financeiro / Tributário</option>
              <option value="deadline">Prazo Fiscal / Vencimento</option>
              <option value="other">Outros Compromissos</option>
            </select>
          </InputGroup>

          <InputGroup>
            <label>Data & Hora Início</label>
            <input 
              type="datetime-local" 
              required 
              value={newEvent.startTime}
              onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
            />
          </InputGroup>

          <InputGroup>
            <label>Data & Hora Término</label>
            <input 
              type="datetime-local" 
              required 
              value={newEvent.endTime}
              onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
            />
          </InputGroup>

          <SubmitBtn type="submit">
            Agendar Compromisso
          </SubmitBtn>
        </form>
      </SidebarPanel>

      <ConfirmModal 
        {...confirmState} 
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))} 
      />
    </CalendarWorkspace>
  );
};

export default Calendar;
