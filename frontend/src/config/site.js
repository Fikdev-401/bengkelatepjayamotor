/**
 * Ganti data di bawah ini sesuai bengkel.
 * Nomor WhatsApp sebaiknya juga diatur lewat VITE_SHOP_WHATSAPP pada file .env.
 */
const whatsapp = (import.meta.env.VITE_SHOP_WHATSAPP || '6281234567890').replace(/\D/g, '');
const localPhone = whatsapp.startsWith('62') ? `0${whatsapp.slice(2)}` : whatsapp;
const address = 'Jl. Raya Cileunyi No. 88, Cileunyi, Kabupaten Bandung, Jawa Barat';

export const site = {
  name: 'Atep Jaya Motor',
  shortName: 'AJM',
  tagline: 'Bengkel motor keluarga sejak 2009',
  whatsapp,
  phoneDisplay: localPhone.replace(/(\d{4})(?=\d)/g, '$1-'),
  address,
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
  mapsEmbedUrl: `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`,
  email: 'halo@atepjayamotor.com',
  hours: [
    { day: 'Senin – Jumat', time: '08.00 – 17.00' },
    { day: 'Sabtu', time: '08.00 – 16.00' },
    { day: 'Minggu', time: 'Tutup' },
  ],
  stats: {
    years: '17+',
    bikes: '10rb+',
    rating: '4.9',
  },
};

export function whatsappLink(message) {
  const text = message || 'Halo Atep Jaya Motor, saya ingin bertanya tentang servis motor.';
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}
