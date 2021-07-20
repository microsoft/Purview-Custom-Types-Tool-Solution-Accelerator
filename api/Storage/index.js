// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = async function (context, req) {
    context.log('Storage: JavaScript HTTP trigger function processing request...');

    const STORAGE_CONNECTION_STRING = process.env["StorageConnectionString"] || null,
          STORAGE_CONTAINER         = process.env["StorageContainer"] || null,
          blobServiceClient         = STORAGE_CONNECTION_STRING
                                      && BlobServiceClient.fromConnectionString(STORAGE_CONNECTION_STRING) || null;

    let contentBody = '';
    let httpStatus = 400;

    context.log(`GET all containers looking for '${STORAGE_CONTAINER}'...`);
    let containerExists = false;
    for await (const container of blobServiceClient.listContainers()) {
      const containerName = (container && container.name) || null;
      if (containerName === STORAGE_CONTAINER) {
        containerExists = true;
        httpStatus = 200;
        contentBody = container;
      }
    }
    // Create container if it does not exist
    if (!containerExists) {
      context.log(`### container does not exist`);
      const containerClient = blobServiceClient.getContainerClient(STORAGE_CONTAINER) || null,
            createContainerResponse = containerClient && await containerClient.create();
      context.log(`Create container ${STORAGE_CONTAINER} successfully`, createContainerResponse.requestId);
      contentBody = {
          name: reqBodyName,
          properties: createContainerResponse
      };
      httpStatus = 200;
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
