import { type DefaultSeoProps } from "next-seo";

const config: DefaultSeoProps = {
  title: "TrackScout",
  description:
    "Compare music vendors like Beatport and Amazon Music to find the best deal for your music!",
  canonical: "https://trackscout.app/",
  additionalLinkTags: [
    {
      rel: "icon",
      href: "/favicon.ico",
    },
  ],
  // openGraph: {
  //   type: "website",
  //   locale: "en_IE",
  //   url: "https://trackscout.app/",
  //   siteName: "TrackScout",
  // },
  // twitter: {
  //   handle: "@handle",
  //   site: "@site",
  //   cardType: "summary_large_image",
  // },
};

export default config;
