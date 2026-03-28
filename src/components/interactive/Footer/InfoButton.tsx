import CustomIcon from "@/components/CustomIcon";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useDeviceSize from "@/hooks/useDeviceSize";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { quicksand } from "@/pages/layout";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

const InfoButton = () => {
  const [supportFrameOpen, setSupportFrameOpen] = useState(false);
  const [infoFrameOpen, setInfoFrameOpen] = useState(false);
  const router = useRouterWithHelpers();
  const { status } = useSession();
  const loggedIn = status === "authenticated";
  const { isSmallDevice } = useDeviceSize();
  const buttonSize = isSmallDevice ? "default" : "lg";

  const toggleSupportFrame = () => {
    setSupportFrameOpen(!supportFrameOpen);
  };

  const handleCreateAccountClick = () => {
    // Hide info frame
    setInfoFrameOpen(false);

    // Open register frame
    router.setParams({ profile: "register" });
  };

  return (
    <Sheet open={infoFrameOpen} onOpenChange={setInfoFrameOpen}>
      <SheetTrigger asChild>
        <Button size={buttonSize} className="w-[72px] border-[1px] border-foreground/30 sm:w-20">
          <CustomIcon
            icon="hamburger"
            variant="foreground"
            height={isSmallDevice ? "20px" : "24px"}
            width={isSmallDevice ? "20px" : "24px"}
            className="shrink-0"
          />
        </Button>
      </SheetTrigger>
      <SheetContent className={`${quicksand.variable}`}>
        <SheetHeader>
          <SheetTitle>
            <div className="-ml-1 flex font-quicksand text-3xl md:text-4xl">
              <h2 className="tracking-wider">Tune</h2>
              <h2 className="tracking-wider text-primary">Hunter</h2>
            </div>
            {/* <p className="flex items-center gap-1 pl-2 text-sm font-normal text-foreground/70">
              <span>By</span>
              <a href="https://alvarnystudios.com/" target="_blank">
                <IconButton
                  icon="external"
                  iconPosition="right"
                  iconSize="16px"
                  text="AlvarnyStudios"
                  textStyle="transform-none tracking-[0.12em]"
                  size="sm"
                  className="gap-1 p-0 font-quicksand "
                />
              </a>
            </p> */}
          </SheetTitle>
          <SheetDescription asChild className="relative">
            <div className="flex flex-col gap-6 text-pretty pt-3 text-justify text-foreground">
              <div className="flex flex-col gap-10 text-sm text-inherit md:text-base">
                <div className="flex flex-col gap-4 text-foreground/70">
                  <p>
                    ... has one purpose: helping you find the music you want to buy, faster. It
                    searches Beatport, Bandcamp, Apple Music, and Amazon Music to show you where
                    it’s available, in what quality, and at what price.
                  </p>
                  {!loggedIn && (
                    <p className="flex flex-col gap-[10px]">
                      <span>
                        You can{" "}
                        <Button
                          variant="link"
                          onClick={handleCreateAccountClick}
                          className="h-auto p-0 text-sm font-normal underline sm:text-base"
                        >
                          create an account
                        </Button>{" "}
                        to unlock more features:
                      </span>
                      <ul className="list-inside list-disc space-y-1 pl-2">
                        <li>View your search history</li>
                        <li>Save songs to your favorites</li>
                        <li>Access your Spotify songs</li>
                      </ul>
                    </p>
                  )}
                </div>
                <div className="m-auto flex w-[90%] flex-col gap-4">
                  <a href="mailto:contact@tunehunter.app?subject=Feedback">
                    {/* <IconButton
                      variant="primary"
                      text={isExtraSmallDevice ? "For Feedback" : "Have feedback?"}
                      size={buttonSize}
                      icon="mail"
                    /> */}
                    <Button
                      variant="primary"
                      size={buttonSize}
                      className="menu-transition flex w-full justify-center gap-2 text-xs font-light uppercase text-primary-foreground sm:text-sm"
                    >
                      <CustomIcon
                        icon="mail"
                        variant="primary-foreground"
                        height={isSmallDevice ? "16px" : "20px"}
                        width={isSmallDevice ? "16px" : "20px"}
                      />
                      <span className="text-xs font-light uppercase text-primary-foreground sm:text-sm">
                        Have feedback?
                      </span>
                    </Button>
                  </a>
                  {/* <div className="relative">
                    <Button
                      variant="success"
                      size={buttonSize}
                      className="menu-transition flex w-full justify-center text-xs font-light uppercase text-primary-foreground sm:text-sm"
                      onClick={toggleSupportFrame}
                    >
                      <div
                        className={cn(
                          "absolute-center menu-transition flex gap-2",
                          supportFrameOpen ? "scale-100 opacity-100" : "scale-75 opacity-0",
                        )}
                      >
                        <CustomIcon
                          icon="x"
                          variant="success"
                          height={isSmallDevice ? "16px" : "20px"}
                          width={isSmallDevice ? "16px" : "20px"}
                        />
                        <span>Close</span>
                      </div>

                      <div
                        className={cn(
                          "absolute-center menu-transition flex items-center gap-2",
                          supportFrameOpen ? "scale-75 opacity-0" : "scale-100 opacity-100",
                        )}
                      >
                        <CustomIcon
                          icon="coffee"
                          variant="success"
                          height={isSmallDevice ? "16px" : "20px"}
                          width={isSmallDevice ? "16px" : "20px"}
                        />
                        <span>Support me</span>
                      </div>
                    </Button>
                    <AnimatePresence mode="wait">
                      {supportFrameOpen && (
                        <motion.div
                          className="absolute -left-4 top-20 h-96 w-[125%] overflow-scroll rounded-md bg-white sm:w-[319px]"
                          {...slideInAndOutFromAbove(0.5, 24)}
                        >
                          <iframe
                            id="kofiframe"
                            src="https://ko-fi.com/alvarny/?hidefeed=true&widget=true&embed=true&preview=true"
                            className="h-full w-[319px] scale-[1] rounded-md border-none sm:scale-100"
                            title="alvarny"
                          />
                          <div className="h-6" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div> */}
                </div>
              </div>

              {/* <div className="text-base">
                <Separator className="border-primary" spacing="base" />
                <div className="flex flex-col gap-6">
                  <p>We've also built:</p>
                  <div className="flex flex-col gap-6">
                    <a href="https://tuneguard.com" target="_blank">
                      <IconButton text="TuneGuard" variant="outlineAccent" size="default" />
                    </a>
                    <a href="https://geotunes.com" target="_blank">
                      <IconButton text="GeoTunes" variant="outlinePrimary" size="default" />
                    </a>
                    <a href="https://soundsphere.com" target="_blank">
                      <IconButton text="SoundSphere" variant="outlineSuccess" size="default" />
                    </a>
                  </div>
                </div>
              </div> */}
              <div className="flex justify-center gap-4">
                <Link
                  href="/privacy"
                  className="text-xs text-foreground/40 underline underline-offset-4 hover:text-foreground/60"
                  onClick={() => setInfoFrameOpen(false)}
                >
                  Data Privacy
                </Link>
                {/* <Link
                  href="/imprint"
                  className="text-xs text-foreground/40 underline underline-offset-4 hover:text-foreground/60"
                  onClick={() => setInfoFrameOpen(false)}
                >
                  Imprint
                </Link> */}
              </div>
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default InfoButton;
