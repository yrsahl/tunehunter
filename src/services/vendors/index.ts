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

const BEATPORT_AFFILIATE_ID = process.env.NEXT_PUBLIC_BEATPORT_AFFILIATE_ID;

/** Appends the affiliate tag to known vendor URLs; returns other URLs unchanged. */
export function withAffiliateTag(url: string): string {
  try {
    const { hostname } = new URL(url);
    const domain = hostname.replace(/^www\./, "");

    // Amazon
    const amazonTag = AMAZON_AFFILIATE_TAGS[domain];
    if (amazonTag) return `${url}?tag=${amazonTag}`;

    // Beatport (Post Affiliate Pro: a_aid param)
    if (domain === "beatport.com" && BEATPORT_AFFILIATE_ID) {
      return `${url}?a_aid=${BEATPORT_AFFILIATE_ID}`;
    }

    return url;
  } catch {
    return url;
  }
}
