// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = async function (context, req) {
    context.log('Blobs: JavaScript HTTP trigger function processing request...');

    const STORAGE_CONNECTION_STRING = process.env["StorageConnectionString"] || null,
          blobServiceClient = STORAGE_CONNECTION_STRING && BlobServiceClient.fromConnectionString(STORAGE_CONNECTION_STRING) || null,

          reqQuery          = req && req.query || null,
          reqBody           = req && req.body || null,
          reqQueryContainer = reqQuery && reqQuery.container || null,
          reqQueryBlob      = reqQuery && reqQuery.blob || null,

          reqBodyContainer  = reqBody && reqBody.container || null,
          reqBodyBlob       = reqBody && reqBody.blob || null,
          reqBodyContent    = reqBody && reqBody.content || null;
    
    let contentBody = '',
        httpStatus = 400;

    switch (req.method) {
        case "GET":
            // Container name is required to get blobs within
            if (reqQueryContainer !== null) {
                const containerClient = blobServiceClient.getContainerClient(reqQueryContainer) || null;
                if (containerClient) {
                    // Retern all blobs if no name
                    if (reqQueryBlob == null) {
                        context.log(`GET all blobs in container ${reqQueryContainer}...`);
                        let i = 1,
                            blobs = [];
                        for await (const blob of containerClient.listBlobsFlat()) {
                            context.log(blob.name);
                            blobs.push(blob);
                        }
                        contentBody = blobs;
                        if (blobs.length > 0) {
                          httpStatus = 200;
                        } else {
                          httpStatus = 404;
                        }
                    }
                    // Return specific blob
                    else {
                      try {
                        context.log(`GET blob ${reqQueryBlob} from container ${reqQueryContainer}...`);
                        const blobClient = containerClient.getBlobClient(reqQueryBlob) || null;
                        if (blobClient) {
                          // Get blob content from position 0 to the end
                          // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
                          const downloadBlockBlobResponse = await blobClient.download(),
                                downloaded = (await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)).toString();
                          //console.log("Downloaded blob content:", downloaded);
                          contentBody = {
                              name: reqQueryBlob,
                              url: blobClient.url,
                              content: downloaded
                          };
                          httpStatus = 200;
                        }
                      }
                      catch (error) {
                        console.log('Blob download failed');
                        console.log(
                          `requestId - ${error.details.requestId}, statusCode - ${error.statusCode}, errorCode - ${error.details.errorCode}\n`
                        );
                        httpStatus = 404;

                      }

                        // [Node.js only] A helper method used to read a Node.js readable stream into a Buffer
                        async function streamToBuffer(readableStream) {
                            return new Promise((resolve, reject) => {
                                const chunks = [];
                                readableStream.on("data", (data) => {
                                    chunks.push(data instanceof Buffer ? data : Buffer.from(data));
                                });
                                readableStream.on("end", () => {
                                    resolve(Buffer.concat(chunks));
                                });
                                readableStream.on("error", reject);
                            });
                        }
                    }
                }
                else {
                    httpStatus = 404;
                }
            }
            break;
        
        // POST new blob by name
        case "POST":
            if (reqBodyContainer != null && reqBodyBlob != null && reqBodyContent != null) {
                const containerClient = blobServiceClient.getContainerClient(reqBodyContainer) || null,
                      content = reqBodyContent,
                      blockBlobClient = containerClient.getBlockBlobClient(reqBodyBlob),
                      uploadBlobResponse = await blockBlobClient.upload(content, content.length);
                
                console.log(`Uploaded blob ${reqBodyBlob} successfully`, uploadBlobResponse.requestId);
                contentBody = {
                    name: reqBodyBlob,
                    properties: uploadBlobResponse
                };
                httpStatus = 201;
            }
            else {
              console.log('### ERROR:');
              console.log('reqBodyContainer:');
              console.log(reqBodyContainer);
              console.log('reqBodyBlob:');
              console.log(reqBodyBlob);
              console.log('reqBodyContent:');
              console.log(reqBodyContent);
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
