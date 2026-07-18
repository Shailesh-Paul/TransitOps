import { useState, useMemo } from 'react';

export const useSearch = (data, searchKeys) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm || !data) return data;
    const lowercasedTerm = searchTerm.toLowerCase();
    
    return data.filter(item => {
      return searchKeys.some(key => {
        const val = item[key];
        return val && String(val).toLowerCase().includes(lowercasedTerm);
      });
    });
  }, [data, searchTerm, searchKeys]);

  return { searchTerm, setSearchTerm, filteredData };
};
