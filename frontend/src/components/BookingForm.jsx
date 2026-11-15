import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { site } from '../config/site';
import { api } from '../lib/api';
import { formatDate, todayJakarta } from '../lib/format';
import { orderWhatsAppUrl } from '../lib/whatsapp';
import Icon from './Icon';

const emptyForm = {
  customerName: '',
  phone: '',
  vehicle: '',
  plateNumber: '',
  serviceId: '',
  preferredDate: '',
  complaint: '',
};

export default function BookingForm({ services, selectedServiceId, selectionKey, loadingServices }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!selectedServiceId) return;
    setForm((current) => ({ ...current, serviceId: String(selectedServiceId) }));
  }, [selectedServiceId, selectionKey]);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.serviceId) {
      setError('Silakan pilih layanan terlebih dahulu.');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.createOrder({
        customerName: form.customerName,
        phone: form.phone,
        serviceId: Number(form.serviceId),
        vehicle: form.vehicle || undefined,
        plateNumber: form.plateNumber || undefined,
        preferredDate: form.preferredDate || undefined,
        complaint: form.complaint || undefined,
      });
      setOrder(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  if (order) {
    return (
      <div className="booking-card booking-success">
        <span className="booking-success__icon">
          <Icon name="check" size={26} />
        </span>
        <p className="eyebrow eyebrow--ink">Pesanan tercatat</p>
        <h3>Terima kasih, {order.customerName.split(' ')[0]}!</h3>
        <p>
          Pesanan Anda sudah masuk ke dashboard bengkel. Satu langkah lagi:
          konfirmasi jadwal lewat WhatsApp agar kami siapkan mekaniknya.
        </p>

        <div className="booking-success__code">
          <span>Kode booking</span>
          <strong>{order.code}</strong>
        </div>

        <dl className="booking-success__detail">
          <div>
            <dt>Layanan</dt>
            <dd>{order.serviceName}</dd>
          </div>
          <div>
            <dt>Rencana datang</dt>
            <dd>{formatDate(order.preferredDate)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>Menunggu konfirmasi bengkel</dd>
          </div>
        </dl>

        <a
          className="btn btn--primary btn--block"
          href={orderWhatsAppUrl(order)}
          target="_blank"
          rel="noreferrer"
        >
          <Icon name="whatsapp" size={19} />
          Lanjutkan ke WhatsApp
        </a>
        <p className="booking-success__note">
          Simpan kode booking ini untuk melihat status pesanan. Belum bisa membuka
          WhatsApp? Hubungi kami di {site.phoneDisplay} dan sebutkan kode di atas.
        </p>

        <Link
          className="btn btn--ghost btn--sm"
          to={`/cek-booking?kode=${encodeURIComponent(order.code)}`}
        >
          <Icon name="search" size={16} />
          Cek status booking
        </Link>

        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => {
            setOrder(null);
            setForm({ ...emptyForm, serviceId: selectedServiceId ? String(selectedServiceId) : '' });
          }}
        >
          Buat pesanan lain
        </button>
      </div>
    );
  }

  return (
    <form className="booking-card booking-form" onSubmit={handleSubmit}>
      <div className="booking-form__head">
        <h3>Form booking servis</h3>
        <span className="chip chip--outline">Gratis · tanpa DP</span>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Nama lengkap <em>*</em></span>
          <input
            type="text"
            name="customerName"
            value={form.customerName}
            onChange={update}
            placeholder="Nama Anda"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
          />
        </label>

        <label className="field">
          <span>Nomor WhatsApp <em>*</em></span>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={update}
            placeholder="0812 3456 7890"
            autoComplete="tel"
            inputMode="tel"
            minLength={9}
            maxLength={25}
            required
          />
        </label>

        <label className="field">
          <span>Jenis motor</span>
          <input
            type="text"
            name="vehicle"
            value={form.vehicle}
            onChange={update}
            placeholder="Honda Vario 160"
            maxLength={100}
          />
        </label>

        <label className="field">
          <span>Nomor polisi</span>
          <input
            type="text"
            name="plateNumber"
            value={form.plateNumber}
            onChange={update}
            placeholder="D 1234 ABC"
            maxLength={20}
          />
        </label>

        <label className="field field--full">
          <span>Layanan <em>*</em></span>
          <div className="select-wrap">
            <select
              name="serviceId"
              value={form.serviceId}
              onChange={update}
              required
              disabled={loadingServices}
            >
              <option value="">
                {loadingServices ? 'Memuat layanan…' : 'Pilih layanan yang dibutuhkan'}
              </option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} — mulai Rp {service.price.toLocaleString('id-ID')}
                </option>
              ))}
            </select>
            <Icon name="chevron-right" size={16} className="select-wrap__chevron" />
          </div>
        </label>

        <label className="field field--full">
          <span>Rencana kedatangan</span>
          <input
            type="date"
            name="preferredDate"
            value={form.preferredDate}
            onChange={update}
            min={todayJakarta()}
          />
          <small>Kosongkan jika ingin datang hari ini atau menyesuaikan jadwal.</small>
        </label>

        <label className="field field--full">
          <span>Keluhan atau catatan</span>
          <textarea
            name="complaint"
            value={form.complaint}
            onChange={update}
            placeholder="Contoh: suara mesin kasar saat digas, rem belakang kurang pakem…"
            rows={3}
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

      <button type="submit" className="btn btn--primary btn--block" disabled={saving}>
        {saving ? 'Mengirim pesanan…' : 'Buat pesanan & chat WhatsApp'}
        {!saving && <Icon name="arrow-right" size={17} />}
      </button>

      <p className="booking-form__note">
        Dengan mengirim form ini, data booking masuk ke dashboard bengkel dan Anda
        diarahkan ke WhatsApp untuk konfirmasi. Tidak ada pembayaran di muka.
      </p>
    </form>
  );
}
