import clsx from "clsx";
import { ReactNode } from "react";

interface TableProps {
  hasHeader: boolean;
  children: ReactNode;
}

const TableBody = ({ hasHeader, children }: TableProps) => {
  return (
    <div className="h-full w-full px-3 sm:px-5 md:px-7">
      <div
        className={clsx(
          "hide-scrollbars relative h-full w-full overflow-scroll pb-4",
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
