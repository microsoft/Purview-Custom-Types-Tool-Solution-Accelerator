// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Fetch user authentication API & set user state
export async function fetchAuth(callback) {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    console.log('### FETCH: GET /.auth/me (NOT CALLED ON LOCALHOST)');
    callback({ "clientPrincipal": null });
  }
  else {
    let apiUrl = "/.auth/me";
    console.log(`### FETCH: GET ${apiUrl}`);
    const authResponse = await fetch(apiUrl).catch(error => console.error('Error:', error)),
          contentType = authResponse && authResponse.headers.get("content-type");

    if (contentType && contentType.indexOf("application/json") !== -1) {
      await authResponse.json()
        .then(authResponse => callback(authResponse))
        .catch(error => console.error('Error:', error));
    }
  }
}

// Fetch AAD token API & set token state
export async function fetchToken(callback) {
  let apiUrl = "/api/aad/token";
  console.log(`### FETCH: GET ${apiUrl}`);

  const tokenResponse = await fetch(apiUrl).catch(error => console.error('Error:', error)),
        headers       = tokenResponse && tokenResponse.headers,
        contentType   = headers && headers.get("content-type");
  let tokenAccess = null;
  if (contentType && contentType.indexOf("application/json") !== -1) {
    await tokenResponse.json()
      .then(tokenResponse => {
        const tokenResponseStatus = (tokenResponse && tokenResponse.status) || null,
              tokenResponseData   = (tokenResponseStatus===200 && tokenResponse.data) || null,
              tokenType           = (tokenResponseData && tokenResponseData.token_type) || null;
        
        // Set token value
        if (tokenType==='Bearer' && tokenResponseData.access_token) tokenAccess = tokenResponseData.access_token;
      })
      .catch(error => console.error('Error:', error));
  }

  callback( (tokenAccess) ? tokenAccess : 'error' );
}

// Fetch API for storage container
export async function fetchContainer(callback) {
  let apiUrl = "/api/storage";
  console.log(`### FETCH: GET ${apiUrl}`);
  const storageResponse = await fetch(apiUrl).catch(error => console.error('Error:', error)),
        contentType = storageResponse && storageResponse.headers.get("content-type");
        
  if (contentType && contentType.indexOf("application/json") !== -1) {
    await storageResponse.json()
      .then(storageResponse => {
        const responseStatus = storageResponse && storageResponse.status,
              responseData   = storageResponse && storageResponse.data,
              container      = responseData && responseData.name;
        if (responseStatus === 200 && container) {
          callback(container);
          console.log('### container:', container);
        }
      })
      .catch(error => console.error('Error:', error));
  }
}


// Fetch API for type definitions using AAD token
export async function fetchTypeDefs(aadToken, callback) {
  if (aadToken) {
    let apiUrl = "/api/purview/typedefs";
    console.log(`### FETCH: GET ${apiUrl}`);
    await fetch(apiUrl, {headers:{'Authorization': `Bearer ${aadToken}`}})
      .then(response => handleApiTypes(response, callback))
      .catch(error => console.error('Error:', error));
  }
}

// Function to handle API response & ensure JSON
export async function handleApiTypes(response, callback) {
  const responseHeaders = response && response.headers,
        contentType = responseHeaders && responseHeaders.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    await response.json()
      .then(response => {
        const responseStatus = response && response.status;
        if (responseStatus === 200) {
          callback(response.data);
          console.log('### typeDefsObj:', response.data);
        }
      })
      .catch(error => console.error('Error:', error));
  }
  else {
    console.log('Warning: TypeDef API response is not JSON or null.');
    callback({});
  }
}
