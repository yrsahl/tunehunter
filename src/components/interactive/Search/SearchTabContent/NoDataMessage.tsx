type EmptyTableProps =
  | {
      message: string;
      element?: JSX.Element;
    }
  | {
      message?: string;
      element: JSX.Element;
    };

const NoDataMessage = ({ message, element }: EmptyTableProps) => {
  return (
    <div className="flex h-full w-full items-center justify-center px-8 text-center text-sm sm:text-base">
      {message && <p>{message}</p>}
      {element}
    </div>
  );
};

export default NoDataMessage;
