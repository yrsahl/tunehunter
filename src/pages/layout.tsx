import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
const Particles = dynamic(() => import("@/components/layout/Particles"), {
  ssr: false,
});

import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { Quicksand } from "next/font/google";
import { type PropsWithChildren } from "react";

export const quicksand = Quicksand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-quicksand",
});

const Layout = ({ children }: PropsWithChildren) => {
  const { resolvedTheme } = useTheme();

  return (
    <div
      className={`${quicksand.variable} relative flex h-screen rotate-0 flex-col items-center justify-between overflow-hidden bg-background text-foreground`}
    >
      {resolvedTheme === "dark" && (
        <Particles className="animate-fade-in absolute inset-0 -z-10" quantity={100} />
      )}
      {/* Footer's 80px high */}
      <main className="page-container relative flex max-h-[calc(100%-80px)] flex-1 flex-col">
        <div className="flex h-full flex-col">
          <div className="flex-grow-[6.6]" /> {/* Empty space */}
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
