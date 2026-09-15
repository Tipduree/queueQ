/** Default listing — override with NEXT_PUBLIC_GOOGLE_MAPS_PLACE_URL if needed. */
const DEFAULT_GOOGLE_MAPS_PLACE_URL =
  "https://www.google.com/maps/place/%E0%B8%99%E0%B9%88%E0%B8%B2%E0%B8%99+%E0%B8%8A%E0%B8%A1%E0%B8%9E%E0%B8%B9%E0%B8%A0%E0%B8%B9%E0%B8%84%E0%B8%B2+%E0%B8%99%E0%B8%A7%E0%B8%94%E0%B9%81%E0%B8%9C%E0%B8%99%E0%B9%84%E0%B8%97%E0%B8%A2+-+Nan+Chumpuphuka+Thai+Massage/@18.7856381,100.7724081,17z/data=!3m1!4b1!4m6!3m5!1s0x31278dde61b88a3f:0xafec1c2a8c688ad4!8m2!3d18.785633!4d100.774983!16s%2Fg%2F11b8z2f0_m?entry=ttu";

export function getGoogleMapsPlaceUrl(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLACE_URL?.trim() || DEFAULT_GOOGLE_MAPS_PLACE_URL;
}

/** Full iframe `src` from Google Share → Embed (optional, best quality). */
function getGoogleMapsEmbedSrcOverride(): string | null {
  const src = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_SRC?.trim();
  return src || null;
}

function parseLatLngFromPlaceUrl(placeUrl: string): { lat: number; lng: number } | null {
  const precise = placeUrl.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (precise) {
    return { lat: Number(precise[1]), lng: Number(precise[2]) };
  }

  const at = placeUrl.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (at) {
    return { lat: Number(at[1]), lng: Number(at[2]) };
  }

  return null;
}

/** Free embed (no API key). Prefer NEXT_PUBLIC_GOOGLE_MAPS_EMBED_SRC when set. */
export function resolveGoogleMapsEmbedSrc(): string | null {
  const override = getGoogleMapsEmbedSrcOverride();
  if (override) {
    return override;
  }

  const placeUrl = getGoogleMapsPlaceUrl();
  if (placeUrl.includes("/maps/embed")) {
    return placeUrl;
  }

  const coords = parseLatLngFromPlaceUrl(placeUrl);
  if (!coords) {
    return null;
  }

  const { lat, lng } = coords;
  return `https://maps.google.com/maps?q=${lat},${lng}&hl=th&z=17&output=embed`;
}
