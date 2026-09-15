import type { ServiceCatalogSlug } from "@/lib/spa/service-catalog-slugs";

export type ServiceCarouselItem = {
  /** slug ตรง catalog (API) + key รูปใน service-category-images.json */
  slug: ServiceCatalogSlug;
  nameKey: string;
  tint1: string;
  tint2: string;
};

/** ลำดับ carousel หน้าแรก */
export const SERVICE_CAROUSEL_ITEMS: ServiceCarouselItem[] = [
  {
    slug: "thai-traditional",
    nameKey: "svc.thai-massage",
    tint1: "#FDF6EC",
    tint2: "#E8C9A8",
  },
  {
    slug: "aromatherapy",
    nameKey: "svc.aroma-oil",
    tint1: "#FAF0E4",
    tint2: "#DFC19A",
  },
  {
    slug: "foot-massage",
    nameKey: "svc.foot-massage",
    tint1: "#FFF8EE",
    tint2: "#D4A373",
  },
  {
    slug: "hot-stone",
    nameKey: "svc.hot-stone",
    tint1: "#F5E6D3",
    tint2: "#C49363",
  },
];
