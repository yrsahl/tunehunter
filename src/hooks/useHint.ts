import useDeviceSize from "@/hooks/useDeviceSize";
import { ReactNode } from "react";
import { toast } from "sonner";

const useHint = () => {
  const { isSmallDevice } = useDeviceSize();

  const showHint = (message: ReactNode) => {
    if (isSmallDevice) {
      toast.info(message);
    }
  };

  return { showHint, isSmallDevice };
};

export default useHint;
