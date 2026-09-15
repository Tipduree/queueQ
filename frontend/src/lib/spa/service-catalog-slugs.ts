/**
 * Slug บริการใน catalog (sidebar / จองคิว) — ต้องตรงกับ backend/prisma/seed.ts
 * รูปแต่ละ slug: src/content/service-category-images.json
 */

export const SERVICE_CATALOG_SLUGS = [
  "thai-traditional",
  "aromatherapy",
  "herbal-scrub",
  "hot-stone",
  "prenatal",
  "foot-massage",
] as const;

export type ServiceCatalogSlug = (typeof SERVICE_CATALOG_SLUGS)[number];
