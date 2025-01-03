import CustomIcon from "@/components/CustomIcon";
import { Button } from "@/components/ui/button";

const InfoButton = () => {
  return (
    <Button size="lg" className="w-20 border-[1px] border-foreground/30">
      <CustomIcon
        icon="questionMark"
        variant="foreground"
        height="24px"
        width="24px"
        className="shrink-0"
      />
    </Button>
  );
};

export default InfoButton;
