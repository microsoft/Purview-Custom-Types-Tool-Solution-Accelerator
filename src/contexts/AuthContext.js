/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { createContext, useContext } from 'react';

// Create new auth context
export const AuthContext = createContext();

// React hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}
