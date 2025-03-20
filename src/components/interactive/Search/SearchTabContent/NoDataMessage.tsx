interface EmptyTableProps {
  message: string;
}

const NoDataMessage = ({ message }: EmptyTableProps) => {
  return (
    <div className="flex h-full w-full items-center justify-center text-center">
      <p>{message}</p>
    </div>
  );
};

export default NoDataMessage;
