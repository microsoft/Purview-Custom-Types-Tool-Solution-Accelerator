// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';

// Fluent UI
import { Label }     from '@fluentui/react/lib/Label';
import { DefaultButton } from '@fluentui/react/lib/Button';

import './AttrDefsDynamicForm.css';

export default function AttrDefsDynamicForm(props) {
  const attrFields       = (props && props.attrFields) || [],
        setAttrFields    = (props && props.setAttrFields) || null, // reference to parent's function
        defaultAttribute = (props && props.defaultAttribute) || null,

        iconAdd          = { iconName: 'Add' },
        iconDelete       = { iconName: 'Delete' };

  // Handle Attributes Change
  const handleAttrChange = (index, event) => {
    const values        = [...attrFields],
          target        = (event && event.target) || null,
          targetType    = (target && target.type) || null,
          targetName    = (target && target.name) || '',
          targetValue   = (target && target.value) || '',
          targetChecked = (target && target.checked) || false;

    switch (targetName) {
      case "name":
      case "typeName":
        values[index][targetName] = targetValue;
        break;

      case "cardinality":
        values[index][targetName] = (targetValue.toLowerCase() === 'single') ? 'SINGLE': 'SET';
        break;

      case "isOptional":
      case "isUnique":
        values[index][targetName] = (targetType==='checkbox' && targetChecked === true) ? true : false;
        break;
      default:
        break;
    }

    setAttrFields(values);
  };

  // Handle Adding Attribute
  const handleAddAttribute = (index, event) => {
    const values = [...attrFields];
    values.push(defaultAttribute);
    setAttrFields(values);
  };

  // Handle Removing Attribute
  const handleRemoveAttribute = (index) => {
    const values = [...attrFields];
    values.splice(index, 1);
    setAttrFields(values);
  };

  return (
    <div className="form_group form_group--extra">
      <h3>Attributes</h3>
      {(attrFields.length > 0) ?
        <table className="form_attributes">
          <tbody>
            <tr>
              <td className="nowrap"><Label>Attribute Name</Label></td>
              <td className="nowrap"><Label>Data Type</Label></td>
              <td><Label>Cardinality</Label></td>
              <td><Label>Optional?</Label></td>
              <td><Label>Unique?</Label></td>
              <td>&nbsp;</td>
            </tr>

            {attrFields.map((inputField, index) => (
              <tr key={`attr${index}`}>
                  <td>
                    <input size="25" type="text" name="name" value={inputField.name} onChange={event => handleAttrChange(index, event)} />
                  </td>
                  <td>
                    <select name="typeName" value={inputField.typeName} onChange={event => handleAttrChange(index, event)}>
                      <option value="string">string</option>
                      <option value="int">int</option>
                      <option value="date">date</option>
                    </select>
                  </td>
                  <td>
                    <select name="cardinality" value={inputField.cardinality} onChange={event => handleAttrChange(index, event)}>
                      <option value="SINGLE">Single</option>
                      <option value="SET">Set (Array)</option>
                    </select>
                  </td>
                  <td className="form_attribute_optional">
                    <input name="isOptional" type="checkbox" checked={inputField.isOptional} onChange={event => handleAttrChange(index, event)} />
                    {(inputField.isOptional) ? ' Optional' : ' Required'}
                  </td>
                  <td className="form_attribute_unique">
                    <input name="isUnique" type="checkbox" checked={inputField.isUnique} onChange={event => handleAttrChange(index, event)} />
                    {(inputField.isUnique) ? ' Unique' : ' Duplicates'}
                  </td>
                  <td className="form_attribute_actions">
                    <DefaultButton
                      className="button--delete"
                      iconProps={iconDelete}
                      ariaDescription="Delete"
                      onClick={() => handleRemoveAttribute(index)} />
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      : null
      }

      <DefaultButton
        iconProps={iconAdd}
        text="Add Attribute"
        ariaDescription="Add Attribute"
        onClick={() => handleAddAttribute()} />
    </div>
  );
}
