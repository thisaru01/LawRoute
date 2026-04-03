/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";

const CaseContext = createContext(null);

export function useCaseContext() {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error("useCaseContext must be used within a CaseProvider");
  }
  return context;
}

export function CaseProvider({ value, children }) {
  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
}
