import { createContext, useContext, useMemo, useState } from 'react';
import api from '../api/client';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('chowly_user') || 'null'); }
    catch { return null; }
  });
  const persist = ({ token, user: nextUser }) => {
    localStorage.setItem('chowly_token', token);
    localStorage.setItem('chowly_user', JSON.stringify(nextUser));
    setUser(nextUser);
  };
  const customerLogin = async (payload) => persist((await api.post('/auth/customer/login', payload)).data);
  const customerRegister = async (payload) => (await api.post('/auth/customer/register', payload)).data;
  const verifyEmail = async (token) => persist((await api.post('/auth/verify-email', { token })).data);
  const resendVerification = async (email) => (await api.post('/auth/resend-verification', { email })).data;
  const googleLogin = async (credential) => persist((await api.post('/auth/google', { credential })).data);
  const staffLogin = async (payload) => persist((await api.post('/auth/staff/login', payload)).data);
  const forgotPassword = async (role, email) => (await api.post(`/auth/${role}/forgot-password`, { email })).data;
  const resetPassword = async (role, token, password) => persist((await api.post(`/auth/${role}/reset-password`, { token, password })).data);
  const updateProfile = async (payload) => {
    const { data: nextUser } = await api.patch('/auth/me', payload);
    localStorage.setItem('chowly_user', JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  };
  const logout = () => {
    localStorage.removeItem('chowly_token');
    localStorage.removeItem('chowly_user');
    setUser(null);
  };
  const value = useMemo(() => ({ user, customerLogin, customerRegister, verifyEmail, resendVerification, googleLogin, staffLogin, forgotPassword, resetPassword, updateProfile, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);