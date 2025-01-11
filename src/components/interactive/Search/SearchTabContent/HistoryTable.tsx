import { SearchSubTab } from "../SearchTabBar";

interface HistoryTabContentProps {
  data: any;
  activeTab?: SearchSubTab;
}

const HistoryTable = ({ data, activeTab }: HistoryTabContentProps) => {
  return <table className="w-full"></table>;
};

export default HistoryTable;
