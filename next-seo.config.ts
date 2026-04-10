import { type DefaultSeoProps } from "next-seo";

const config: DefaultSeoProps = {
  title: "TuneHunter",
  description:
    "Buy tracks faster. Search every major music store at once.",
  canonical: "https://tunehunter.app/",
  additionalLinkTags: [
    {
      rel: "icon",
      href: "/favicon.ico",
    },
  ],
  // openGraph: {
  //   type: "website",
  //   locale: "en_IE",
  //   url: "https://tunehunter.app/",
  //   siteName: "TuneHunter",
  // },
  // twitter: {
  //   handle: "@handle",
  //   site: "@site",
  //   cardType: "summary_large_image",
  // },
};

export default config;
