// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, {useState} from 'react';

// Sub-views within main single-page application
import SelectServiceType from '../../components/SelectServiceType/SelectServiceType';
import ServiceType       from '../../components/ServiceType/ServiceType';

// Component styles
import './Main.css';

export default function Main() {
  // View state
  const [view,            setView]            = useState(),
        [viewServiceType, setViewServiceType] = useState(),
        [viewName,        setViewName]        = useState();
        
  // Common nav elements
  const homeLink        = <a key="nav_home" href="/"
                            onClick={(e) => {
                              e.preventDefault();
                              updateView('main', '', '');
                            }}
                          >Home</a>;

  // Func to return breadcrumb arrow with key (required by lists)
  const breadcrumbArrow = (key) => {
    return <span key={`arrow${key}`} className="breadcrumb_arrow">&gt;</span>
  };

  // Function to update view
  const updateView = (view, cat, name) => {
          // console.log(`<Main> updateView(${view}, ${cat}, ${name})`);
          const validViews = ['main', 'serviceType'];
          if (validViews.indexOf(view) !== -1) {
            setView(view);
            window.scrollTo(0,0);

            switch (view) {

              case 'serviceType':
                if (cat) setViewServiceType(String(cat));
                if (name) setViewName(String(name));
                break;
              
              default:
                break;
            }
          }
        };

  // Build output
  let breadcrumbs = [],
      output;

  switch (view) {
    case 'serviceType':
      breadcrumbs.push(homeLink);
      if (viewServiceType === 'new' && viewName) {
        breadcrumbs.push( breadcrumbArrow(1) );
        breadcrumbs.push(viewName);
      }
      else if (viewServiceType) {
        breadcrumbs.push( breadcrumbArrow(1) );
        breadcrumbs.push(viewServiceType);
      }
      output = <ServiceType serviceTypeName={viewServiceType} newName={viewName}  />
      break;
      
    default:
      output  = <SelectServiceType updateView={updateView} />
      break;
  }

  return (
    <main className="main" role="main">
      {(breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 0)
          ? <nav className="breadcrumbs">{breadcrumbs}</nav>
          : null
      }
      {output}
    </main>
  );
}
