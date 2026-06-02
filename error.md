Hello there, we proceede well the other day and everything is working perfectly as expected in the base directory file development.md
Today we're proceeding to phase 2 still on the super_admin dashboard cleaning nand finalizations

# Phase 2
Lets work on the missing elements in the super admin dashboard, but now we'll be calling them from the other apps files/routes files, like now we follow this path
- To-Do tasks
1. In every routes file apps, there exists some paths and filesa called settings, system in other apps like accounts has a system sidebar item.
I want to have a single settings items in the super-admin's sidebar elements
2. The overal dashboard of each app like the kpi dashboard, we redirect to the executive dashboard, we have the organizational dashboard in structure app/routes, we have the tenant dashboard in tenants dashboard, we have the connection items, all of them in the super_admin dashboard
    - We have the billing items, the admin billing items in the billing routes
    - Don't mind about the ones for config app cause all are in the super-admin sidebar, I integrated them
    - Also in kpi include the Aanalytics file, the KPIAnalytics page
    - we have the reviews app dashboard, settings and any path/routes that looks like admin-ish there
    - We have the structure routes, settings and dashboard files too
    - Just as the config app, include everuything in the tenants app and the accountes apps routes in the super_admin sidebar
    - I have the react icons(fi, lucid, md, etc) installed already, you can use them
    - Also I was using this sidebar during testing components/common/layout/sidebar.jsx just read it you see how things we're there 