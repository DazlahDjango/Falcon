Hello, I want us to handle my KPI app here, I had this app earlier fully stacked, later on I came to remove some other things and implemented others, but now the completion on the backend proceeded to the models and services only, there are some modules that were not cleaned, i.e
1. Managers
2. API/ directory (serializers, filters and views)
So even when I try creating the KPI in frontend, it throws an error of database integrity error, and my django-logs shows kpi frmaework_id etc

# Requirements
1. Read the base directory files kpi_imp.md, analyze and understand to see what I changed earlier.
2. We're cleaning the backend first before we move to frontend so make it complete
3. In kpi_imp.md, after finishing, we tested in the apps/kpi/test.py and remember those were services and models only, and all passed. so I want also the APIs to work perfectly not to get the same error, earlier
4. Read the whole KPI app, clean all files in them that import sectors, framewroks thopugh I've been trying to clean them earlier and be sure my KPI app will not break during production or development environment

# NOTE:
1. Everything was working perfectly before, so be carefull with the things we're changing, and also I'm using transaction.atomic() for most of my field data so make sure we're doing something that is perfect
2. I've been developing my apps in some strategies and I gues you will consider them too, for the first 3 I call themj my 3s strategies:
    1. Security
    2. Solidity
    3. Stability
    4. The CIA Traid development
    5. And other solid strategies that an enterprise level system sclaing from SMEs to the most high level organizations can achieve
Let's consider everything in details
What I have is time, so let's keenly look at everything, make perfect changes and implementations,and also upgarding where needed
By the end of this implementation/fix, I don't expect any error, bugs or issues in KPI app, the flow of everything should be good as required, I know you have some business idea too, so apply all of them and also consider my organization/client structure on the structure app, though I also tried to achieve a lot there, just understand everyhting in the base directory file kpi_imp.md file, analyze it line by line It'll explain everyhting I wanted earlier, and let's start a fresh 
Read the KPI app before any changes, understand and start fixing if needed from managers, models, engine, services, signals, tasks, consumers and the api/ directory(both filters, serializers, views, urls etc)