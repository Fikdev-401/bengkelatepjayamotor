import { Link } from 'react-router-dom';
import { site, whatsappLink } from '../config/site';
import Icon from './Icon';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo />
          <p>
            {site.tagline}. Kami bantu jaga motor Anda tetap sehat, aman, dan nyaman
            dipakai setiap hari.
          </p>
          <a
            className="footer__wa"
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="whatsapp" size={18} />
            {site.phoneDisplay}
          </a>
        </div>

        <div className="footer__col">
          <h4>Layanan</h4>
          <a href="/#layanan">Servis rutin</a>
          <a href="/#layanan">Tune up mesin</a>
          <a href="/#layanan">Servis CVT</a>
          <a href="/#layanan">Rem &amp; kelistrikan</a>
        </div>

        <div className="footer__col">
          <h4>Informasi</h4>
          <a href="/#tentang">Tentang bengkel</a>
          <a href="/#cara-pesan">Cara pesan</a>
          <a href="/#booking">Booking servis</a>
          <Link to="/cek-booking">Cek status booking</Link>
          <a href="/#lokasi">Lokasi &amp; jam buka</a>
        </div>

        <div className="footer__col">
          <h4>Kunjungi</h4>
          <p>{site.address}</p>
          <p>
            Senin–Jumat 08.00–17.00
            <br />
            Sabtu 08.00–16.00
          </p>
          <Link className="footer__admin" to="/admin/login">
            Login admin
          </Link>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>© {new Date().getFullYear()} {site.name}. Semua hak dilindungi.</p>
        <p>Dibuat dengan sepenuh hati untuk motor Anda.</p>
      </div>
    </footer>
  );
}
