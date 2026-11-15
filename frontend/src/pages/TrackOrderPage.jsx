import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import Logo from '../components/Logo';
import StatusBadge from '../components/admin/StatusBadge';
import { site, whatsappLink } from '../config/site';
import { api } from '../lib/api';
import { formatDate, formatDateTime } from '../lib/format';

const FLOW = [
  {
    key: 'PENDING',
    label: 'Booking masuk',
    hint: 'Menunggu pengecekan dari bengkel.',
  },
  {
    key: 'CONFIRMED',
    label: 'Dikonfirmasi',
    hint: 'Jadwal kedatangan sudah disetujui.',
  },
  {
    key: 'IN_PROGRESS',
    label: 'Dikerjakan',
    hint: 'Motor sedang ditangani mekanik.',
  },
  {
    key: 'COMPLETED',
    label: 'Selesai',
    hint: 'Motor sudah siap diambil.',
  },
];

function parseCode(value) {
  const compact = String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  const match = /^AJM(\d{6})([A-Z0-9]{4})$/.exec(compact);
  return match ? `AJM-${match[1]}-${match[2]}` : null;
}

export default function TrackOrderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = useRef(searchParams.get('kode') || '');
  const autoLookupDone = useRef(false);

  const [code, setCode] = useState(initialCode.current.toUpperCase());
  const [state, setState] = useState('idle');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const lookup = useCallback(async (rawCode) => {
    setState('loading');
    setError('');
    setOrder(null);

    try {
      const { data } = await api.trackOrder(rawCode);
      setOrder(data);
      setState('ready');
    } catch (requestError) {
      setError(requestError.message);
      setState('error');
    }
  }, []);

  useEffect(() => {
    if (autoLookupDone.current) return;
    autoLookupDone.current = true;

    const parsed = parseCode(initialCode.current);
    if (parsed) lookup(parsed);
  }, [lookup]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (state === 'loading') return;

    const parsed = parseCode(code);
    if (!parsed) {
      setOrder(null);
      setState('error');
      setError('Kode booking belum lengkap. Formatnya AJM-YYMMDD-XXXX, contoh AJM-261115-AB12.');
      return;
    }

    setCode(parsed);
    setSearchParams({ kode: parsed }, { replace: true });
    lookup(parsed);
  };

  const currentIndex = order ? FLOW.findIndex((step) => step.key === order.status) : -1;
  const isCancelled = order?.status === 'CANCELLED';
  const isCompleted = order?.status === 'COMPLETED';

  return (
    <div className="track-page">
      <header className="track-topbar">
        <div className="container track-topbar__inner">
          <Link to="/" className="navbar__brand" aria-label={`${site.name} — beranda`}>
            <Logo />
          </Link>
          <Link to="/" className="track-back">
            <Icon name="chevron-left" size={15} />
            Beranda
          </Link>
        </div>
      </header>

      <main className="track-main">
        <div className="container track-shell">
          <div className="track-head">
            <p className="eyebrow">
              <span className="eyebrow__line" />
              Status booking
            </p>
            <h1 className="display">
              Cek status <span>booking.</span>
            </h1>
            <p>
              Masukkan kode booking yang Anda terima setelah mengisi form, lalu
              lihat perkembangan pesanan tanpa perlu menghubungi bengkel.
            </p>
          </div>

          <form className="track-search" onSubmit={handleSubmit}>
            <div className="track-search__row">
              <label className="field field--dark track-search__field">
                <span>Kode booking</span>
                <input
                  type="text"
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value.toUpperCase());
                    if (error) setError('');
                    if (state === 'error') setState('idle');
                  }}
                  placeholder="AJM-261115-AB12"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={20}
                  required
                  aria-describedby="track-hint"
                />
              </label>
              <button
                type="submit"
                className="btn btn--primary track-search__submit"
                disabled={state === 'loading'}
              >
                {state === 'loading' ? 'Mencari…' : 'Cek status'}
                {state !== 'loading' && <Icon name="search" size={17} />}
              </button>
            </div>
            <p className="track-search__hint" id="track-hint">
              Kode ada di halaman konfirmasi booking dan pesan WhatsApp Anda,
              contoh <span className="mono">AJM-261115-AB12</span>. Tidak menemukan
              kode?{' '}
              <a
                href={whatsappLink(
                  'Halo Atep Jaya Motor, saya ingin menanyakan status booking saya.',
                )}
                target="_blank"
                rel="noreferrer"
              >
                Hubungi bengkel
              </a>
              .
            </p>
          </form>

          {state === 'loading' && (
            <div className="track-state track-state--loading" role="status" aria-live="polite">
              <span className="track-state__icon">
                <Icon name="clock" size={20} />
              </span>
              <div>
                <strong>Mencari pesanan…</strong>
                <p>Mohon tunggu sebentar.</p>
              </div>
            </div>
          )}

          {state === 'error' && (
            <div className="track-state track-state--error" role="alert">
              <span className="track-state__icon">
                <Icon name="alert" size={20} />
              </span>
              <div>
                <strong>Belum bisa menampilkan pesanan</strong>
                <p>
                  {error} Pastikan kode sesuai. Jika masih bermasalah,{' '}
                  <a
                    href={whatsappLink(
                      'Halo Atep Jaya Motor, saya ingin menanyakan status booking saya.',
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    chat bengkel
                  </a>
                  .
                </p>
              </div>
            </div>
          )}

          {state === 'ready' && order && (
            <section className="track-result" aria-live="polite">
              <div className="track-result__head">
                <div className="track-result__code">
                  <span>Kode booking</span>
                  <strong>{order.code}</strong>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {isCancelled ? (
                <div className="track-cancelled">
                  <Icon name="alert" size={19} />
                  <div>
                    <strong>Booking dibatalkan</strong>
                    <p>
                      Hubungi bengkel lewat WhatsApp jika ingin menjadwalkan ulang.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="track-timeline">
                  {FLOW.map((step, index) => {
                    const done = isCompleted || index < currentIndex;
                    const current = !isCompleted && index === currentIndex;
                    const className = [
                      'track-step',
                      done ? 'is-done' : '',
                      current ? 'is-current' : '',
                      !done && !current ? 'is-future' : '',
                    ]
                      .filter(Boolean)
                      .join(' ');

                    return (
                      <div className={className} key={step.key}>
                        <span className="track-step__dot">
                          {done ? <Icon name="check" size={11} /> : index + 1}
                        </span>
                        <strong>{step.label}</strong>
                        <p>{step.hint}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              <dl className="track-details">
                <div>
                  <dt>Nama</dt>
                  <dd>{order.customerName}</dd>
                </div>
                <div>
                  <dt>Layanan</dt>
                  <dd>{order.serviceName}</dd>
                </div>
                <div>
                  <dt>Motor</dt>
                  <dd>
                    {[order.vehicle, order.plateNumber].filter(Boolean).join(' · ') || '—'}
                  </dd>
                </div>
                <div>
                  <dt>Rencana datang</dt>
                  <dd>{formatDate(order.preferredDate)}</dd>
                </div>
                <div>
                  <dt>Booking dibuat</dt>
                  <dd>{formatDateTime(order.createdAt)}</dd>
                </div>
                <div>
                  <dt>Terakhir diperbarui</dt>
                  <dd>{formatDateTime(order.updatedAt)}</dd>
                </div>
              </dl>

              <div className="track-result__actions">
                <a
                  className="btn btn--primary btn--sm"
                  href={whatsappLink(
                    `Halo ${site.name}, saya ingin menanyakan status booking ${order.code} untuk layanan ${order.serviceName}.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="whatsapp" size={17} />
                  Tanya status via WA
                </a>
                <a className="btn btn--ghost btn--sm" href="/#booking">
                  Booking servis lagi
                  <Icon name="arrow-right" size={16} />
                </a>
              </div>

              <p className="track-privacy">
                Halaman ini hanya menampilkan ringkasan booking. Nomor WhatsApp dan
                catatan internal bengkel tidak ditampilkan.
              </p>
            </section>
          )}
        </div>
      </main>

      <a
        className="wa-float"
        href={whatsappLink()}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat WhatsApp Atep Jaya Motor"
      >
        <Icon name="whatsapp" size={26} />
      </a>

      <Footer />
    </div>
  );
}
