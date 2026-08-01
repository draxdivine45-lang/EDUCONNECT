import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { loginRequest, registerRequest } from '../api/auth';

const AuthContext = createContext(null);

const TOKEN_KEY = 'educonnect_token';
const USER_KEY = 'educonnect_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  const persistSession = useCallback((nextUser, nextToken) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const { user: loggedInUser, token: newToken } = await loginRequest(credentials);
      persistSession(loggedInUser, newToken);
      return loggedInUser;
    },
    [persistSession]
  );

  const register = useCallback(
    async (payload) => {
      const { user: newUser, token: newToken } = await registerRequest(payload);
      persistSession(newUser, newToken);
      return newUser;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateStoredUser = useCallback((nextUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      updateStoredUser,
    }),
    [user, token, login, register, logout, updateStoredUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
