/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { createContext, useContext } from 'react';

// Create new typedefs context
export const TypeDefsContext = createContext();

// React hook to use typedefs context
export function useTypeDefs() {
  return useContext(TypeDefsContext);
}
