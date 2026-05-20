import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dbService } from '../services/dbService';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const toast = useToast();

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const session = await dbService.auth.getCurrentSession();
      if (session) {
        setUser(session.user);
        setProfile(session.profile);
      }
      // Set indicator if Supabase client is active or falling back
      setIsDemoMode(!dbService.isSupabaseActive());
    } catch (err) {
      console.error('Erro ao verificar sessão:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const { user: authedUser, profile: userProfile } = await dbService.auth.login(username, password);
      
      setUser(authedUser);
      setProfile(userProfile);
      
      // Save session in local storage for local dev persistence
      dbService.auth.saveSession(authedUser, userProfile);
      
      toast.success(`Bem-vindo, ${userProfile.full_name}!`, 'Autenticação Concluída');
      return userProfile;
    } catch (err) {
      toast.error(err.message || 'Erro ao realizar login. Tente novamente.', 'Falha de Login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await dbService.auth.logout(profile);
      dbService.auth.clearSession();
      setUser(null);
      setProfile(null);
      toast.info('Sessão encerrada com sucesso.', 'Logout');
    } catch (err) {
      toast.error('Erro ao encerrar sessão.', 'Falha de Logout');
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (username, password, fullName, role) => {
    try {
      if (!profile || profile.role !== 'admin') {
        throw new Error('Apenas administradores podem cadastrar novos usuários.');
      }
      
      await dbService.auth.createUser(username, password, fullName, role, profile);
      toast.success(`Colaborador ${fullName} cadastrado com sucesso!`, 'Cadastro Realizado');
    } catch (err) {
      toast.error(err.message || 'Erro ao cadastrar usuário.', 'Falha de Cadastro');
      throw err;
    }
  };

  const hasPermission = (allowedRoles) => {
    if (!profile) return false;
    return allowedRoles.includes(profile.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isDemoMode,
        isAuthenticated: !!user,
        login,
        logout,
        registerUser,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
