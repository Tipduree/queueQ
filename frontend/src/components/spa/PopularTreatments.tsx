"use client";

import { I18n } from "@/components/spa/I18n";
import { useLineGatedBooking } from "@/components/spa/useLineGatedBooking";
import type { SpaMode } from "@/components/spa/SpaHome";
import type { CSSProperties } from "react";
const starIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path d="m10 1 2.6 6 6.4.5-5 4 1.6 6.5L10 14.7 4.4 18l1.6-6.5-5-4 6.4-.5Z" />
  </svg>
);

type Treatment = {
  serviceId: string;
  nameKey: string;
  tagKey?: "tag.best" | "tag.new";
  rating: string;
  price: string;
  tint1: string;
  tint2: string;
};

const treatments: Treatment[] = [
  {
    serviceId: "thai-traditional",
    nameKey: "pc1n",
    tagKey: "tag.best",
    rating: "4.9 (243)",
    price: "450 ฿",
    tint1: "#FDF6EC",
    tint2: "#E8C9A8",
  },
  {
    serviceId: "aromatherapy",
    nameKey: "pc2n",
    rating: "4.8 (188)",
    price: "650 ฿",
    tint1: "#FAF0E4",
    tint2: "#DFC19A",
  },
  {
    serviceId: "herbal-scrub",
    nameKey: "pc3n",
    tagKey: "tag.new",
    rating: "4.7 (112)",
    price: "1,200 ฿",
    tint1: "#FFF8EE",
    tint2: "#D4A373",
  },
  {
    serviceId: "hot-stone",
    nameKey: "pc4n",
    rating: "4.9 (95)",
    price: "850 ฿",
    tint1: "#F5E6D3",
    tint2: "#C49363",
  },
  {
    serviceId: "prenatal",
    nameKey: "pc5n",
    rating: "4.9 (67)",
    price: "700 ฿",
    tint1: "#F0E0CE",
    tint2: "#B8834F",
  },
];

type PopularTreatmentsProps = {
  mode?: SpaMode;
};

export function PopularTreatments({ mode = "booking" }: PopularTreatmentsProps) {
  const { openBookingWithService } = useLineGatedBooking();
  const isLanding = mode === "landing";

  return (
    <section className="popular" id="popular">
      <div className="wrap">
        <div className="popular-head">
          <h2>
            <I18n k="pop.title" as="span" />
          </h2>
          <a href="#services" className="view-all">
            <I18n k="cat.viewall" />
          </a>
        </div>
        <div className="carousel">
          {treatments.map(({ serviceId, nameKey, tagKey, rating, price, tint1, tint2 }) => (
            <div key={nameKey} className="p-card">
              <div
                className="thumb"
                style={
                  {
                    "--tint1": tint1,
                    "--tint2": tint2,
                  } as CSSProperties
                }
              >
                {tagKey ? (
                  <span className="tag">
                    <I18n k={tagKey} />
                  </span>
                ) : null}
                {isLanding ? null : (
                  <button
                    type="button"
                    className="add"
                    aria-label="Add to queue"
                    onClick={() => openBookingWithService(serviceId)}
                  >
                    +
                  </button>
                )}
              </div>
              <div className="body">
                <h4>
                  <I18n k={nameKey} />
                </h4>
                <div className="stars">
                  {starIcon}
                  <span>{rating}</span>
                </div>
                <div className="price">{price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
