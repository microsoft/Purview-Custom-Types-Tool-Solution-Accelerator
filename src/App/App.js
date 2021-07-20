// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, {useState, useEffect} from 'react';

// React Contexts for user & AAD token authentication
import { AuthContext }     from '../contexts/AuthContext';
import { AadTokenContext } from '../contexts/AadTokenContext';
import { TypeDefsContext } from '../contexts/TypeDefsContext';
import { StorageContext }  from '../contexts/StorageContext';

// Child components
import AppHeader    from '../components/AppHeader/AppHeader';
import AppFooter    from '../components/AppFooter/AppFooter';
import Main         from '../components/Main/Main';
import HowToSetup   from '../components/HowToSetup/HowToSetup';

// Component styles
import './App.css';

// Fluent UI
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { Modal }           from '@fluentui/react';

// Helper to consolidate fetch functions
const helper = require("./helper");

export default function App() {
  // React Hooks: useState with a var name, set function, & default value
  const [user,      setUser]      = useState(),
        [token,     setToken]     = useState(),
        [container, setContainer] = useState(),
        [typeDefs,  setTypeDefs]  = useState(),
        [refresh,   setRefresh]   = useState(),
        [status,    setStatus]    = useState('Loading application...'),
        [showSetup, setShowSetup] = useState(false);
  
  // React Hook: useEffect when component changes
  // Empty array ensures it only runs once on component mount
  useEffect(() => {
    // Fluent UI icons
    initializeIcons();
    
    // Fetch user & token
    setStatus('Authorizing user & token...');
    helper.fetchAuth(setUser);
    helper.fetchToken(setToken);
    helper.fetchContainer(setContainer);
  }, []);

  // Hook to get Purview API TypeDefs when token or refresh changes
  useEffect(() => {
    if (token && token === 'error') {
      setStatus('Error: Unable to access application API');
      setShowSetup(true);
    }
    else if (token) {
      setStatus('Processing type definitions...');
      helper.fetchTypeDefs(token, setTypeDefs);
    }
  }, [token, refresh]);

  return (
    <AuthContext.Provider value={user}>
      <AadTokenContext.Provider value={token}>
        <StorageContext.Provider value={container}>
          {(typeDefs)
            ? <TypeDefsContext.Provider value={[typeDefs, setRefresh]}>
                <div className="app">
                  <AppHeader />
                  <Main />
                </div>
                <AppFooter />
              </TypeDefsContext.Provider>
            
            // No typedefs, so still loading
            : <Modal containerClassName="app_loading" titleAriaId="loading" isOpen={true} isModeless={true}>
                <div className="app_loading_title">Purview Custom Types Tool</div>
                <div className="app_loading_status">{status}</div>
                {(showSetup)
                    ? <div className="app_setup">
                        <HowToSetup />
                      </div>
                    : null
                }
              </Modal>

          }
        </StorageContext.Provider>
      </AadTokenContext.Provider>
    </AuthContext.Provider>
  );
}

