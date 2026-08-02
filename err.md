I want to work o0n my app standadization today, and the first app is my apps/configs/ directory cause is the one that act as the registration of the other system apps, helps in maintainance, backups, disaster recoveries, other encryptions services, restorations, healths etc.
First task, I want you to do a full configs app system review, like every file, without changing anything, just to get the concepts of each module, okay??

Apps structure,, the way you'll be reading the files/modules follows this directory oder
from apps/configs:
1. managers/ -> all files in the managers leaving none outside, like I really want a full app review, the managers files are around 13
2. Models/ -> all models files they are around 16
3. Services/ module -> this is now the main important files cause they handle the fully configs app system flow, they are categorised into directories.
   a. services/backup/ -> handles backups
   b. services/disaster_recovery -> for disaster recoveries
   c. services/health/ -> for other apps health checking
   d. services/maintenance/ -> for maintenance management
   e.  services/realtime/ -> configs app realtime management
   f. services/registry/ -> all the other apps registration
   g. service/restore/ -> restorations of deleted or backed up data
   h. services/scheduling/ -> schedule all the tasks i.e maintenance
   i. services/security/ -> configs app system security
   j. services/settings/ -> the configs settings module

4. admin.py
5. apps.py
6. constants.py
7. default_system_settings.py
8. signals.py
9. tasks.py
10. consumers/ ->  all consumers files
11. api/v1/(all modules files here) i.e:
   a. filters/**
   b. throttles/**
   c. serializers/**(10 files)
   d. views/**(we have around 10+ files here)
   e. urls.py

Those are the primary files for the configs app.
NOTE:
1. I repeat, don't skip even a single file in this module, I have a lot of time, just take your time to read all of those files please
2. After we've analyzed all the files, I want you to write for me a file on the base directory called configs_findings.md file on what you,ve find on that app

Ratings:
My achievements is to have 10/10 production ready configs app that fully supports the other core-apps freely and fulfils all that's required to do
1. Flexibility
2. Scurity
3. Solidity
4. Stability
5. Ease of breaking during production and deployment
6. CIA Traid implementations

Yeah that's all make me proud in this