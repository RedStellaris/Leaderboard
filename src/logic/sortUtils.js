import { useState } from "react";

export function useSortConfig() {
  const [sortConfig, setSortConfig] = useState({ key: null, dir: "asc" });
  function onSort(key) {
    setSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));
  }
  return [sortConfig, onSort];
}

export function sortRows(rows, sortConfig, getVal) {
  if (!sortConfig.key) return rows;
  return [...rows].sort((a, b) => {
    const va = getVal(a, sortConfig.key);
    const vb = getVal(b, sortConfig.key);
    if (typeof va === "string") {
      return sortConfig.dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return sortConfig.dir === "asc" ? va - vb : vb - va;
  });
}
