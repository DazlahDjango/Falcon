I want you to have a full analysis of my backend apps, mostly all the api directories(the urls, views and the serializers)
all the apps, they are around 8-ish
apps/:
    - accounts/api/v1/**(serializers, views, urls)
    - tenant/api/v1/**(serializers, views, urls)
    - structure/api/v1/**(serializers, views, urls)
    - kpi/api/v1/**(serializers, views, urls)
    - billing/api/v1/**(serializers, views, urls)
    - reportplt/api/v1/**(serializers, views, urls)
    - reviews/api/v1/**(serializers, views, urls)
    - configs/api/v1/**(serializers, views, urls)

# NOTE:
    - What I have is time, take also your time to analyze all those files, I don't care the time you'll finish
    - In addition to those files, I want you to read the services/ layer of all those app, that's where compatibility, horizontal/vertical imports across all the apps comes in, the business logic of the system and dependancy. N/B-> I'd prefer you start with the service layer of this apps, the directory is in: (app_name/services/**(all service files))
    - I repeat, you're going to analyze all the files and dependant files in the directory I've requested and give me your findings in each directory in Docs/findings/**(you'll create the findings files in this directory i.e, kpi.md, tenant.md etc then finish in the same directory with overall.md(this overall.md will scale, rate the files according to how I'll tell you bellow in the requirements))

# Overview of the apps
1. Tenant -> multi-tenancy, isolations via the org/tenant_id, multiple database routing, org schemas separations etc
2. Accounts -> Users, sessions, passowrds, profiles, roles, permissions and other accounts-ish management layers
3. Structure -> It holds the organization structure scaling from the highest unit Divisions to the lowest unit Individual person. we have the following hierarchy (Divisions,departments, sections, units(they replaced teams), individual users)
4. KPI -> This is the main aim and the most important app of the system, it stores the main business idea(KPIs)
5. Billing -> For all payment, plans and subscriptions for the SaaS system managed by PayStack APIs, it includes the following: subscriptions, payments, plans, invoices, usage, webhooks, billings and other financial billings activities
6. ReportPlt -> I started integration os this to cover overal system and businesses reportings, it's not yet done, standadization is still low and mapping to the existing apps
7. Reviews, Overal system and business reviews, it is also structured with things like PIP, cycles, promotions, ratings, calibrations, aggregations, etc, you'll just view them all when you're reviewing the files
8. Configs -> Is among the core app in this system, this app is used to manage the following:
    - Configurations of the other apps
    - System analysis
    - Health checks
    - Recovery(Disaster Recoveries)
    - Maintenance 
    - Backup(Check mostly in this too very deep)
    - Encryptions and other security features
    N/B it is role=super_admin oriented

# Requirements 
1. Start with reading the service layer of the whole app, here analyze everything i.e:
    - Flow of the apps/cross-app flow
    - Business flow and specific module operations
    - Compatibilty with the imports and correct imports
    - Possible bugs and errors that we can fix
    - Other strategies that I'm missing and your recommendations to add some other things or upgrade what I have
2. After the service layer, you can move to this dependant files, serializers, filters and models:
    - Check fileds compatibility
    - All classes should be well integrated and imports called correctly from the paths
    - Look for possible bugs and errors that we can fix
    - Other strategies that I'm missing and your recommendations to add some other things or upgrade what I have
3. After that move to the views and urls, here analyze everything i.e:
    - Chech the flow and dependancies
    - Just as the other two make sure too it integrates with the service layer correctly
    - Look for possible bugs and errors that we can fix
    - Other strategies that I'm missing and your recommendations to add some other things or upgrade what I have
    - File cleanness 
4. After all that, we have the following in each apps:
    - signals/ directory or the signals.py
    - middleware/ or middleware.py
    - tasks/ or tasks.py
    - utils/ or utils.py
    - app.py
    - project celery configurations of tasks in project directory config/celery.py, celery_beat.py, celery_queues.py, celery_routes.py
    - Consumers and the routings/routings.py and the project configurations in config/routing.py

# Ratings(This happens in each modules i.e serivces, the models, serializers and filters, views, consumers, middlewares, signals, tasks etc)
1. Solidity
2. Security
3. Cleanliness
4. Dependancies and imports
5. CIA Traid implementation 
6. Issolations and database routing in each app
7. Ease of failing/breaking/not working effectively during production
8. Breaking during hosting
9. Compatibility to each apps
10. Caching strategies and implementation
11. Optimization and performance
12. Bugs and fixing
# N/B rate them all out of 10/10
# Final rating of the whole system including all the ratings above and your recommendations to improve, just upgrade or add what you think is necessary for the system, after this we'll come with a perfect implementation plan that will take the system to another level(10/10) that's after we've analyzed all the findings

# Findings Directory structure:
Docs/findings:
1. findinfgs.md(overal findings, cross import across the whole apps etc)(This should be the last file to be integrated after all the ones bellow have been well reviewed and written)
2. tenant/services.md, apis.md, db/models.md, midllewares.md, signals.md, consumers.md, tasks.md etc
3. accounts/ services.md, apis.md, db/models.md, midllewares.md, signals.md, consumers.md, tasks.md etc
4. structure/ services.md, apis.md, db/models.md, midllewares.md, signals.md, consumers.md, tasks.md etc
5. kpi/ services.md, apis.md, db/models.md, midllewares.md, signals.md, consumers.md, tasks.md etc
6. billing/ services.md, apis.md, db/models.md, midllewares.md, signals.md, consumers.md, tasks.md etc
7. reportplt/ services.md, apis.md, db/models.md, midllewares.md, signals.md, consumers.md, tasks.md etc
8. reviews/ services.md, apis.md, db/models.md, midllewares.md, signals.md, consumers.md, tasks.md etc
9. configs/ services.md, apis.md, db/models.md, midllewares.md, signals.md, consumers.md, tasks.md etc


# NOTE:
I'm not in a hurry to go anywhere, take your time, make sure we're achieving a 10/10 after this, I don't care what it takes just make it perfect.
Take your time, give me a production, quality findings and implementations
then you can write in the same Docs/findings directory an improvement_implementation.md file after everything is done
# Follow everything I've said deeply and well. Make me proud, lets start