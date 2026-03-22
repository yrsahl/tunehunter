import { getCountryName } from "@/lib/validators";

interface VendorLogoProps {
  store: string;
  region: string;
}

const VendorLogo = ({ store, region }: VendorLogoProps) => {
  return (
    <div className="flex items-center space-x-5">
      <div className="avatar">
        <div className="mask mask-squircle h-10 w-10 sm:h-12 sm:w-12">
          <img src={`logos/${store.toLowerCase()}.svg`} alt={`${store} logo`} />
        </div>
      </div>
      <div className="hidden">
        <div className="font-bold">{store}</div>
        <div className="text-sm font-normal opacity-50">
          {getCountryName(region)}
        </div>
      </div>
    </div>
  );
};

export default VendorLogo;
