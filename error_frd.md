# This is for frontend requirements
First as I told you earlier most errors were arising from somethin like "cannot convert value to primitive"
Most research had told me that they arise when you call react lazy component so first thing you'll do is to go through the routes/dashboard.routes because thats where lazy is fully called and the rooute of all dashboard frontend files

# STructure
0. - config/constants/dashboard** these is where the APIs are defined, confirm if they are correct
1. - services/dasboard/** - here, the dashboard.service is the base but now I configured the axios client to be only one, supporting all the apps, the axios config files are in services/api/, check how the other apps call the services, but you must confirm it is compatible with our dashboard firs, if not then don't call it in
2. - components/dashboard/** and the config/navigation-  all files integration check anything that can cause error too cause they are linked top lazy
3. - contexts/dashboard/** - make sure they import the correct files from the existing one i.e how they import users and maybe tenants etc
4. - hooks/dashboard/** - I don't know the work of hooks yet but I think they carry out the app actions
5. - store/dashbord/(middleware, slices, selectors) I think also this one may cause exceptions and errors
6. - And lastly pages/dashboard/** - they import almost all components just stabalise them all. Also make them call the realtime data from the other files
7. - styles/dashboard/** - they need to be professional and layouts to be so smooth and apealing

## N/B:
- I'll change the layouts, like now I'm using the one I integrated in accouns to view my files in browser the components/common/Layout/**
Now we'll be changing to the dashboard app, after reviewing and fixing all the files, I want you to come here in the base directory:
    - wastes/ - here you'll include how the file will be integrated, how the layout will change like
        - routes/index.jsx - implement the files layout and other files there
        - store/index and rootreducer if needed
        etc

I think that's all from my side, also be serious with this ones too and remember no iditing my root files, just call them in the waste directory
Then as the backend we've done on the Docs/dashboard/ do it also for frontend