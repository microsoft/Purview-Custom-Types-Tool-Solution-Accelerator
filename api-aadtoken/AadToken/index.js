// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Helper Function: Get AAD Token
async function getToken(context) {
  const fetch = (await import('node-fetch')).default;

  // Default token is null
  let fetchResponse = null,
      tokenResponse = null;

  // AAD & App variables from api/local.settings.json
  const AadTenantId     = process.env["AadTenantId"] || null,
        AppClientId     = process.env["AppClientId"] || null,
        AppClientSecret = process.env["AppClientSecret"] || null,
        aadApi          = AadTenantId && `https://login.microsoftonline.com/${AadTenantId}/oauth2/token`,
        postOptions     = AppClientId && AppClientSecret && {
                            method: 'POST',
                            headers: {
                              "Content-Type": "application/x-www-form-urlencoded",
                            },
                            body: new URLSearchParams({
                                'client_id': AppClientId,
                                'client_secret': AppClientSecret,
                                'resource': "https://purview.azure.net",
                                'grant_type': "client_credentials"
                            })
                          };

  if (aadApi && postOptions) {
    // Fetch token here via API with POST options
    fetchResponse = await fetch(aadApi, postOptions);
    if (!fetchResponse.ok) {
      context.log.error(`An error has occured: ${fetchResponse.status}`);
      context.log.error(fetchResponse);
      return null;
    }
    tokenResponse = await fetchResponse.json();
  }
  
  return tokenResponse;
}

// MAIN AZURE FUNCTION
module.exports = async function (context) {
  // Default API response is a bad request
  let httpStatus = 400,
      contentBody = {
        error: 'Bad Request'
      };
  
  // Get AAD token & set response
  const tokenResponse = await getToken(context);
  if (tokenResponse) {
    httpStatus = 200;
    contentBody = tokenResponse;
  }

  // context.res.body should be always be valid JSON, even for errors
  context.res = {
      status: httpStatus, 
      body: {
          status: httpStatus,
          data: contentBody
      },
      headers: { "content-type" : "application/json" }
  };
  
  context.done();
}
