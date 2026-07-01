import { useCallback, useMemo, useState } from 'react';

export const usePagination = (initialState = {}) => {
  const {
    initialPage = 1,
    initialPageSize = 20,
    initialTotal = 0,
  } = initialState;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(initialTotal);

  const totalPages = useMemo(() => {
    if (total === 0) return 1;
    return Math.ceil(total / pageSize);
  }, [total, pageSize]);

  const hasNext = useMemo(() => {
    return page < totalPages;
  }, [page, totalPages]);

  const hasPrev = useMemo(() => {
    return page > 1;
  }, [page]);

  const nextPage = useCallback(() => {
    if (hasNext) {
      setPage(page + 1);
    }
  }, [page, hasNext]);

  const prevPage = useCallback(() => {
    if (hasPrev) {
      setPage(page - 1);
    }
  }, [page, hasPrev]);

  const goToPage = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages]
  );

  const changePageSize = useCallback(
    (newSize) => {
      setPageSize(newSize);
      setPage(1);
    },
    []
  );

  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
    setTotal(initialTotal);
  }, [initialPage, initialPageSize, initialTotal]);

  const getPageRange = useCallback(() => {
    const range = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  }, [page, totalPages]);

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext,
    hasPrev,
    setPage,
    setPageSize,
    setTotal,
    nextPage,
    prevPage,
    goToPage,
    changePageSize,
    resetPagination,
    getPageRange,
  };
};