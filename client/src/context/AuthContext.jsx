import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('shopstreamToken');
    const savedUser = localStorage.getItem('shopstreamUser');
    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('shopstreamToken');
        localStorage.removeItem('shopstreamUser');
      }
    }
    setInitializing(false);
  }, []);

  const persistSession = (data) => {
    // Backend returns { _id, name, email, role, token } flattened (see PDF auth routes)
    const { token, ...userData } = data;
    localStorage.setItem('shopstreamToken', token);
    localStorage.setItem('shopstreamUser', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    return persistSession(res.data);
  };

  const register = async (name, email, password) => {
    const res = await registerUser({ name, email, password });
    return persistSession(res.data);
  };

  const logout = () => {
    localStorage.removeItem('shopstreamToken');
    localStorage.removeItem('shopstreamUser');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      initializing
    }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
