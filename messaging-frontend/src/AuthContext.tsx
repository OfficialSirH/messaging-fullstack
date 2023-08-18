import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
  username: string;
  password: string;
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  setLoggedIn: () => {
    console.warn('setLoggedIn: no auth context provider');
  },
  username: '',
  password: '',
  setUsername: () => {
    console.warn('setUsername: no auth context provider');
  },
  setPassword: () => {
    console.warn('setPassword: no auth context provider');
  },
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthContext.Provider value={{ isLoggedIn, setLoggedIn, username, password, setUsername, setPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
