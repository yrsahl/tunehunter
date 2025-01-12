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
import { quicksand } from "@/pages/layout";

const InfoButton = () => {
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
            <p className="flex items-center gap-1 pl-2 text-sm font-normal text-foreground/70">
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
            </p>
          </SheetTitle>
          <SheetDescription className="pt-2 text-base" asChild>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 text-foreground/70">
                <p>
                  This app allows you to search for music in different online stores, saving you
                  time when buying and comparing from online music vendors like Beatport and
                  Bandcamp.
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vari us enim
                  in eros elementum tristique. Duis cursus, odio auctor viverra scelerisque, magna
                  nunc ultricies felis, eget ultricies lectus enim nec purus.
                </p>
              </div>
              {/* <Separator className="border-primary" spacing="small" /> */}
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default InfoButton;
