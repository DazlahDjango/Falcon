# Intro(We focus only on the backend)
we'll be focusing on KPI app today, thanks for being my assistant today, let's now start
Just a little into on what I had earlier, everyhting is working perfectly on this app but now during a presentation my employer told me that the KPI app is a little with somethings that I should not need them i.e the sectors and the framework, that's why you've seen I later came and integrated sectors in the tenant app if you've done a good review I hope you saw boh of this two app have the sector module but now I'm going to maintain the one ion the tenant app, just as my employer have said I need the sector module in the tenant app so that I canm include it during the tenant onboarding then KPI creation will just depend entirely on the sector that it's organization was provided with
The sector part is working perfectly on the frontend & backend of the tenant app and also the one of KPI app is working, so I think the thing to be removed is now the Sector on the KPI app and the Framework and any of the files that import those two modules
# Preview
The KPI module itself is so much secured, solid and active so any changes should be carefull and safe, cause any little bug, i.e spellings etc can cause break, almost all the files were using transaction.atomic(), so when changes are being done, make sure it's a perfect and sure change that we're making here

# Requirements
1. We need to remove the two modules, framework and sectors from the KPI app, all their imports and usage.
2. We have the cascading of the KPIs, where the executive will create the KPI, inputs all the details now he starts to cascade them acros the organizatrion where if they have a devision it'll be cascaded to the divisions, then departments, sections, units, and now individuals, make sure you keep keen on the cascade rules there too, make sure that's much achieved cause I'll be tetsting everything immediately we're done
N/B - It should scale from SMEs to much enterprise, by this I mean that the cascading though it is criticaly required, I think it should optional to some other instances, like now to our small scale organizations, so it has to allow first cascading to any level, i.e maybe an organization has only staffs and the executive now they will just be cuscaded to them, or now in case where it is enterprise organizations we can go from the divisions to the individuals, I know you understand what I'm saying
In structure organizational units starts with the (divisions, departments, sections, units then now the staffs/individuals)
3. Read the example.md file on the base directory, earlier my structures were from departments, teams, individuals etc before I change so that example is based on the earlier one, but you canm just use it as a refrence so that you see how KPI flow trends, that time the dashboard-champion could aslo be able to create KPI but my employee said their is no need it should only be the executive, then the sector and framework part is also included and we're going to eliminate them
I just used an example of my own name but maybe if you'd want to test,I have several tenant and users here, you can just use this ones

# To-Do List
1. Read all the files in the KPI app
2. Analyze the entire flow of the KPI app
3. Identify all the files that import the framework and sectors modules
4. Remove the framework and sectors modules from the KPI app
5. Make sure the cascade is working perfectly with the new structural hierarchy that I have
6. Make sure the cascade is optional when it has to do with SMEs and vice versa 
7. Tenant Isolation and db routing is integrated perfectly in the tenant app so the only thing for you is the tenant awareness on the KPI, unless is a super admin who does not need the tenant_id/awareness to view or perform anything
