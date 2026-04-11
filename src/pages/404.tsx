import { track } from "@/lib/plausible";
import { type NextPage } from "next";
import { useEffect } from "react";

const Custom404: NextPage = () => {
  useEffect(() => {
    track("404", { path: window.location.pathname });
  }, []);

  return <h1>404 | Page Not Found</h1>;
};

export default Custom404;
