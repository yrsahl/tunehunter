import { MoonLoader, PuffLoader, ScaleLoader } from "react-spinners";

export const MusicPlayingIndicator = ({ size }: { size: number }) => {
  return (
    <ScaleLoader
      height={size}
      width={size / 5}
      margin={size / 10}
      radius={size}
      speedMultiplier={0.8}
      color={"hsl(var(--primary))"}
    />
  );
};

export const LoadingIndicator = ({
  size,
  color = "foreground",
}: {
  size: number;
  color?: string;
}) => {
  return <MoonLoader color={`hsl(var(--${color}))`} size={size} className="m-auto" />;
};

export const LoadingIndicatorTwo = ({
  size,
  color = "foreground",
}: {
  size: number;
  color?: string;
}) => {
  return <PuffLoader color={`hsl(var(--${color}))`} size={size} className="m-auto" />;
};

export const RedirectIndicator = ({ size }: { size: number }) => {
  return (
    <ScaleLoader
      height={size}
      width={size / 5}
      margin={size / 10}
      radius={size}
      speedMultiplier={1}
      color={"hsl(var(--foreground))"}
    />
  );
};
