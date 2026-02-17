import { MedalIcon } from "lucide-react";

const RankingIndicator = ({ rank }: { rank: number }) => {
  if (rank === 1)
    return <MedalIcon fill="#EFBF04" stroke="#000" size="28px" strokeWidth={".7px"} />;
  if (rank === 2)
    return <MedalIcon fill="#C4C4C4" stroke="#000" strokeWidth={".7px"} size="28px" />;
  if (rank === 3)
    return <MedalIcon fill="#CE8946" stroke="#000" strokeWidth={".7px"} size="28px" />;
  return <p className="text-center">{`${rank}.`}</p>;
};

export default RankingIndicator;
