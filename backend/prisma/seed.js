import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const services = [
  {
    name: 'Servis Rutin',
    slug: 'servis-rutin',
    category: 'Servis',
    description:
      'Pemeriksaan menyeluruh mesin, rem, ban, kelistrikan, dan oli. Cocok untuk servis berkala supaya motor selalu dalam kondisi prima.',
    price: 65000,
    duration: '45–60 menit',
    icon: 'wrench',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    name: 'Ganti Oli Mesin',
    slug: 'ganti-oli-mesin',
    category: 'Perawatan',
    description:
      'Penggantian oli mesin dengan pilihan oli berkualitas, termasuk pengecekan filter dan tekanan angin ban.',
    price: 55000,
    duration: '20–30 menit',
    icon: 'oil',
    isFeatured: true,
    sortOrder: 2,
  },
  {
    name: 'Tune Up Mesin',
    slug: 'tune-up-mesin',
    category: 'Mesin',
    description:
      'Bersihkan karburator atau injektor, setel klep, ganti busi, dan optimalkan tenaga mesin agar tarikan kembali responsif.',
    price: 125000,
    duration: '60–90 menit',
    icon: 'engine',
    isFeatured: true,
    sortOrder: 3,
  },
  {
    name: 'Servis CVT Matic',
    slug: 'servis-cvt-matic',
    category: 'Mesin',
    description:
      'Bongkar-bersih CVT, cek roller, v-belt, dan kampas ganda. Mengatasi motor matic bergetar dan suara kasar.',
    price: 95000,
    duration: '45–60 menit',
    icon: 'gear',
    isFeatured: false,
    sortOrder: 4,
  },
  {
    name: 'Servis Rem & Cakram',
    slug: 'servis-rem-cakram',
    category: 'Rem',
    description:
      'Pengecekan sistem rem depan dan belakang, penggantian kampas, serta bleeding rem agar pengereman lebih pakem.',
    price: 75000,
    duration: '30–45 menit',
    icon: 'brake',
    isFeatured: false,
    sortOrder: 5,
  },
  {
    name: 'Ganti Ban & Tambal',
    slug: 'ganti-ban-tambal',
    category: 'Ban & Roda',
    description:
      'Pemasangan ban baru atau tambal tubeless, dilanjutkan balancing dan pengecekan tekanan angin.',
    price: 30000,
    duration: '20–40 menit',
    icon: 'tire',
    isFeatured: false,
    sortOrder: 6,
  },
  {
    name: 'Aki & Kelistrikan',
    slug: 'aki-kelistrikan',
    category: 'Kelistrikan',
    description:
      'Cek pengisian aki, penggantian aki baru, serta perbaikan lampu, klakson, dan kabel kelistrikan.',
    price: 50000,
    duration: '30 menit',
    icon: 'battery',
    isFeatured: false,
    sortOrder: 7,
  },
  {
    name: 'Cuci Motor & Detailing',
    slug: 'cuci-motor-detailing',
    category: 'Perawatan',
    description:
      'Cuci motor menyeluruh sampai bagian tersembunyi, dikeringkan, lalu diberi wax agar bodi lebih mengkilap.',
    price: 25000,
    duration: '30 menit',
    icon: 'wash',
    isFeatured: false,
    sortOrder: 8,
  },
];

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@atepjayamotor.com').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin12345';
  const name = process.env.SEED_ADMIN_NAME || 'Admin Atep Jaya';

  await prisma.user.upsert({
    where: { email },
    update: { name },
    create: {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: 'ADMIN',
    },
  });

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  console.log(`[seed] Admin siap: ${email}`);
  console.log(`[seed] ${services.length} layanan siap digunakan.`);
}

main()
  .catch((error) => {
    console.error('[seed] Gagal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
