import { useState, useMemo, useEffect } from 'react';

export interface UsePaginationOptions {
  initialPageSize?: number;
  initialPage?: number;
}

export function usePagination<T>(items: T[], options?: UsePaginationOptions) {
  const [pageSize, setPageSize] = useState(options?.initialPageSize || 10);
  const [currentPage, setCurrentPage] = useState(options?.initialPage || 1);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Auto-correct currentPage if total items shrinks
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalItems, totalPages, currentPage]);

  // Reset page to 1 whenever the array reference changes (e.g. search / filter applied)
  const resetPage = () => setCurrentPage(1);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    paginatedItems,
    resetPage
  };
}
