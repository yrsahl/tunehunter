import { fadeInAndOut } from "@/helpers/animations";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

interface TableProps {
  hasHeader: boolean;
  children: ReactNode;
}

const TableBody = ({ hasHeader, children }: TableProps) => {
  return (
    <AnimatePresence mode="wait">
      <div className="h-full w-full px-3 sm:px-5 md:px-7">
        <motion.div
          className={clsx(
            "hide-scrollbars relative h-full w-full overflow-scroll pb-4",
            hasHeader ? "pt-12" : "pt-4",
          )}
          {...fadeInAndOut(0.15)}
        >
          <table className="w-full">
            <tbody>{children}</tbody>
          </table>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TableBody;
