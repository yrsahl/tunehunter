import { type DefaultSeoProps } from "next-seo";

const config: DefaultSeoProps = {
  title: "TuneHunter – Buy tracks faster",
  description:
    "Search Beatport, Bandcamp, iTunes & Amazon at once ✓ Find where to buy any track in seconds ✓ Compare prices across every major music store.",
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
    title: "TuneHunter – Buy tracks faster",
    description:
      "Search Beatport, Bandcamp, iTunes & Amazon at once ✓ Find where to buy any track in seconds ✓ Compare prices across every major music store.",
    images: [
      {
        url: "https://tunehunter.app/api/og",
        width: 1200,
        height: 630,
        alt: "TuneHunter – Buy tracks faster",
      },
    ],
  },
  twitter: {
    cardType: "summary_large_image",
  },
};

export default config;
