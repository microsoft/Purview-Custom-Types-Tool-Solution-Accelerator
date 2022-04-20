# Deploy to Azure

## Prerequisites
- [Azure subscription](https://azure.microsoft.com/free/)
- [Azure Purview](https://azure.microsoft.com/en-us/services/purview/)
- [Service Principal](https://docs.microsoft.com/en-us/azure/purview/tutorial-using-rest-apis#create-a-service-principal-application) that can access the Azure Purview API
- [VS Code](https://code.visualstudio.com/) with [Azure Functions extenstion](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions)

## Notes

*Due to the [Node dependency management in Azure Functions](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node#dependency-management), we need to ensure that all dependencies are installed on the Function App in Azure. When deploying Function Apps from source control, any package.json file present in the repo, will trigger an npm install in its folder during deployment. But when deploying via the Portal or CLI, you'll have to manually install the packages.*

*The directions below are for [deploying with dependencies](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node#deploying-with-dependencies), but you could also [deploy using Kudu](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node#using-kudu) (Windows Only).*

## Azure Setup
1. Click the button below to create an Azure Static Web App using your GitHub repository:

    [![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/?feature.customportal=false#create/Microsoft.StaticApp)

1. Sign in to GitHub and authorize Azure Static Web Apps
1. Select your organization, repository, and branch from the dropdowns
1. Select `React` as the build preset
1. Update the project structure:
    - App location = `/`
    - Api location = `/api`
    - Output location = `build`
1. Click on 'Review + create' to create the Static Web App

1. Once the resource is created, it will automatically deploy your app to a URL listed in the Azure portal.

1. Click **Configuration** in the left nav to add the following app settings using either the names & values previously pasted into `/api/local.settings.json` or new values for production resources.
    - StorageConnectionString
    - AadTenantId
    - AppClientId
    - AppClientSecret
    - AtlasAccountName

1. Click **Role management** in the left nav and click `Invite`
    - Add yourself by using AAD and your email address as it appears in AAD
    - Add the `admin` role to the invite
    - Generate initation link and copy into a new browser window to consent
    - [Learn more](https://docs.microsoft.com/en-us/azure/static-web-apps/authentication-authorization) about authentication & authorization

## Azure Function for the AAD Token
*Due to the two methods of [API support in Azure Static Web Apps with Azure Functions](https://docs.microsoft.com/en-us/azure/static-web-apps/apis), we will need to deploy a separate Azure Function for the `/api/AadToken` endpoint. For more information, please review [how to bring your own functions to Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/functions-bring-your-own).*

1. Open an existing function project in VS Code, or create a new folder and open it in a new VS Code window.

1. Click Azure (Shift+Alt+A) > Functions extension > Create Function (lightning+ icon)
    - Create new project
    - `JavaScript` as the language
    - `HTTP Trigger` as the template
    - Provide a function name `AadToken`
    - `Function` as the authorization level

1. Copy the following 3 files from [/api-aadtoken/](./api-aadtoken/) into your function project:
    - package.json
    - AadToken/function.json
    - AadToken/index.js

1. Run `npm install` from the VS Code Terminal to install the [node-fetch](https://www.npmjs.com/package/node-fetch) dependency.

1. From the Azure Functions extension within VS Code, click `Deploy to Function App` (cloud icon) and select or create a Function App in Azure.

1. From the Azure Function within Azure Portal, update the `Function Keys` using either the names & values previously pasted into `/api/local.settings.json` or new values for production resources.
    - AadTenantId
    - AppClientId
    - AppClientSecret

1. Copy the Function URL from VS Code or Azure Portal (including a key that adds code param) and open in a browser to confirm a succesful response from the AAD Token API. *You may need to restart the Function app*

1. When a token is successfully returned from the API, override the `fetchToken()` reference to `apiUrl` within [src/App/helper.js](https://github.com/microsoft/Purview-Custom-Types-Tool-Solution-Accelerator/blob/main/src/App/helper.js#L26) using your Function URL.

1. Push the change to your repo to trigger an update of Azure Static Web App. [Learn more about preview environments](https://docs.microsoft.com/en-us/azure/static-web-apps/preview-environments)

The Azure Static Web App should now be working the same as the [local deployment method](./README.md).
