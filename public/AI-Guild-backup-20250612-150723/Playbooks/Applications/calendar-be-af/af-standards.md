# calendar-be-af
CalendarBE with azure functions
Backend Azure Function Standards (BE-AzureFunctionStandards.md)

📦 Azure Functions Version

Runtime: Azure Functions v4

Language: Node.js 20 (LTS)

Structure: Modern (v4+) centralized routing via app.http() inside src/functions/*.js

Update Dependencies:

npm install -g azure-functions-core-tools@4 --unsafe-perm true
npm install                # local node_modules
npm outdated               # check versions
npm update                 # safe update

📂 Naming Standards & Structure

Use flat folders with prefix-style grouping.

Example Azure Function Structure (with status):

src/functions/
├── Category_Get.js            # WIP (Accepted)
├── Category_List.js           # Deferred
├── Category_Create.js         # Deferred
├── Category_Update.js         # Deferred
├── Category_Delete.js         # Deferred
├── Event_Get.js               # Deferred
├── Event_Post.js              # Deferred
├── UserLogin_Get.js           # Deferred
├── UserLogin_Create.js        # Deferred
├── Organizer_Get.js           # Deferred
├── Organizer_Create.js        # Deferred
├── Venue_Get.js               # Deferred
├── MasteredLocations_Get.js   # Deferred

Status Labels:

✅ Production — in use, tested, deployed

🚧 WIP — active development, test locally

🟢 Coming — planned, ready to scaffold

⚪ Deferred — future scope

🔴 Ignore — legacy, will not migrate

🎨 Linting Setup

ESLint with default Node.js rules

npm install --save-dev eslint
npx eslint --init

Recommended .eslintignore:

node_modules
.vscode
local.settings.json

Optional script:

"scripts": {
  "lint": "eslint src/functions --ext .js"
}

🔀 GitHub Integration (Serial Strategy)

Primary source of truth

Pushes flow from local → GitHub → Azure

Do not deploy manually unless hotfixing

Git Branching Strategy

DEVL → TEST → PROD

Local devs work on DEVL

Merges approved into TEST

PROD is deployed via GitHub Action

🚀 GitHub Actions YAML (CI/CD to Azure)

.github/workflows/azure-functions.yml

name: Azure Functions Deploy

on:
  push:
    branches:
      - PROD

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - uses: Azure/functions-action@v1
        with:
          app-name: your-function-app-name
          package: .
          publish-profile: ${{ secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE }}

✅ Testing Strategy

Local: via func start

Integration: Postman, browser, curl

Unit: Optional — add jest or mocha per function

E2E: Coming soon — test parallel routes vs Express

⚙️ Build Process

No build needed for Node.js Azure Functions v4

You may use Babel or tsup for TypeScript or ESNext features

🖼 Future Triggers & Storage

✅ HTTP Trigger (Current)

All functions use app.http()

📸 Blob Storage Integration (Planned)

Azure Blob for event & organizer image uploads

Will use:

@azure/storage-blob

Blob SAS token

JSON payloads for metadata

Example future endpoints:

Image_UploadToBlob.js       # HTTP → Upload image to blob container
Image_GetFromBlob.js        # HTTP → Return secure image URL

🏁 Summary

We're migrating from Node/Express to Azure Functions (AF) using a flat and grouped naming strategy. Each endpoint will live under src/functions/ and follow CI/CD pipelines from GitHub → Azure. Category_Get is the first function accepted. Others are deferred until stabilization.

