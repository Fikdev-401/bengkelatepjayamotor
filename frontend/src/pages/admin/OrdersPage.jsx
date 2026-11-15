import { useEffect, useState } from 'react';
import Icon from '../../components/Icon';
import Modal from '../../components/admin/Modal';
import StatusBadge from '../../components/admin/StatusBadge';
import { api } from '../../lib/api';
import {
  ORDER_STATUS_OPTIONS,
  formatDate,
  formatDateTime,
  statusInfo,
} from '../../lib/format';
import { customerWhatsAppUrl } from '../../lib/whatsapp';

const FILTERS = [{ value: 'ALL', label: 'Semua status' }, ...ORDER_STATUS_OPTIONS];

function OrderDetail({ order, onClose, onSaved }) {
  const [status, setStatus] = useState(order.status);
  const [note, setNote] = useState(order.adminNote || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const { data } = await api.admin.updateOrder(order.id, {
        status,
        adminNote: note,
      });
      onSaved(data);
      setSaved(true);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`Pesanan ${order.code}`}
      subtitle={`Masuk ${formatDateTime(order.createdAt)}`}
      onClose={onClose}
      size="lg"
    >
      <div className="order-detail">
        <div className="order-detail__head">
          <StatusBadge status={order.status} />
          <span className="order-detail__service">{order.serviceName}</span>
        </div>

        <div className="order-detail__grid">
          <div>
            <span>Nama pelanggan</span>
            <strong>{order.customerName}</strong>
          </div>
          <div>
            <span>Nomor WhatsApp</span>
            <strong>{order.phone}</strong>
          </div>
          <div>
            <span>Motor</span>
            <strong>{order.vehicle || '—'}</strong>
          </div>
          <div>
            <span>Nomor polisi</span>
            <strong>{order.plateNumber || '—'}</strong>
          </div>
          <div>
            <span>Rencana datang</span>
            <strong>{formatDate(order.preferredDate)}</strong>
          </div>
          <div>
            <span>Terakhir diperbarui</span>
            <strong>{formatDateTime(order.updatedAt)}</strong>
          </div>
        </div>

        <div className="order-detail__complaint">
          <span>Keluhan / catatan pelanggan</span>
          <p>{order.complaint || 'Pelanggan tidak menuliskan keluhan.'}</p>
        </div>

        <form className="order-detail__form" onSubmit={handleSave}>
          <div className="form-grid">
            <label className="field">
              <span>Status pengerjaan</span>
              <div className="select-wrap">
                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                  {ORDER_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Icon name="chevron-right" size={16} className="select-wrap__chevron" />
              </div>
            </label>

            <span className="order-detail__status-hint">
              Status saat ini: {statusInfo(order.status).label}
            </span>

            <label className="field field--full">
              <span>Catatan admin</span>
              <textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Contoh: sudah dikonfirmasi via WA, datang Sabtu pagi."
                maxLength={1000}
              />
            </label>
          </div>

          {error && (
            <div className="alert alert--error" role="alert">
              <Icon name="alert" size={17} />
              {error}
            </div>
          )}

          {saved && (
            <div className="alert alert--success" role="status">
              <Icon name="check" size={17} />
              Perubahan berhasil disimpan.
            </div>
          )}

          <div className="order-detail__actions">
            <a
              className="btn btn--table btn--sm"
              href={customerWhatsAppUrl(order)}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="whatsapp" size={16} />
              Chat pelanggan
            </a>
            <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
              {saving ? 'Menyimpan…' : 'Simpan perubahan'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [status, setStatus] = useState('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setState('loading');
    setError('');

    api.admin
      .getOrders({ status, search, page, limit: 10 })
      .then((response) => {
        if (!active) return;
        setOrders(response.data);
        setMeta(response.meta);
        setState('ready');
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError.message);
        setState('error');
      });

    return () => {
      active = false;
    };
  }, [status, search, page, reloadKey]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleSaved = (updated) => {
    setOrders((current) =>
      current.map((order) => (order.id === updated.id ? { ...order, ...updated } : order)),
    );
    setSelected((current) => (current ? { ...current, ...updated } : current));
  };

  return (
    <div className="orders-page">
      <div className="toolbar">
        <div className="toolbar__filters">
          <div className="select-wrap select-wrap--filter">
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              aria-label="Filter status pesanan"
            >
              {FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
            <Icon name="chevron-right" size={16} className="select-wrap__chevron" />
          </div>

          <form className="search-field" onSubmit={handleSearch}>
            <Icon name="search" size={17} />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari kode, nama, atau nomor HP…"
              aria-label="Cari pesanan"
            />
            <button type="submit">Cari</button>
          </form>
        </div>

        <span className="toolbar__count">
          {meta ? `${meta.total} pesanan` : 'Memuat…'}
        </span>
      </div>

      {state === 'error' && (
        <div className="alert alert--error" role="alert">
          <Icon name="alert" size={18} />
          <span>{error}</span>
          <button
            type="button"
            className="btn btn--table btn--sm"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Coba lagi
          </button>
        </div>
      )}

      <section className="panel">
        {state === 'loading' && (
          <div className="panel__empty">
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line short" />
          </div>
        )}

        {state === 'ready' && orders.length === 0 && (
          <div className="empty-state">
            <span className="empty-state__icon">
              <Icon name="search" size={24} />
            </span>
            <strong>Tidak ada pesanan yang cocok</strong>
            <p>Coba ubah filter status atau kata kunci pencarian.</p>
          </div>
        )}

        {state === 'ready' && orders.length > 0 && (
          <>
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pesanan</th>
                    <th>Pelanggan</th>
                    <th>Layanan</th>
                    <th>Jadwal</th>
                    <th>Status</th>
                    <th aria-label="Aksi" />
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong className="mono">{order.code}</strong>
                        <span className="cell-sub">{formatDateTime(order.createdAt)}</span>
                      </td>
                      <td>
                        <strong>{order.customerName}</strong>
                        <span className="cell-sub">
                          {order.phone}
                          {order.vehicle ? ` · ${order.vehicle}` : ''}
                        </span>
                      </td>
                      <td>{order.serviceName}</td>
                      <td>
                        {order.preferredDate ? (
                          formatDate(order.preferredDate)
                        ) : (
                          <span className="muted">Belum ditentukan</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="cell-action">
                        <button
                          type="button"
                          className="btn btn--table btn--sm"
                          onClick={() => setSelected(order)}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <span>
                Halaman {meta.page} dari {meta.totalPages}
              </span>
              <div>
                <button
                  type="button"
                  className="btn btn--table btn--sm"
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  disabled={meta.page <= 1}
                >
                  <Icon name="chevron-left" size={15} />
                  Sebelumnya
                </button>
                <button
                  type="button"
                  className="btn btn--table btn--sm"
                  onClick={() => setPage((current) => Math.min(current + 1, meta.totalPages))}
                  disabled={meta.page >= meta.totalPages}
                >
                  Berikutnya
                  <Icon name="chevron-right" size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {selected && (
        <OrderDetail
          order={selected}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
