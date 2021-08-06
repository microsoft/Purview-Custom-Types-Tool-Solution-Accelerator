// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, {useState} from 'react';

// React Contexts
import { useTypeDefs } from '../../contexts/TypeDefsContext';

// Child components
import ServiceTypeNav  from '../../components/ServiceTypeNav/ServiceTypeNav';
import TypeDefDetails  from '../../components/TypeDefDetails/TypeDefDetails';
import TypeDefNew  from '../../components/TypeDefNew/TypeDefNew';

// Component styles
import './ServiceType.css';

// Fluent UI
import { Icon } from '@fluentui/react/lib/Icon';

export default function ServiceType(props) {
  const newValue              = 'new',
        allValue              = 'All',
        uncatValue            = '-Uncategorized',
        propsServiceTypeName  = (props && props.serviceTypeName) || null,
        propsNewName          = (props && props.newName) || null,

        useTypeDefsArray      = useTypeDefs(),
        typeDefs              = (useTypeDefsArray && useTypeDefsArray[0]) || null,
        myServiceTypes        = (typeDefs && typeDefs.myServiceTypes) || null,
        myServiceTypesList    = (myServiceTypes && myServiceTypes.serviceTypes) || null,

        // Lookup specific service type, confirm name and get category keys
        serviceType           = (propsServiceTypeName === allValue)
                                  ? typeDefs
                                  : (myServiceTypesList && myServiceTypesList[propsServiceTypeName]) || null,
        serviceTypeName       = (propsServiceTypeName === newValue) ? propsNewName : propsServiceTypeName,

        // React State
        [serviceView, setServiceView] = useState( (propsServiceTypeName === newValue) ? 'new' : null ),
        [typeDef,     setTypeDef]     = useState(),

        ServiceIcon = () => <Icon iconName="OpenFolderHorizontal" className="servicetype_header_icon" />;
  
  const updateServiceView = (view, typeDef) => {
    // console.log(`<ServiceType> updateServiceView(${view})`, typeDef);
    setServiceView(view);
    setTypeDef(typeDef);
  };

  // Build output
  let output;
  switch (serviceView) {
    case 'details':
      output = <TypeDefDetails typeDef={typeDef} serviceTypeName={serviceTypeName} updateServiceView={updateServiceView} />;
      break;
      
    case 'new':
      output  = <TypeDefNew typeDef={typeDef} serviceTypeName={serviceTypeName} />
      break;
    
    default:
      output =  <>
                  <div className="servicetype_header">
                    <ServiceIcon />
                    <h1 className="title">{(serviceTypeName === uncatValue) ? 'Uncategorized' : serviceTypeName}</h1>
                  </div>
                  {(serviceTypeName===uncatValue || serviceTypeName===allValue)
                    ? <><p>Select a type definition from the list.</p><p>OR</p><p>Go back to select a service type before creating new typedefs.</p></>
                    : <p>Select or create a type definition from the list.</p>
                  }
                </>;
      break;
  }

  return(
    <div className="servicetype_container">
      <div className="servicetype_nav">
        <ServiceTypeNav
          serviceTypeName={serviceTypeName}
          serviceType={serviceType}
          updateServiceView={updateServiceView}
        />
      </div>
      <div className="servicetype_content">
        {output}
      </div>
    </div>
  );
}
