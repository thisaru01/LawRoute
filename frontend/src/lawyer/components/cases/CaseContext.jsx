/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";

// Shared React context for all case-related data/actions
const CaseContext = createContext(null);

// Hook to access case data inside the Case layout
export function useCaseContext() {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error("useCaseContext must be used within a CaseProvider");
  }
  return context;
}

// Provider wrapper used at the case-layout level
export function CaseProvider({ value, children }) {
  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
}
