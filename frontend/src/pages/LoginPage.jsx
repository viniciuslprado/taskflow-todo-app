import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Preencha todos os campos.');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Bem-vindo de volta! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon" style={{ width: 40, height: 40, fontSize: 20, borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b, #fcd34d)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(245,158,11,0.2)' }}>⚡</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>TaskFlow</span>
        </div>

        <h1 className="auth-heading">Bem-vindo de volta</h1>
        <p className="auth-subheading">Entre na sua conta para continuar</p>

        <form onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">E-mail</label>
            <input
              id="email"
              className="form-input"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Senha</label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? <><span className="spinner" /> Entrando...</> : 'Entrar na conta →'}
          </button>
        </form>

        <p className="auth-divider">
          Não tem conta?{' '}
          <Link to="/register" className="auth-link">Criar conta grátis</Link>
        </p>
      </div>
    </div>
  );
}
