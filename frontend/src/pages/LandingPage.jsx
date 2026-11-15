import { useCallback, useEffect, useRef, useState } from 'react';
import BookingForm from '../components/BookingForm';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import Navbar from '../components/Navbar';
import ServiceCard from '../components/ServiceCard';
import { site, whatsappLink } from '../config/site';
import { api } from '../lib/api';

const marqueeItems = [
  'Servis rutin',
  'Tune up mesin',
  'Ganti oli',
  'Servis CVT',
  'Rem & cakram',
  'Kelistrikan',
  'Ganti ban',
  'Cuci detailing',
];

const advantages = [
  {
    icon: 'gauge',
    title: 'Mekanik berpengalaman',
    text: 'Ditangani langsung oleh mekanik yang sudah bertahun-tahun menangani motor harian, matic, dan bebek.',
  },
  {
    icon: 'tag',
    title: 'Harga jujur',
    text: 'Estimasi biaya disampaikan sebelum pengerjaan. Tidak ada tambahan yang tidak Anda setujui.',
  },
  {
    icon: 'shield',
    title: 'Garansi pengerjaan',
    text: 'Kalau ada yang belum beres setelah servis, bawa kembali dan kami cek ulang tanpa biaya.',
  },
  {
    icon: 'clock',
    title: 'Tepat waktu',
    text: 'Antrean terjadwal lewat WhatsApp, jadi Anda tidak perlu menunggu lama di bengkel.',
  },
];

const steps = [
  {
    title: 'Pilih layanan',
    text: 'Lihat daftar layanan dan estimasi harganya. Belum yakin? Tanyakan lewat WhatsApp.',
  },
  {
    title: 'Isi form booking',
    text: 'Lengkapi nama, nomor WhatsApp, motor, dan keluhan. Cukup satu menit.',
  },
  {
    title: 'Konfirmasi via WA',
    text: 'Pesan WhatsApp otomatis terbuka dengan kode booking. Kirim, lalu kami konfirmasi jadwal.',
  },
  {
    title: 'Datang & servis',
    text: 'Bawa motor sesuai jadwal. Duduk santai, motor kami rawat sampai selesai.',
  },
];

const testimonials = [
  {
    name: 'Rizky Hidayat',
    vehicle: 'Honda Vario 160',
    text: 'Servis CVT di sini hasilnya beda, motor jadi halus lagi. Harganya juga dijelaskan detail dari awal, tidak ada biaya kejutan.',
  },
  {
    name: 'Dewi Anggraini',
    vehicle: 'Yamaha Mio',
    text: 'Booking lewat WhatsApp pagi, sore sudah bisa datang. Mekaniknya ramah dan mau menjelaskan bagian mana yang memang perlu diganti.',
  },
  {
    name: 'Pak Yusuf',
    vehicle: 'Honda Supra X',
    text: 'Sudah langganan sejak lama. Motor tua saya tetap jalan enak karena servisnya rutin dan teliti. Recommended.',
  },
];

export default function LandingPage() {
  const [services, setServices] = useState([]);
  const [servicesStatus, setServicesStatus] = useState('loading');
  const [servicesError, setServicesError] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectionKey, setSelectionKey] = useState(0);
  const bookingRef = useRef(null);

  const loadServices = useCallback(async () => {
    setServicesStatus('loading');
    setServicesError('');
    try {
      const { data } = await api.getServices();
      setServices(data);
      setServicesStatus('ready');
    } catch (error) {
      setServicesStatus('error');
      setServicesError(error.message);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleBook = (service) => {
    setSelectedServiceId(String(service.id));
    setSelectionKey((key) => key + 1);
    bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="site" id="atas">
      <Navbar />

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="container hero__inner">
            <div className="hero__copy">
              <p className="eyebrow">
                <span className="eyebrow__dot" />
                {site.tagline} · Bandung
              </p>

              <h1 className="hero__title">
                Motor sehat,
                <br />
                jalan <span>tenang.</span>
              </h1>

              <p className="hero__lead">
                Dari ganti oli sampai turun mesin, Atep Jaya Motor merawat motor
                Anda dengan tangan mekanik berpengalaman. Harga jujur, hasil rapi,
                dan antrean yang bisa dipesan dari rumah.
              </p>

              <div className="hero__actions">
                <a
                  className="btn btn--primary"
                  href={whatsappLink()}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="whatsapp" size={19} />
                  Chat WhatsApp
                </a>
                <a className="btn btn--ghost" href="#booking">
                  Booking servis
                  <Icon name="arrow-right" size={18} />
                </a>
              </div>

              <ul className="hero__proof">
                <li>
                  <strong>{site.stats.years}</strong>
                  <span>tahun melayani</span>
                </li>
                <li>
                  <strong>{site.stats.bikes}</strong>
                  <span>motor ditangani</span>
                </li>
                <li>
                  <strong>{site.stats.rating}</strong>
                  <span>penilaian pelanggan</span>
                </li>
              </ul>
            </div>

            <div className="hero__visual">
              <div className="hero__ring" aria-hidden="true" />
              <div className="ticket">
                <div className="ticket__head">
                  <span>Kartu servis</span>
                  <span className="ticket__brand">AJM</span>
                </div>
                <h2 className="ticket__title">Servis Rutin</h2>
                <p className="ticket__sub">
                  Pemeriksaan menyeluruh · injeksi &amp; karburator
                </p>

                <ul className="ticket__list">
                  <li>
                    <span>Oli &amp; filter</span>
                    <span className="ticket__check">✓</span>
                  </li>
                  <li>
                    <span>Rem &amp; ban</span>
                    <span className="ticket__check">✓</span>
                  </li>
                  <li>
                    <span>Kelistrikan</span>
                    <span className="ticket__check">✓</span>
                  </li>
                </ul>

                <div className="ticket__total">
                  <span>Mulai dari</span>
                  <strong>Rp 65.000</strong>
                </div>

                <div className="ticket__barcode" aria-hidden="true" />
                <div className="ticket__foot">
                  <span>ATEP JAYA MOTOR</span>
                  <span>SEJAK 2009</span>
                </div>
              </div>

              <div className="hero__stamp">
                <span>Buka</span>
                <strong>08.00</strong>
                <span>Senin–Sabtu</span>
              </div>

              <div className="hero__note">
                <Icon name="shield" size={20} />
                <div>
                  <strong>Garansi pengerjaan</strong>
                  <span>Belum puas? Kami cek ulang.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee__track">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span key={`${item}-${index}`}>
                {item}
                <i>✳</i>
              </span>
            ))}
          </div>
        </div>

        {/* LAYANAN */}
        <section className="section services" id="layanan">
          <div className="container">
            <div className="section__head">
              <div>
                <p className="eyebrow">
                  <span className="eyebrow__line" />
                  Layanan bengkel
                </p>
                <h2 className="display">
                  Semua yang motor
                  <br />
                  Anda butuhkan
                </h2>
              </div>
              <p className="section__lead">
                Perawatan rutin sampai perbaikan mesin. Pilih layanannya, lalu
                booking langsung — tanpa perlu telepon bolak-balik.
              </p>
            </div>

            {servicesStatus === 'loading' && (
              <div className="service-grid">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div className="service-card service-card--skeleton" key={index}>
                    <div className="skeleton skeleton--icon" />
                    <div className="skeleton skeleton--title" />
                    <div className="skeleton skeleton--line" />
                    <div className="skeleton skeleton--line short" />
                    <div className="skeleton skeleton--foot" />
                  </div>
                ))}
              </div>
            )}

            {servicesStatus === 'error' && (
              <div className="notice">
                <Icon name="alert" size={22} />
                <div>
                  <strong>Daftar layanan belum bisa dimuat.</strong>
                  <p>{servicesError}</p>
                </div>
                <button type="button" className="btn btn--outline btn--sm" onClick={loadServices}>
                  Coba lagi
                </button>
              </div>
            )}

            {servicesStatus === 'ready' && (
              <>
                <div className="service-grid">
                  {services.map((service) => (
                    <ServiceCard key={service.id} service={service} onBook={handleBook} />
                  ))}
                </div>
                <p className="services__note">
                  Harga di atas adalah estimasi awal dan dapat berbeda sesuai kondisi
                  motor. Punya pertanyaan?{' '}
                  <a href={whatsappLink()} target="_blank" rel="noreferrer">
                    Tanya lewat WhatsApp
                  </a>
                  .
                </p>
              </>
            )}
          </div>
        </section>

        {/* TENTANG */}
        <section className="about" id="tentang">
          <div className="container about__grid">
            <div className="about__copy">
              <p className="eyebrow eyebrow--ink">
                <span className="eyebrow__line" />
                Tentang kami
              </p>
              <h2 className="display display--ink">
                Bengkel keluarga,
                <br />
                perhatian yang tulus.
              </h2>
              <p>
                Atep Jaya Motor berawal dari bengkel kecil di pinggir jalan dengan
                satu prinsip sederhana: motor pelanggan harus keluar bengkel dalam
                kondisi lebih baik, bukan sekadar tagihan yang lebih besar.
              </p>
              <p>
                Sampai hari ini, prinsip itu tidak berubah. Kami mencatat setiap
                servis, menjelaskan bagian yang perlu diganti, dan memberi tahu
                mana yang masih bisa dipakai.
              </p>

              <ul className="about__list">
                <li>
                  <Icon name="check" size={16} />
                  Mekanik yang menangani langsung, bukan sekadar penerima order
                </li>
                <li>
                  <Icon name="check" size={16} />
                  Estimasi biaya transparan sebelum motor dikerjakan
                </li>
                <li>
                  <Icon name="check" size={16} />
                  Sparepart pilihan dengan garansi pemasangan
                </li>
              </ul>

              <a className="btn btn--dark" href="#booking">
                Booking servis sekarang
                <Icon name="arrow-right" size={18} />
              </a>
            </div>

            <div className="about__panel">
              <div className="about__panel-head">
                <span className="about__tag">
                  <span className="eyebrow__dot" />
                  Buka hari ini
                </span>
                <h3>Jam operasional</h3>
                <ul className="hours">
                  {site.hours.map((item) => (
                    <li key={item.day}>
                      <span>{item.day}</span>
                      <strong className={item.time === 'Tutup' ? 'is-closed' : ''}>
                        {item.time}
                      </strong>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="about__panel-body">
                <div className="about__location">
                  <Icon name="map-pin" size={20} />
                  <div>
                    <strong>Lokasi bengkel</strong>
                    <p>{site.address}</p>
                  </div>
                </div>

                <div className="about__years">
                  <strong>{site.stats.years}</strong>
                  <span>tahun merawat motor pelanggan</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KEUNGGULAN */}
        <section className="section advantages">
          <div className="container">
            <div className="section__head section__head--center">
              <div>
                <p className="eyebrow">
                  <span className="eyebrow__line" />
                  Kenapa Atep Jaya
                </p>
                <h2 className="display">Alasan pelanggan kembali</h2>
              </div>
              <p className="section__lead">
                Bukan karena promo. Karena motor mereka benar-benar terasa lebih
                baik setelah diservis di sini.
              </p>
            </div>

            <div className="advantage-grid">
              {advantages.map((item, index) => (
                <article className="advantage" key={item.title}>
                  <div className="advantage__top">
                    <span className="advantage__icon">
                      <Icon name={item.icon} size={24} />
                    </span>
                    <span className="advantage__num">0{index + 1}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CARA PESAN */}
        <section className="section steps" id="cara-pesan">
          <div className="container">
            <div className="section__head">
              <div>
                <p className="eyebrow">
                  <span className="eyebrow__line" />
                  Cara pesan
                </p>
                <h2 className="display">
                  Empat langkah,
                  <br />
                  antrean siap.
                </h2>
              </div>
              <p className="section__lead">
                Tidak perlu aplikasi tambahan. Semua booking diteruskan ke WhatsApp
                bengkel agar bisa langsung dikonfirmasi.
              </p>
            </div>

            <ol className="steps__grid">
              {steps.map((item, index) => (
                <li className="step" key={item.title}>
                  <span className="step__num">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* TESTIMONI */}
        <section className="section testimonials">
          <div className="container">
            <div className="section__head">
              <div>
                <p className="eyebrow">
                  <span className="eyebrow__line" />
                  Kata pelanggan
                </p>
                <h2 className="display">Sudah mereka rasakan</h2>
              </div>
              <div className="testimonials__rating">
                <div className="stars" aria-label="Rating 4.9 dari 5">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <Icon key={index} name="star" size={18} />
                  ))}
                </div>
                <span>4.9 / 5 dari pelanggan setia</span>
              </div>
            </div>

            <div className="testimonial-grid">
              {testimonials.map((item) => (
                <figure className="testimonial" key={item.name}>
                  <div className="stars">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <Icon key={index} name="star" size={15} />
                    ))}
                  </div>
                  <blockquote>“{item.text}”</blockquote>
                  <figcaption>
                    <span className="testimonial__avatar">{item.name.charAt(0)}</span>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.vehicle}</span>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* BOOKING */}
        <section className="booking" id="booking" ref={bookingRef}>
          <div className="container booking__grid">
            <div className="booking__copy">
              <p className="eyebrow eyebrow--ink">
                <span className="eyebrow__line" />
                Booking cepat
              </p>
              <h2 className="display display--ink">
                Ambil antrean
                <br />
                dari rumah.
              </h2>
              <p>
                Isi form, pesanan langsung masuk ke dashboard bengkel. Setelah itu
                Anda diarahkan ke WhatsApp untuk mengonfirmasi jadwal dengan
                mekanik kami.
              </p>

              <ul className="booking__perks">
                <li>
                  <Icon name="check" size={15} /> Tanpa biaya pendaftaran
                </li>
                <li>
                  <Icon name="check" size={15} /> Tidak perlu bayar di muka
                </li>
                <li>
                  <Icon name="check" size={15} /> Bisa reschedule lewat WhatsApp
                </li>
              </ul>

              <div className="booking__wa">
                <span className="booking__wa-icon">
                  <Icon name="whatsapp" size={22} />
                </span>
                <div>
                  <strong>Mau langsung chat?</strong>
                  <p>Tim kami siap bantu pilih layanan yang tepat.</p>
                </div>
                <a
                  className="btn btn--primary btn--sm"
                  href={whatsappLink()}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              </div>

              <div className="booking__hours">
                <Icon name="clock" size={18} />
                <span>
                  Senin–Jumat 08.00–17.00 · Sabtu 08.00–16.00 · Minggu tutup
                </span>
              </div>
            </div>

            <BookingForm
              services={services}
              selectedServiceId={selectedServiceId}
              selectionKey={selectionKey}
              loadingServices={servicesStatus === 'loading'}
            />
          </div>
        </section>

        {/* KONTAK */}
        <section className="contact" id="lokasi">
          <div className="container contact__grid">
            <div>
              <p className="eyebrow">
                <span className="eyebrow__line" />
                Kunjungi bengkel
              </p>
              <h2 className="display">Mampir, kami tengok dulu.</h2>
              <p className="contact__lead">
                Belum yakin perlu servis apa? Datang saja. Kami cek kondisi motor
                Anda, jelaskan temuannya, lalu Anda yang memutuskan.
              </p>

              <ul className="contact__list">
                <li>
                  <span className="contact__icon">
                    <Icon name="map-pin" size={19} />
                  </span>
                  <div>
                    <strong>Alamat</strong>
                    <a href={site.mapsUrl} target="_blank" rel="noreferrer">
                      {site.address}
                    </a>
                  </div>
                </li>
                <li>
                  <span className="contact__icon">
                    <Icon name="whatsapp" size={19} />
                  </span>
                  <div>
                    <strong>WhatsApp / telepon</strong>
                    <a href={whatsappLink()} target="_blank" rel="noreferrer">
                      {site.phoneDisplay}
                    </a>
                  </div>
                </li>
                <li>
                  <span className="contact__icon">
                    <Icon name="clock" size={19} />
                  </span>
                  <div>
                    <strong>Jam buka</strong>
                    <p>Senin–Jumat 08.00–17.00 · Sabtu 08.00–16.00</p>
                  </div>
                </li>
              </ul>

              <div className="contact__actions">
                <a
                  className="btn btn--primary"
                  href={whatsappLink('Halo Atep Jaya Motor, saya ingin bertanya soal servis.')}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="whatsapp" size={18} />
                  Chat bengkel
                </a>
                <a className="btn btn--ghost" href={site.mapsUrl} target="_blank" rel="noreferrer">
                  Buka di Maps
                  <Icon name="arrow-up-right" size={17} />
                </a>
              </div>
            </div>

            <div className="contact__map">
              <iframe
                title={`Lokasi ${site.name}`}
                src={site.mapsEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </section>
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
