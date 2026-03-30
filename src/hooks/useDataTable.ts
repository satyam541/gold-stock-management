import { useState, useMemo, useRef } from "react";

interface UseDataTableOptions<T> {
  searchFn?: (item: T, query: string) => boolean;
  defaultPageSize?: number;
}

export function useDataTable<T>(
  allData: T[],
  options: UseDataTableOptions<T> = {}
) {
  const { defaultPageSize = 10 } = options;
  const searchFnRef = useRef(options.searchFn);
  searchFnRef.current = options.searchFn;

  const [search, setSearchRaw] = useState("");
  const [pageSize, setPageSizeRaw] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim() || !searchFnRef.current) return allData;
    const q = search.toLowerCase().trim();
    return allData.filter((item) => searchFnRef.current!(item, q));
  }, [allData, search]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  const from = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, totalItems);

  const setSearch = (v: string) => {
    setSearchRaw(v);
    setCurrentPage(1);
  };

  const setPageSize = (v: number) => {
    setPageSizeRaw(v);
    setCurrentPage(1);
  };

  return {
    data: paginatedData,
    search,
    setSearch,
    pageSize,
    setPageSize,
    currentPage: safePage,
    setCurrentPage,
    totalItems,
    totalPages,
    from,
    to,
  };
}
