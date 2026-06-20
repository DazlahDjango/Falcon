Good morning, I want to work today fully on kpi app and make sure it's fully functional. 
With your help, I managed to fix the routing issues and roght now I can view all the pages in the browser, just to be clear, all the backend apis when I was testing them earlier they all returned 200 ok status code which its much appealing, you can check this on the base directory path Docs/KPIs/tested_apis.md

# KPI Files Paths
If you'd want to check the backend kpi files, I don't have a problem with that but its okay, I myself can rate it 10/10 enterprise-oriented production ready
For kpi frontend files this are the paths
Frontend as base dir
1. services/kpi/**
2. store/kpi/slices/**, store/kpi/selectors/kpi.selectors
3. components/kpi/**
4. pages/kpi/**
Then the routes are in src/routes/kpi.routes.jsx which I've told you it's fully functional

# What I have see in frontend
1. I can view all the pages, see creation buttons since I'm accessing as super admin role and all permissions they don't affect the super admin
2. I started by trying to create sectors and the creation form was displayed but now when it comes button submission it doesn't submits, though when the form is empty and click the submit button, it gives you the validation messages on the asterisk fields that you have to fill them
3. For the kpi management testing, I started by clicking the create button but it was just loading though it had displayed the wizard creation numbers form of the three steps, I think it will work perfectly after this, maybe it was because it lacked the sectors, categories, framework etc
4. Being super admin, I called all the elements/components in the super admin navigation and including the other users dashboards, everything was working perfectly, it was well styled and appealing
5. I could say that's all for now but one last thing, in kpi.routes.jsx files I've called all the analytics files correctly but the momment I try accessing them, they call the admin dashboard overview instead of the pages they are assigned. I think maybe I called the navigations link in the wrong way or something, you can check that too in config/navigation/platformAdminNavigation.js

# what I want you to do now
1. We start by fixing the the CRUD actions, just clean the files/pages for all actions performed either, create , edit, view, delete, update, search, achieve, activate, deactivate etc
2. Once number 1 is done we can proceed to check the error code of too many request sent, I guess that is always handled by the hooks, slices or the selectors and I think is just introduction of useRef required to fix that
3. After NO. 2 we can proceed to clean the whole files making sure their will be no any code error apart from the necessary status code i.e 200, 404, 201(I think so this is for create) etc.
4. Lastly but not the least, we make sure that all the kpi app is fully functional and works perfectly as it should and since I'm the one using the app, the changes should be done in a way that won't affect the super admin access, and I'll appreciate if you could leave me with some kind of instruction or documentation after you're done for me to understand the best approach you took to fix these issues, so that I don't make these mistakes in future and also I can be able to fix them myself.

**Note**:
1. Make sure you don't affect the app's functionality
2. Don't affect the distribution of permissions
3. Don't affect the app's styling and appearance for now
4. The Primary thing we're focusing on is to make all the pages to function as intended and make sure there are no other issues i.e 
    * Too many requests
    * No response from requests
    * Status codes not being displayed correctly

Thank you so much lets make this happen now, I'll be here to test as you make the changes and we fix them right there, don't mind you testing them, let me test by myself, you just make sure the files are clean and working, that's all I need from you, Thank you