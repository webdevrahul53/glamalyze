"use client";

import { useState, useCallback } from "react";
import { debounce } from "lodash";
import { Input } from "@heroui/react";
import { SearchIcon } from "../utilities/svgIcons";

const SearchComponent = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearch = useCallback(
    debounce((query) => onSearch(query), 500), 
    []
  );

  const handleChange = (e: any) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  return (
    <Input
      placeholder="Search ..."
      type="text"
      value={searchQuery}
      onChange={handleChange}
      startContent={<SearchIcon width="20" />}
    />
  );
};

export default SearchComponent;
