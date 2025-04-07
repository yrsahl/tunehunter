interface EmptyTableProps {
  message: string;
}

const NoDataMessage = ({ message }: EmptyTableProps) => {
  return (
    <div className="flex h-full w-full items-center justify-center px-8 text-center">
      <p>{message}</p>
    </div>
  );
};

export default NoDataMessage;
