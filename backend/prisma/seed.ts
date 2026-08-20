import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const services = [
  {
    slug: 'thai-traditional',
    nameKey: 'pc1n',
    durationMin: 60,
    price: 450,
    categoryKey: 'c1n',
    tint1: '#E4D9BC',
    tint2: '#C9BB92',
  },
  {
    slug: 'aromatherapy',
    nameKey: 'pc2n',
    durationMin: 90,
    price: 650,
    categoryKey: 'c2n',
    tint1: '#DFD3B6',
    tint2: '#BDAD82',
  },
  {
    slug: 'herbal-scrub',
    nameKey: 'pc3n',
    durationMin: 120,
    price: 1200,
    categoryKey: 'c4n',
    tint1: '#E7DCC0',
    tint2: '#CDBE93',
  },
  {
    slug: 'hot-stone',
    nameKey: 'pc4n',
    durationMin: 90,
    price: 850,
    categoryKey: 'c1n',
    tint1: '#DAD0AE',
    tint2: '#B8A87A',
  },
  {
    slug: 'prenatal',
    nameKey: 'pc5n',
    durationMin: 60,
    price: 700,
    categoryKey: 'c1n',
    tint1: '#EAE0C4',
    tint2: '#D2C398',
  },
  {
    slug: 'foot-massage',
    nameKey: 'queue.svc.foot',
    durationMin: 45,
    price: 350,
    categoryKey: 'c3n',
    tint1: '#E0D5B8',
    tint2: '#C4B48A',
  },
];

async function main() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  console.log(`Seeded ${services.length} services`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
