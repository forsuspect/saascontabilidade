import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { shouldUseFastMotion, overlayFade, modalPop } from '../utils/motion';
import { mobileGlassFix } from '../styles/glass';
import { Shield, Eye, EyeOff, Terminal, ShieldAlert, Cpu } from 'lucide-react';
import { logSystemAction } from '../services/dbService';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: #000000;
  overflow: hidden;
  padding: 20px;
`;

const SpaceGrid = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(139, 30, 47, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 30, 47, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  transform: perspective(500px) rotateX(60deg) translateY(-100px);
  transform-origin: top;
  animation: grid-scroll 20s linear infinite;
  pointer-events: none;
  opacity: 0.6;

  @keyframes grid-scroll {
    0% { background-position: 0 0; }
    100% { background-position: 0 100px; }
  }

  @media (max-width: 768px) {
    animation: none;
    opacity: 0.4;
  }
`;

const GlowOrb = styled(motion.div)`
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 30, 47, 0.12) 0%, transparent 70%);
  filter: blur(50px);
  pointer-events: none;
  z-index: 1;
`;

const TerminalOverlay = styled.div`
  position: absolute;
  top: 24px;
  left: 24px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: rgba(180, 43, 64, 0.75);
  display: flex;
  flex-direction: column;
  gap: 4px;
  pointer-events: none;
  z-index: 2;

  @media (max-width: 640px) {
    display: none;
  }
`;

const HUDSystemPanel = styled(motion.div)`
  width: 100%;
  max-width: 440px;
  background: rgba(12, 12, 16, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 30, 47, 0.25);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8),
              0 0 30px rgba(139, 30, 47, 0.15);
  z-index: 10;
  position: relative;
  overflow: hidden;

  @media (max-width: 480px) {
    padding: 28px 20px;
    border-radius: 12px;
  }

  ${mobileGlassFix}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, var(--wine-red-light) 50%, transparent 100%);
    box-shadow: 0 0 10px var(--wine-red-light);
  }
`;

const Scanline = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%, 
    rgba(0, 0, 0, 0.25) 50%
  );
  background-size: 100% 4px;
  z-index: 2;
  pointer-events: none;
  opacity: 0.15;
`;

const HeaderTitleSection = styled.div`
  text-align: center;
  margin-bottom: 32px;
  position: relative;
`;

const AppLogo = styled(motion.div)`
  display: inline-flex;
  padding: 12px;
  border-radius: 12px;
  background: rgba(139, 30, 47, 0.1);
  border: 1px solid rgba(139, 30, 47, 0.3);
  color: var(--wine-red-light);
  margin-bottom: 16px;
  box-shadow: 0 0 15px rgba(139, 30, 47, 0.15);
`;

const AppTitle = styled.h1`
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  background: linear-gradient(90deg, #ffffff 30%, var(--text-wine) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 6px;
`;

const AppSubtitle = styled.p`
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-weight: 500;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-family: var(--font-display);
  font-size: 0.8rem;
  color: var(--text-gray-light);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  background: rgba(10, 10, 12, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px 42px 12px 16px;
  color: var(--text-white);
  font-size: 0.95rem;
  font-family: var(--font-main);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  &:focus {
    border-color: var(--wine-red-light);
    box-shadow: 0 0 15px var(--wine-glow);
    background: rgba(139, 30, 47, 0.04);
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 14px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: var(--text-gray-light);
  }
`;

const ErrorPanel = styled(motion.div)`
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ef4444;
  font-size: 0.85rem;
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, var(--wine-red) 0%, var(--wine-red-dark) 100%);
  color: var(--text-white);
  padding: 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  font-family: var(--font-display);
  letter-spacing: 0.05em;
  border: 1px solid rgba(139, 30, 47, 0.4);
  box-shadow: 0 4px 15px rgba(139, 30, 47, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--wine-red-light) 0%, var(--wine-red) 100%);
    box-shadow: 0 0 25px var(--wine-glow-strong);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--text-white);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const SystemFooter = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  padding-top: 16px;
`;

const StaticIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const GreenDot = styled.span`
  width: 6px;
  height: 6px;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
`;

const ForgotPasswordBtn = styled.button`
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;
  border: none;
  padding: 0;
  transition: color 0.2s ease;

  &:hover {
    color: var(--wine-red-light);
  }
`;

const InfoModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
`;

const InfoModalContent = styled(motion.div)`
  background: rgba(12, 12, 16, 0.95);
  border: 1px solid rgba(139, 30, 47, 0.35);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(139, 30, 47, 0.2);
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 420px;
  text-align: center;
  position: relative;
`;

const CloseBtn = styled.button`
  background: linear-gradient(135deg, var(--wine-red) 0%, var(--wine-red-dark) 100%);
  border: 1px solid rgba(139, 30, 47, 0.4);
  color: var(--text-white);
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 24px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, var(--wine-red-light) 0%, var(--wine-red) 100%);
    box-shadow: 0 0 15px var(--wine-glow-strong);
  }
`;

const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errMessage, setErrMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  useEffect(() => {
    // Record anonymous access to the system portal
    logSystemAction('SYS_ACCESS', 'Visitante acessou a interface de autenticação do sistema.', 'anonymous', 'visitante', 'visitante');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrMessage('Preencha todos os campos credenciais.');
      return;
    }

    setIsSubmitting(true);
    setErrMessage('');

    try {
      await login(username, password);
    } catch (err) {
      setErrMessage(err.message || 'Erro de autenticação no servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginContainer>
      <SpaceGrid />
      {!shouldUseFastMotion() && (
        <GlowOrb
          animate={{
            x: [0, 40, -40, 0],
            y: [0, -40, 40, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <HUDSystemPanel
        initial={shouldUseFastMotion() ? false : { opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={shouldUseFastMotion() ? { duration: 0.15 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <Scanline />

        <HeaderTitleSection>
          <AppLogo
            animate={shouldUseFastMotion() ? false : { scale: [1, 1.05, 1] }}
            transition={shouldUseFastMotion() ? undefined : { duration: 4, repeat: Infinity }}
          >
            <Cpu size={28} />
          </AppLogo>
          <AppTitle>AETHERIS</AppTitle>
          <AppSubtitle>Sistema Operacional SaaS</AppSubtitle>
        </HeaderTitleSection>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="username">Usuário do Sistema</Label>
            <InputWrapper>
              <Input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: admin"
                disabled={isSubmitting}
                autoFocus
              />
            </InputWrapper>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">
              <span>Senha de Acesso</span>
            </Label>
            <InputWrapper>
              <Input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isSubmitting}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </PasswordToggle>
            </InputWrapper>
          </FormGroup>

          <AnimatePresence>
            {errMessage && (
              <ErrorPanel
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <ShieldAlert size={18} />
                <span>{errMessage}</span>
              </ErrorPanel>
            )}
          </AnimatePresence>

          <LoginButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <Shield size={18} />
                <span>Validar Acesso</span>
              </>
            )}
          </LoginButton>
        </Form>

        <SystemFooter style={{ justifyContent: 'center' }}>
          <ForgotPasswordBtn type="button" onClick={() => setShowForgotModal(true)}>
            Esqueceu sua senha?
          </ForgotPasswordBtn>
        </SystemFooter>
      </HUDSystemPanel>

      <AnimatePresence>
        {showForgotModal && (
          <InfoModalOverlay
            {...overlayFade()}
            onClick={() => setShowForgotModal(false)}
          >
            <InfoModalContent
              {...modalPop()}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-white)', fontSize: '1.2rem', marginBottom: '16px', fontWeight: 600 }}>Solicitar Acesso</h3>
              <p style={{ color: 'var(--text-gray-light)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Para redefinir sua senha ou solicitar credenciais de acesso, entre em contato diretamente com os proprietários da plataforma ou a equipe de desenvolvimento do site.
              </p>
              <CloseBtn onClick={() => setShowForgotModal(false)}>Entendido</CloseBtn>
            </InfoModalContent>
          </InfoModalOverlay>
        )}
      </AnimatePresence>
      <div style={{position: 'absolute', bottom: '20px', left: 0, width: '100%', textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', zIndex: 10}}>
        Desenvolvido por <a href="https://automize-one.vercel.app/" target="_blank" rel="noopener noreferrer" style={{color: 'var(--wine-red-light)', textDecoration: 'none', fontWeight: 600}}>Automize</a>
      </div>
    </LoginContainer>
  );
};

export default Login;
