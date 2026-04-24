# Frontend Organisation Architecture Standardization

This plan details the comprehensive restructuring and generation of missing files for the `organisation` module, ensuring it has complete parity with the robust, scalable architecture of the `accounts` module. 

## User Review Required
Since the `organisation` module is missing many architectural layers, we need to create a substantial number of new files (middleware, services, custom hooks, utils, and pages). Please confirm if you approve generating all these missing components to complete the feature set!

## Proposed Changes

---

### Services Layer (Creating Missing Files)
Currently, `accounts` has robust specific services while `organisation` only has a basic `api.js` and `organisationService.js`.
- **[NEW]** `services/organisation/departmentService.js`
- **[NEW]** `services/organisation/teamService.js`
- **[NEW]** `services/organisation/domainService.js`
- **[NEW]** `services/organisation/kpiService.js`
- **[NEW]** `services/organisation/auditService.js`
- **[NEW]** `services/organisation/subscriptionService.js`
- **[NEW]** `services/organisation/brandingService.js`

---

### Redux Store Integration & Middlewares (Creating Missing Files)
The `organisation` module has some slices defined, but they are not registered. We also need to add domain-specific middleware.
- **[MODIFY]** `store/rootReducer.js`: Register `organisation`, `department`, `domain`, `branding`, `position`, `subscription`, and `settings` reducers into the Redux combining reducer.
- **[NEW]** `store/organisation/middlewares/auditMiddleware.js`: Middleware to automatically dispatch audit log actions on state changes.
- **[NEW]** `store/organisation/middlewares/syncMiddleware.js`

---

### Custom Hooks (Creating Missing Files)
While we have a few standard hooks, we need specialized logic handlers.
- **[NEW]** `hooks/organisation/useKpiData.js`
- **[NEW]** `hooks/organisation/useAuditLogs.js`
- **[NEW]** `hooks/organisation/useDepartmentHierarchy.js`

---

### Context Layer
- **[NEW]** `contexts/organisation/OrganisationContext.jsx`: Move existing logic into a properly namespaced folder.
- **[DELETE]** `contexts/OrganisationContext.jsx`: Delete the old un-namespaced context file and update imports across all components.

---

### Utilities (Creating Missing Files)
The `accounts` module has constant files, formatters, tokens, validations, etc. We will match this entirely for `organisation`.
- **[NEW]** `utils/organisation/constants.js`: Define standard KPI thresholds, subscription enums, and department nesting specs.
- **[NEW]** `utils/organisation/formatters.js`: Visual formatting logic for domains, subscriptions, currency conversion.
- **[NEW]** `utils/organisation/validators.js`: Structural validators for hierarchies, domains, etc.
- **[NEW]** `utils/organisation/helpers.js`

---

### Pages Layer (Creating Missing Files)
Entry points logic for routing should be encapsulated in `pages/organisation`.
- **[NEW]** `pages/organisation/Dashboard.jsx`: Wrapper/entry page passing context over to `OrganisationDashboard` components.
- **[NEW]** `pages/organisation/Departments.jsx`
- **[NEW]** `pages/organisation/Teams.jsx`
- **[NEW]** `pages/organisation/index.js`: Barrel exporter for the newly created pages.

---

### Templates (Creating Missing Files)
Adding standard architectural definitions.
- **[NEW]** `templates/organisation/defaultBranding.js`: Standardized object formats or CSS variables representing the base layout of a custom organisation.
- **[NEW]** `templates/organisation/emailTemplates.js`

## Open Questions

This is a large structural update that creates all the missing files you noted. Does this comprehensive list match what you're looking for, and do I have your approval to start building these out?

Great, now ready for the frontend??
First thing: Don't change anything on the base files that are not related to organisation app:
You can check the common components(MainLayout, SideBAr etc). Then we start with the organisation components:
This how my structure looks like:
componets/accounts
components/organisations
hooks/accounts
hooks/organisations
etcetra
Clean every organisations frontend file and add everyfile that I don't have in components and all modules that are missing files
Also add for me the files styling(css), Though I stated integrationg the css organizations fils I have the main styles directory in the src/ and the index.css
Make sure all urls patterns are being called well and working
Then after you're done with the other files move on to the base ones that are calling the organisations module(routes, constants, app.jsx etc):
Lets begin, styling and the module implementations should be proffesional 