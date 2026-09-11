"use client";

import { I18n } from "@/components/spa/I18n";
import { ServicesCatalogSidebar } from "@/components/spa/ServicesCatalogSidebar";
import { useLineGatedBooking } from "@/components/spa/useLineGatedBooking";
import type { SpaMode } from "@/components/spa/SpaHome";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { useState } from "react";

const MN_TERTIARY = "#365314";

const categories = [
  {
    nameKey: "c1n",
    goKey: "c1g",
    tint1: "#FDF6EC",
    tint2: "#E8C9A8",
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke={MN_TERTIARY} strokeWidth="1.3">
        <path d="M30 8c-10 8-15 18-10 30 2.5 6 7.5 10 10 10s7.5-4 10-10c5-12 0-22-10-30Z" />
      </svg>
    ),
  },
  {
    nameKey: "c2n",
    goKey: "c2g",
    tint1: "#FAF0E4",
    tint2: "#DFC19A",
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke={MN_TERTIARY} strokeWidth="1.3">
        <circle cx="30" cy="24" r="11" />
        <path d="M30 35v17M22 44h16" />
      </svg>
    ),
  },
  {
    nameKey: "c3n",
    goKey: "c3g",
    tint1: "#FFF8EE",
    tint2: "#D4A373",
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke={MN_TERTIARY} strokeWidth="1.3">
        <path d="M17 42c0-12 5-22 13-27 8 5 13 15 13 27" />
        <path d="M17 42h26" />
      </svg>
    ),
  },
  {
    nameKey: "c4n",
    goKey: "c4g",
    tint1: "#F5E6D3",
    tint2: "#C49363",
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke={MN_TERTIARY} strokeWidth="1.3">
        <rect x="13" y="13" width="34" height="34" rx="4" />
        <path d="M13 24h34M24 13v34" />
      </svg>
    ),
  },
] as const;

type ServicesSectionProps = {
  mode?: SpaMode;
};

type CategoryCardProps = {
  nameKey: string;
  goKey: string;
  tint1: string;
  tint2: string;
  icon: ReactNode;
  isLanding: boolean;
  onOpenCatalog: () => void;
  onBook: (event: { stopPropagation: () => void }) => void;
  onBookKeyDown: (event: KeyboardEvent) => void;
};

function CategoryCard({
  nameKey,
  goKey,
  tint1,
  tint2,
  icon,
  isLanding,
  onOpenCatalog,
  onBook,
  onBookKeyDown,
}: CategoryCardProps) {
  const cardStyle = {
    "--tint1": tint1,
    "--tint2": tint2,
  } as CSSProperties;

  return (
    <button
      type="button"
      className={`cat-card cat-card--carousel${isLanding ? " cat-card--static" : ""}`}
      style={cardStyle}
      onClick={onOpenCatalog}
    >
      <div className="thumb">{icon}</div>
      <h3>
        <I18n k={nameKey} />
      </h3>
      {isLanding ? null : (
        <span
          className="go"
          role="button"
          tabIndex={0}
          onClick={onBook}
          onKeyDown={onBookKeyDown}
        >
          <I18n k={goKey} />
        </span>
      )}
    </button>
  );
}

export function ServicesSection({ mode = "booking" }: ServicesSectionProps) {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const { openBookingQueue } = useLineGatedBooking();
  const isLanding = mode === "landing";

  const openCatalog = () => setCatalogOpen(true);

  const handleBookClick = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    openBookingQueue();
  };

  const handleBookKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      openBookingQueue();
    }
  };

  const categoryCards = categories.map((category) => (
    <CategoryCard
      key={category.nameKey}
      {...category}
      isLanding={isLanding}
      onOpenCatalog={openCatalog}
      onBook={handleBookClick}
      onBookKeyDown={handleBookKeyDown}
    />
  ));

  return (
    <section className="cat" id="services">
      <div className="wrap">
        <div className="cat-head">
          <div>
            <h2>
              <I18n k="cat.title" as="span" />
            </h2>
            <p>
              <I18n k="cat.sub" as="span" />
            </p>
          </div>
          <button type="button" className="view-all" onClick={openCatalog}>
            <I18n k="cat.viewall" />
          </button>
        </div>

        {isLanding ? (
          <Carousel
            className="cat-carousel-embla"
            opts={{
              align: "start",
              dragFree: true,
              containScroll: "trimSnaps",
            }}
          >
            <CarouselContent className="-ml-5">
              {categories.map((category) => (
                <CarouselItem
                  key={category.nameKey}
                  className="basis-[82%] pl-5 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <CategoryCard
                    {...category}
                    isLanding={isLanding}
                    onOpenCatalog={openCatalog}
                    onBook={handleBookClick}
                    onBookKeyDown={handleBookKeyDown}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          <div className="carousel cat-carousel">{categoryCards}</div>
        )}
      </div>

      <ServicesCatalogSidebar open={catalogOpen} onClose={() => setCatalogOpen(false)} />
    </section>
  );
}
