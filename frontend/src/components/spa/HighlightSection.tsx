"use client";

import { I18n } from "@/components/spa/I18n";
import Image from "next/image";

export function HighlightSection() {
  return (
    <section className="highlight-section">
      <div className="wrap highlight-section__grid">
        <div className="highlight-section__copy">
          <span className="highlight-section__num">01</span>
          <h3>
            <I18n k="highlight.title" />
          </h3>
          <p>
            <I18n k="highlight.body" />
          </p>
        </div>
        <div className="highlight-section__media">
          <Image
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
            alt=""
            width={420}
            height={420}
            className="highlight-section__img"
          />
        </div>
      </div>
    </section>
  );
}
