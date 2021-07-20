// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState } from 'react';

// React context for token, & typedefs
import { useStorage }  from '../../contexts/StorageContext';

// Fluent UI
import { ActionButton } from '@fluentui/react/lib/Button';

export default function CreateTemplate(props) {
  const typeDef          = (props && props.typeDef) || null,
        setBlobPath      = (props && props.setBlobPath) || null,

        // Storage context
        storageContainer = useStorage(),
        
        // State of creation
        [disabled,  setDisabled] = useState(false),

        // Icons
        iconUpload       = { iconName: 'CloudUpload' };

  // Handle clicking create button
  const handleCreate = (typeDef, e) => {
    e.preventDefault();
    setDisabled(true);

    const typeDefName        = (typeDef && typeDef.name) || null,
          typeDefAttributes  = (typeDef && typeDef.attributeDefs) || null,
          typeDefOptions     = (typeDef && typeDef.options) || null,
          typeDefOptionsKeys = (typeDefOptions && Object.keys(typeDefOptions)) || null,
          typeDefRelAttrDefs = (typeDef && typeDef.relationshipAttributeDefs);

    if (typeDefName) {
      let jsonToUpload = {
        typeName: typeDefName,
        attributes: {
          qualifiedName: "",
          name: "",
          description: ""
        }
      }

      // Loop clean attributes to add key:value to attributes
      if (typeDefAttributes && Array.isArray(typeDefAttributes) && typeDefAttributes.length > 0) {
        typeDefAttributes.forEach((attr, i) => {
          const attrName = (attr && attr.name) || null;
          if (attrName && jsonToUpload && jsonToUpload.attributes) {
            jsonToUpload.attributes[attrName] = "";
          }
        });
      }

      // Loop options for entity typedefs
      if (typeDefOptionsKeys && Array.isArray(typeDefOptionsKeys) && typeDefOptionsKeys.length > 0) {
        jsonToUpload.options = {};
        typeDefOptionsKeys.forEach((optKey,i) => {
          if (optKey && optKey !== "") {
            jsonToUpload.options[optKey] = "";
          }
        });
      }

      // Handle relationships attribute definitions
      if (typeDefRelAttrDefs && Array.isArray(typeDefRelAttrDefs) && typeDefRelAttrDefs.length > 0) {
        jsonToUpload.relationshipAttributes = {};
        typeDefRelAttrDefs.forEach((relAttr,i) => {
          const name = (relAttr && relAttr.name) || null;
          if (name && name !== "") {
            jsonToUpload.relationshipAttributes[name] = {
              qualifiedName: "",
              entityStatus: "",
              displayText: ""
            }
          }
        });
      }

      // Upload to ADLS for a reuseable JSON template
      const container   = storageContainer || 'purview-custom-types-tool',
            dateToJson  = new Date().toJSON(),
            encodedDate = (dateToJson && dateToJson.replace(/[^0-9]/g, '')) || '',
            uploadPath  = `custom-typedefs/${typeDefName}-${encodedDate}.json`,
            blobBody    = {
                            container: container,
                            blob:      uploadPath,
                            content:   JSON.stringify(jsonToUpload)
                          },
            postEntity  = {
                            method:  'POST',
                            body:    JSON.stringify(blobBody),
                            headers: {'Content-Type':'application/json'}
                          };
      
      // POST API to create new blob
      let apiUrl = "/api/storage/blobs";
      console.log(`### FETCH: POST ${apiUrl}`);
      console.log('jsonToUpload:', jsonToUpload);
      fetch(apiUrl, postEntity)
        .then(response => response.json()) 
        .then(json => {
          // SUCCESSFUL UPLOAD
          if (json.status === 201) {
            console.log(`### Blob '${container}/${uploadPath}' was successfully created`);
            // Update component state
            setBlobPath( `${container}/${uploadPath}` );
            setDisabled(false);
          }
        })
        .catch(error => {console.error('Error:', error)});
    }
  }

  return (
    <ActionButton
      iconProps={iconUpload}
      onClick={(e) => handleCreate(typeDef, e)}
      allowDisabledFocus disabled={disabled} checked={false}
    >Create Template</ActionButton>
  );
}
