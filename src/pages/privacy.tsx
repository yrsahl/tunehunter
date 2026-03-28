import { ShieldCheck } from "lucide-react";
import { type NextPage } from "next";
import Link from "next/link";

type Section =
  | { title: string; subsections: { heading: string; items: string[] }[] }
  | { title: string; items: string[] };

const sections: Section[] = [
  {
    title: "What we collect",
    subsections: [
      {
        heading: "If you use the app as a guest",
        items: [
          "Your selected region, stored locally in your browser (localStorage only — never sent to our servers)",
        ],
      },
      {
        heading: "If you create an account",
        items: [
          "Your name and email address",
          "Your preferences: region, language, and theme",
          "A record of every song you search for, including the region at the time of the search",
          "A record of which stores you visit from search results",
          "Songs you save to your favorites",
        ],
      },
      {
        heading: "If you connect Spotify",
        items: [
          "Your Spotify OAuth token, used only to read your recently played tracks, queue, and top tracks — we do not write to your Spotify account",
        ],
      },
    ],
  },
  {
    title: "What we do not collect",
    items: [
      "Payment information of any kind",
      "Precise location (region is inferred from your browser language settings or chosen manually)",
      "Any data beyond what is listed above",
    ],
  },
  {
    title: "How we use it",
    items: [
      "Search history is used to power trending song charts and your personal history tab",
      "Store visit records are associated with your searches for your own reference",
      "We track anonymised aggregate statistics on how often song data is fetched from our cache vs. external stores — this data is not linked to individual users",
    ],
  },
  {
    title: "Retention",
    items: [
      "Cached store listings are refreshed after 30 days",
      "You can delete your account and all associated data at any time from your account settings",
    ],
  },
];

const Privacy: NextPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-4 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold tracking-wide md:text-3xl">Data Privacy</h1>
        </div>
        <p className="text-sm text-foreground/60 md:text-base">
          You should know exactly what data TuneHunter stores and why, so here it is:
        </p>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-8">
        {sections.map((section) => (
          <div key={section.title} className="flex flex-col gap-4">
            <h2 className="text-base font-bold uppercase tracking-widest text-primary md:text-lg">
              {section.title}
            </h2>
            {"subsections" in section ? (
              <div className="flex flex-col gap-5">
                {section.subsections.map((sub) => (
                  <div key={sub.heading} className="flex flex-col gap-2">
                    <h3 className="text-sm font-bold text-foreground/80 md:text-base">
                      {sub.heading}
                    </h3>
                    <ul className="flex flex-col gap-1 pl-4">
                      {sub.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-foreground/70 md:text-base"
                        >
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary md:mt-[9px]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="flex flex-col gap-1 pl-4">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-foreground/70 md:text-base"
                  >
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary md:mt-[9px]" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Back */}
      <Link
        href="/"
        className="mt-4 self-start text-sm text-primary underline underline-offset-4 md:text-base"
      >
        ← Back to TuneHunter
      </Link>
    </div>
  );
};

export default Privacy;
