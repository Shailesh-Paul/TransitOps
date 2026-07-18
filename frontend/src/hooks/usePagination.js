import { useState, useMemo } from 'react';

export const usePagination = (data, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data?.slice(start, start + itemsPerPage) || [];
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    nextPage: () => goToPage(currentPage + 1),
    prevPage: () => goToPage(currentPage - 1),
    itemsPerPage
  };
};
