import dynamic from "next/dynamic";
const InfoButton = dynamic(() => import("../interactive/Footer/InfoButton"), { ssr: false });
const ProfileButton = dynamic(() => import("../interactive/Footer/ProfileButton"), { ssr: false });
const ThemeToggle = dynamic(() => import("../interactive/Footer/ThemeToggle"), { ssr: false });

const Footer = () => {
  return (
    <div className="flex h-16 w-full items-center bg-muted sm:h-20">
      <div className="flex flex-1 justify-center">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <ProfileButton />
      </div>
      <div className="flex flex-1 justify-center">
        <InfoButton />
      </div>
    </div>
  );
};

export default Footer;
