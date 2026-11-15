import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import Logo from '../../components/Logo';
import { site } from '../../config/site';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/admin', { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login">
      <div className="login__card">
        <aside className="login__aside">
          <Logo light />
          <div>
            <p className="eyebrow">
              <span className="eyebrow__dot" />
              Panel bengkel
            </p>
            <h1 className="display display--sm">
              Kelola layanan
              <br />
              dan pesanan.
            </h1>
            <p>
              Semua booking dari website masuk ke sini. Konfirmasi jadwal, ubah
              status pengerjaan, dan atur daftar layanan bengkel.
            </p>
          </div>
          <div className="login__aside-foot">
            <span>
              <Icon name="shield" size={16} /> Khusus admin {site.name}
            </span>
            <a href="/" className="login__back">
              <Icon name="chevron-left" size={15} /> Kembali ke website
            </a>
          </div>
        </aside>

        <div className="login__form-wrap">
          <div className="login__form-head">
            <span className="login__form-icon">
              <Icon name="wrench" size={22} />
            </span>
            <h2>Masuk dashboard</h2>
            <p>Gunakan akun admin yang sudah terdaftar.</p>
          </div>

          <form onSubmit={handleSubmit} className="login__form">
            <label className="field field--dark">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@atepjayamotor.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="field field--dark">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>

            {error && (
              <div className="alert alert--error" role="alert">
                <Icon name="alert" size={17} />
                {error}
              </div>
            )}

            <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
              {submitting ? 'Memeriksa akun…' : 'Masuk'}
              {!submitting && <Icon name="arrow-right" size={17} />}
            </button>
          </form>

          <p className="login__help">
            Lupa password? Hubungi pengelola website untuk mengatur ulang akun.
          </p>
        </div>
      </div>
    </div>
  );
}
