import { useState, useEffect, ReactNode } from 'react';
import { LoginPage } from '../pages/LoginPage';

interface BasicAuthProps {
  children: ReactNode;
}

export function BasicAuth({ children }: BasicAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('basicAuth');
    if (auth === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return <LoginPage onLogin={handleLogin} />;
}
