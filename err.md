I want you to help me with the tenant app, start with reading the base directory file accounts.md to see how my two base accounts users have their roles, I have integrated everything their, now I just remain with one thing in tenant app to make my account app complete on user management
in that accounts.md file theirs a part where I'm saying client_admin onbording should happen during the tenant onboarding, like I should create the client_admin when I'm creating the tenant, and all my the client/tenant/organization users will inherit his/her tenant id

# To-DO task
1. Read the backend tenant app files, understand and unlyze it very well,
2. Read the accounts backend file mostly in user management and the admin management to understand how admin manage users in both roles(super and client admin) though super_admin is optional to have the tenant isolation IDs

# Requirements:
1. Client admin should be created during the tenant onboarding process,
2. All the client/tenant/organization users will inherit his/her tenant id from the client_admin(though already this is satisfied by the accounts app, cause I've tried even loging in with a client with no tenant ID and definitely it failed)
3. I want to have another file/function/class where when I click an organization or users as super admin I can map them to a specific organization
4. Those two 3 listed-to-do are the primary for now, then we'll proceed with others as we move on, but make sure you have the tenant app in memory because it's my priority today

# NOTE:
My tenant app on what I have now is working very perfect and have everything and all the modules works great, from connections, migrations etc
Mostly focus on the user-mapping for the super-admin to the clients, that's our primary for this 10 to 30 mins