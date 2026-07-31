Just as we've analyzed the backend we'll do so to the frontend, and the first app will be this accounts app

# Note -> You'll follow the flow below to view the accounts files
1. Re-analyze the accounts service and api layers
2. Read the ./urls_apis.md file to see the api urls endpoints, I've called all of them using the show_urls django command
3. Now to frontend/src/ directory, we have the following
    1. config/constants/accountsApiConstants.js(make sure all the urls in the urls_apis.md file are in here for accounts apis paths, and if there are missing urls, you'll add them during implementation), accountsConstants on the same directory
    2. services/accounts/api/**(all services files) -> analyze if they all call the apis in the accountsApiConstants.js files that've called the urls_apis.md urls, accounts/websocket/(all files)
    3. store/accounts/**(all the files):
        - slice/**(they import from our accounts axios services) -> all thunks and slices configurations
        - selectors/**(for additional thunks and touting, including both nested and normal routing)
        - middlewares/**(all the accounts middlewares) -> from the auth to the last middleware(loggerMiddleware.js)
    4. hooks/accounts/**(this ones now extends the slices and the selctors) they act as our intermediary between the other files with our components files
    5. components/accounts/**(all components directories fully analyzed) -> admin/, audit/, auth/, common/, mfa/, permissions/, preferences/, profiles/, reports/, roles/, security/, sessions/, users/. Make sure they all have the correct imports from there dependant files i.e hooks etc
    6. pages/accounts/**(all accounts pages)
    7. routes/accounts.routes.jsx files -> make sure they map all the routes to the pages also some routes have been called directly by the routes/index.jsx
    8. contexts/accounts/**(all contexts files)

# Needed: -> Make sure this frontend is mapping directly with our backend flow
1. Understand all the modules and provide a good findings per module in the directory Docs/frontend/accounts/findings/**
2. If there will be an upgrade the provide a good upgrade/fixes implementations in the directory Docs/frontend/accounts/

N/B:
Make sure the files are clean, don't add comments in them, I want them clean the way they are, no need of many comments
Make me proud in this