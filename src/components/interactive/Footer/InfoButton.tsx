import CustomIcon from "@/components/CustomIcon";
import IconButton from "@/components/IconButton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { slideInAndOutFromAbove } from "@/helpers/animations";
import { quicksand } from "@/pages/layout";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const InfoButton = () => {
  const [showSupportFrame, setShowSupportFrame] = useState(false);

  const toggleSupportFrame = () => {
    setShowSupportFrame(!showSupportFrame);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="lg" className="w-20 border-[1px] border-foreground/30">
          <CustomIcon
            icon="questionMark"
            variant="foreground"
            height="24px"
            width="24px"
            className="shrink-0"
          />
        </Button>
      </SheetTrigger>
      <SheetContent className={`${quicksand.variable}`}>
        <SheetHeader>
          <SheetTitle>
            <div className="-ml-1 flex font-quicksand text-4xl">
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
              <div className="flex flex-col gap-12 text-base text-inherit">
                <div className="flex flex-col gap-4 text-foreground/70">
                  <p>
                    ... has one purpose: It finds you the music you want to buy, quicker. TuneHunter
                    seraches across different online stores like Beatport, Bandcamp or Apple Music
                    to show you where it is available, in what quality and to what price.
                  </p>
                  <p className="flex flex-col gap-[6px]">
                    <span>
                      By creating an account you can unlock more features to help you with your
                      search, such as:
                    </span>
                    <ul className="list-inside list-disc space-y-1 pl-2">
                      <li>Viewing your search history</li>
                      <li>Adding songs to your wish list</li>
                      <li>Accessing your Spotify data</li>
                    </ul>
                  </p>
                </div>
                <div className="m-auto flex w-[90%] flex-col gap-4">
                  <a href="mailto:contact@tunehunter.app?subject=Feedback">
                    <IconButton variant="primary" text="Have feedback?" size="lg" icon="mail" />
                  </a>
                  <div className="relative">
                    <IconButton
                      text="Buy me a coffee"
                      variant="success"
                      size="lg"
                      icon="coffee"
                      onClick={toggleSupportFrame}
                    />
                    <AnimatePresence mode="wait">
                      {showSupportFrame && (
                        <motion.div
                          className="absolute -left-4 top-20 h-96 w-[319px] rounded-md bg-white"
                          {...slideInAndOutFromAbove(0.5, 24)}
                        >
                          <iframe
                            id="kofiframe"
                            src="https://ko-fi.com/alvarny/?hidefeed=true&widget=true&embed=true&preview=true"
                            className="h-full w-full rounded-md border-none"
                            title="alvarny"
                          />
                          <div className="h-6"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default InfoButton;
