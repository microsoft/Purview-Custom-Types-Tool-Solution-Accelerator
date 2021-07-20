// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState, useEffect } from 'react';

// Fluent UI
import { PrimaryButton } from '@fluentui/react/lib/Button';

export default function FormSubmit(props) {
  const handleClick  = (props && props.handleClick) || null, // reference to parent's function
        text         = (props && props.text) || 'Submit',
        textLoading  = (props && props.textLoading) || 'Loading',
        disabledProp = (props && props.disabled) || null,
        iconName     = (props && props.iconName) || null,
        iconProps    = (iconName) ? { iconName: iconName } : null,

        // React states
        [disabled, setDisabled] = useState(),
        
        style = (disabled) ? 'submit submit--disabled' : 'submit';

  // React Hooks: useEffect when token changes
  useEffect(() => {
    setDisabled( (disabledProp && disabledProp === true) ? true : false);
  }, [disabledProp]);


  function handleThisClick(e) {
    e.preventDefault();
    handleClick(e);
  }

  return (
    <PrimaryButton
      text={(disabled) ? textLoading : text}
      ariaDescription={text}
      iconProps={iconProps}
      onClick={handleThisClick}
      className={style}
      disabled={disabled}
      allowDisabledFocus
      checked={false} />
  );
}
