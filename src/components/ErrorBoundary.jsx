import React, { Component } from 'react';
import styled from 'styled-components';
import { ShieldAlert, RefreshCw } from 'lucide-react';

const ErrorContainer = styled.div`
  min-height: 100vh;
  background: #000000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #f8fafc;
  position: relative;
  overflow: hidden;
`;

const GlitchGrid = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(139, 30, 47, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 30, 47, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
  pointer-events: none;
  opacity: 0.5;
`;

const HologramBox = styled.div`
  background: rgba(18, 18, 22, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(139, 30, 47, 0.4);
  box-shadow: 0 0 30px rgba(139, 30, 47, 0.25);
  border-radius: 16px;
  padding: 40px;
  max-width: 520px;
  width: 100%;
  text-align: center;
  z-index: 10;
  position: relative;

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

const IconWrapper = styled.div`
  display: inline-flex;
  padding: 16px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  margin-bottom: 20px;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
`;

const ErrorTitle = styled.h1`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.8rem;
  margin-bottom: 12px;
  color: #f8fafc;
`;

const ErrorDesc = styled.p`
  font-size: 0.95rem;
  color: #94a3b8;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const ErrorDetails = styled.pre`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: #e27d8d;
  text-align: left;
  overflow-x: auto;
  margin-bottom: 24px;
  max-height: 120px;
`;

const ActionButton = styled.button`
  background: #8b1e2f;
  color: #f8fafc;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(139, 30, 47, 0.3);

  &:hover {
    background: #b42b40;
    box-shadow: 0 4px 20px rgba(180, 43, 64, 0.5);
    transform: translateY(-1px);
  }
`;

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <GlitchGrid />
          <HologramBox>
            <IconWrapper>
              <ShieldAlert size={36} />
            </IconWrapper>
            <ErrorTitle>Falha no Módulo Quântico</ErrorTitle>
            <ErrorDesc>
              Ocorreu uma exceção inesperada ao renderizar o painel SaaS. 
              O sistema isolou a falha de forma segura.
            </ErrorDesc>
            <ErrorDetails>
              {this.state.error ? this.state.error.toString() : 'Erro desconhecido'}
            </ErrorDetails>
            <ActionButton onClick={this.handleReset}>
              <RefreshCw size={16} />
              Reiniciar Sistema
            </ActionButton>
          </HologramBox>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}
