// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';

// Child components
import Code  from '../../components/Code/Code';

export default function HowToSetup() {
  // React Context for Storage
  const jsonSettings = {
          "IsEncrypted": false,
          "Values": {
            "AzureWebJobsStorage": "",
            "FUNCTIONS_WORKER_RUNTIME": "node",
            "AadTenantId": "YOUR_AZURE_TENANT_ID",
            "AppClientId": "YOUR_AZURE_APP_CLIENT_ID",
            "AppClientSecret": "YOUR_AZURE_APP_CLIENT_SECRET",
            "AtlasAccountName": "YOUR_AZURE_PURVIEW_ATLAS_ACCOUNT_NAME",
            "StorageConnectionString": "YOUR_AZURE_STORAGE_CONNECTION_STRING",
            "StorageContainer": "NEW_CONTAINER_NAME"
          }
        };

  return (
    <>
      <h1 className="title">Initial Setup</h1>
      <ol>
        <li>Rename <b>/app/api/local.settings.json.rename</b> to <b>local.settings.json</b></li>
        <li>Update <b>/app/api/local.settings.json</b> with your Azure values:</li>
      </ol>
      <Code header="JSON" block={jsonSettings} />

      <h1 className="title">Get Started</h1>
      <ol>
        <li>Run <b>cd api; npm start</b> in a terminal to start the API using local Azure Functions</li>
        <li>Run <b>npm start</b> in a <i>second terminal</i> to start the application</li>
      </ol>
      <br />
    </>
  );
}
