import { trackEvent } from "@/lib/plausible";
import { type NextPage } from "next";
import Link from "next/link";
import { useEffect } from "react";

const Custom404: NextPage = () => {
  useEffect(() => {
    trackEvent("404", { path: window.location.pathname });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-warn">404</h1>
        <p className="text-xl font-medium">This page doesn't exist.</p>
      </div>
      <Link
        href="/"
        className="mt-2 text-sm text-primary underline underline-offset-4 md:text-base"
      >
        ← Back to TuneHunter
      </Link>
    </div>
  );
};

export default Custom404;
