I want to make a complete change on the structure overview modu to use the StructureDashboard.jsx page but only the modules imported toc hange like:

# requirements
1. in that page we're importing teams and yet teams was replaced with the Units, it should have the Divisions, departments, units, sectors etc, and anything that structure needs to have i don't likle the one I'm using right now, it's awfully styled, lets shift to this one
2. I want  you to pick the ones in the pages/structure/DashboardPage.jsx and implement it partaily in the our new file pages/structure/StructurePage.jsx
3. You can add other things in that file but the only things I want them to change is the modules called from the components to the page
4. Also to the cost centers, when I click the create button, it stays in loading state, I don't know why it has to load to open a form, that's unnecessary, it loadis like "loading cost centers" and yet it's the form where I have to create the cost center, why does it have to load bearing in mind we want to create, why are we loading the form and yet we're not fetching the cost cenmters in them, don't you think that's a little bit off?? let's fix this and all the other structure files that initializes loading when opening the creation form, unless you think this is a good idea, but it's taking so long
 
## To-Do List
1. Read the whole pages/structure directory mostly the files in the index.js and the StructureDashboard.jsx page
2. Read the full components files in the index file of components/structure
3. Read the whole structure hooks to see t6hge flow of the other files from the services to the slices
4. Read the cost centers forms and the slices to see how states.loading works then let's chnage everyhting

understand, analyze everything before we start making any changes