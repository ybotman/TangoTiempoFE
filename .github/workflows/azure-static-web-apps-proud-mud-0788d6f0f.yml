name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job

    steps:
      # Checkout the code
      - uses: actions/checkout@v3
        with:
          submodules: true
          lfs: false

      # Set up Node.js 20.x
      - name: Set up Node.js 20.x
        uses: actions/setup-node@v3
        with:
          node-version: '20.x'

      # Get short commit hash
      - name: Get short commit hash
        id: vars
        run: echo "COMMIT_SHORT_SHA=$(echo ${{ github.sha }} | cut -c1-7)" >> $GITHUB_ENV

      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_PROUD_MUD_0788D6F0F }}
          repo_token: ${{ secrets.GITHUB_TOKEN }} 
          action: "upload"
          app_location: "/" # App source code path
          api_location: "" # Api source code path - optional
          output_location: "" # Built app content directory - optional
        env:
          BUILD_VERSION: v1.0.${{ github.run_number }}.${{ env.COMMIT_SHORT_SHA }}
          NEXT_PUBLIC_BUILD_VERSION: v1.0.${{ github.run_number }}.${{ env.COMMIT_SHORT_SHA }}

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_PROUD_MUD_0788D6F0F }}
          action: "close"
          app_location: "."