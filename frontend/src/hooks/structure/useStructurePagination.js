import { useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

export const useStructurePagination = ({
  page: externalPage = 1,
  pageSize: externalPageSize = 50,
  total = 0,
  onPageChange = null,
  onPageSizeChange = null,
  defaultPageSize = 50,
  pageSizeOptions = [10, 25, 50, 100, 250],
}) => {
  const dispatch = useDispatch();
  const [internalPage, setInternalPage] = useState(externalPage);
  const [internalPageSize, setInternalPageSize] = useState(externalPageSize || defaultPageSize);
  const page = externalPage !== undefined ? externalPage : internalPage;
  const pageSize = externalPageSize !== undefined ? externalPageSize : internalPageSize;
  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);
  const startIndex = useMemo(() => (page - 1) * pageSize + 1, [page, pageSize]);
  const endIndex = useMemo(() => Math.min(page * pageSize, total), [page, pageSize, total]);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  const setPage = useCallback((newPage) => {
    const targetPage = Math.min(Math.max(1, newPage), totalPages);
    if (targetPage === page) return;
    if (onPageChange) {
      onPageChange(targetPage);
    } else {
      setInternalPage(targetPage);
    }
  }, [page, totalPages, onPageChange]);
  const nextPage = useCallback(() => {
    if (hasNextPage) setPage(page + 1);
  }, [hasNextPage, page, setPage]);
  const previousPage = useCallback(() => {
    if (hasPreviousPage) setPage(page - 1);
  }, [hasPreviousPage, page, setPage]);
  const firstPage = useCallback(() => {
    if (page !== 1) setPage(1);
  }, [page, setPage]);
  const lastPage = useCallback(() => {
    if (page !== totalPages) setPage(totalPages);
  }, [page, totalPages, setPage]);
  const setPageSize = useCallback((newSize) => {
    if (newSize === pageSize) return;
    const currentFirstItem = (page - 1) * pageSize + 1;
    const newPage = Math.ceil(currentFirstItem / newSize);
    
    if (onPageSizeChange) {
      onPageSizeChange(newSize, newPage);
    } else {
      setInternalPageSize(newSize);
      setInternalPage(newPage);
    }
  }, [page, pageSize, onPageSizeChange]);
  
  // Reset pagination
  const resetPagination = useCallback(() => {
    if (onPageChange) {
      onPageChange(1);
    } else {
      setInternalPage(1);
    }
  }, [onPageChange]);
  
  // Update total (e.g., when filters change)
  const updateTotal = useCallback((newTotal) => {
    // This is just a pass-through - the parent component should handle
    if (onPageChange && page > Math.ceil(newTotal / pageSize)) {
      onPageChange(1);
    }
  }, [page, pageSize, onPageChange]);
  
  // Get page range for display (e.g., "1-3 of 5")
  const getPageRange = useCallback(() => {
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);
  
  return {
    // Current state
    page,
    pageSize,
    total,
    totalPages,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    
    // Actions
    setPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setPageSize,
    resetPagination,
    updateTotal,
    getPageRange,
    
    // Options
    pageSizeOptions,
    
    // Helper booleans
    isFirstPage: page === 1,
    isLastPage: page === totalPages || totalPages === 0,
    hasItems: total > 0,
    isEmpty: total === 0,
  };
};

export const useReduxPagination = ({
  page,
  pageSize,
  total,
  setPageAction,
  setPageSizeAction,
  pageSizeOptions = [10, 25, 50, 100, 250],
}) => {
  const dispatch = useDispatch();
  
  const handlePageChange = useCallback((newPage) => {
    if (setPageAction) {
      dispatch(setPageAction(newPage));
    }
  }, [dispatch, setPageAction]);
  
  const handlePageSizeChange = useCallback((newSize, newPage) => {
    if (setPageSizeAction) {
      dispatch(setPageSizeAction(newSize));
    }
    if (setPageAction && newPage) {
      dispatch(setPageAction(newPage));
    }
  }, [dispatch, setPageSizeAction, setPageAction]);
  
  return useStructurePagination({
    page,
    pageSize,
    total,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    pageSizeOptions,
  });
};

export default useStructurePagination;