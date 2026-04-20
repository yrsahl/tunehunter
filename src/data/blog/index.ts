import { type BlogPost } from "./types";
import whyDjsStopBuyingOneStore from "./posts/why-djs-stop-buying-one-store";

// Other posts ready to add when the time comes:
// import beatportVsJunoVsTraxsource from "./posts/beatport-vs-juno-vs-traxsource";
// import whereToByFlac2026 from "./posts/where-to-buy-flac-2026";
// import hiResAudioBestPrice from "./posts/hi-res-audio-best-price";

export const blogPosts: BlogPost[] = [whyDjsStopBuyingOneStore];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
