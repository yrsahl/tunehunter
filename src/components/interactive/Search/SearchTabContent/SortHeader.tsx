import { ChevronDown, ChevronUp } from "lucide-react";

interface SortHeaderProps {
  label: string;
  isActive: boolean;
  isAsc: boolean;
  onClick: () => void;
}

const SortHeader = ({ label, isActive, isAsc, onClick }: SortHeaderProps) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 font-bold text-foreground transition hover:text-foreground/70"
  >
    {label}
    {isActive && (isAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
  </button>
);

export default SortHeader;
