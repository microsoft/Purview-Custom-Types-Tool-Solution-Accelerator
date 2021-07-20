// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, {useState} from 'react';

// Fluent UI
import { Label }         from '@fluentui/react/lib/Label';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Icon }          from '@fluentui/react/lib/Icon';

export default function OptionsDynamicForm(props) {
  const options       = (props && props.options) || [],
        setOptions    = (props && props.setOptions) || null, // reference to parent's function
        defaultOption = (props && props.defaultOption) || null,
        show          = (props && props.show) || false,

        // Icons
        iconAdd          = { iconName: 'Add' },
        iconDelete       = { iconName: 'Delete' },
        IconCaretOpen     = () => <Icon iconName="CaretSolid" className="typedef_category_icon typedef_category_icon--open" />,
        IconCaretClosed   = () => <Icon iconName="CaretSolidRight" className="typedef_category_icon typedef_category_icon--closed" />,
        [showAdvanced, setShowAdvanced] = useState(show);

  // Handle Options Change
  const handleOptionChange = (index, event) => {
    const values        = [...options],
          target        = (event && event.target) || null,
          targetName    = (target && target.name) || '',
          targetValue   = (target && target.value) || '',
          validNames    = ["optionKey", "optionValue"];

    if (targetName && validNames.indexOf(targetName) !== -1) {
      values[index][targetName] = targetValue;
    }
    setOptions(values);
  };

  // Handle clicking advanced
  const handleAdvancedClick = (e) => {
    e.preventDefault();
    setShowAdvanced( (showAdvanced) ? false : true );
  };
  
  // Handle Adding Option
  const handleAddOption = (index, event) => {
    const values = [...options];
    values.push(defaultOption);
    setOptions(values);
  };

  // Handle Removing Option
  const handleRemoveOption = (index) => {
    const values = [...options];
    values.splice(index, 1);
    setOptions(values);
  };

  return (
    <div className="form_group form_group--extra">
      <h3 className="clickable" onClick={(e) => handleAdvancedClick(e)}>
        {(showAdvanced)
            ? <IconCaretOpen />
            : <IconCaretClosed />
        }
        Advanced Options
      </h3>
      
      <div className={(showAdvanced) ? null : 'hidden'}>
        {(options.length > 0) ?
          <table className="form_options">
            <tbody>
              <tr>
                <td className="nowrap"><Label>Key</Label></td>
                <td className="nowrap"><Label>Value</Label></td>
                <td>&nbsp;</td>
              </tr>

              {options.map((inputField, index) => (
                <tr key={`option${index}`}>
                  <td>
                    <input size="25" type="text" name="optionKey" value={inputField.optionKey} onChange={event => handleOptionChange(index, event)} />
                  </td>
                  <td>
                    <input size="25" type="text" name="optionValue" value={inputField.optionValue} onChange={event => handleOptionChange(index, event)} />
                  </td>
                  <td className="form_option_actions">
                    <DefaultButton
                      className="button--delete"
                      iconProps={iconDelete}
                      ariaDescription="Delete"
                      onClick={() => handleRemoveOption(index)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        : null
        }

        <DefaultButton
          iconProps={iconAdd}
          text="Add Option"
          ariaDescription="Add Option"
          onClick={() => handleAddOption()} />
      </div>
    </div>
  );
}
