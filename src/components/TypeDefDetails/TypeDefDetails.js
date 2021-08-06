// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState, useEffect } from 'react';

// React context for token, & typedefs
import { useAadToken } from '../../contexts/AadTokenContext';
import { useTypeDefs } from '../../contexts/TypeDefsContext';

// Child components
import CreateTemplate from '../../components/CreateTemplate/CreateTemplate';
import Code           from '../../components/Code/Code';

// Fluent UI
import { Icon }                             from '@fluentui/react/lib/Icon';
import { ActionButton }                     from '@fluentui/react/lib/Button';
import { MessageBar, MessageBarType }       from '@fluentui/react';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { useBoolean }                       from '@fluentui/react-hooks';
import { PrimaryButton, DefaultButton }     from '@fluentui/react/lib/Button';

export default function TypeDefDetails(props) {
  const typeDef           = (props && props.typeDef) || null,        
        serviceTypeName   = (props && props.serviceTypeName) || null,
        updateServiceView = (props && props.updateServiceView) || null,

        name              = (typeDef && typeDef.name) || null,
        category          = (typeDef && typeDef.category) || null,
        isEntity          = (category === 'ENTITY') ? true : false,
        isRelationship    = (category === 'RELATIONSHIP') ? true : false,

        guid              = (typeDef && typeDef.guid) || null,
        description       = (typeDef && typeDef.description) || null,
        serviceType       = (typeDef && typeDef.serviceType) || null,
        attributeDefs     = (typeDef && typeDef.attributeDefs) || [],

        // Entity-specific
        superTypes        = (isEntity && typeDef.superTypes) || [],
        options           = (isEntity && typeDef.options) || [],
        subTypes          = (isEntity && typeDef.subTypes) || [],
        relAttrDefs       = (typeDef && typeDef.relationshipAttributeDefs) || [],

        // Relationship-specific
        relCategory       = (isRelationship && typeDef.relationshipCategory) || null,
        endDef1           = (isRelationship && typeDef.endDef1) || {},
        endDef2           = (isRelationship && typeDef.endDef2) || {},

        // State of blob path
        [blobPath,   setBlobPath]   = useState(),
        [msgStorage, setMsgStorage] = useState(),

        // Icons
        iconClone         = { iconName: 'Copy' },

        TypeDefIcon = () => (isRelationship)
          ? <Icon iconName="Relationship" className="servicetype_header_icon" />
          : <Icon iconName="FileCode" className="servicetype_header_icon" />,

        // Delete functionality
        aadToken                    = useAadToken(), // AAD token from React context
        useTypeDefsArray            = useTypeDefs(), // TypeDefs context
        setRefresh                  = (useTypeDefsArray && useTypeDefsArray[1]) || null,
        createdBy                   = (typeDef && typeDef.createdBy) || null,
        createdByAdmin              = (createdBy && (createdBy === 'admin' || createdBy === 'ServiceAdmin')) ? true : false,
        defaultDelState             = false,
        defaultDelMsg               = 'Delete',
        [deleted,    setDeleted]    = useState(defaultDelState),
        [isDeleting, setIsDeleting] = useState(defaultDelState),
        [deleteMsg,  setDeleteMsg]  = useState(defaultDelMsg),
        [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true),
        dialogContentProps = {
                              type: DialogType.normal,
                              title: 'Delete Type Definition?',
                              closeButtonAriaLabel: 'Close',
                              subText: 'Are you sure you want to delete this?'
                            },
        modalProps        = {
                              isBlocking: false,
                              styles: { main: { maxWidth: 450 } },
                            };

  // Output arrays
  let outputSuperTypes = [],
      outputSubTypes   = [],
      outputAttrDefs   = [],
      outputOptions    = [],
      outputRelDefs    = [];
  
  // Build output for supertypes
  if (superTypes  && Array.isArray(superTypes) && superTypes.length > 0) {
    superTypes.sort(); // sort alphabetically
    superTypes.forEach((superType,i) => {
      outputSuperTypes.push(
        <li key={`supertype${i}`}>
          {superType}
        </li>
      );
    });
  }

  // Build output for subtypes
  if (subTypes  && Array.isArray(subTypes) && subTypes.length > 0) {
    subTypes.sort(); // sort alphabetically
    subTypes.forEach((subType,i) => {
      outputSubTypes.push(
        <li key={`subtype${i}`}>
          {subType}
        </li>
      );
    });
  }

  // Build output for attribute defs
  if (attributeDefs  && Array.isArray(attributeDefs) && attributeDefs.length > 0) {
    attributeDefs.forEach((attr,i) => {
      const attrName       = (attr && attr.name) || null,
            attrType       = (attr && attr.typeName) || null,
            attrIsOptional = (attr && attr.isOptional) || null,
            attrIsUnique   = (attr && attr.isUnique) || null;
      if (attrName && attrType) {
        outputAttrDefs.push(
          <li key={`attribute${i}`}>
            {attrName} <small className="muted">({attrType})</small>
            <small className="muted">
              {(attrIsOptional) ? '' : ' *required'}
              {(attrIsUnique) ? ' *unique' : ''}
            </small>
          </li>
        );
      }
    });
  }

  // Build output for relationship attribute defs
  if (relAttrDefs  && Array.isArray(relAttrDefs) && relAttrDefs.length > 0) {
    relAttrDefs.forEach((rel,i) => {
      const relName         = (rel && rel.name) || null,
            relType         = (rel && rel.typeName) || null,
            relTypeSplit    = (relType && relType.split('array<')),
            relTypeSplitLen = (relTypeSplit && Array.isArray(relTypeSplit) && relTypeSplit.length) || 0,
            relTypeLink     = (relTypeSplitLen > 1) ? relTypeSplit[1].replace('>','') : relTypeSplit[0],
            relIsOptional   = (rel && rel.isOptional) || null,
            relIsUnique     = (rel && rel.isUnique) || null;

      if (relName && relType) {
        outputRelDefs.push(
          <li key={`rel${i}`}>
            {relName} <small className="muted">(
              { (relTypeSplitLen>1) ? 'array<' : null }
              {relTypeLink}
              { (relTypeSplitLen>1) ? '>' : null }
            )</small>
            <small className="muted">
              {(relIsOptional) ? '' : ' *required'}
              {(relIsUnique) ? ' *unique' : ''}
            </small>
          </li>
        );
        }
    });
  }

  // Build output for options
  if (isEntity && options  && Array.isArray(options) && options.length > 0) {
    options.forEach((option,i) => {
      const key   = (option && option.optionKey) || null,
            value = (option && option.optionValue) || null;
      outputOptions.push(
        <li key={`option${i}`}>
          {key}: {value}
        </li>
      );
    });
  }

  // Handle clicking clone
  const handleCloneClick = (typeDef, e) => {
    e.preventDefault();
    if (typeDef) {
      updateServiceView('new', typeDef);
      window.scrollTo(0,0);
    }
  }

  // Handle clicking typedef
  /*
  const handleTypeDefClick = (typeDef, e) => {
    e.preventDefault();
    if (typeDef) {
      updateServiceView('details', typeDef);
      window.scrollTo(0,0);
    }
  }
  */

  // Handle clicking delete
  async function handleDeleteClick(typeDef, e) {
    e.preventDefault();
    toggleHideDialog();
    setIsDeleting(true);
    setDeleteMsg('Deleting...');

    const guid = (typeDef && typeDef.guid) || null,
          category = (typeDef && typeDef.category) || null;

    if (guid && category) {
      const apiUrl = `/api/purview/typedefs?guid=${guid}&category=${category.toLowerCase()}`,
            fetchOptions = {
              method: "DELETE",
              headers: {
                "Content-Type":"application/json",
                "Authorization": `Bearer ${aadToken}`
              }
            };
      console.log(`### FETCH: DELETE ${apiUrl}`);
      
      // DELETE to Purview API
      await fetch(apiUrl, fetchOptions)
        .then(response => response.json()) 
        .then(json => {
          setIsDeleting(false);
          
          // SUCCESSFUL DELETE to Purview API
          if (json && json.status === 200) {
            console.log(`### DELETED '${guid}'`);
            setDeleted(true);
            setDeleteMsg('Deleted from Purview');
            // Trigger refresh of Purview API
            if (setRefresh) setRefresh( new Date().toJSON().replace(/[^0-9]/g, '') );
          }
          // API responsed with errors
          else {
            setDeleteMsg('Error, check logs');
          }
        })
        // Fetch errors
        .catch(error => {
          console.error("Error:", error);
          setDeleteMsg('Error, check logs');
          setIsDeleting(false);
        });
    }
  };
        

  // React Hook: useEffect when typeDef changes
  useEffect(() => {
    if (typeDef) {
      setDeleted(defaultDelState);
      setDeleteMsg(defaultDelMsg);
    }
  }, [typeDef, defaultDelState, defaultDelMsg]);

  // React Hook: useEffect when blobPath changes
  useEffect(() => {
    if (blobPath) {
      setMsgStorage(
        <MessageBar messageBarType={MessageBarType.success}>
          <strong>Storage:</strong> {`Created blob '${blobPath}'`}
        </MessageBar>
      );
    }
  }, [blobPath]);

  return(
    <>
      <div className="servicetype_header">
        <TypeDefIcon />
        <h1 className="title">{name}</h1>
      </div>
      <div className="typedef">
        {msgStorage}
        {(isEntity || isRelationship)
            ? <ActionButton
                iconProps={iconClone}
                onClick={(e) => handleCloneClick(typeDef, e)}
                allowDisabledFocus disabled={false} checked={false}
              >Clone Type</ActionButton>
            : null
        }
        
        {(isEntity)
            ? <CreateTemplate typeDef={typeDef} setBlobPath={setBlobPath} />
            : null
        }

        <hr />
        
        <div className="typedef-details">
          {
          // Display description only if it differs from the name
          (description !== name) ? <p>{description}</p> : null
          }

          {
          // Display service type only if it differs from the UI parent
          (serviceType !== serviceTypeName) ? <p>Service Type: {serviceType}</p> : null
          }

          <p><strong>GUID</strong><br />{guid}</p>

          {
          // Super Types
          (isEntity && outputSuperTypes && Array.isArray(outputSuperTypes) && outputSuperTypes.length > 0)
              ? <>
                  <strong>Super Types</strong>
                  <ul>{outputSuperTypes}</ul><br />
                </>
              :null
          }
          {
          // Sub Types
          (isEntity && outputSubTypes && Array.isArray(outputSubTypes) && outputSubTypes.length > 0)
              ? <>
                  <strong>Sub Types</strong>
                  <ul>{outputSubTypes}</ul><br />
                </>
              :null
          }
          {
          // Relationship category
            (isRelationship)
              ? <p><strong>Relationship Category</strong><br />{relCategory}</p>
              : null
          }
          {
          // Attribute defs
            (outputAttrDefs && Array.isArray(outputAttrDefs) && outputAttrDefs.length > 0)
              ? <div>
                  <strong>Attributes</strong>
                  <ul>{outputAttrDefs}</ul><br />
                </div>
              : null
          }
          {
          // Entity-specific relationship attribute defs
            (isEntity && outputRelDefs && Array.isArray(outputRelDefs) && outputRelDefs.length > 0)
              ? <div>
                  <strong>Relationship Attribute Definitions</strong>
                  <ul>{outputRelDefs}</ul><br />
                </div>
              : null
          }
          {
          // Entity-specific options
            (isEntity && options && Array.isArray(options) && options.length > 0)
              ? <div>
                  <strong>Advanced Options</strong>
                  <ul>{outputOptions}</ul><br />
                </div>
              : null
          }

          {(isRelationship && endDef1 && endDef2)
              ? <>
                  <strong>EndDefs</strong><br />
                  <ul>
                  <li>
                          {endDef1.name} : {endDef1.type} <small className="muted">(
                            {endDef1.cardinality}
                            {(endDef1.isContainer) ? ' *container' : null}
                            {(endDef1.isLegacyAttribute) ? ' *legacy' : null}
                          )</small>
                        
                    </li>
                    <li>
                          {endDef2.name} : {endDef2.type} <small className="muted">(
                            {endDef2.cardinality}
                            {(endDef2.isContainer) ? ' *container' : null}
                            {(endDef2.isLegacyAttribute) ? ' *legacy' : null}
                          )</small>
                        
                    </li>
                  </ul>
                </>
              : null
          }
        </div>

        <Code header="JSON" block={typeDef} />
        {(!createdByAdmin)
            ? <>
                <DefaultButton
                  text={deleteMsg}
                  disabled={(deleted) ? deleted : isDeleting}
                  onClick={toggleHideDialog}
                  className={`button--fullwidth ${(deleted) ? "button--critical" : "button--delete"}`}
                />

                <Dialog
                  hidden={hideDialog}
                  onDismiss={toggleHideDialog}
                  dialogContentProps={dialogContentProps}
                  modalProps={modalProps}
                >
                  <DialogFooter>
                    <PrimaryButton
                      text={deleteMsg}
                      disabled={isDeleting}
                      onClick={(e) => handleDeleteClick(typeDef, e)}
                      className="button--critical"
                    />
                    <DefaultButton onClick={toggleHideDialog} text="Cancel" />
                  </DialogFooter>
                </Dialog>
              </>
            : null
        }
      </div>
    </>
  );
}
