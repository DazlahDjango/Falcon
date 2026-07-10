Hi there, I want us to take the dashboard layout & navigations to the next level
I want us to change the coloring of my navigations/sidebars
Read the files in:
components/dashboard/Layout directory and the Sidebar and the other related files for navigations, header, footer, profile tags/card
we also have other navigation file in config/navigation/platformAdminNav.js

## requirements 
It's just a few, I want you to make it exactly on the images I will be sharing, hopefully we can achieve that, lets start with sidebars and headers and footers

# To-Do List
review those layouts and navigations files then for my css files, we're recreating them to achieve all those images in this form, like now if we're changing the LAyout and Sidebar directory, we need css files in
components/dashboard/Layout/layout.css
component/dashboard/Sidebar/sidebar.css
I think also we can just use new class name for the css files in those .jsx files so that they don't mix with the css files I had earlier which I don't know where they are
# NOTE:
Forcus on the sidebars, nav items, headers, and footers
Look at those two images, 
the first shows the sideba and navigationitems behaviour, the second Headers and footers included
Make sure all the dependant files also have a cool styling
After we're done we can now call our css files in the base directory src index.css, no calling the css in the same component file

Start with the routes/index.jsx where we're calling the
const RoleBasedAppLayout = React.lazy(() => import("../components/dashboard/Layout/RoleBasedAppLayout"));
