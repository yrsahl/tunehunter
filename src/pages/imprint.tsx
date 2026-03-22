import { type NextPage } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";

const Imprint: NextPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-4 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <FileText className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold tracking-wide md:text-3xl">Imprint</h1>
        </div>
        <p className="text-sm text-foreground/60 md:text-base">
          Information in accordance with § 5 TMG.
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-8 text-sm text-foreground/70 md:text-base">

        {/* Operator */}
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold uppercase tracking-widest text-primary md:text-lg">
            Operator
          </h2>
          <p>[Gewerbename]</p>
          <p>Inhaber: [Vorname Nachname]</p>
          <p>[Straße Hausnummer]</p>
          <p>[PLZ] [Stadt]</p>
          <p>Deutschland</p>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold uppercase tracking-widest text-primary md:text-lg">
            Contact
          </h2>
          <p>
            Email:{" "}
            <a
              href="mailto:contact@tunehunter.app"
              className="text-primary underline underline-offset-4"
            >
              contact@tunehunter.app
            </a>
          </p>
        </div>

        {/* Tax */}
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold uppercase tracking-widest text-primary md:text-lg">
            Tax Information
          </h2>
          <p>Steuernummer: [XX/XXX/XXXXX]</p>
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE[XXXXXXXXX]</p>
        </div>

        {/* Responsible for content */}
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold uppercase tracking-widest text-primary md:text-lg">
            Responsible for content
          </h2>
          <p>Gemäß § 55 Abs. 2 RStV:</p>
          <p>[Vorname Nachname], [Straße Hausnummer], [PLZ] [Stadt]</p>
        </div>

        {/* Affiliate disclosure */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-bold uppercase tracking-widest text-primary md:text-lg">
            Affiliate Disclosure
          </h2>
          <p>
            This website contains affiliate links. If you purchase a product through one of these
            links, we may receive a small commission at no additional cost to you. This applies to
            links to Amazon Music. Affiliate relationships do not influence the results or rankings
            shown on this site.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-bold uppercase tracking-widest text-primary md:text-lg">
            Disclaimer
          </h2>
          <p>
            TuneHunter is an independent price comparison service. We are not affiliated with
            Beatport, Bandcamp, Apple Music, Amazon Music, or Spotify. All trademarks and brand
            names are the property of their respective owners.
          </p>
          <p>
            Prices and availability shown are fetched from third-party stores and may be outdated.
            We accept no liability for the accuracy of this information.
          </p>
        </div>

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

export default Imprint;
