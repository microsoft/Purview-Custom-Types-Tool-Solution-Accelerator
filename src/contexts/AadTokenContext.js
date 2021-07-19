import { createContext, useContext } from 'react';

// Create new auth context
export const AadTokenContext = createContext();

// React hook to use auth context
export function useAadToken() {
  return useContext(AadTokenContext);
}
