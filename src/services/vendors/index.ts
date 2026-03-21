// Vendor services integration (iTunes, etc.)
export * from "./api";
export * from "./transformers";

// Maps Amazon domain → NEXT_PUBLIC affiliate tag env var
const AMAZON_AFFILIATE_TAGS: Record<string, string | undefined> = {
  "amazon.de":     process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_DE,
  "amazon.com":    process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_US,
  "amazon.co.uk":  process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_GB,
  "amazon.fr":     process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_FR,
  "amazon.es":     process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_ES,
  "amazon.it":     process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_IT,
  "amazon.co.jp":  process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_JP,
  "amazon.ca":     process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_CA,
  "amazon.com.au": process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_AU,
};

/** Appends the affiliate tag to Amazon URLs; returns other URLs unchanged. */
export function withAffiliateTag(url: string): string {
  try {
    const { hostname } = new URL(url);
    const domain = hostname.replace(/^www\./, "");
    const tag = AMAZON_AFFILIATE_TAGS[domain];
    if (!tag) return url;
    return `${url}?tag=${tag}`;
  } catch {
    return url;
  }
}
