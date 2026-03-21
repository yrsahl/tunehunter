import { type DefaultSeoProps } from "next-seo";

const config: DefaultSeoProps = {
  title: "TuneHunter",
  description:
    "Compare music vendors like Beatport and Amazon Music to find the best deal for your music!",
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
