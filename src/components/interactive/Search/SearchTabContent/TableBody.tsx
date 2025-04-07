import clsx from "clsx";
import { ReactNode } from "react";

interface TableProps {
  hasHeader: boolean;
  children: ReactNode;
}

const TableBody = ({ hasHeader, children }: TableProps) => {
  return (
    <div className="h-full w-full ">
      <div
        className={clsx(
          "hide-scrollbars relative h-full w-full overflow-scroll px-3 pb-4 sm:px-5 md:px-7",
          hasHeader ? "pt-12" : "pt-4",
        )}
      >
        <table className="w-full">
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
};

export default TableBody;
