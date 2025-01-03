import { Suspense } from "react";
import InfoButton from "../interactive/Footer/InfoButton";
import ProfileButton from "../interactive/Footer/ProfileButton";
import { ThemeToggle } from "../interactive/Footer/ThemeToggle";

const Footer = () => {
  return (
    <Suspense>
      <div className="flex h-20 w-full items-center bg-muted">
        <div className="flex flex-1 justify-center">
          <ThemeToggle />
        </div>
        <div className="flex flex-1 justify-center">
          <ProfileButton />
        </div>
        <div className="flex flex-1 justify-center">
          <InfoButton />
        </div>
      </div>
    </Suspense>
  );
};

export default Footer;
