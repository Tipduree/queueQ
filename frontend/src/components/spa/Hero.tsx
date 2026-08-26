"use client";

import { I18n } from "@/components/spa/I18n";
import { HeroBookingCard } from "@/components/spa/HeroBookingCard";
import Image from "next/image";

type HeroProps = {
  showBookingCard?: boolean;
};

export function Hero({ showBookingCard = false }: HeroProps) {
  return (
    <section className="hero-ref">
      <div className="wrap hero-ref__inner">
        <h1>
          <I18n k="hero.title" as="span" />
        </h1>

        <div className="hero-pill">
          <Image
            src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1400&q=80"
            alt=""
            width={1100}
            height={420}
            priority
            className="hero-pill__img"
          />
        </div>

        {showBookingCard ? <HeroBookingCard /> : null}
      </div>
    </section>
  );
}
