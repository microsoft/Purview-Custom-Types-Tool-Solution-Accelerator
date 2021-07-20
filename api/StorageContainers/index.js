// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = async function (context, req) {
    context.log('Containers: JavaScript HTTP trigger function processing request...');

    const STORAGE_CONNECTION_STRING = process.env["StorageConnectionString"] || null,
          blobServiceClient = STORAGE_CONNECTION_STRING && BlobServiceClient.fromConnectionString(STORAGE_CONNECTION_STRING) || null,
          reqQuery = req && req.query || null,
          reqBody  = req && req.body || null,
          reqQueryName = reqQuery && reqQuery.name || null,
          reqBodyName  = reqBody && reqBody.name || null;
    
    let contentBody = '',
        httpStatus = 200;

    switch (req.method) {
        case "GET":
            // GET all containers
            if (reqQueryName == null) {
                context.log('GET all containers...');
                let i = 1,
                    containers = [];
                for await (const container of blobServiceClient.listContainers()) {
                  context.log(container.name);
                  containers.push(container);
                }
                contentBody = containers;
                if (containers.length == 0) {
                    httpStatus = 404;
                }
            }
            // GET container by name
            else {
                context.log(`GET container by name: ${reqQueryName}...`);
                const containerClient = blobServiceClient.getContainerClient(reqQueryName) || null;
                if (containerClient) {
                    context.log(containerClient.accountName);
                    contentBody = containerClient;
                }
                else {
                    httpStatus = 404;
                }
            }
            
            break;
        
        // POST new container by name
        case "POST":
            if (reqBodyName != null) {
                const containerClient = blobServiceClient.getContainerClient(reqBodyName) || null,
                      createContainerResponse = containerClient && await containerClient.create();
                context.log(`Create container ${reqBodyName} successfully`, createContainerResponse.requestId);
                contentBody = {
                    name: reqBodyName,
                    properties: createContainerResponse
                };
                httpStatus = 201;
            }
            else {
                httpStatus = 400;
            }
            break;
        
        default:
            break;
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
