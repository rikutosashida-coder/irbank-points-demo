import { useState, useEffect, ReactNode } from 'react';

interface BasicAuthProps {
  children: ReactNode;
}

export function BasicAuth({ children }: BasicAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const auth = sessionStorage.getItem('basicAuth');
    if (auth === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'points' && password === 'note2026') {
      sessionStorage.setItem('basicAuth', 'authenticated');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '480px',
      }}>
        <h2 style={{ marginBottom: '1rem', textAlign: 'center', color: '#333', fontSize: '1.5rem', fontWeight: 'bold' }}>
          IRBANK ポイントシステム
        </h2>
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: '6px',
          fontSize: '0.9rem',
          lineHeight: '1.6',
          color: '#444',
        }}>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            <strong>IRBANKの世界へようこそ</strong>
          </p>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            あなたは<strong>IRBANK社員</strong>として、ゼロから会社を一緒に育てていきます。
          </p>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            活動を通じて<strong>ポイント</strong>を獲得し、<strong>賞状</strong>で表彰され、
            そして<strong>役職</strong>を手にしていく──
          </p>
          <p style={{ margin: '0' }}>
            まさに一つの会社としての成長を体験できる世界です。
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>
              ID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            />
          </div>
          {error && (
            <div style={{
              color: '#dc3545',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}
