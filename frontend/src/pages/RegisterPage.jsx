import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('Preencha todos os campos.');
    if (password.length < 6) return toast.error('Senha deve ter pelo menos 6 caracteres.');
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Conta criada! Bem-vindo ao TaskFlow 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const logoStyle = {
    width: 40, height: 40, fontSize: 20, borderRadius: 10,
    background: 'linear-gradient(135deg, #f59e0b, #fcd34d)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 24px rgba(245,158,11,0.2)'
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon" style={logoStyle}>⚡</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>TaskFlow</span>
        </div>

        <h1 className="auth-heading">Criar sua conta</h1>
        <p className="auth-subheading">Comece a organizar sua vida hoje</p>

        <form onSubmit={handleSubmit} id="register-form">
          <div className="form-group">
            <label className="form-label" htmlFor="name">Seu nome</label>
            <input
              id="name"
              className="form-input"
              type="text"
              placeholder="João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">E-mail</label>
            <input
              id="reg-email"
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
            <label className="form-label" htmlFor="reg-password">Senha</label>
            <input
              id="reg-password"
              className="form-input"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
            disabled={loading}
            id="register-submit-btn"
          >
            {loading ? <><span className="spinner" /> Criando conta...</> : 'Criar conta grátis →'}
          </button>
        </form>

        <p className="auth-divider">
          Já tem conta?{' '}
          <Link to="/login" className="auth-link">Fazer login</Link>
        </p>
      </div>
    </div>
  );
}
