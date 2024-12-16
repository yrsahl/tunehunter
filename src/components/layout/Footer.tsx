import { Suspense } from "react";
import LanguagePicker from "../interactive/Footer/LanguagePicker";
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
          <LanguagePicker />
        </div>
      </div>
    </Suspense>
  );
};

export default Footer;
