# Troubleshooting

## Debug Azure Deployments

1. If possible, [run the app locally](https://github.com/microsoft/Purview-Custom-Types-Tool-Solution-Accelerator#local-setup) to confirm your configuration values are correct and your application service principal has the permission to access your Purview account.

1. Ensure your deployed Function returns a valid token via JSON:
    ```https://{AzFuncName}.azurewebsites.net/api/aad/token?code={AzFuncKey}```

1. Use the web browser's `More Tools > Developer Tools > Console` (Ctrl + Shift + I) to debug the API calls and responses.
