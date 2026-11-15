import { useEffect, useState } from 'react';
import Icon, { SERVICE_ICONS } from '../../components/Icon';
import Modal from '../../components/admin/Modal';
import { api } from '../../lib/api';
import { rupiah } from '../../lib/format';

const emptyService = {
  name: '',
  category: 'Servis',
  description: '',
  price: '',
  duration: '',
  icon: 'wrench',
  isActive: true,
  isFeatured: false,
  sortOrder: 0,
};

function ServiceForm({ service, onClose, onSaved }) {
  const [form, setForm] = useState(() =>
    service
      ? {
          ...emptyService,
          ...service,
          price: String(service.price),
          duration: service.duration || '',
          sortOrder: String(service.sortOrder ?? 0),
        }
      : emptyService,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name: form.name,
      category: form.category,
      description: form.description,
      price: Number(form.price),
      duration: form.duration || null,
      icon: form.icon,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      const response = service
        ? await api.admin.updateService(service.id, payload)
        : await api.admin.createService(payload);
      onSaved(response.data);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={service ? 'Ubah layanan' : 'Tambah layanan'}
      subtitle={
        service
          ? 'Perubahan langsung tampil di website.'
          : 'Layanan baru akan tampil di website jika ditandai aktif.'
      }
      onClose={onClose}
      size="lg"
    >
      <form className="service-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field field--full">
            <span>Nama layanan <em>*</em></span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={update}
              placeholder="Contoh: Servis Rutin"
              maxLength={120}
              required
            />
          </label>

          <label className="field">
            <span>Kategori <em>*</em></span>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={update}
              placeholder="Servis / Mesin / Ban"
              maxLength={60}
              required
            />
          </label>

          <label className="field">
            <span>Harga mulai dari (Rp) <em>*</em></span>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={update}
              placeholder="65000"
              min={0}
              step={1000}
              required
            />
          </label>

          <label className="field">
            <span>Estimasi durasi</span>
            <input
              type="text"
              name="duration"
              value={form.duration}
              onChange={update}
              placeholder="45–60 menit"
              maxLength={60}
            />
          </label>

          <label className="field">
            <span>Ikon layanan</span>
            <div className="select-wrap">
              <select name="icon" value={form.icon} onChange={update}>
                {SERVICE_ICONS.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
              <Icon name="chevron-right" size={16} className="select-wrap__chevron" />
            </div>
          </label>

          <label className="field">
            <span>Urutan tampil</span>
            <input
              type="number"
              name="sortOrder"
              value={form.sortOrder}
              onChange={update}
              min={0}
              max={9999}
            />
            <small>Angka kecil tampil lebih dulu.</small>
          </label>

          <label className="field field--full">
            <span>Deskripsi <em>*</em></span>
            <textarea
              name="description"
              value={form.description}
              onChange={update}
              rows={4}
              maxLength={1000}
              placeholder="Jelaskan singkat apa saja yang dikerjakan pada layanan ini."
              required
            />
          </label>
        </div>

        <div className="checkbox-row">
          <label className="checkbox">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={update}
            />
            <span>
              <strong>Tampilkan di website</strong>
              <small>Layanan nonaktif disembunyikan dari pengunjung.</small>
            </span>
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={update}
            />
            <span>
              <strong>Tandai favorit</strong>
              <small>Menampilkan label “Favorit” pada kartu layanan.</small>
            </span>
          </label>
        </div>

        {error && (
          <div className="alert alert--error" role="alert">
            <Icon name="alert" size={17} />
            {error}
          </div>
        )}

        <div className="modal__actions">
          <button type="button" className="btn btn--table btn--sm" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
            {saving ? 'Menyimpan…' : service ? 'Simpan perubahan' : 'Tambah layanan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setState('loading');
    setError('');

    api.admin
      .getServices()
      .then((response) => {
        if (!active) return;
        setServices(response.data);
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
  }, [reloadKey]);

  const openCreate = () => {
    setEditingService(null);
    setFormOpen(true);
  };

  const openEdit = (service) => {
    setEditingService(service);
    setFormOpen(true);
  };

  const handleSaved = (saved) => {
    setServices((current) => {
      const exists = current.some((service) => service.id === saved.id);
      const next = exists
        ? current.map((service) => (service.id === saved.id ? saved : service))
        : [...current, saved];

      return next.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    });
    setFormOpen(false);
    setEditingService(null);
  };

  const toggleActive = async (service) => {
    setBusyId(service.id);
    setError('');

    try {
      const { data } = await api.admin.updateService(service.id, {
        isActive: !service.isActive,
      });
      setServices((current) =>
        current.map((item) => (item.id === data.id ? data : item)),
      );
    } catch (toggleError) {
      setError(toggleError.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    setError('');

    try {
      await api.admin.deleteService(deleting.id);
      setServices((current) => current.filter((service) => service.id !== deleting.id));
      setDeleting(null);
    } catch (deleteError) {
      setError(deleteError.message);
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="services-page">
      <div className="toolbar">
        <div>
          <p className="toolbar__hint">
            {services.length} layanan terdaftar ·{' '}
            {services.filter((service) => service.isActive).length} tampil di website
          </p>
        </div>
        <button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>
          <Icon name="plus" size={17} />
          Tambah layanan
        </button>
      </div>

      {error && (
        <div className="alert alert--error" role="alert">
          <Icon name="alert" size={18} />
          <span>{error}</span>
          {state === 'error' && (
            <button
              type="button"
              className="btn btn--table btn--sm"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Coba lagi
            </button>
          )}
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

        {state === 'ready' && services.length === 0 && (
          <div className="empty-state">
            <span className="empty-state__icon">
              <Icon name="wrench" size={24} />
            </span>
            <strong>Belum ada layanan</strong>
            <p>Tambahkan layanan pertama agar bisa dipilih pelanggan di website.</p>
            <button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>
              <Icon name="plus" size={16} />
              Tambah layanan
            </button>
          </div>
        )}

        {state === 'ready' && services.length > 0 && (
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Layanan</th>
                  <th>Kategori</th>
                  <th>Harga</th>
                  <th>Durasi</th>
                  <th>Status</th>
                  <th aria-label="Aksi" />
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <div className="service-cell">
                        <span className="service-cell__icon">
                          <Icon name={service.icon} size={18} />
                        </span>
                        <div>
                          <strong>{service.name}</strong>
                          <span className="cell-sub">
                            {service.isFeatured ? 'Favorit · ' : ''}
                            {service.description.slice(0, 60)}
                            {service.description.length > 60 ? '…' : ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{service.category}</td>
                    <td>{rupiah(service.price)}</td>
                    <td>{service.duration || '—'}</td>
                    <td>
                      <button
                        type="button"
                        className={`toggle ${service.isActive ? 'is-on' : ''}`}
                        onClick={() => toggleActive(service)}
                        disabled={busyId === service.id}
                        aria-pressed={service.isActive}
                        title={service.isActive ? 'Sembunyikan dari website' : 'Tampilkan di website'}
                      >
                        <span className="toggle__dot" />
                        {service.isActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="cell-action">
                      <div className="row-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => openEdit(service)}
                          aria-label={`Ubah ${service.name}`}
                        >
                          <Icon name="edit" size={17} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          onClick={() => setDeleting(service)}
                          aria-label={`Hapus ${service.name}`}
                        >
                          <Icon name="trash" size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {formOpen && (
        <ServiceForm
          service={editingService}
          onClose={() => {
            setFormOpen(false);
            setEditingService(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {deleting && (
        <Modal
          title="Hapus layanan?"
          subtitle="Tindakan ini tidak bisa dibatalkan."
          onClose={() => setDeleting(null)}
          size="sm"
        >
          <p className="confirm-text">
            Layanan <strong>{deleting.name}</strong> akan dihapus dari daftar. Pesanan
            lama yang memakai layanan ini tetap tersimpan.
          </p>
          <div className="modal__actions">
            <button
              type="button"
              className="btn btn--table btn--sm"
              onClick={() => setDeleting(null)}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={handleDelete}
              disabled={deleteBusy}
            >
              {deleteBusy ? 'Menghapus…' : 'Ya, hapus'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
