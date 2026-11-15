import { whatsappLink } from '../config/site';
import { formatDate } from './format';

export function orderWhatsAppUrl(order) {
  const lines = [
    'Halo Atep Jaya Motor, saya sudah booking servis lewat website.',
    '',
    `Kode booking: ${order.code}`,
    `Nama: ${order.customerName}`,
    `No. WhatsApp: ${order.phone}`,
    `Layanan: ${order.serviceName}`,
  ];

  if (order.vehicle || order.plateNumber) {
    const vehicle = [order.vehicle, order.plateNumber ? `(${order.plateNumber})` : '']
      .filter(Boolean)
      .join(' ');
    lines.push(`Motor: ${vehicle}`);
  }

  if (order.preferredDate) {
    lines.push(`Rencana datang: ${formatDate(order.preferredDate)}`);
  }

  if (order.complaint) {
    lines.push(`Keluhan: ${order.complaint}`);
  }

  lines.push('', 'Mohon konfirmasi jadwalnya ya. Terima kasih!');

  return whatsappLink(lines.join('\n'));
}

export function customerWhatsAppUrl(order) {
  const message = `Halo ${order.customerName}, ini Atep Jaya Motor. Kami ingin konfirmasi booking ${order.code} untuk layanan ${order.serviceName}.`;
  return `https://wa.me/${order.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

