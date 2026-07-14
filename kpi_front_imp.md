Next is now the KPI frontend modifcation too, we've modified the backend and you've tested the whole thing and it works perfectly fine, so now we'll move to the frontend modifications

# Files locations
from frontend/src we have the
1. config/constants/kpiApiConstants, kpiRouteConstants, kpiConstants files
2. services/kpi/**(all the files in this services are specificaly for kpi)
3. store/kpi/**(all slice, selectors)
4. hooks/kpi/**
5. components/kpi/**(if what we have and what you'll integrate will not be enough for real-data imports i.e where we're importing maybe divisions, departments, units, sections for cascading or users, just call from their respective app data, like now structures for organization hierarchy and users from the accounts etc)
6. If there will be a change in styling, then here are the files, 
component/kpi/module_name/module_name.css
8. pages/kpi/**
9. routes/kpi.routes.jsx
10. config/navigation/platformAdminNav.js

N/B:
- Let them follow the backend completely with everything we've integrated, cascading, kpi creation, dashboards, analytics etc
- make my files clean, exclude any unnecessary comments and spacing, I'm not a beginner so just give me the clean frontend implementation that folows our KPI backend modifications
Make me proud