interface EmptyTableProps {
  message: string;
}

const NoDataMessage = ({ message }: EmptyTableProps) => {
  return (
    <div className="flex h-full w-full items-center justify-center px-8 text-center text-sm sm:text-base">
      <p>{message}</p>
    </div>
  );
};

export default NoDataMessage;
