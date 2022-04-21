// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, {useState} from 'react';

// React Contexts
import { useTypeDefs } from '../../contexts/TypeDefsContext';

// Component styles
import './SelectServiceType.css';

// Fluent UI
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { Label }         from '@fluentui/react/lib/Label';
import { TextField }     from '@fluentui/react/lib/TextField';
import { Dropdown, DropdownMenuItemType } from '@fluentui/react/lib/Dropdown';

export default function SelectServiceType(props) {
  const valueOfNew         = 'new',
        updateView         = (props && props.updateView),

        // Context for TypeDefs
        useTypeDefsArray   = useTypeDefs(),
        typeDefs           = (useTypeDefsArray && useTypeDefsArray[0]) || null,
        myServiceTypes     = (typeDefs && typeDefs.myServiceTypes) || null,
        myServiceTypeNames = (myServiceTypes && myServiceTypes.names) || [],

        // React state
        [showInput,   setShowInput]   = useState(false),
        [inputName,   setInputName]   = useState(''),
        [disabled,    setDisabled]    = useState(true),
        [serviceType, setServiceType] = useState();

  // Handle select
  function handleSelect(value) {
    if (!value) {
      setDisabled(true);
      setShowInput(false);
      setServiceType(null);
    }
    else {
      setDisabled( (value===valueOfNew && !inputName) ? true : false);
      setShowInput( (value===valueOfNew) ? true : false );
      setServiceType(value);
    }
  }

  // Handle input name
  function handleInputName(e) {
    const target = (e && e.target),
          value  = (target && target.value);
    setDisabled( (value) ? false : true );
    setInputName(value);
  }

  // Handle continue click
  function handleContinue(e) {
    e.preventDefault();
    // New service means new typedef
    if (serviceType) {
      updateView(
        'serviceType',
        serviceType,
        (serviceType===valueOfNew && inputName) ? inputName : ''
      );
    }
  }

  // Build array of select options
  let options = [];
  if (myServiceTypeNames && Array.isArray(myServiceTypeNames) && myServiceTypeNames.length > 0) {
    myServiceTypeNames.forEach((name,i) => {
      options.push({
        key:  name,
        text: name
      });
    });
  }
  options.push({
    key: "moreHeader",
    text: "More Actions",
    itemType: DropdownMenuItemType.Header
  });
  options.push({
    key: valueOfNew,
    text: "+ Create New Service Type"
  });
  options.push({
    key: "All",
    text: "* All Type Definitions"
  });

  return (
    <div className="select_servicetype_container">
      <div className="select_servicetype_image">
        <img src="/assets/images/purview_homepage.svg" alt="Microsoft Purview" />
      </div>
      <div className="select_servicetype_action">
        <h1 className="title nowrap">Select service type</h1>

        <form onSubmit={handleContinue}>
          <div className="form_group">
            <Dropdown
              placeholder="Select..."
              onChange={(event, item) => { handleSelect(item && item.key); }}
              options={options}
            />
          </div>
          {(showInput)
            ? <div className="form_group">
                <Label required>Name:</Label>
                <TextField value={inputName} onChange={handleInputName} />
              </div>
            : null
          }
        </form>
        
        <PrimaryButton
          className="form_group"
          text="Continue"
          ariaDescription="Continue"
          onClick={handleContinue}
          allowDisabledFocus
          disabled={disabled}
          checked={false} />
      </div>
    </div>
  );
}
