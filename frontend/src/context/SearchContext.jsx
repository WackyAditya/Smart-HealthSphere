import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext({
  searchTerm: '',
  setSearchTerm: () => {},
  clearSearch: () => {},
});

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const clearSearch = () => setSearchTerm('');

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm, clearSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
