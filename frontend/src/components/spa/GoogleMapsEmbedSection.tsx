"use client";

import { I18n } from "@/components/spa/I18n";
import { useLanguage } from "@/components/spa/LanguageProvider";
import {
  FEATURED_GOOGLE_LISTING,
  FEATURED_GOOGLE_REVIEWS,
  type FeaturedGoogleReview,
} from "@/lib/google-maps/featured-reviews";
import { getGoogleMapsPlaceUrl, resolveGoogleMapsEmbedSrc } from "@/lib/google-maps/embed";

function StarRating({ rating }: { rating: FeaturedGoogleReview["rating"] }) {
  return (
    <span className="google-map-section__stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={
            index < rating ? "google-map-section__star google-map-section__star--on" : "google-map-section__star"
          }
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function GoogleMapsEmbedSection() {
  const { t } = useLanguage();
  const embedSrc = resolveGoogleMapsEmbedSrc();
  const placeUrl = getGoogleMapsPlaceUrl();

  if (!embedSrc) {
    return null;
  }

  const { rating, reviewCount } = FEATURED_GOOGLE_LISTING;
  const summaryStars = Math.min(5, Math.max(1, Math.round(rating))) as FeaturedGoogleReview["rating"];

  return (
    <section className="google-map-section" aria-labelledby="google-map-heading">
      <div className="wrap google-map-section__inner">
        <header className="google-map-section__head">
          <p className="section-eyebrow">
            <I18n k="map.eyebrow" />
          </p>
          <h2 id="google-map-heading">
            <I18n k="map.title" />
          </h2>
          <p className="google-map-section__sub">
            <I18n k="map.sub" />
          </p>
        </header>

        <div className="google-map-section__grid">
          <div className="google-map-section__reviews">
            <div className="google-map-section__summary">
              <p className="google-map-section__score">
                <span className="google-map-section__score-value">{rating.toFixed(1)}</span>
                <StarRating rating={summaryStars} />
              </p>
              <p className="google-map-section__count">
                {t("map.reviewCount").replace("{count}", reviewCount.toLocaleString("th-TH"))}
              </p>
            </div>

            <ul className="google-map-section__review-list">
              {FEATURED_GOOGLE_REVIEWS.map((review, index) => (
                <li key={`${review.author}-${index}`} className="google-map-section__review-card">
                  <div className="google-map-section__review-head">
                    <StarRating rating={review.rating} />
                    <span className="google-map-section__review-author">{review.author}</span>
                  </div>
                  <p className="google-map-section__review-text">{review.text}</p>
                  {review.when ? <p className="google-map-section__review-when">{review.when}</p> : null}
                </li>
              ))}
            </ul>

            <p className="google-map-section__source">
              {/* <I18n k="map.reviewsSource" /> */}
              <a href={placeUrl} target="_blank" rel="noopener noreferrer" className="google-map-section__link">
                <I18n k="map.openGoogle" />
              </a>
            </p>
          </div>

          <div className="google-map-section__map">
            <iframe
              title="Google Maps"
              src={embedSrc}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="google-map-section__frame"
            />
          </div>
        </div>

        {/* <p className="google-map-section__actions">
          <a href={placeUrl} target="_blank" rel="noopener noreferrer" className="google-map-section__link">
            <I18n k="map.openGoogle" />
          </a>
        </p> */}
      </div>
    </section>
  );
}
