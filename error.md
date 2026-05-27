Okay, so this is it, I have to project environment, the one for testing and now this one for full integration after testing,
So before I was working only using this one, but I tried to integrate the dashboard app in it and it caused more that inifinity errors, so I decided to use too, I called the checkout from git for the last codes that were working perfectly and that's what I have right now here and the integrated dashboard app too

So earlier main errors that arises were object cannot be converted to primitive, and all were caused by the dashboard files but later I fixed them on the test environment, I found out that serializer files were calling data with there field property mostly where we're defining date i.e 
last_updated=serializer.DateTimeField but later it I changed to charfield and it started working

Now I've copy pasted the dashboard files that I have been fixing earlier and I'm not ready to call them in the primary files(routes/index.jsx, etc) because I fear what had happened earlier, I spent like 4 days trying to figure out how the error was.

I want you to help me clean this dashboard files but don't implement them now first in the root files just be 100% that those files will work as they are supposed to, please
And don't joke with them, make sure you think them through first before changing, editting, deleting anything, then provide a file in docs/dashboard/error_fixes on how, what, where and the why you've fixed the files for more resolution and learning in future

#  Getting some refernce from other apps which are 90-100 % complete like accounts, config, tenants etc I want you to look into the following
## Dashboard Backend(App)
1.  - middleware before we call them into settings/base but don't call them, I'll call them my self, make sure they import everything as required by the all apps, like for users, it hase to call the exact fields/data from accounts app, for tenant, billing etc
2.  - The Services Directory, make sure they are portable and stable to the existing apps
3.  - The APIs directory, mostly the serializers, and views
4.  - Signals and the realtime consumers
I think that's all for backend, just make sure they are okay, and for any root files that I've not called them yes, please don't call them, just fix the files 
Then come back we proceed with the frontend
## N/B Take it seriously please, it drained me earlier, thanks