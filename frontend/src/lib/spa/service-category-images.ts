import config from "@/content/service-category-images.json";
import type { ServiceCatalogSlug } from "@/lib/spa/service-catalog-slugs";

const STOCK_IMAGES: Partial<Record<ServiceCatalogSlug, string>> = {
  "thai-traditional":
    "https://images.unsplash.com/photo-1544165185-7ab58e377664?auto=format&fit=crop&w=720&q=80",
  aromatherapy:
    "https://images.unsplash.com/photo-1596178060560-4953979766f0?auto=format&fit=crop&w=720&q=80",
  "foot-massage":
    "https://images.unsplash.com/photo-1515377905705-c4789e51d11?auto=format&fit=crop&w=720&q=80",
};

/** ไฟล์ map รูป catalog + carousel (key = service slug) */
export const SERVICE_CATEGORY_IMAGE_CONFIG_PATH =
  "frontend/src/content/service-category-images.json";

/** รายการบริการ (ชื่อ ราคา ระยะเวลา) — seed DB */
export const SERVICE_CATALOG_SEED_PATH = "backend/prisma/seed.ts";

export const SERVICE_CATEGORY_IMAGE_FOLDER =
  "frontend/public/images/services/";

/** รูปตาม slug จาก API (/services) — ใช้ทั้ง carousel และ services-catalog */
export function getServiceImageSrc(slug: string): string | null {
  const record = config as Record<string, string>;
  const raw = record[slug];
  if (typeof raw === "string" && raw.trim()) {
    return raw.trim();
  }

  if (slug in STOCK_IMAGES) {
    return STOCK_IMAGES[slug as ServiceCatalogSlug] ?? null;
  }

  return null;
}

/** @deprecated ใช้ getServiceImageSrc(slug) */
export function getServiceCategoryImageSrc(slug: string): string | null {
  return getServiceImageSrc(slug);
}
