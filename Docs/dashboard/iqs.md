# Good morning  and how are you doing
- I want us to work on the dashboard app today
If you're able to read images, please visit the src/assets/images/desktop.png, mobile.png, icon-s.png 
# Requirements
- I want my dashboard layout to look exactly like those ones in those pictures, though I'm using different users accounts etc
- Mostly, focus on the layout, color, and the components, though I have some more than that, but mostly the layout
# What I have
1. components/dashboard/layaout/** - define all the dashboard layouts
2. Other dashboards from other apps, though don't mid them
3. realtime and real-data from other apps, i.e kpis, users from accounts, tenants/clients, org structure, reviews, config app(only admin related), billing app
4. In components/dashboard/Sidebar and the config/navigation - they define each role sidebars layouts etc.
5. In the components/dashboard/layout/** we have two layouts the dashboard-layout and the main-layout, I guess we can make it one
6. Still on the layout we have the RoleBasedAppLayout for redirections according to your role
7. We have the routes/index.jsx - initialy it was calling the other apps dashboard but now that I've finished integrating the dashboard app, you can change it to the new layout and dashboard we've integrated.
We also have the other apps routes etc
8. The login submission submits to the initial kpi/dashboard but now I want it to submit to the new dashboard app
# N/B
I want you to read the following
1. exept the Development director read all Docs/**/pendings. files in the base directory Docs/ it I'll guide you on what each dashboard needs, 
2. You can import everything from the existing app cause they are all realtime
3. I insist on the layout change to the one in those pictures, and calling my own data and components that I have
4. I have the React-Icons ie Fi etc you can use them, where necesary
5. Read the sidebars components and calling 
That's all I have for now make me proud

## Check this
All other apps works perfectly, but whyen I try to call the dashboard files in them, they work though but some of the dashboard files returns "cannot change the value to primitive"
Like now the executive dashboard files work but without calling some files like "import { getDefaultRouteByRole } from "../config/constants/dashboardRouteConstants";
"
And also when I call the /dashboard api to be submitted after logging in it redirects to the executive one and yet I'm super_admin

Earlier it had not been working, all were returning "cannot convert object to premitive" then it turns out the issue was the serializers, but I fixed them but now it's only the executive files working and not all again

NOTE
Read the base directory file error.md, that's what I was trying to solve yesterday 