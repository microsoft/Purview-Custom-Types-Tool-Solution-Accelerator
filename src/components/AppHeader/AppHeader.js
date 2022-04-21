// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, {useState, useEffect} from 'react';

// React Contexts
import { useAuth }     from '../../contexts/AuthContext';
import { useTypeDefs } from '../../contexts/TypeDefsContext';

// Fluent UI
import { Icon } from '@fluentui/react/lib/Icon';

// Component styles
import './AppHeader.css';

export default function AppHeader() {
  const user             = useAuth(),
        useTypeDefsArray = useTypeDefs(),
        typeDefs         = (useTypeDefsArray && useTypeDefsArray[0]) || null,
        atlasAccountName = (typeDefs && typeDefs.atlasAccountName) || null,
        
        // Component state
        [authOutput, setAuthOutput] = useState(null),
        
        // Icons
        HeaderIcon       = () => <Icon iconName="CaretSolidRight" className="header_chevron" />;
  
  // Update call-to-action based on user
  useEffect(() => {
    if (user) {
      const clientPrincipal = (user && user.clientPrincipal) || null,
            userDetails     = (clientPrincipal && clientPrincipal.userDetails) || null,
            outputAnon      = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
                                ? 'Welcome localhost'
                                : <>Welcome | <a href="/login" className="header_link">Sign In</a></>,
            outputUser      = (userDetails && <>Hi {userDetails} | <a href="/logout" className="header_link">Sign Out</a></>) || null,
            newOutput          = (userDetails) ? outputUser : outputAnon;
      
      setAuthOutput(newOutput);
    }
  }, [user]);

  return (
    <header className="header" role="banner">
      <div className="header_branding">
        <a href="/" className="header_title">Purview Custom Types Tool</a>
        {(atlasAccountName) ? <><HeaderIcon />{atlasAccountName}</> : null}
      </div>
      <div className="auth" role="navigation">{authOutput}</div>
    </header>
  );
};
