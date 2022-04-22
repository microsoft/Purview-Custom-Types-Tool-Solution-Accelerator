# Deploy to Azure

## Prerequisites
- [Azure subscription](https://azure.microsoft.com/free/)
- [Microsoft Purview](https://azure.microsoft.com/en-us/services/purview/)
- [Service Principal](https://docs.microsoft.com/en-us/azure/purview/tutorial-using-rest-apis#create-a-service-principal-application) that can access the Microsoft Purview API
- [VS Code](https://code.visualstudio.com/) with [Azure Functions extenstion](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions)

## Notes

*Due to the two methods of [API support in Azure Static Web Apps with Functions](https://docs.microsoft.com/en-us/azure/static-web-apps/apis), we will need to deploy a separate Azure Function for the `/api/AadToken` endpoint. For more information, please review [how to bring your own Functions to SWA](https://docs.microsoft.com/en-us/azure/static-web-apps/functions-bring-your-own).*

*Due to [Node dependency management in Azure Functions](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node#dependency-management), we need to ensure all dependencies are installed in Azure. When deploying Function Apps from source control, any package.json file present in the repo will trigger an npm install during deployment. However when deploying via the Portal or CLI, you'll have to manually install the packages.*

*The directions below are for deploying with dependencies via VS Code, but you could also [deploy using Kudu](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node#using-kudu) (on Windows only).*

## Azure Function for the AAD Token
1. Copy or move the [/api-aadtoken/](./api-aadtoken/) folder out to a new location and open as a new VS Code project.

1. Run `npm install` from the VS Code Terminal to install the [node-fetch](https://www.npmjs.com/package/node-fetch) dependency.

1. From the Azure Functions extension within VS Code, click **Deploy to Function App** (cloud icon) and select or create a Function App in Azure.

1. From the Azure Function in Azure Portal, click **Configuration** to add the following application settings using either the names & values previously pasted into `/api/local.settings.json` or new values for production resources.
    - AadTenantId
    - AppClientId
    - AppClientSecret

1. Copy the Function URL from VS Code or Azure Portal (including a key that adds code param) and open in a browser to confirm a successful response from the AAD Token API. If needed, you can troubleshoot issues in the Portal by browsing to the **Functions** and **Code + Test** to debug logs while making an HTTP request.

1. When a token is successfully returned from the API, override the `fetchToken()` reference to `apiUrl` within [src/App/helper.js](./src/App/helper.js#L26) using your new Function URL. It will be in this format: `https://APPNAME.azurewebsites.net/api/aad/token?code=DEFAULT_KEY`

1. Push the app change to your code repo that will be the deployment source. *Please follow additional best practices for [Securing Azure Functions](https://docs.microsoft.com/en-us/azure/azure-functions/security-concepts) and note the [Security constraints with bringing your own functions to Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/functions-bring-your-own#security-constraints)*

## Application Setup
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

1. Click **Configuration** in the left nav to add the following app settings using either the names & values previously pasted into `/api/local.settings.json` or new values for production resources.
    - StorageConnectionString
    - AtlasAccountName
    <!-- AadTenantId,  AppClientId, AppClientSecret-->

1. Click **Role management** in the left nav and click `Invite`
    - Add yourself by using AAD and your email address as it appears in AAD
    - Add the `admin` role to the invite
    - Generate invitation link and copy into a new browser window to consent
    - [Learn more](https://docs.microsoft.com/en-us/azure/static-web-apps/authentication-authorization) about authentication & authorization

    *Note: By default, the [public/routes.json](./public/routes.json) is setup to only allow Azure Active Directory and requires the `admin` role. You can use the app's `/login` to gain initial access. Learn more about [authentication and authorization for Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/authentication-authorization)*

1. Copy the Static Web App URL from the **Overview** page, then go back to the Azure Function and click **CORS** to paste your app URL in the Allowed Origins.

1. Open the Static Web App URL to confirm it is working the same as the [local deployment method](./README.md).
