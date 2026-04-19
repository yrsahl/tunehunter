import { type DefaultSeoProps } from "next-seo";

const config: DefaultSeoProps = {
  title: "TuneHunter – Compare Music Download Prices",
  description:
    "Compare music download prices across Beatport, Bandcamp, iTunes & Amazon in one search. Find the cheapest place to buy any track online — stop tab-hopping, start saving.",
  canonical: "https://tunehunter.app/",
  additionalLinkTags: [
    {
      rel: "icon",
      href: "/favicon.ico",
    },
  ],
  openGraph: {
    type: "website",
    url: "https://tunehunter.app/",
    siteName: "TuneHunter",
    title: "TuneHunter – Compare Music Download Prices",
    description:
      "Compare music download prices across Beatport, Bandcamp, iTunes & Amazon in one search. Find the cheapest place to buy any track online — stop tab-hopping, start saving.",
    images: [
      {
        url: "https://tunehunter.app/api/og",
        width: 1200,
        height: 630,
        alt: "TuneHunter – Compare music download prices across all major stores",
      },
    ],
  },
  twitter: {
    cardType: "summary_large_image",
    site: "@tunehunterapp",
  },
};

export default config;
