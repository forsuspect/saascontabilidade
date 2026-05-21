import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import styled from 'styled-components';
import { toastMotion } from '../utils/motion';
import { mobileGlassFix } from '../styles/glass';

const ToastContext = createContext(null);

const ToastContainer = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 99999;
  max-width: 380px;
  width: calc(100vw - 48px);
`;

const ToastCard = styled(motion.div)`
  background: rgba(10, 10, 12, 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid ${props => {
    if (props.$type === 'success') return 'rgba(16, 185, 129, 0.25)';
    if (props.$type === 'error') return 'rgba(239, 68, 68, 0.25)';
    if (props.$type === 'warning') return 'rgba(245, 158, 11, 0.25)';
    return 'rgba(59, 130, 246, 0.25)';
  }};
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.6), 
              0 0 15px -3px ${props => {
                if (props.$type === 'success') return 'rgba(16, 185, 129, 0.1)';
                if (props.$type === 'error') return 'rgba(239, 68, 68, 0.1)';
                if (props.$type === 'warning') return 'rgba(245, 158, 11, 0.1)';
                return 'rgba(59, 130, 246, 0.1)';
              }};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #f8fafc;
  overflow: hidden;
  position: relative;

  ${mobileGlassFix}
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${props => {
    if (props.$type === 'success') return '#10b981';
    if (props.$type === 'error') return '#ef4444';
    if (props.$type === 'warning') return '#f59e0b';
    return '#3b82f6';
  }};
`;

const Content = styled.div`
  flex-grow: 1;
`;

const Title = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 4px;
  letter-spacing: -0.01em;
`;

const Message = styled.p`
  font-size: 0.85rem;
  color: #cbd5e1;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 4px;
  
  &:hover {
    color: #f8fafc;
    background: rgba(255, 255, 255, 0.05);
  }
`;

const ProgressBar = styled(motion.div)`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: ${props => {
    if (props.$type === 'success') return 'linear-gradient(90deg, #10b981, #34d399)';
    if (props.$type === 'error') return 'linear-gradient(90deg, #ef4444, #f87171)';
    if (props.$type === 'warning') return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    return 'linear-gradient(90deg, #3b82f6, #60a5fa)';
  }};
  width: 100%;
`;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message, duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message, title = 'Sucesso') => addToast('success', title, message), [addToast]);
  const error = useCallback((message, title = 'Erro') => addToast('error', title, message), [addToast]);
  const warning = useCallback((message, title = 'Aviso') => addToast('warning', title, message), [addToast]);
  const info = useCallback((message, title = 'Informação') => addToast('info', title, message), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <ToastContainer>
        <AnimatePresence>
          {toasts.map(toast => {
            const Icon = toast.type === 'success' ? CheckCircle2 
                        : toast.type === 'error' ? XCircle 
                        : toast.type === 'warning' ? AlertTriangle 
                        : Info;

            return (
              <ToastCard
                key={toast.id}
                $type={toast.type}
                {...toastMotion()}
              >
                <IconWrapper $type={toast.type}>
                  <Icon size={18} />
                </IconWrapper>
                <Content>
                  <Title>{toast.title}</Title>
                  <Message>{toast.message}</Message>
                </Content>
                <CloseButton onClick={() => removeToast(toast.id)}>
                  <X size={14} />
                </CloseButton>
                <ProgressBar
                  $type={toast.type}
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                  style={{ originX: 0 }}
                />
              </ToastCard>
            );
          })}
        </AnimatePresence>
      </ToastContainer>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
