# Azure Web Services Deployment Guide

This guide will help you deploy your NestJS application to Azure Web Services (App Service).

## Prerequisites

- Azure account
- Upstash Redis account
- Git repository with your code

## Environment Variables

Set the following environment variables in Azure App Service Configuration:

```
REDIS_HOST=your-upstash-redis-host
REDIS_PASSWORD=your-upstash-redis-password
PORT=8080
NODE_ENV=production
```

To get Upstash Redis credentials:
1. Go to [Upstash Console](https://console.upstash.com)
2. Create or select your Redis database
3. Copy the REST API URL and REST API Token
4. Extract the host (from URL) and password (from token)

## Deployment Steps

### Option 1: Deploy from GitHub (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Azure deployment"
   git push origin main
   ```

2. **Create Azure App Service**
   - Go to [Azure Portal](https://portal.azure.com)
   - Click "Create a resource"
   - Search for "Web App"
   - Click "Create"
   - Fill in:
     - Resource group: Create or select existing
     - Web app name: Your unique app name
     - Runtime stack: Node.js (LTS)
     - Operating system: Linux
     - Region: Choose closest to your users
     - Pricing plan: Free (F1) or Standard (S1) for production
   - Click "Create"

3. **Configure Deployment Center**
   - Go to your App Service
   - Click "Deployment Center" in left menu
   - Select "GitHub"
   - Authorize Azure to access your GitHub
   - Select your repository and branch
   - Click "Save"

4. **Add Environment Variables**
   - Go to your App Service
   - Click "Configuration" in left menu
   - Click "Application settings"
   - Add the environment variables listed above
   - Click "Save"

5. **Build Configuration**
   - In Deployment Center, click "Build"
   - Set "Build command" to: `npm run build`
   - Set "Start command" to: `npm run start:prod`
   - Click "Save"

Azure will automatically build and deploy your app on every push to GitHub.

### Option 2: Deploy from Local Machine

1. **Install Azure CLI**
   ```bash
   # Windows (PowerShell)
   winget install Microsoft.AzureCLI

   # Or download from https://docs.microsoft.com/cli/azure/install-azure-cli
   ```

2. **Login to Azure**
   ```bash
   az login
   ```

3. **Create Resource Group**
   ```bash
   az group create --name myResourceGroup --location eastus
   ```

4. **Create App Service Plan**
   ```bash
   az appservice plan create --name myAppServicePlan --resource-group myResourceGroup --sku FREE --is-linux
   ```

5. **Create Web App**
   ```bash
   az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name your-app-name --runtime "NODE|18-lts"
   ```

6. **Configure Environment Variables**
   ```bash
   az webapp config appsettings set --resource-group myResourceGroup --name your-app-name --settings REDIS_HOST=your-host REDIS_PASSWORD=your-password PORT=8080 NODE_ENV=production
   ```

7. **Deploy**
   ```bash
   # Build your app locally
   npm run build

   # Deploy using ZIP
   cd dist
   zip -r ../app.zip .
   cd ..
   az webapp deployment source config-zip --resource-group myResourceGroup --name your-app-name --src app.zip
   ```

## Health Check

Azure will automatically monitor your app at the `/health` endpoint. This endpoint returns:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Monitoring

- Go to your App Service in Azure Portal
- Click "Log Stream" to view real-time logs
- Click "Metrics" to view performance metrics
- Use Application Insights for advanced monitoring (optional)

## Troubleshooting

### App not starting
- Check the Log Stream for errors
- Verify environment variables are set correctly
- Ensure the build command is `npm run build`
- Ensure the start command is `npm run start:prod`

### Redis connection errors
- Verify REDIS_HOST and REDIS_PASSWORD are correct
- Check Upstash Redis is running
- Ensure your Azure App Service can reach Upstash (no firewall blocking)

### Rate limiting not working
- Check Redis connection logs
- Verify trust proxy is enabled (it is in main.ts)
- Check if IP is being extracted correctly in logs

## Scaling

To scale your application:
1. Go to your App Service
2. Click "Scale up" (change plan) or "Scale out" (add instances)
3. For production, consider Standard (S1) or higher

## Security

- Use HTTPS (enabled by default on Azure)
- Store sensitive values in Azure Key Vault (optional)
- Restrict access using IP restrictions in Azure Portal
- Enable Azure Managed Identity for secure database access (optional)
