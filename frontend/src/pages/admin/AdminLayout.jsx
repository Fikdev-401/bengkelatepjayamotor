import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/pesanan', label: 'Pesanan', icon: 'clipboard' },
  { to: '/admin/layanan', label: 'Layanan', icon: 'wrench' },
];

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/pesanan': 'Pesanan masuk',
  '/admin/layanan': 'Layanan bengkel',
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const today = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin">
      {sidebarOpen && (
        <button
          type="button"
          className="admin__overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Tutup menu"
        />
      )}

      <aside className={`admin__sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <Link to="/admin" className="admin__brand">
          <Logo light />
        </Link>

        <nav className="admin__nav" aria-label="Navigasi admin">
          <span className="admin__nav-label">Menu utama</span>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'is-active' : '')}
            >
              <Icon name={item.icon} size={19} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin__sidebar-foot">
          <a href="/" className="admin__site-link" target="_blank" rel="noreferrer">
            <Icon name="arrow-up-right" size={17} />
            Lihat website
          </a>
          <div className="admin__account">
            <span className="admin__avatar">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
            <div>
              <strong>{user?.name}</strong>
              <span>Administrator</span>
            </div>
            <button type="button" onClick={handleLogout} className="icon-btn icon-btn--ghost" aria-label="Keluar">
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className="admin__body">
        <header className="admin__topbar">
          <button
            type="button"
            className="admin__menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
          >
            <Icon name="menu" size={21} />
          </button>
          <div className="admin__heading">
            <h1>{pageTitles[location.pathname] || 'Dashboard'}</h1>
            <p>{today}</p>
          </div>
          <Link to="/admin/pesanan" className="admin__quick">
            <Icon name="clipboard" size={17} />
            <span>Cek pesanan</span>
          </Link>
        </header>

        <main className="admin__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
