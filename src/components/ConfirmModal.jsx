import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalBox = styled(motion.div)`
  width: 100%;
  max-width: 420px;
  background: rgba(12, 12, 16, 0.95);
  border: 1px solid rgba(139, 30, 47, 0.4);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8),
              0 0 30px rgba(139, 30, 47, 0.2);
  position: relative;
  overflow: hidden;
  color: #f8fafc;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, transparent, #ef4444, transparent);
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;

  &:hover {
    color: #f8fafc;
    background: rgba(255, 255, 255, 0.05);
  }
`;

const IconWrapper = styled.div`
  display: inline-flex;
  padding: 12px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  margin-bottom: 20px;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.15);
`;

const Title = styled.h3`
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const Message = styled.p`
  font-size: 0.9rem;
  color: #cbd5e1;
  line-height: 1.5;
  margin-bottom: 24px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  &.confirm {
    background: linear-gradient(135deg, var(--wine-red) 0%, var(--wine-red-dark) 100%);
    color: #f8fafc;
    border-color: rgba(139, 30, 47, 0.4);
    box-shadow: 0 4px 12px rgba(139, 30, 47, 0.3);

    &:hover {
      background: linear-gradient(135deg, var(--wine-red-light) 0%, var(--wine-red) 100%);
      box-shadow: 0 0 15px var(--wine-glow-strong);
    }
  }

  &.cancel {
    background: rgba(255, 255, 255, 0.02);
    color: #94a3b8;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #f8fafc;
    }
  }
`;

const ConfirmModal = ({ 
  isOpen, 
  title = "Confirmar Ação", 
  message = "Tem certeza que deseja prosseguir?", 
  confirmText = "Confirmar", 
  cancelText = "Cancelar", 
  onConfirm, 
  onCancel 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Backdrop
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <ModalBox
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 10, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          >
            <CloseBtn onClick={onCancel}>
              <X size={16} />
            </CloseBtn>
            
            <IconWrapper>
              <AlertTriangle size={24} />
            </IconWrapper>

            <Title>{title}</Title>
            <Message>{message}</Message>

            <ButtonGroup>
              <Button className="cancel" onClick={onCancel}>
                {cancelText}
              </Button>
              <Button className="confirm" onClick={async () => {
                try {
                  await onConfirm();
                } catch (e) {
                  console.error(e);
                } finally {
                  if (onCancel) onCancel();
                }
              }}>
                {confirmText}
              </Button>
            </ButtonGroup>
          </ModalBox>
        </Backdrop>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
