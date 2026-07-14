Complete KPI Walkthrough: Laban's Commercial Organization
Setting the Scene
Organization: TechGrow Solutions (Commercial Sector)
Role: Laban is the Dashboard Champion (oversees the entire KPI system)
Teams: Team A (Sales), Team B (Marketing), Team C (Product)
Each Team: 1 Team Lead + 4 Team Members = 15 people total

Part 1: Who Creates What? (Framework Setup)
Question: Who creates frameworks? Super Admin or Client Admin?
Answer: Both, but with different permissions.

Role	Can Create Frameworks?	Can Publish?	Can Delete?
Super Admin	✅ Yes (any tenant)	✅ Yes	✅ Yes
Client Admin	✅ Yes (their tenant only)	✅ Yes	❌ No (only deactivate)
Dashboard Champion	❌ No (can only use published ones)	❌ No	❌ No
In our example:

Super Admin (at Falcon Consulting) creates the initial commercial framework template

Client Admin (TechGrow's IT manager) customizes it for their company

Laban (Dashboard Champion) only uses published frameworks, cannot create/edit

The Framework Creation & Publishing Process
Step 1: Super Admin creates framework

text
Framework Name: "Commercial Performance v1.0"
Sector: Commercial
Status: DRAFT (only admins can see it)
Step 2: Client Admin customizes

Adds company-specific KPIs

Sets default weights

Configures thresholds

Step 3: Client Admin publishes

text
Status changes: DRAFT → PUBLISHED
Now visible to all users (Dashboard Champions, Managers, Staff)
Step 4: (Later) Version 2.0 created

text
New framework: "Commercial Performance v2.0" (DRAFT)
Old framework: "Commercial Performance v1.0" (ARCHIVED)
Historical data preserved, new data uses v2.0
Part 2: The KPI We'll Track
KPI Name: Monthly Revenue Achievement
KPI Type: FINANCIAL
Calculation Logic: HIGHER_IS_BETTER
Measure Type: CUMULATIVE (YTD)
Unit: KES
Category: FINANCIAL

Why this KPI? It touches every part of the organization and demonstrates all features.

Part 3: Executive Sets Company Targets (Laban as Dashboard Champion)
Laban (Dashboard Champion) logs in and sets the annual target:

Step 1: Set Annual Target

text
Company Annual Revenue Target: 100,000,000 KES for 2025
Step 2: Choose Phasing Strategy
Laban chooses Seasonal Distribution because TechGrow sells more in Q4:

Month	% of Annual	Target Amount
January	5%	5,000,000 KES
February	5%	5,000,000 KES
March	7%	7,000,000 KES
April	7%	7,000,000 KES
May	8%	8,000,000 KES
June	8%	8,000,000 KES
July	8%	8,000,000 KES
August	8%	8,000,000 KES
September	8%	8,000,000 KES
October	10%	10,000,000 KES
November	10%	10,000,000 KES
December	16%	16,000,000 KES
TOTAL	100%	100,000,000 KES
Step 3: Lock Phasing
Once the performance cycle starts (January 1st), Laban locks the phasing. No one can change monthly targets after this point. This ensures data integrity.

Part 4: Target Cascading (Breaking Down to Departments)
Laban now cascades the company target to departments:

Distribution Rule: Weighted by Team Size
Department	Team Size	% of Company	Department Target
Team A (Sales)	5 people	50%	50,000,000 KES
Team B (Marketing)	5 people	50%	50,000,000 KES
Team C (Product)	5 people	0%	0 KES (no revenue responsibility)
Wait, Team C has 0%? That's intentional. Product team doesn't directly generate revenue. They have different KPIs (product usage, feature adoption).

For this example, we'll focus on Team A and Team B.

Team A (Sales) - Further Cascade to Individuals
Team Lead (Manager) receives 50,000,000 KES annual target.

Distribution Rule: Equal Split (all sales reps equal)

Individual	Annual Target	Monthly Target (January)
Sales Rep 1	12,500,000 KES	625,000 KES
Sales Rep 2	12,500,000 KES	625,000 KES
Sales Rep 3	12,500,000 KES	625,000 KES
Sales Rep 4	12,500,000 KES	625,000 KES
Team Lead	0 KES (their KPI is team performance)	-
Note: Team Lead's KPI is "Team Revenue Achievement" - they succeed when their team succeeds.

Team B (Marketing) - Different Distribution Rule
Marketing supports Sales, so they have a smaller target.

Individual	Annual Target	Monthly Target (January)
Marketing Rep 1	16,666,667 KES	833,333 KES
Marketing Rep 2	16,666,667 KES	833,333 KES
Marketing Rep 3	16,666,667 KES	833,333 KES
Team Lead	0 KES (team performance KPI)	-
Part 5: Staff Enters Actual Data (January)
Sales Rep 1 - Enters Data
Login: Sees their dashboard with one KPI: "Monthly Revenue Achievement"

Target for January: 625,000 KES

They enter: 580,000 KES (slightly below target)

Add notes: "Two large deals delayed to February"

Attach evidence: Sales report PDF

Click Submit

Status changes: PENDING VALIDATION

What happens next:

System sends notification to Team Lead (Manager)

Rep sees: "Waiting for approval"

Part 6: Manager Validates Data
Team Lead (Sales Manager) logs in
Their dashboard shows:

Their own KPIs (at the top)

Below that, a list of their 4 team members

Each team member card shows:

Name

Role

Status indicator (🟡 for pending, 🟢 approved, 🔴 rejected)

They see Sales Rep 1 has PENDING submission

Click to review:

They see:

Actual value: 580,000 KES

Target: 625,000 KES

Notes about delayed deals

Attached sales report

Decision: Approve (the reason is legitimate, variance is small)

Click Approve → Add comment: "Noted the delay, approve for now"

Status changes: APPROVED

What happens next:

Sales Rep 1 gets notification: "Your data has been approved"

Score is calculated automatically

Dashboards update in real-time

Part 7: Score Calculation (The Formula)
Formula 1: HIGHER_IS_BETTER (Revenue)
text
Score = (Actual ÷ Target) × 100
Sales Rep 1 January:

text
Score = (580,000 ÷ 625,000) × 100 = 92.8%
Traffic Light: 🟢 GREEN (≥90%)

Interpretation: Slightly below target but still "On Track"

What if they had exceeded target?
text
Actual: 700,000 KES, Target: 625,000 KES
Score = (700,000 ÷ 625,000) × 100 = 112%
System caps at 100% (no bonus points for exceeding)

Formula 2: LOWER_IS_BETTER (Different KPI example)
Let's say we tracked "Customer Complaint Response Time" for Support Team.

Target: 24 hours
Actual: 18 hours

text
Score = (Target ÷ Actual) × 100
Score = (24 ÷ 18) × 100 = 133% → capped at 100%
Actual: 36 hours (slower than target)

text
Score = (24 ÷ 36) × 100 = 66.7%
Traffic Light: 🟡 YELLOW (At risk)

Part 8: Weighted Scores (Overall Performance)
Sales Rep 1 has multiple KPIs with different weights:

KPI	Score	Weight	Contribution
Revenue Achievement	92.8%	50%	46.4
Customer Satisfaction	85%	30%	25.5
Pipeline Generation	70%	20%	14.0
OVERALL SCORE		100%	85.9%
Traffic Light: 🟡 YELLOW (At risk overall, even though revenue was green)

Part 9: Cumulative vs Non-Cumulative
Cumulative (YTD) - How Revenue Works
January: Actual 580K, Target 625K → YTD Achievement: 92.8%
February: Actual 650K, Target 625K

YTD Calculation:

text
Total Actual (Jan+Feb) = 580K + 650K = 1,230,000 KES
Total Target (Jan+Feb) = 625K + 625K = 1,250,000 KES
YTD Score = (1,230,000 ÷ 1,250,000) × 100 = 98.4%
Even though February was good, the January shortfall still affects YTD score.

Non-Cumulative - How Monthly Satisfaction Works
January: Satisfaction score 85%
February: Satisfaction score 92%

Each month stands alone. February's score doesn't add to January. You start fresh each period.

Part 10: Red Alert System
What happens if someone consistently underperforms?
January: Score 45% → 🔴 RED
February: Score 48% → 🔴 RED (second consecutive red)

System automatically:

Sends alert to Team Lead (manager)

Sends alert to Laban (Dashboard Champion)

Sends alert to HR

Laban sees in Champion Dashboard:

Red alert count increases

Click to see details

Can initiate Performance Improvement Plan (PIP)

Part 11: What Each Person Sees
1. Sales Rep 1 (Individual Staff)
Dashboard shows:

Their overall score (85.9%)

List of their KPIs with individual scores

Recent activity (their submissions, approvals)

Trend chart showing their performance over last 6 months

Cannot see: Other team members' scores

2. Team Lead (Manager)
Dashboard shows:

Their own score (at top)

Team summary: 4 members, average score 82%

List of team members with scores:

Name	Score	Status	Action
Rep 1	85.9%	🟡	-
Rep 2	92%	🟢	-
Rep 3	48%	🔴	Needs attention
Rep 4	78%	🟡	-
Pending validations (if any)

Missing submissions (who hasn't entered data)

Can click any team member to see their full dashboard (drill-down)

3. Laban (Dashboard Champion)
Dashboard shows:

Organization submission rate (100% - everyone submitted)

Department compliance (Team A: 100%, Team B: 100%)

Unvalidated entries (0)

Pending escalations (0)

Red KPI alerts (1 - Rep 3)

Also sees:

Department ranking

KPI status distribution

Data quality metrics

Can do:

Cascade targets for next year

Lock phasing

View audit logs

Export reports

4. Executive (CEO)
Dashboard shows (high-level only):

Organization health score (78%)

Red KPI count (3 across organization)

Department rankings (Team A: 82%, Team B: 79%, Team C: 85%)

Trend: Performance improving over last 3 months

Can drill down but usually delegates details to Laban

5. Client Admin (IT Manager)
Can do everything Laban can do, plus:

Create new frameworks

Edit categories

Manage templates

Configure system settings

Manage user roles

Cannot: Delete frameworks with data (only deactivate)

6. Super Admin (Falcon Consulting)
Can do everything, plus:

See ALL tenants' data

Create tenant-wide frameworks

Manage subscriptions

System-wide settings

Part 12: Complete Data Flow Diagram
text
Step 1: Setup (Before Year Starts)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Super Admin → Creates Framework (DRAFT)
Client Admin → Customizes & Publishes (PUBLISHED)
Laban (Champion) → Sets Annual Target (100M)
Laban → Phases across months
Laban → Cascades to departments/individuals
Laban → Locks phasing on Jan 1

Step 2: Monthly Process
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rep → Enters actual data (580K)
Rep → Adds notes, attaches evidence
Rep → Submits (PENDING)

Team Lead → Receives notification
Team Lead → Reviews data
Team Lead → Approves or Rejects
If Rejected → Rep resubmits

System → Calculates score (92.8%)
System → Updates traffic light (GREEN)
System → Updates dashboards in real-time

Step 3: Aggregation & Reporting
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Individual scores → Team average (82%)
Team scores → Department roll-up
Department scores → Organization health (78%)
All visible in real-time dashboards

Step 4: Exceptions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If RED for 2 months → Auto-alert to Champion & HR
If unresolved → Escalate to senior management
If needed → Initiate Performance Improvement Plan (PIP)
Summary: Who Does What
Person	Role	Key Responsibilities
Super Admin (Falcon)	Platform owner	Creates templates, manages tenants
Client Admin (IT Manager)	Tenant owner	Customizes frameworks, manages users
Laban	Dashboard Champion	Sets targets, cascades, monitors compliance
Team Lead	Manager	Validates team data, reviews performance
Sales Rep	Staff	Enters actual data, views own KPIs
CEO	Executive	Views organization health, high-level trends
One Complete Example Timeline
January 1: Laban locks phasing for 2025

January 31: Rep enters 580K revenue

February 1: Team Lead approves (92.8% score)

February 28: Rep enters 650K revenue

March 1: System calculates YTD: 98.4%

March 31: Rep enters 600K revenue (slightly below)

April 1: YTD: (580+650+600=1,830K) ÷ (625×3=1,875K) = 97.6%

Throughout: Laban monitors champion dashboard, sees green status, takes no action

December 31: Year-end total actual = 98.2M vs target 100M = 98.2% final score

January next year: Laban sets new targets, repeats process

This single example covers:

✅ Framework creation & publishing (Super Admin → Client Admin → Champion)

✅ Annual target setting

✅ Monthly phasing with seasonal strategy

✅ Target cascading (Organization → Department → Individual)

✅ Staff data entry with evidence

✅ Manager validation (approve/reject)

✅ Score calculation (both formulas)

✅ Weighted scores

✅ Cumulative vs non-cumulative

✅ Red alert system

✅ Role-based dashboards (Staff, Manager, Champion, Executive, Admin)

✅ Drill-down capability

✅ Real-time updates