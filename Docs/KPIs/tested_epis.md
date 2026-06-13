(falc) PS C:\Users\Dazlah Administrator\Desktop\Falcon_pms> python scratch/kpi_endpoints.py
================================================================================
LOGGING IN...
================================================================================
✅ Login successful!
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90e...
--------------------------------------------------------------------------------
================================================================================
KPI API ENDPOINT TEST
================================================================================
Testing 70 endpoints with 10 workers
--------------------------------------------------------------------------------

📁 TESTING: Sectors
----------------------------------------
  ✅ GET 200 - 6.261s - http://127.0.0.1:8000/api/v1/kpis/sectors/?sector_type=COMMERCIAL
  ✅ GET 200 - 6.347s - http://127.0.0.1:8000/api/v1/kpis/sectors/?is_active=true
  ✅ GET 200 - 6.445s - http://127.0.0.1:8000/api/v1/kpis/sectors/

📁 TESTING: Frameworks
----------------------------------------
  ✅ GET 200 - 3.931s - http://127.0.0.1:8000/api/v1/kpis/frameworks/?is_default=true
  ✅ GET 200 - 4.01s - http://127.0.0.1:8000/api/v1/kpis/frameworks/
  ✅ GET 200 - 4.085s - http://127.0.0.1:8000/api/v1/kpis/frameworks/?status=PUBLISHED

📁 TESTING: Categories
----------------------------------------
  ✅ GET 200 - 5.415s - http://127.0.0.1:8000/api/v1/kpis/categories/?category_type=FINANCIAL
  ✅ GET 200 - 5.478s - http://127.0.0.1:8000/api/v1/kpis/categories/?is_active=true
  ✅ GET 200 - 5.551s - http://127.0.0.1:8000/api/v1/kpis/categories/

📁 TESTING: Templates
----------------------------------------
  ✅ GET 200 - 2.587s - http://127.0.0.1:8000/api/v1/kpis/templates/?difficulty=INTERMEDIATE
  ✅ GET 200 - 2.658s - http://127.0.0.1:8000/api/v1/kpis/templates/
  ✅ GET 200 - 2.733s - http://127.0.0.1:8000/api/v1/kpis/templates/?is_published=true

📁 TESTING: KPI Definitions
----------------------------------------
  ✅ GET 200 - 5.23s - http://127.0.0.1:8000/api/v1/kpis/kpis/?kpi_type=PERCENTAGE
  ✅ GET 200 - 5.307s - http://127.0.0.1:8000/api/v1/kpis/kpis/?measure_type=CUMULATIVE
  ✅ GET 200 - 5.388s - http://127.0.0.1:8000/api/v1/kpis/kpis/
  ✅ GET 200 - 5.459s - http://127.0.0.1:8000/api/v1/kpis/kpis/?calculation_logic=HIGHER_IS_BETTER
  ✅ GET 200 - 5.544s - http://127.0.0.1:8000/api/v1/kpis/kpis/?is_active=true

📁 TESTING: Targets & Phasing
----------------------------------------
  ✅ GET 200 - 5.925s - http://127.0.0.1:8000/api/v1/kpis/monthly-phasing/
  ✅ GET 200 - 5.993s - http://127.0.0.1:8000/api/v1/kpis/monthly-phasing/?is_locked=false
  ✅ GET 200 - 6.068s - http://127.0.0.1:8000/api/v1/kpis/targets/
  ✅ GET 200 - 6.132s - http://127.0.0.1:8000/api/v1/kpis/targets/?year=2025

📁 TESTING: Actuals & Evidence
----------------------------------------
  ✅ GET 200 - 6.183s - http://127.0.0.1:8000/api/v1/kpis/actuals/?status=PENDING
  ✅ GET 200 - 6.245s - http://127.0.0.1:8000/api/v1/kpis/actual-adjustments/
  ✅ GET 200 - 6.333s - http://127.0.0.1:8000/api/v1/kpis/actuals/?year=2025
  ✅ GET 200 - 6.391s - http://127.0.0.1:8000/api/v1/kpis/actual-adjustments/?status=PENDING
  ✅ GET 200 - 6.462s - http://127.0.0.1:8000/api/v1/kpis/actuals/
  ✅ GET 200 - 6.515s - http://127.0.0.1:8000/api/v1/kpis/evidence/

📁 TESTING: Scores & Aggregations
----------------------------------------
  ✅ GET 200 - 12.391s - http://127.0.0.1:8000/api/v1/kpis/scores/?year=2025
  ✅ GET 200 - 12.471s - http://127.0.0.1:8000/api/v1/kpis/scores/my_scores/
  ✅ GET 200 - 12.53s - http://127.0.0.1:8000/api/v1/kpis/aggregated-scores/ranking/
  ✅ GET 200 - 12.625s - http://127.0.0.1:8000/api/v1/kpis/scores/
  ✅ GET 200 - 12.7s - http://127.0.0.1:8000/api/v1/kpis/scores/statistics/
  ✅ GET 200 - 12.767s - http://127.0.0.1:8000/api/v1/kpis/aggregated-scores/
  ✅ GET 200 - 12.838s - http://127.0.0.1:8000/api/v1/kpis/aggregated-scores/organization/
  ✅ GET 200 - 12.913s - http://127.0.0.1:8000/api/v1/kpis/aggregated-scores/departments/
  ✅ GET 200 - 12.985s - http://127.0.0.1:8000/api/v1/kpis/traffic-lights/red_alerts/
  ✅ GET 200 - 13.06s - http://127.0.0.1:8000/api/v1/kpis/traffic-lights/

📁 TESTING: Validations
----------------------------------------
  ✅ GET 200 - 8.568s - http://127.0.0.1:8000/api/v1/kpis/validations/pending/
  ✅ GET 200 - 8.631s - http://127.0.0.1:8000/api/v1/kpis/escalations/my_escalations/
  ✅ GET 200 - 8.718s - http://127.0.0.1:8000/api/v1/kpis/validations/pending-summary/
  ✅ GET 200 - 8.786s - http://127.0.0.1:8000/api/v1/kpis/escalations/
  ✅ GET 200 - 8.861s - http://127.0.0.1:8000/api/v1/kpis/rejection-reasons/
  ✅ GET 200 - 8.94s - http://127.0.0.1:8000/api/v1/kpis/validations/

📁 TESTING: Cascade
----------------------------------------
  ✅ GET 200 - 4.178s - http://127.0.0.1:8000/api/v1/kpis/cascade-rules/
  ✅ GET 200 - 4.274s - http://127.0.0.1:8000/api/v1/kpis/cascade-rules/?is_active=true
  ✅ GET 200 - 4.329s - http://127.0.0.1:8000/api/v1/kpis/cascade-maps/

📁 TESTING: Dashboards
----------------------------------------
  ✅ GET 200 - 13.228s - http://127.0.0.1:8000/api/v1/kpis/dashboard/executive/
  ✅ GET 200 - 13.315s - http://127.0.0.1:8000/api/v1/kpis/dashboard/champion/
  ✅ GET 200 - 13.395s - http://127.0.0.1:8000/api/v1/kpis/dashboard/manager/
  ✅ GET 200 - 13.484s - http://127.0.0.1:8000/api/v1/kpis/dashboard/individual/?year=2025&month=1
  ✅ GET 200 - 13.567s - http://127.0.0.1:8000/api/v1/kpis/dashboard/individual/
  ✅ GET 200 - 13.672s - http://127.0.0.1:8000/api/v1/kpis/admin/overview/

📁 TESTING: Analytics & Reports
----------------------------------------
  ✅ GET 200 - 9.507s - http://127.0.0.1:8000/api/v1/kpis/analytics/predictions/
  ✅ GET 200 - 9.588s - http://127.0.0.1:8000/api/v1/kpis/department-rollups/
  ✅ GET 200 - 9.67s - http://127.0.0.1:8000/api/v1/kpis/organization-health/current/
  ✅ GET 200 - 9.758s - http://127.0.0.1:8000/api/v1/kpis/analytics/insights/
  ✅ GET 200 - 9.842s - http://127.0.0.1:8000/api/v1/kpis/organization-health/history/?months=6
  ✅ GET 200 - 9.913s - http://127.0.0.1:8000/api/v1/kpis/analytics/heatmap/
  ✅ GET 200 - 9.999s - http://127.0.0.1:8000/api/v1/kpis/kpi-summaries/?year=2025
  ✅ GET 200 - 10.08s - http://127.0.0.1:8000/api/v1/kpis/kpi-summaries/

📁 TESTING: History (Audit)
----------------------------------------
  ✅ GET 200 - 5.274s - http://127.0.0.1:8000/api/v1/kpis/kpi-history/
  ✅ GET 200 - 5.35s - http://127.0.0.1:8000/api/v1/kpis/actual-history/
  ✅ GET 200 - 5.414s - http://127.0.0.1:8000/api/v1/kpis/target-history/

📁 TESTING: Reference & System
----------------------------------------
  ✅ GET 200 - 5.607s - http://127.0.0.1:8000/api/v1/kpis/reference-data/
  ✅ GET 200 - 5.708s - http://127.0.0.1:8000/api/v1/kpis/notifications/preferences/
  ✅ GET 200 - 5.796s - http://127.0.0.1:8000/api/v1/kpis/reference-data/?include=users,departments

📁 TESTING: Weights & Linkages
----------------------------------------
  ✅ GET 200 - 7.269s - http://127.0.0.1:8000/api/v1/kpis/kpi-dependencies/
  ✅ GET 200 - 7.332s - http://127.0.0.1:8000/api/v1/kpis/kpi-weights/
  ✅ GET 200 - 7.39s - http://127.0.0.1:8000/api/v1/kpis/strategic-linkages/
  ✅ GET 200 - 7.455s - http://127.0.0.1:8000/api/v1/kpis/kpi-weights/?is_active=true

================================================================================
WRITE OPERATIONS TESTS
================================================================================

📝 Testing POST /sectors/ (Create Sector)...
  Status: 201
  ✅ Sector created: 3217409b-0910-4126-ad91-260212087a8c

📝 Testing PATCH /sectors/{id}/ (Update Sector)...
  Status: 200
  ✅ Sector updated successfully

📝 Testing DELETE /sectors/{id}/ (Delete Sector)...
  Status: 204
  ✅ Sector deleted successfully

📝 Testing POST /categories/ (Create Category)...
  Status: 201
  ✅ Category created: a6838a54-e62c-487d-9f05-226279057a74

📝 Testing POST /calculations/trigger/ (Trigger Score Calculation)...
  Status: 202
  ✅ Calculation scheduled: 9d86f11e-32d3-4d66-af2d-c1bf53535b67
      Status: PENDING

================================================================================
FINAL RESULTS SUMMARY
================================================================================

📊 ENDPOINT SUMMARY:
  ✅ Successful requests: 70
  ❌ Failed requests: 0
  💥 Errors: 0
  📁 Total endpoints tested: 70

📊 WRITE OPERATIONS SUMMARY:
  📝 POST /sectors/ (Create): ✅
  📝 PATCH /sectors/ (Update): ✅
  📝 DELETE /sectors/ (Delete): ✅
  📝 POST /categories/ (Create): ✅
  📝 POST /calculations/trigger/: ✅

⏱️ Total test time: 121.2s

================================================================================
KPI API TEST COMPLETE
================================================================================