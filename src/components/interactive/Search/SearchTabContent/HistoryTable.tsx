import { useSearchTabData } from "@/contexts/SearchTabDataContext";
import { SearchSubTab } from "../SearchTabBar";

interface HistoryTabContentProps {
  activeTab?: SearchSubTab;
}

const HistoryTable = ({ activeTab }: HistoryTabContentProps) => {
  const {
    history: { data, refetchData, isLoading },
  } = useSearchTabData();

  const historyData = data!; // Must exist due to checks in parent SearchTabContent

  return <table className="w-full"></table>;
};

export default HistoryTable;
