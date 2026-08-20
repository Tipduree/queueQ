"use client";

import { I18n } from "@/components/spa/I18n";
import { useQueue } from "@/components/spa/queue/QueueProvider";
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
    tint1: "#E4D9BC",
    tint2: "#C9BB92",
  },
  {
    serviceId: "aromatherapy",
    nameKey: "pc2n",
    rating: "4.8 (188)",
    price: "650 ฿",
    tint1: "#DFD3B6",
    tint2: "#BDAD82",
  },
  {
    serviceId: "herbal-scrub",
    nameKey: "pc3n",
    tagKey: "tag.new",
    rating: "4.7 (112)",
    price: "1,200 ฿",
    tint1: "#E7DCC0",
    tint2: "#CDBE93",
  },
  {
    serviceId: "hot-stone",
    nameKey: "pc4n",
    rating: "4.9 (95)",
    price: "850 ฿",
    tint1: "#DAD0AE",
    tint2: "#B8A87A",
  },
  {
    serviceId: "prenatal",
    nameKey: "pc5n",
    rating: "4.9 (67)",
    price: "700 ฿",
    tint1: "#EAE0C4",
    tint2: "#D2C398",
  },
];

export function PopularTreatments() {
  const { openQueueWithService } = useQueue();

  return (
    <section className="popular">
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
                <button
                  type="button"
                  className="add"
                  aria-label="Add to queue"
                  onClick={() => openQueueWithService(serviceId)}
                >
                  +
                </button>
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
