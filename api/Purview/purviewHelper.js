// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const fetch = require("node-fetch");

const AtlasAccountName = process.env["AtlasAccountName"] || null,
      apiPrefix        = `https://${AtlasAccountName}.catalog.purview.azure.com/api`;

// GET all type definitions
async function getTypeDefs(token) {
  const apiUrl        = (token && `${apiPrefix}/atlas/v2/types/typedefs`) || null,
        fetchResponse = apiUrl && await fetch(apiUrl, {headers:{'Authorization': `Bearer ${token}`}});

  let result = null;
  if (fetchResponse && fetchResponse.status && fetchResponse.status===200 && fetchResponse.ok) {
    const fetchResponseJson = await fetchResponse.json();
    if (fetchResponseJson) {
      result = await processApiTypes(fetchResponseJson);
    }
  }
  else {
    console.error(`Error ${fetchResponse.status}`);
  }
  return result;
}

// API response returns types with no order, so this builds a more usable object to store in React state
// We gather all names into an array to be sorted alphabetically
// We also build an "associative array" object using name as the key and API type as the value
/*
  // Purview Catalog API returns unordered arrays of type definitions:
  {
    "enumDefs": [...],
    "structDefs": [...],
    "classificationDefs": [...],
    "entityDefs": [...],
    "relationshipDefs": [...],
  }

  // This will clean and store JSON in React app state with sorted names for better UX and an associative array object to lookup
  // WARNING: guid is unique but name is not, so there is a potential for duplicate names to get consolidated
  {
    "enumDefs": {
      "names": ["a","b","c"],
      "types": {
        "b": {},
        "c": {},
        "a": {}
      }
    },
    "structDefs": {},
    "classificationDefs": {},
    "entityDefs": {},
    "relationshipDefs": {},

    "myServiceTypes": {
      "names": ["x", "y", "z"],
      "serviceTypes":{
        "x": {
          "entityDefs": {
            "names": ["a", "b"],
            "types": {
              "a": {},
              "b": {}
            }
          }
        }
      }
    }
  }
*/
async function processApiTypes(apiTypes) {
  const validCategories = [
    'classificationDefs',
    'entityDefs',
    'enumDefs',
    'relationshipDefs',
    'structDefs'
  ];

  // Start baseline JSON object we'll return
  let typeDefsObj = {
        atlasAccountName: AtlasAccountName,
        myServiceTypes: {
          names: [],
          serviceTypes: {}
        }
      },
      myServiceTypeNames = [];

  if (apiTypes) {
    // Start by looping the valid categories (ie entityDefs, relationshipDefs)
    validCategories.forEach((cat, iCat) => {
      // Check if category exists in API response
      const catArray = apiTypes[cat] || [];
      if (catArray && Array.isArray(catArray) && catArray.length > 0) {
        // Initialize JSON object for category
        typeDefsObj[cat] = { names:[], typeDefs:{} }

        // Initialize category-specific names to be sorted before adding
        let typeNames    = [];
        
        // Loop typedefs within category
        catArray.forEach((catTypeDef, iCatTypeDef) => {
          const typeName        = (catTypeDef && catTypeDef.name) || null,
                serviceType     = (catTypeDef && catTypeDef.serviceType) || '-Uncategorized',
                createdBy       = (catTypeDef && catTypeDef.createdBy) || null,
                createdByAdmin  = (createdBy && (createdBy === 'admin' || createdBy === 'ServiceAdmin')) ? true : false,
                serviceExists   = (serviceType && myServiceTypeNames.indexOf(serviceType) === -1) ? false : true;

          if (typeName) {
            // Add name to array that'll be sorted later
            typeNames.push(typeName);

            // Add type directly to associative array object
            typeDefsObj[cat].typeDefs[typeName] = catTypeDef;

            // My typedefs (not admin)
            if (!createdByAdmin) {

              // Handle if service type doesn't already exist
              if (!serviceExists) {
                // Add name to array that'll be sorted later
                myServiceTypeNames.push(serviceType);
                // Initialize my service type object
                typeDefsObj.myServiceTypes.serviceTypes[serviceType] = {};
              }

              // Initialize my service types' category object
              if (
                typeDefsObj.myServiceTypes.serviceTypes[serviceType]
                && !typeDefsObj.myServiceTypes.serviceTypes[serviceType][cat]
              ) {
                typeDefsObj.myServiceTypes.serviceTypes[serviceType][cat] = {
                  names: [],
                  typeDefs: {}
                }
              }

              // Add to object
              if (
                typeDefsObj.myServiceTypes.serviceTypes[serviceType]
                && typeDefsObj.myServiceTypes.serviceTypes[serviceType][cat]
              ) {
                typeDefsObj.myServiceTypes.serviceTypes[serviceType][cat].names.push(typeName);
                typeDefsObj.myServiceTypes.serviceTypes[serviceType][cat].typeDefs[typeName] = catTypeDef;
              }
            }
          }
        });
        // End loop typedefs within category

        // Sort the names array alphabetically for better UX
        // WARNING: guid is unique but name is not, so there is potential for duplicates to be inaccessbile here
        typeNames.sort();

        // Add sorted names to the new typeDefsObj
        typeDefsObj[cat].names = typeNames;
      }
    });
    // End loop category

    // Finish by sorting my service type names
    myServiceTypeNames.sort();

    // Add to main object
    typeDefsObj.myServiceTypes.names = myServiceTypeNames;

    // Loop to my service types object to sort names
    const myServiceTypesKeys = Object.keys(typeDefsObj.myServiceTypes.serviceTypes);
    myServiceTypesKeys.forEach((key, i) => {
      const obj = typeDefsObj.myServiceTypes.serviceTypes[key];
      
      validCategories.forEach((cat, iCat) => {
        let myServTypeCat = obj[cat] || null,
            myServTypeCatNames = (myServTypeCat && myServTypeCat.names) || null;
        if (myServTypeCatNames && Array.isArray(myServTypeCatNames)) {
          myServTypeCatNames.sort();
          typeDefsObj.myServiceTypes.serviceTypes[key][cat].names = myServTypeCatNames;
        }
      });
    });
  }

  // Return the more usable JSON structure
  return typeDefsObj;
}


// GET Type Def by GUID
async function getTypeDefByGuid(token, guid) {
  const apiUrl        = (token && guid && `${apiPrefix}/atlas/v2/types/typedef/guid/${guid}`) || null,
        fetchResponse = apiUrl && await fetch(apiUrl, {headers:{'Authorization': `Bearer ${token}`}});
        
  let result = null;
  if (fetchResponse && fetchResponse.status && fetchResponse.status===200 && fetchResponse.ok) {
    const fetchResponseJson = await fetchResponse.json();
    if (fetchResponseJson) {
      result = fetchResponseJson;
    }
  }
  else {
    console.error(`Error ${fetchResponse.status}`);
  }
  return result;
}

// POST Type Defs
async function postTypeDefs(token, typedefs) {
  const apiUrl        = (token && `${apiPrefix}/atlas/v2/types/typedefs`) || null,
        fetchOptions  = typedefs && {
                          method:  'POST',
                          body:    JSON.stringify(typedefs),
                          headers: {
                            'Content-Type':'application/json',
                            'Authorization': `Bearer ${token}`
                          }
                        },
        fetchResponse = apiUrl && await fetch(apiUrl, fetchOptions);
  
  let result = null;
  if (fetchResponse) {
    const fetchResponseJson = await fetchResponse.json();
    if (fetchResponseJson) {
      result = fetchResponseJson;
    }
    else {
      console.error('### Error: Invalid JSON from response');
    }
  }
  else {
    console.error('### Error: No response from fetch()');
  }
  return result;
}

// DELETE Type Def by GUID
async function deleteTypeDefByGuid(token, guid, category) {
  const apiUrl        = (token && `${apiPrefix}/atlas/v2/types/typedefs`) || null,
        delBody       = apiUrl && guid && category && (
                          (category.toLowerCase()==='relationship')
                            ? { relationshipDefs: [ {guid: guid} ] }
                            : { entityDefs: [ {guid: guid} ] }
                        ),
        fetchOptions  = delBody && {
                          method:  'DELETE',
                          body:    JSON.stringify(delBody),
                          headers: {
                            'Content-Type':'application/json',
                            'Authorization': `Bearer ${token}`
                          }
                        },
        fetchResponse = apiUrl && await fetch(apiUrl, fetchOptions);

  let result = null;
  if (fetchResponse) {
    const fetchStatus     = fetchResponse.status || 500,
          fetchStatusText = fetchResponse.statusText || "Internal error";
    result = {
      status: fetchStatus,
      statusText: fetchStatusText
    }
  }
  else {
    console.error('### Error: No response from fetch()');
  }
  return result;
}

module.exports = {
  getTypeDefs,
  getTypeDefByGuid,
  postTypeDefs,
  deleteTypeDefByGuid
};
