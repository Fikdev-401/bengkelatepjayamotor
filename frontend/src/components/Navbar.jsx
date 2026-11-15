import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { site, whatsappLink } from '../config/site';
import Icon from './Icon';
import Logo from './Logo';

const links = [
  { href: '#layanan', label: 'Layanan' },
  { href: '#tentang', label: 'Tentang' },
  { href: '#cara-pesan', label: 'Cara Pesan' },
  { href: '#lokasi', label: 'Kontak' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <a href="#atas" className="navbar__brand" aria-label={`${site.name} — kembali ke atas`}>
          <Logo />
        </a>

        <nav className="navbar__links" aria-label="Navigasi utama">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
          <Link to="/cek-booking">Cek Booking</Link>
        </nav>

        <div className="navbar__actions">
          <a
            className="btn btn--primary btn--sm navbar__cta"
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="whatsapp" size={17} />
            Chat WhatsApp
          </a>

          <button
            type="button"
            className="navbar__toggle"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
          >
            <Icon name={open ? 'x' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      {open && (
        <div className="navbar__mobile" id="mobile-menu">
          <nav aria-label="Navigasi mobile">
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
                <Icon name="arrow-up-right" size={18} />
              </a>
            ))}
            <Link to="/cek-booking" onClick={() => setOpen(false)}>
              Cek status booking
              <Icon name="arrow-up-right" size={18} />
            </Link>
            <a href="#booking" onClick={() => setOpen(false)}>
              Booking servis
              <Icon name="arrow-up-right" size={18} />
            </a>
          </nav>
          <a
            className="btn btn--primary btn--block"
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="whatsapp" size={18} />
            Chat WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}
