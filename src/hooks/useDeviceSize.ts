import { useMediaQuery } from "@uidotdev/usehooks";

const useDeviceSize = () => {
  const isMobileDevice = useMediaQuery("only screen and (max-width : 480px)");
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  const isMediumDevice = useMediaQuery(
    "only screen and (min-width : 769px) and (max-width : 992px)",
  );
  const isLargeDevice = useMediaQuery(
    "only screen and (min-width : 993px) and (max-width : 1200px)",
  );
  const isExtraLargeDevice = useMediaQuery("only screen and (min-width : 1201px)");

  return {
    isMobileDevice,
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    isExtraLargeDevice,
  };
};

export default useDeviceSize;
