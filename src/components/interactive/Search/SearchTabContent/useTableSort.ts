import { useRef, useState } from "react";

const useTableSort = <T extends string>(defaultSort: T) => {
  const [sort, setSort] = useState<T>(defaultSort);
  const [filter, setFilter] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleSort = (asc: string, desc: string) => {
    setSort((sort === asc ? desc : asc) as T);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  return { sort, setSort, toggleSort, filter, setFilter, scrollRef };
};

export default useTableSort;
