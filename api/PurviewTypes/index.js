// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const purviewHelper = require("../Purview/purviewHelper")

module.exports = async function (context, req) {
  let httpStatus = 500,
      contentBody = 'Internal server error';
  
  // Request Headers
  const headers      = req && req.headers,
        headerAuth   = (headers && headers.authorization) || null,
        token        = (headerAuth && headerAuth.replace('Bearer ', '')) || null,

        // Request Query
        reqQuery     = (req && req.query) || null,
        reqQueryGuid = (reqQuery && reqQuery.guid) || null,
        reqQueryCat  = (reqQuery && reqQuery.category) || null,

        // Request Body
        reqBody      = req && req.body || null;
  
  if (!token) {
    httpStatus = 400;
    contentBody = 'Error: Invalid token';
  }
  else {
    switch (req.method) {
      case "GET":
        // GET typedef by guid
        if (reqQueryGuid) {
          const result = await purviewHelper.getTypeDefByGuid(token, reqQueryGuid);
          if (result) {
            httpStatus = 200;
            contentBody = result;
          }
          else {
            httpStatus = 400;
            contentBody = 'Error: No guid defined';
          }
        }
        // Get all type definitions
        else {
          const result = await purviewHelper.getTypeDefs(token);
          if (result) {
            httpStatus = 200;
            contentBody = result;
          }
          else {
            httpStatus = 400;
            contentBody = 'Error: No typedefs found';
          }
        }
        break;

      case "POST":
        if (reqBody) {
          const result = await purviewHelper.postTypeDefs(token, reqBody),
                resultErrorCode = (result && result.errorCode) || null,
                resultErrorMessage = (result && result.errorMessage) || null;

          if (result) {
            //console.log('##### RESULT (START) #######');
            //console.log(result);
            //console.log('##### RESULT (END #######');
            
            if (resultErrorCode || resultErrorMessage) {
              httpStatus = 400;
              contentBody = resultErrorMessage; // `${resultErrorMessage} (Error Code: ${resultErrorCode})`;
            }
            else {
              httpStatus  = result.status || 200;
              contentBody = result;
            }
          }
          else {
            httpStatus  = 400;
            contentBody = 'Error: Invalid response from typedef post';
          }
        }
        else {
          httpStatus  = 400;
          contentBody = 'Error: No post body found';
        }
        break;
      
      case "DELETE":
        if (reqQueryGuid && reqQueryCat) {
                result = await purviewHelper.deleteTypeDefByGuid(token, reqQueryGuid, reqQueryCat),
                status = result && result.status || 500,
                statusText = result && result.statusText || 'Error: Invalid response from typedef delete';
          
          httpStatus  = (status === 204) ? 200 : status;
          contentBody = statusText;
        }
        else {
          httpStatus  = 500;
          contentBody = 'Error: No guid defined';
        }
      break;
      
      default:
        break;
    }
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
