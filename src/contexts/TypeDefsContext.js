// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createContext, useContext } from 'react';

// Create new typedefs context
export const TypeDefsContext = createContext();

// React hook to use typedefs context
export function useTypeDefs() {
  return useContext(TypeDefsContext);
}
