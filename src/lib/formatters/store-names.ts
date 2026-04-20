const STORE_DISPLAY_NAMES: Record<string, string> = {
  itunes:       "iTunes",
  bandcamp:     "Bandcamp",
  beatport:     "Beatport",
  amazon:       "Amazon",
  traxsource:   "Traxsource",
  junodownload: "Juno Download",
  qobuz:        "Qobuz",
  hdtracks:     "HDTracks",
  sevendigital: "7digital",
};

export const createStoreName = (store: string) => {
  // Strip any variant suffix (e.g. "amazon_uk" → "amazon")
  const base = store.includes("_") ? store.substring(0, store.indexOf("_")) : store;
  return STORE_DISPLAY_NAMES[base] ?? (base.charAt(0).toUpperCase() + base.slice(1));
};
