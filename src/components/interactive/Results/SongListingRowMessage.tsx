import { countryNamesEnglish } from "@/lib/validators";
import { motion } from "framer-motion";

interface ISongListingRowMessageProps {
  message: string;
  store: string;
  region: string;
}

const SongListingRowMessage = ({ message, store, region }: ISongListingRowMessageProps) => {
  return (
    <motion.tr>
      {/* Store */}
      <td>
        <div className="flex items-center space-x-5">
          <div className="avatar ">
            <div className="mask mask-squircle h-10 w-10 sm:h-12 sm:w-12">
              <img src={`logos/${store.toLowerCase()}.svg`} alt="Avatar Tailwind CSS Component" />
            </div>
          </div>
          <div className="hidden">
            <div className="font-bold">{store}</div>
            <div className="text-sm font-normal opacity-50">
              {countryNamesEnglish[region.toUpperCase()]}
            </div>
          </div>
        </div>
      </td>

      {/* Message */}
      <td colSpan={4} className="text-center text-sm text-muted-foreground sm:text-base">
        {message}
      </td>
    </motion.tr>
  );
};

export default SongListingRowMessage;
