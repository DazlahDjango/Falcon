Hello, I want you to help me with my kpi app.
Accessing its browser links gives me 404 page not found I think the routes are not being called correctly
See how the other apps implement their routes in:
src/config/constants/appnameApiConstants i.e config/constants/configApiConstants\
also check the routes constants, earlier before cleaning my codes, I was using the confic/constants/index where all my kpis routes were being called but now I've integreated enterprise level architecture of the kpis
I have save all the urls with python manage.py show_urls for kpis in the Docs/KPIs/urls.md file
The backend apis are successfully called each returning 200 ok response and I've saved a refrence in Docs/KPIs/tested_apis.md file
The frontend services are their in the src/services/api for full axios configuration though in that directory theirs a file called endpoints.js this is where the kpi services files imports the endpoints and this kpi services files are in src/services/kpi/**
# Requirements
1. Read the Docs/KPIs/urls.md for all kpi related urls and the Docs/KPIs/tested_apis.md
2. Read the src/config/constants/appnameApiConstants to see how the other apps integrate the endpoints mostly focus on the config's, review's, billing's constants
3. Read the src/config/constants/appnameRouteConstants to see how the routes/ imports the constants
4. Read the src/routes/** to see the frontend dynamic routes of eaach app
5. read the components/dashboard/Sidebar/** to see how each role sidebars were integrated
6. read the src/config/navigation/ to see how admins-navigation and kpi-navigations are integrated