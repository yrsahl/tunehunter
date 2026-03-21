"use client";

import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-fit">
        <button
          className="flex items-center font-quicksand text-4xl shadow-primary drop-shadow-xl md:text-5xl"
          onClick={handleClick}
        >
          <h1 className="tracking-wider">Tune</h1>
          <h1 className="tracking-wider text-primary">Hunter</h1>
        </button>
      </div>
      {/* <p className="text-md italic text-muted-foreground">
        The easy way to buy club mixes of your favorite tunes!
      </p> */}
    </div>
  );
};

export default Header;
