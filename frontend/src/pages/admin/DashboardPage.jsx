import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import StatusBadge from '../../components/admin/StatusBadge';
import { api } from '../../lib/api';
import { formatDateTime } from '../../lib/format';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    setState('loading');
    setError('');

    try {
      const [statsResponse, ordersResponse] = await Promise.all([
        api.admin.getStats(),
        api.admin.getOrders({ limit: 6 }),
      ]);
      setStats(statsResponse.data);
      setRecentOrders(ordersResponse.data);
      setState('ready');
    } catch (loadError) {
      setError(loadError.message);
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  const cards = stats
    ? [
        {
          label: 'Menunggu konfirmasi',
          value: stats.pending,
          icon: 'clock',
          tone: 'warn',
          note: 'Perlu dihubungi lewat WA',
        },
        {
          label: 'Sedang dikerjakan',
          value: stats.inProgress,
          icon: 'wrench',
          tone: 'info',
          note: 'Motor sedang di bengkel',
        },
        {
          label: 'Selesai bulan ini',
          value: stats.monthCompleted,
          icon: 'check',
          tone: 'success',
          note: 'Pengerjaan tuntas',
        },
        {
          label: 'Total pesanan',
          value: stats.totalOrders,
          icon: 'clipboard',
          tone: 'neutral',
          note: `${stats.todayOrders} pesanan masuk hari ini`,
        },
      ]
    : [];

  return (
    <div className="dashboard">
      {state === 'error' && (
        <div className="alert alert--error" role="alert">
          <Icon name="alert" size={18} />
          <span>{error}</span>
          <button type="button" className="btn btn--table btn--sm" onClick={() => setReloadKey((key) => key + 1)}>
            Coba lagi
          </button>
        </div>
      )}

      <div className="stat-grid">
        {state === 'loading' &&
          [0, 1, 2, 3].map((index) => (
            <div className="stat-card" key={index}>
              <div className="skeleton skeleton--icon" />
              <div className="skeleton skeleton--line short" />
              <div className="skeleton skeleton--title" />
            </div>
          ))}

        {state === 'ready' &&
          cards.map((card) => (
            <article className={`stat-card stat-card--${card.tone}`} key={card.label}>
              <div className="stat-card__top">
                <span className="stat-card__icon">
                  <Icon name={card.icon} size={20} />
                </span>
                <span className="stat-card__label">{card.label}</span>
              </div>
              <strong className="stat-card__value">{card.value}</strong>
              <span className="stat-card__note">{card.note}</span>
            </article>
          ))}
      </div>

      <div className="dashboard__grid">
        <section className="panel">
          <div className="panel__head">
            <div>
              <h2>Pesanan terbaru</h2>
              <p>Booking terakhir yang masuk dari website.</p>
            </div>
            <Link to="/admin/pesanan" className="panel__link">
              Lihat semua
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>

          {state === 'loading' && (
            <div className="panel__empty">
              <div className="skeleton skeleton--line" />
              <div className="skeleton skeleton--line" />
              <div className="skeleton skeleton--line short" />
            </div>
          )}

          {state === 'ready' && recentOrders.length === 0 && (
            <div className="empty-state">
              <span className="empty-state__icon">
                <Icon name="clipboard" size={24} />
              </span>
              <strong>Belum ada pesanan</strong>
              <p>
                Pesanan dari form booking di website akan muncul otomatis di sini.
              </p>
            </div>
          )}

          {state === 'ready' && recentOrders.length > 0 && (
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pesanan</th>
                    <th>Pelanggan</th>
                    <th>Layanan</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong className="mono">{order.code}</strong>
                        <span className="cell-sub">{formatDateTime(order.createdAt)}</span>
                      </td>
                      <td>
                        <strong>{order.customerName}</strong>
                        <span className="cell-sub">{order.phone}</span>
                      </td>
                      <td>{order.serviceName}</td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="panel panel--side">
          <div className="panel__head">
            <div>
              <h2>Ringkasan hari ini</h2>
              <p>Aktivitas bengkel Anda.</p>
            </div>
          </div>

          <div className="side-highlight">
            <span>Pesanan masuk hari ini</span>
            <strong>{stats ? stats.todayOrders : '—'}</strong>
            <small>Termasuk yang sudah selesai</small>
          </div>

          <ul className="side-list">
            <li>
              <span>Layanan aktif</span>
              <strong>{stats ? stats.activeServices : '—'}</strong>
            </li>
            <li>
              <span>Dikonfirmasi</span>
              <strong>{stats ? stats.confirmed : '—'}</strong>
            </li>
            <li>
              <span>Dibatalkan</span>
              <strong>{stats ? stats.cancelled : '—'}</strong>
            </li>
          </ul>

          <div className="side-actions">
            <Link to="/admin/pesanan" className="btn btn--dark btn--block btn--sm">
              Kelola pesanan
              <Icon name="arrow-right" size={16} />
            </Link>
            <Link to="/admin/layanan" className="btn btn--table btn--block btn--sm">
              Atur layanan
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
