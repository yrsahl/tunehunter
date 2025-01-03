import Header from "@/components/layout/Header";
const Particles = dynamic(() => import("@/components/layout/Particles"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/layout/Footer"), {
  ssr: false,
});

import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { type PropsWithChildren } from "react";

const Layout = ({ children }: PropsWithChildren) => {
  const { resolvedTheme } = useTheme();

  return (
    <div className="relative flex h-screen rotate-0 flex-col items-center justify-between overflow-hidden bg-background text-foreground">
      {resolvedTheme === "dark" && (
        <Particles className="animate-fade-in absolute inset-0 -z-10" quantity={100} />
      )}
      <main className="page-container relative flex max-h-[calc(100%-80px)] flex-1 flex-col">
        <div className="flex h-full flex-col">
          <div className="flex-grow-[6.6]"></div> {/* Empty space */}
          <div className="hide-scrollbars max-h-full w-full overflow-y-auto py-6">
            <div className="flex w-full flex-col items-center justify-center gap-8">
              <Header />
              {children}
            </div>
          </div>
          <div className="flex-grow-[3.3]" /> {/* Empty space */}
        </div>
      </main>
      <div className="h-20 w-full">
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
