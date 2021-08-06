// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState } from 'react';

// Component styles
import './ServiceTypeNav.css';

// Fluent UI
import { Icon } from '@fluentui/react/lib/Icon';
import { DefaultButton, ActionButton } from '@fluentui/react/lib/Button';

export default function ServiceTypeNav(props) {
  const serviceType       = (props && props.serviceType) || null,
        serviceTypeName   = (props && props.serviceTypeName) || null,
        updateServiceView = (props && props.updateServiceView) || null,

        // Categories of type defs
        serviceTypeCats   = (serviceType && Object.keys(serviceType)) || [],
        
        // Icons
        iconNew           = { iconName: 'Add' },
        iconTypeDef       = { iconName: 'FileCode' },
        iconRelationship  = { iconName: 'Relationship' },
        IconCaretOpen     = () => <Icon iconName="CaretSolid" className="typedef_category_icon typedef_category_icon--open" />,
        IconCaretClosed   = () => <Icon iconName="CaretSolidRight" className="typedef_category_icon typedef_category_icon--closed" />,

        // React State
        [activeCat,     setActiveCat]     = useState( (serviceTypeName !== 'All') ? 'entityDefs' : null ),
        [activeTypeDef, setActiveTypeDef] = useState();

  // Handle clicking new entity button
  const handleNewClick = () => {
    updateServiceView('new', null);
  };

  const handleNameClick = (typeDef, e) => {
    e.preventDefault();
    if (typeDef) {
      setActiveTypeDef(typeDef && typeDef.guid);
      updateServiceView('details', typeDef);
      window.scrollTo(0,0);
    }
  };

  // Handle clicking list category
  const handleCatClick = (cat, e) => {
    e.preventDefault();
    // reset active category if clicked "off" a 2nd time
    (activeCat === cat) ? setActiveCat('') : setActiveCat( cat );
  };
  
  // Build output
  let output = [];
  if (serviceTypeCats && Array.isArray(serviceTypeCats) && serviceTypeCats.length > 0) {
    // Loop through object keys (type def categories)
    serviceTypeCats.forEach((cat,i) => {
      if (cat !== 'myServiceTypes') {
        const catTitle = (cat && (cat.charAt(0).toUpperCase() + cat.slice(1)).replace('Defs', ' Defs') ) || null,
              category = serviceType[cat] || null,
              names    = (category && category.names) || null,
              types    = (category && category.typeDefs),
              catClass = (activeCat === cat) ? 'typedef_category_list active_category' : 'typedef_category_list';
        
        // Build list output
        let outputList = [];
        if (names && Array.isArray(names) && names.length > 0) {
          // Category header (collapsible w/ count)
          output.push(
            <div key={`cat${i}`} className="typedef_category_header">
              <div className="typedef_category_name">
                {(activeCat === cat)
                    ? <IconCaretOpen />
                    : <IconCaretClosed />
                }
                <div>
                  <a href={`/typedefs/${cat}`} onClick={(e) => handleCatClick(cat, e)}>{catTitle}</a>
                </div>
              </div>
              <div className="typedef_category_count">
                <small className="muted">{names.length}</small>
              </div>
            </div>
          );

          // Loop through sorted names array to build output
          names.forEach((name,i2) => {
            const typeDef = (types && types[name]) || null,
                  guid    = (typeDef && typeDef.guid) || null,
                  isActive = (guid && guid === activeTypeDef) ? true : false;
            if (typeDef) {
              outputList.push(
                <li
                  key={`typeDef${i2}`}
                  className={`typedef_category_list_item${ (isActive) ? ' typedef_category_list_item--active' : null }`}
                >
                  <ActionButton
                    className="list_button"
                    iconProps={(cat==='relationshipDefs') ? iconRelationship : iconTypeDef}
                    ariaLabel={name}
                    onClick={(e) => handleNameClick(typeDef, e)}
                    allowDisabledFocus disabled={false} checked={false}
                  >
                    {name}
                  </ActionButton>
                </li>
              );
              }
          });

          output.push(
            <ul key={`catlist${i}`} className={catClass}>
              {outputList}
            </ul>
          );
        }
      }
    });
  }
  else {
    output.push(
      <div key="no-items" className="typedef_new">
        <div><img alt="No items" className="typedef_list_empty" key="typedef_list_empty" src="/assets/images/icon-empty-items.svg" /></div>
      </div>
    )
  }
  
  return(
    <>
      {(serviceTypeName !== '-Uncategorized' && serviceTypeName !== 'All')
        ?  <div className="typedef_new" role="navigation">
            <DefaultButton
              className="typedef_new_button"
              iconProps={iconNew}
              text="New Type Definition"
              onClick={() => { handleNewClick() }}
            />
          </div>
        : null
      }
      <div className="typedef_category_lists">
        {output}
      </div>
    </>
  );
}
