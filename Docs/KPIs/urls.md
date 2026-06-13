(falc) PS C:\Users\Dazlah Administrator\Desktop\Falcon_pms> python manage.py show_urls | Select-String "kpi"
{"time": "2026-06-08 14:21:05,450", "level": "INFO", "module": "apps", "message": "AXES: BEGIN version 8.3.1, blocking by combination of username and ip_address and user_agent"}
C:\Users\Dazlah Administrator\Desktop\Falcon_pms\falc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-06-08 14:21:07,522", "level": "INFO", "module": "connection_cleanup", "message": "Connection cleanup scheduler started"}
{"time": "2026-06-08 14:21:07,992", "level": "INFO", "module": "apps", "message": "Dashboard critical caches warmed"}

/admin/dashboard/favoritekpi/   django.contrib.admin.options.changelist_view    admin:dashboard_favoritekpi_changelist
/admin/dashboard/favoritekpi/<path:object_id>/  django.views.generic.base.RedirectView
/admin/dashboard/favoritekpi/<path:object_id>/change/   django.contrib.admin.options.change_view
admin:dashboard_favoritekpi_change
/admin/dashboard/favoritekpi/<path:object_id>/delete/   django.contrib.admin.options.delete_view
admin:dashboard_favoritekpi_delete
/admin/dashboard/favoritekpi/<path:object_id>/history/  django.contrib.admin.options.history_view
admin:dashboard_favoritekpi_history
/admin/dashboard/favoritekpi/add/       django.contrib.admin.options.add_view   admin:dashboard_favoritekpi_add
/admin/kpi/annualtarget/        django.contrib.admin.options.changelist_view    admin:kpi_annualtarget_changelist
/admin/kpi/annualtarget/<path:object_id>/       django.views.generic.base.RedirectView
/admin/kpi/annualtarget/<path:object_id>/change/        django.contrib.admin.options.change_view        admin:kpi_annualtarget_change
/admin/kpi/annualtarget/<path:object_id>/delete/        django.contrib.admin.options.delete_view        admin:kpi_annualtarget_delete
/admin/kpi/annualtarget/<path:object_id>/history/       django.contrib.admin.options.history_view
admin:kpi_annualtarget_history
/admin/kpi/annualtarget/add/    django.contrib.admin.options.add_view   admin:kpi_annualtarget_add
/admin/kpi/calculationlog/      django.contrib.admin.options.changelist_view    admin:kpi_calculationlog_changelist
/admin/kpi/calculationlog/<path:object_id>/     django.views.generic.base.RedirectView
/admin/kpi/calculationlog/<path:object_id>/change/      django.contrib.admin.options.change_view
admin:kpi_calculationlog_change
/admin/kpi/calculationlog/<path:object_id>/delete/      django.contrib.admin.options.delete_view
admin:kpi_calculationlog_delete
/admin/kpi/calculationlog/<path:object_id>/history/     django.contrib.admin.options.history_view
admin:kpi_calculationlog_history
/admin/kpi/calculationlog/add/  django.contrib.admin.options.add_view   admin:kpi_calculationlog_add
/admin/kpi/cascaderule/ django.contrib.admin.options.changelist_view    admin:kpi_cascaderule_changelist
/admin/kpi/cascaderule/<path:object_id>/        django.views.generic.base.RedirectView
/admin/kpi/cascaderule/<path:object_id>/change/ django.contrib.admin.options.change_view        admin:kpi_cascaderule_change
/admin/kpi/cascaderule/<path:object_id>/delete/ django.contrib.admin.options.delete_view        admin:kpi_cascaderule_delete
/admin/kpi/cascaderule/<path:object_id>/history/        django.contrib.admin.options.history_view
admin:kpi_cascaderule_history
/admin/kpi/cascaderule/add/     django.contrib.admin.options.add_view   admin:kpi_cascaderule_add
/admin/kpi/escalation/  django.contrib.admin.options.changelist_view    admin:kpi_escalation_changelist
/admin/kpi/escalation/<path:object_id>/ django.views.generic.base.RedirectView
/admin/kpi/escalation/<path:object_id>/change/  django.contrib.admin.options.change_view        admin:kpi_escalation_change
/admin/kpi/escalation/<path:object_id>/delete/  django.contrib.admin.options.delete_view        admin:kpi_escalation_delete
/admin/kpi/escalation/<path:object_id>/history/ django.contrib.admin.options.history_view       admin:kpi_escalation_history
/admin/kpi/escalation/add/      django.contrib.admin.options.add_view   admin:kpi_escalation_add
/admin/kpi/kpi/ django.contrib.admin.options.changelist_view    admin:kpi_kpi_changelist
/admin/kpi/kpi/<path:object_id>/        django.views.generic.base.RedirectView
/admin/kpi/kpi/<path:object_id>/change/ django.contrib.admin.options.change_view        admin:kpi_kpi_change
/admin/kpi/kpi/<path:object_id>/delete/ django.contrib.admin.options.delete_view        admin:kpi_kpi_delete
/admin/kpi/kpi/<path:object_id>/history/        django.contrib.admin.options.history_view       admin:kpi_kpi_history
/admin/kpi/kpi/add/     django.contrib.admin.options.add_view   admin:kpi_kpi_add
/admin/kpi/kpicategory/ django.contrib.admin.options.changelist_view    admin:kpi_kpicategory_changelist
/admin/kpi/kpicategory/<path:object_id>/        django.views.generic.base.RedirectView
/admin/kpi/kpicategory/<path:object_id>/change/ django.contrib.admin.options.change_view        admin:kpi_kpicategory_change
/admin/kpi/kpicategory/<path:object_id>/delete/ django.contrib.admin.options.delete_view        admin:kpi_kpicategory_delete
/admin/kpi/kpicategory/<path:object_id>/history/        django.contrib.admin.options.history_view
admin:kpi_kpicategory_history
/admin/kpi/kpicategory/add/     django.contrib.admin.options.add_view   admin:kpi_kpicategory_add
/admin/kpi/kpiframework/        django.contrib.admin.options.changelist_view    admin:kpi_kpiframework_changelist
/admin/kpi/kpiframework/<path:object_id>/       django.views.generic.base.RedirectView
/admin/kpi/kpiframework/<path:object_id>/change/        django.contrib.admin.options.change_view        admin:kpi_kpiframework_change
/admin/kpi/kpiframework/<path:object_id>/delete/        django.contrib.admin.options.delete_view        admin:kpi_kpiframework_delete
/admin/kpi/kpiframework/<path:object_id>/history/       django.contrib.admin.options.history_view
admin:kpi_kpiframework_history
/admin/kpi/kpiframework/add/    django.contrib.admin.options.add_view   admin:kpi_kpiframework_add
/admin/kpi/kpisummary/  django.contrib.admin.options.changelist_view    admin:kpi_kpisummary_changelist
/admin/kpi/kpisummary/<path:object_id>/ django.views.generic.base.RedirectView
/admin/kpi/kpisummary/<path:object_id>/change/  django.contrib.admin.options.change_view        admin:kpi_kpisummary_change
/admin/kpi/kpisummary/<path:object_id>/delete/  django.contrib.admin.options.delete_view        admin:kpi_kpisummary_delete
/admin/kpi/kpisummary/<path:object_id>/history/ django.contrib.admin.options.history_view       admin:kpi_kpisummary_history
/admin/kpi/kpisummary/add/      django.contrib.admin.options.add_view   admin:kpi_kpisummary_add
/admin/kpi/kpitemplate/ django.contrib.admin.options.changelist_view    admin:kpi_kpitemplate_changelist
/admin/kpi/kpitemplate/<path:object_id>/        django.views.generic.base.RedirectView
/admin/kpi/kpitemplate/<path:object_id>/change/ django.contrib.admin.options.change_view        admin:kpi_kpitemplate_change
/admin/kpi/kpitemplate/<path:object_id>/delete/ django.contrib.admin.options.delete_view        admin:kpi_kpitemplate_delete
/admin/kpi/kpitemplate/<path:object_id>/history/        django.contrib.admin.options.history_view
admin:kpi_kpitemplate_history
/admin/kpi/kpitemplate/add/     django.contrib.admin.options.add_view   admin:kpi_kpitemplate_add
/admin/kpi/kpiweight/   django.contrib.admin.options.changelist_view    admin:kpi_kpiweight_changelist
/admin/kpi/kpiweight/<path:object_id>/  django.views.generic.base.RedirectView
/admin/kpi/kpiweight/<path:object_id>/change/   django.contrib.admin.options.change_view        admin:kpi_kpiweight_change
/admin/kpi/kpiweight/<path:object_id>/delete/   django.contrib.admin.options.delete_view        admin:kpi_kpiweight_delete
/admin/kpi/kpiweight/<path:object_id>/history/  django.contrib.admin.options.history_view       admin:kpi_kpiweight_history
/admin/kpi/kpiweight/add/       django.contrib.admin.options.add_view   admin:kpi_kpiweight_add
/admin/kpi/monthlyactual/       django.contrib.admin.options.changelist_view    admin:kpi_monthlyactual_changelist
/admin/kpi/monthlyactual/<path:object_id>/      django.views.generic.base.RedirectView
/admin/kpi/monthlyactual/<path:object_id>/change/       django.contrib.admin.options.change_view
admin:kpi_monthlyactual_change
/admin/kpi/monthlyactual/<path:object_id>/delete/       django.contrib.admin.options.delete_view
admin:kpi_monthlyactual_delete
/admin/kpi/monthlyactual/<path:object_id>/history/      django.contrib.admin.options.history_view
admin:kpi_monthlyactual_history
/admin/kpi/monthlyactual/add/   django.contrib.admin.options.add_view   admin:kpi_monthlyactual_add
/admin/kpi/monthlyphasing/      django.contrib.admin.options.changelist_view    admin:kpi_monthlyphasing_changelist
/admin/kpi/monthlyphasing/<path:object_id>/     django.views.generic.base.RedirectView
/admin/kpi/monthlyphasing/<path:object_id>/change/      django.contrib.admin.options.change_view
admin:kpi_monthlyphasing_change
/admin/kpi/monthlyphasing/<path:object_id>/delete/      django.contrib.admin.options.delete_view
admin:kpi_monthlyphasing_delete
/admin/kpi/monthlyphasing/<path:object_id>/history/     django.contrib.admin.options.history_view
admin:kpi_monthlyphasing_history
/admin/kpi/monthlyphasing/add/  django.contrib.admin.options.add_view   admin:kpi_monthlyphasing_add
/admin/kpi/organizationhealth/  django.contrib.admin.options.changelist_view    admin:kpi_organizationhealth_changelist
/admin/kpi/organizationhealth/<path:object_id>/ django.views.generic.base.RedirectView
/admin/kpi/organizationhealth/<path:object_id>/change/  django.contrib.admin.options.change_view
admin:kpi_organizationhealth_change
/admin/kpi/organizationhealth/<path:object_id>/delete/  django.contrib.admin.options.delete_view
admin:kpi_organizationhealth_delete
/admin/kpi/organizationhealth/<path:object_id>/history/ django.contrib.admin.options.history_view
admin:kpi_organizationhealth_history
/admin/kpi/organizationhealth/add/      django.contrib.admin.options.add_view   admin:kpi_organizationhealth_add
/admin/kpi/rejectionreason/     django.contrib.admin.options.changelist_view    admin:kpi_rejectionreason_changelist
/admin/kpi/rejectionreason/<path:object_id>/    django.views.generic.base.RedirectView
/admin/kpi/rejectionreason/<path:object_id>/change/     django.contrib.admin.options.change_view
admin:kpi_rejectionreason_change
/admin/kpi/rejectionreason/<path:object_id>/delete/     django.contrib.admin.options.delete_view
admin:kpi_rejectionreason_delete
/admin/kpi/rejectionreason/<path:object_id>/history/    django.contrib.admin.options.history_view
admin:kpi_rejectionreason_history
/admin/kpi/rejectionreason/add/ django.contrib.admin.options.add_view   admin:kpi_rejectionreason_add
/admin/kpi/score/       django.contrib.admin.options.changelist_view    admin:kpi_score_changelist
/admin/kpi/score/<path:object_id>/      django.views.generic.base.RedirectView
/admin/kpi/score/<path:object_id>/change/       django.contrib.admin.options.change_view        admin:kpi_score_change
/admin/kpi/score/<path:object_id>/delete/       django.contrib.admin.options.delete_view        admin:kpi_score_delete
/admin/kpi/score/<path:object_id>/history/      django.contrib.admin.options.history_view       admin:kpi_score_history
/admin/kpi/score/add/   django.contrib.admin.options.add_view   admin:kpi_score_add
/admin/kpi/sector/      django.contrib.admin.options.changelist_view    admin:kpi_sector_changelist
/admin/kpi/sector/<path:object_id>/     django.views.generic.base.RedirectView
/admin/kpi/sector/<path:object_id>/change/      django.contrib.admin.options.change_view        admin:kpi_sector_change
/admin/kpi/sector/<path:object_id>/delete/      django.contrib.admin.options.delete_view        admin:kpi_sector_delete
/admin/kpi/sector/<path:object_id>/history/     django.contrib.admin.options.history_view       admin:kpi_sector_history
/admin/kpi/sector/add/  django.contrib.admin.options.add_view   admin:kpi_sector_add
/admin/kpi/trafficlight/        django.contrib.admin.options.changelist_view    admin:kpi_trafficlight_changelist
/admin/kpi/trafficlight/<path:object_id>/       django.views.generic.base.RedirectView
/admin/kpi/trafficlight/<path:object_id>/change/        django.contrib.admin.options.change_view        admin:kpi_trafficlight_change
/admin/kpi/trafficlight/<path:object_id>/delete/        django.contrib.admin.options.delete_view        admin:kpi_trafficlight_delete
/admin/kpi/trafficlight/<path:object_id>/history/       django.contrib.admin.options.history_view
admin:kpi_trafficlight_history
/admin/kpi/trafficlight/add/    django.contrib.admin.options.add_view   admin:kpi_trafficlight_add
/admin/kpi/validationrecord/    django.contrib.admin.options.changelist_view    admin:kpi_validationrecord_changelist
/admin/kpi/validationrecord/<path:object_id>/   django.views.generic.base.RedirectView
/admin/kpi/validationrecord/<path:object_id>/change/    django.contrib.admin.options.change_view
admin:kpi_validationrecord_change
/admin/kpi/validationrecord/<path:object_id>/delete/    django.contrib.admin.options.delete_view
admin:kpi_validationrecord_delete
/admin/kpi/validationrecord/<path:object_id>/history/   django.contrib.admin.options.history_view
admin:kpi_validationrecord_history
/admin/kpi/validationrecord/add/        django.contrib.admin.options.add_view   admin:kpi_validationrecord_add
/api/v1/dashboard/favorites/    apps.dashboard.api.v1.views.fevorite.FavoriteKPIViewSet favorite-kpi-list
/api/v1/dashboard/favorites/<pk>/       apps.dashboard.api.v1.views.fevorite.FavoriteKPIViewSet favorite-kpi-detail
/api/v1/dashboard/favorites/<pk>\.<format>/     apps.dashboard.api.v1.views.fevorite.FavoriteKPIViewSet favorite-kpi-detail
/api/v1/dashboard/favorites/reorder/    apps.dashboard.api.v1.views.fevorite.FavoriteKPIViewSet favorite-kpi-reorder
/api/v1/dashboard/favorites/reorder\.<format>/  apps.dashboard.api.v1.views.fevorite.FavoriteKPIViewSet
favorite-kpi-reorder
/api/v1/dashboard/favorites\.<format>/  apps.dashboard.api.v1.views.fevorite.FavoriteKPIViewSet favorite-kpi-list
/api/v1/kpis/   apps.kpi.api.v1.urls.api_root   kpi:api-root
/api/v1/kpis/   rest_framework.routers.APIRootView      kpi:api-root
/api/v1/kpis/   rest_framework.routers.APIRootView      kpi:api-root
/api/v1/kpis/<drf_format_suffix:format> rest_framework.routers.APIRootView      kpi:api-root
/api/v1/kpis/<drf_format_suffix:format> rest_framework.routers.APIRootView      kpi:api-root
/api/v1/kpis/actual-adjustments/        apps.kpi.api.v1.views.actual.ActualAdjustmentViewSet    kpi:actual-adjustment-list
/api/v1/kpis/actual-adjustments/<pk>/   apps.kpi.api.v1.views.actual.ActualAdjustmentViewSet    kpi:actual-adjustment-detail
/api/v1/kpis/actual-adjustments/<pk>/\.<format>/        apps.kpi.api.v1.views.actual.ActualAdjustmentViewSet
kpi:actual-adjustment-detail
/api/v1/kpis/actual-adjustments/<pk>/approve/   apps.kpi.api.v1.views.actual.ActualAdjustmentViewSet
kpi:actual-adjustment-approve
/api/v1/kpis/actual-adjustments/<pk>/approve/\.<format>/        apps.kpi.api.v1.views.actual.ActualAdjustmentViewSet
kpi:actual-adjustment-approve
/api/v1/kpis/actual-adjustments/\.<format>/     apps.kpi.api.v1.views.actual.ActualAdjustmentViewSet
kpi:actual-adjustment-list
/api/v1/kpis/actual-history/    apps.kpi.api.v1.views.history.ActualHistoryViewSet      kpi:actual-history-list
/api/v1/kpis/actual-history/<pk>/       apps.kpi.api.v1.views.history.ActualHistoryViewSet      kpi:actual-history-detail
/api/v1/kpis/actual-history/<pk>/\.<format>/    apps.kpi.api.v1.views.history.ActualHistoryViewSet
kpi:actual-history-detail
/api/v1/kpis/actual-history/\.<format>/ apps.kpi.api.v1.views.history.ActualHistoryViewSet      kpi:actual-history-list
/api/v1/kpis/actual-history/for_actual/ apps.kpi.api.v1.views.history.ActualHistoryViewSet
kpi:actual-history-for-actual
/api/v1/kpis/actual-history/for_actual/\.<format>/      apps.kpi.api.v1.views.history.ActualHistoryViewSet
kpi:actual-history-for-actual
/api/v1/kpis/actuals/   apps.kpi.api.v1.views.actual.MonthlyActualViewSet       kpi:actual-list
/api/v1/kpis/actuals/<pk>/      apps.kpi.api.v1.views.actual.MonthlyActualViewSet       kpi:actual-detail
/api/v1/kpis/actuals/<pk>/\.<format>/   apps.kpi.api.v1.views.actual.MonthlyActualViewSet       kpi:actual-detail
/api/v1/kpis/actuals/<pk>/approve/      apps.kpi.api.v1.views.actual.MonthlyActualViewSet       kpi:actual-approve
/api/v1/kpis/actuals/<pk>/approve/\.<format>/   apps.kpi.api.v1.views.actual.MonthlyActualViewSet       kpi:actual-approve
/api/v1/kpis/actuals/<pk>/evidence/     apps.kpi.api.v1.views.actual.MonthlyActualViewSet       kpi:actual-evidence
/api/v1/kpis/actuals/<pk>/evidence/\.<format>/  apps.kpi.api.v1.views.actual.MonthlyActualViewSet       kpi:actual-evidence
/api/v1/kpis/actuals/<pk>/reject/       apps.kpi.api.v1.views.actual.MonthlyActualViewSet       kpi:actual-reject
/api/v1/kpis/actuals/<pk>/reject/\.<format>/    apps.kpi.api.v1.views.actual.MonthlyActualViewSet       kpi:actual-reject
/api/v1/kpis/actuals/<pk>/resubmit/     apps.kpi.api.v1.views.actual.MonthlyActualViewSet       kpi:actual-resubmit
/api/v1/kpis/actuals/<pk>/resubmit/\.<format>/  apps.kpi.api.v1.views.actual.MonthlyActualViewSet       kpi:actual-resubmit
/api/v1/kpis/actuals/<pk>/submit/       apps.kpi.api.v1.views.actual.MonthlyActualViewSet       kpi:actual-submit
/api/v1/kpis/actuals/<pk>/submit/\.<format>/    apps.kpi.api.v1.views.actual.MonthlyActualViewSet       kpi:actual-submit
/api/v1/kpis/actuals/<pk>/validations/  apps.kpi.api.v1.views.actual.MonthlyActualViewSet       kpi:actual-validations
/api/v1/kpis/actuals/<pk>/validations/\.<format>/       apps.kpi.api.v1.views.actual.MonthlyActualViewSet
kpi:actual-validations
/api/v1/kpis/actuals/\.<format>/        apps.kpi.api.v1.views.actual.MonthlyActualViewSet       kpi:actual-list
/api/v1/kpis/admin/overview/    apps.kpi.api.v1.views.dashboard.KPIOverviewDashboardView        kpi:kpi-admin-overview
/api/v1/kpis/aggregated-scores/ apps.kpi.api.v1.views.score.AggregatedScoreViewSet      kpi:aggregated-score-list
/api/v1/kpis/aggregated-scores/<pk>/    apps.kpi.api.v1.views.score.AggregatedScoreViewSet      kpi:aggregated-score-detail
/api/v1/kpis/aggregated-scores/<pk>/\.<format>/ apps.kpi.api.v1.views.score.AggregatedScoreViewSet
kpi:aggregated-score-detail
/api/v1/kpis/aggregated-scores/\.<format>/      apps.kpi.api.v1.views.score.AggregatedScoreViewSet      kpi:aggregated-score-list
/api/v1/kpis/aggregated-scores/departments/     apps.kpi.api.v1.views.score.AggregatedScoreViewSet
kpi:aggregated-score-departments
/api/v1/kpis/aggregated-scores/departments/\.<format>/  apps.kpi.api.v1.views.score.AggregatedScoreViewSet
kpi:aggregated-score-departments
/api/v1/kpis/aggregated-scores/organization/    apps.kpi.api.v1.views.score.AggregatedScoreViewSet
kpi:aggregated-score-organization
/api/v1/kpis/aggregated-scores/organization/\.<format>/ apps.kpi.api.v1.views.score.AggregatedScoreViewSet
kpi:aggregated-score-organization
/api/v1/kpis/aggregated-scores/ranking/ apps.kpi.api.v1.views.score.AggregatedScoreViewSet      kpi:aggregated-score-ranking
/api/v1/kpis/aggregated-scores/ranking/\.<format>/      apps.kpi.api.v1.views.score.AggregatedScoreViewSet
kpi:aggregated-score-ranking
/api/v1/kpis/analytics/export/  apps.kpi.api.v1.views.analytics.AnalyticsExportView     kpi:analytics-export
/api/v1/kpis/analytics/heatmap/ apps.kpi.api.v1.views.analytics.PerformanceHeatmapView  kpi:analytics-heatmap
/api/v1/kpis/analytics/insights/        apps.kpi.api.v1.views.insight.AnalyticsInsightsView     kpi:analytics-insights
/api/v1/kpis/analytics/predictions/     apps.kpi.api.v1.views.insight.RiskPredictionsView       kpi:risk-predictions
/api/v1/kpis/bulk/actual-upload/        apps.kpi.api.v1.views.bulk.BulkActualUploadView kpi:bulk-actual-upload
/api/v1/kpis/bulk/kpi-upload/   apps.kpi.api.v1.views.bulk.BulkKPIUploadView    kpi:bulk-kpi-upload
/api/v1/kpis/bulk/target-upload/        apps.kpi.api.v1.views.bulk.BulkTargetUploadView kpi:bulk-target-upload
/api/v1/kpis/calculations/status/<str:task_id>/ apps.kpi.api.v1.views.calculation.CalculationStatusView
kpi:calculation-status
/api/v1/kpis/calculations/trigger/      apps.kpi.api.v1.views.calculation.TriggerCalculationView        kpi:trigger-calculation
/api/v1/kpis/cascade-maps/      apps.kpi.api.v1.views.cascade.CascadeMapViewSet kpi:cascade-map-list
/api/v1/kpis/cascade-maps/<pk>/ apps.kpi.api.v1.views.cascade.CascadeMapViewSet kpi:cascade-map-detail
/api/v1/kpis/cascade-maps/<pk>/\.<format>/      apps.kpi.api.v1.views.cascade.CascadeMapViewSet kpi:cascade-map-detail
/api/v1/kpis/cascade-maps/<pk>/rollback/        apps.kpi.api.v1.views.cascade.CascadeMapViewSet kpi:cascade-map-rollback
/api/v1/kpis/cascade-maps/<pk>/rollback/\.<format>/     apps.kpi.api.v1.views.cascade.CascadeMapViewSet
kpi:cascade-map-rollback
/api/v1/kpis/cascade-maps/\.<format>/   apps.kpi.api.v1.views.cascade.CascadeMapViewSet kpi:cascade-map-list
/api/v1/kpis/cascade-maps/cascade_department/   apps.kpi.api.v1.views.cascade.CascadeMapViewSet
kpi:cascade-map-cascade-department
/api/v1/kpis/cascade-maps/cascade_department/\.<format>/        apps.kpi.api.v1.views.cascade.CascadeMapViewSet
kpi:cascade-map-cascade-department
/api/v1/kpis/cascade-maps/tree/ apps.kpi.api.v1.views.cascade.CascadeMapViewSet kpi:cascade-map-tree
/api/v1/kpis/cascade-maps/tree/\.<format>/      apps.kpi.api.v1.views.cascade.CascadeMapViewSet kpi:cascade-map-tree
/api/v1/kpis/cascade-rules/     apps.kpi.api.v1.views.cascade.CascadeRuleViewSet        kpi:cascade-rule-list
/api/v1/kpis/cascade-rules/<pk>/        apps.kpi.api.v1.views.cascade.CascadeRuleViewSet        kpi:cascade-rule-detail
/api/v1/kpis/cascade-rules/<pk>/\.<format>/     apps.kpi.api.v1.views.cascade.CascadeRuleViewSet        kpi:cascade-rule-detail
/api/v1/kpis/cascade-rules/<pk>/set_default/    apps.kpi.api.v1.views.cascade.CascadeRuleViewSet
kpi:cascade-rule-set-default
/api/v1/kpis/cascade-rules/<pk>/set_default/\.<format>/ apps.kpi.api.v1.views.cascade.CascadeRuleViewSet
kpi:cascade-rule-set-default
/api/v1/kpis/cascade-rules/\.<format>/  apps.kpi.api.v1.views.cascade.CascadeRuleViewSet        kpi:cascade-rule-list
/api/v1/kpis/categories/        apps.kpi.api.v1.views.framework.KPICategoryViewSet      kpi:category-list
/api/v1/kpis/categories/<pk>/   apps.kpi.api.v1.views.framework.KPICategoryViewSet      kpi:category-detail
/api/v1/kpis/categories/<pk>/\.<format>/        apps.kpi.api.v1.views.framework.KPICategoryViewSet      kpi:category-detail
/api/v1/kpis/categories/<pk>/children/  apps.kpi.api.v1.views.framework.KPICategoryViewSet      kpi:category-children
/api/v1/kpis/categories/<pk>/children/\.<format>/       apps.kpi.api.v1.views.framework.KPICategoryViewSet
kpi:category-children
/api/v1/kpis/categories/<pk>/kpis/      apps.kpi.api.v1.views.framework.KPICategoryViewSet      kpi:category-kpis
/api/v1/kpis/categories/<pk>/kpis/\.<format>/   apps.kpi.api.v1.views.framework.KPICategoryViewSet      kpi:category-kpis
/api/v1/kpis/categories/<pk>/move/      apps.kpi.api.v1.views.framework.KPICategoryViewSet      kpi:category-move
/api/v1/kpis/categories/<pk>/move/\.<format>/   apps.kpi.api.v1.views.framework.KPICategoryViewSet      kpi:category-move
/api/v1/kpis/categories/\.<format>/     apps.kpi.api.v1.views.framework.KPICategoryViewSet      kpi:category-list
/api/v1/kpis/categories/reorder/        apps.kpi.api.v1.views.framework.KPICategoryViewSet      kpi:category-reorder
/api/v1/kpis/categories/reorder/\.<format>/     apps.kpi.api.v1.views.framework.KPICategoryViewSet      kpi:category-reorder
/api/v1/kpis/dashboard/champion/        apps.kpi.api.v1.views.dashboard.ChampionDashboardView   kpi:dashboard-champion
/api/v1/kpis/dashboard/executive/       apps.kpi.api.v1.views.dashboard.ExecutiveDashboardView  kpi:dashboard-executive
/api/v1/kpis/dashboard/individual/      apps.kpi.api.v1.views.dashboard.IndividualDashboardView kpi:dashboard-individual
/api/v1/kpis/dashboard/manager/ apps.kpi.api.v1.views.dashboard.ManagerDashboardView    kpi:dashboard-manager
/api/v1/kpis/department-rollups/        apps.kpi.api.v1.views.analytics.DepartmentRollupViewSet kpi:department-rollup-list
/api/v1/kpis/department-rollups/<pk>/   apps.kpi.api.v1.views.analytics.DepartmentRollupViewSet
kpi:department-rollup-detail
/api/v1/kpis/department-rollups/<pk>/\.<format>/        apps.kpi.api.v1.views.analytics.DepartmentRollupViewSet
kpi:department-rollup-detail
/api/v1/kpis/department-rollups/\.<format>/     apps.kpi.api.v1.views.analytics.DepartmentRollupViewSet
kpi:department-rollup-list
/api/v1/kpis/department-rollups/ranking/        apps.kpi.api.v1.views.analytics.DepartmentRollupViewSet
kpi:department-rollup-ranking
/api/v1/kpis/department-rollups/ranking/\.<format>/     apps.kpi.api.v1.views.analytics.DepartmentRollupViewSet
kpi:department-rollup-ranking
/api/v1/kpis/escalations/       apps.kpi.api.v1.views.validation.EscalationViewSet      kpi:escalation-list
/api/v1/kpis/escalations/<pk>/  apps.kpi.api.v1.views.validation.EscalationViewSet      kpi:escalation-detail
/api/v1/kpis/escalations/<pk>/\.<format>/       apps.kpi.api.v1.views.validation.EscalationViewSet      kpi:escalation-detail
/api/v1/kpis/escalations/<pk>/resolve/  apps.kpi.api.v1.views.validation.EscalationViewSet      kpi:escalation-resolve
/api/v1/kpis/escalations/<pk>/resolve/\.<format>/       apps.kpi.api.v1.views.validation.EscalationViewSet
kpi:escalation-resolve
/api/v1/kpis/escalations/\.<format>/    apps.kpi.api.v1.views.validation.EscalationViewSet      kpi:escalation-list
/api/v1/kpis/escalations/my_escalations/        apps.kpi.api.v1.views.validation.EscalationViewSet
kpi:escalation-my-escalations
/api/v1/kpis/escalations/my_escalations/\.<format>/     apps.kpi.api.v1.views.validation.EscalationViewSet
kpi:escalation-my-escalations
/api/v1/kpis/evidence/  apps.kpi.api.v1.views.actual.EvidenceViewSet    kpi:evidence-list
/api/v1/kpis/evidence/<pk>/     apps.kpi.api.v1.views.actual.EvidenceViewSet    kpi:evidence-detail
/api/v1/kpis/evidence/<pk>/\.<format>/  apps.kpi.api.v1.views.actual.EvidenceViewSet    kpi:evidence-detail
/api/v1/kpis/evidence/\.<format>/       apps.kpi.api.v1.views.actual.EvidenceViewSet    kpi:evidence-list
/api/v1/kpis/export/kpis/       apps.kpi.api.v1.views.export.KPIExportView      kpi:export-kpis
/api/v1/kpis/export/reports/    apps.kpi.api.v1.views.export.ReportExportView   kpi:export-reports
/api/v1/kpis/export/scores/     apps.kpi.api.v1.views.export.ScoreExportView    kpi:export-scores
/api/v1/kpis/frameworks/        apps.kpi.api.v1.views.framework.KPIFrameworkViewSet     kpi:framework-list
/api/v1/kpis/frameworks/<pk>/   apps.kpi.api.v1.views.framework.KPIFrameworkViewSet     kpi:framework-detail
/api/v1/kpis/frameworks/<pk>/\.<format>/        apps.kpi.api.v1.views.framework.KPIFrameworkViewSet     kpi:framework-detail
/api/v1/kpis/frameworks/<pk>/archive/   apps.kpi.api.v1.views.framework.KPIFrameworkViewSet     kpi:framework-archive
/api/v1/kpis/frameworks/<pk>/archive/\.<format>/        apps.kpi.api.v1.views.framework.KPIFrameworkViewSet
kpi:framework-archive
/api/v1/kpis/frameworks/<pk>/categories/        apps.kpi.api.v1.views.framework.KPIFrameworkViewSet     kpi:framework-categories
/api/v1/kpis/frameworks/<pk>/categories/\.<format>/     apps.kpi.api.v1.views.framework.KPIFrameworkViewSet
kpi:framework-categories
/api/v1/kpis/frameworks/<pk>/duplicate/ apps.kpi.api.v1.views.framework.KPIFrameworkViewSet     kpi:framework-duplicate
/api/v1/kpis/frameworks/<pk>/duplicate/\.<format>/      apps.kpi.api.v1.views.framework.KPIFrameworkViewSet
kpi:framework-duplicate
/api/v1/kpis/frameworks/<pk>/kpis/      apps.kpi.api.v1.views.framework.KPIFrameworkViewSet     kpi:framework-kpis
/api/v1/kpis/frameworks/<pk>/kpis/\.<format>/   apps.kpi.api.v1.views.framework.KPIFrameworkViewSet     kpi:framework-kpis
/api/v1/kpis/frameworks/<pk>/publish/   apps.kpi.api.v1.views.framework.KPIFrameworkViewSet     kpi:framework-publish
/api/v1/kpis/frameworks/<pk>/publish/\.<format>/        apps.kpi.api.v1.views.framework.KPIFrameworkViewSet
kpi:framework-publish
/api/v1/kpis/frameworks/\.<format>/     apps.kpi.api.v1.views.framework.KPIFrameworkViewSet     kpi:framework-list
/api/v1/kpis/kpi-dependencies/  apps.kpi.api.v1.views.kpi.KPIDependencyViewSet  kpi:kpi-dependency-list
/api/v1/kpis/kpi-dependencies/<pk>/     apps.kpi.api.v1.views.kpi.KPIDependencyViewSet  kpi:kpi-dependency-detail
/api/v1/kpis/kpi-dependencies/<pk>/\.<format>/  apps.kpi.api.v1.views.kpi.KPIDependencyViewSet  kpi:kpi-dependency-detail
/api/v1/kpis/kpi-dependencies/<pk>/impact_chain/        apps.kpi.api.v1.views.kpi.KPIDependencyViewSet
kpi:kpi-dependency-impact-chain
/api/v1/kpis/kpi-dependencies/<pk>/impact_chain/\.<format>/     apps.kpi.api.v1.views.kpi.KPIDependencyViewSet
kpi:kpi-dependency-impact-chain
/api/v1/kpis/kpi-dependencies/\.<format>/       apps.kpi.api.v1.views.kpi.KPIDependencyViewSet  kpi:kpi-dependency-list
/api/v1/kpis/kpi-history/       apps.kpi.api.v1.views.history.KPIHistoryViewSet kpi:kpi-history-list
/api/v1/kpis/kpi-history/<pk>/  apps.kpi.api.v1.views.history.KPIHistoryViewSet kpi:kpi-history-detail
/api/v1/kpis/kpi-history/<pk>/\.<format>/       apps.kpi.api.v1.views.history.KPIHistoryViewSet kpi:kpi-history-detail
/api/v1/kpis/kpi-history/\.<format>/    apps.kpi.api.v1.views.history.KPIHistoryViewSet kpi:kpi-history-list
/api/v1/kpis/kpi-history/for_kpi/       apps.kpi.api.v1.views.history.KPIHistoryViewSet kpi:kpi-history-for-kpi
/api/v1/kpis/kpi-history/for_kpi/\.<format>/    apps.kpi.api.v1.views.history.KPIHistoryViewSet kpi:kpi-history-for-kpi
/api/v1/kpis/kpi-summaries/     apps.kpi.api.v1.views.analytics.KPISummaryViewSet       kpi:kpi-summary-list
/api/v1/kpis/kpi-summaries/<pk>/        apps.kpi.api.v1.views.analytics.KPISummaryViewSet       kpi:kpi-summary-detail
/api/v1/kpis/kpi-summaries/<pk>/\.<format>/     apps.kpi.api.v1.views.analytics.KPISummaryViewSet       kpi:kpi-summary-detail
/api/v1/kpis/kpi-summaries/\.<format>/  apps.kpi.api.v1.views.analytics.KPISummaryViewSet       kpi:kpi-summary-list
/api/v1/kpis/kpi-summaries/by_sector/   apps.kpi.api.v1.views.analytics.KPISummaryViewSet       kpi:kpi-summary-by-sector
/api/v1/kpis/kpi-summaries/by_sector/\.<format>/        apps.kpi.api.v1.views.analytics.KPISummaryViewSet
kpi:kpi-summary-by-sector
/api/v1/kpis/kpi-weights/       apps.kpi.api.v1.views.kpi.KPIWeightViewSet      kpi:kpi-weight-list
/api/v1/kpis/kpi-weights/<pk>/  apps.kpi.api.v1.views.kpi.KPIWeightViewSet      kpi:kpi-weight-detail
/api/v1/kpis/kpi-weights/<pk>/\.<format>/       apps.kpi.api.v1.views.kpi.KPIWeightViewSet      kpi:kpi-weight-detail
/api/v1/kpis/kpi-weights/\.<format>/    apps.kpi.api.v1.views.kpi.KPIWeightViewSet      kpi:kpi-weight-list
/api/v1/kpis/kpi-weights/validate_sum/  apps.kpi.api.v1.views.kpi.KPIWeightViewSet      kpi:kpi-weight-validate-sum
/api/v1/kpis/kpi-weights/validate_sum/\.<format>/       apps.kpi.api.v1.views.kpi.KPIWeightViewSet
kpi:kpi-weight-validate-sum
/api/v1/kpis/kpis/      apps.kpi.api.v1.views.kpi.KPIViewSet    kpi:kpi-list
/api/v1/kpis/kpis/<pk>/ apps.kpi.api.v1.views.kpi.KPIViewSet    kpi:kpi-detail
/api/v1/kpis/kpis/<pk>/\.<format>/      apps.kpi.api.v1.views.kpi.KPIViewSet    kpi:kpi-detail
/api/v1/kpis/kpis/<pk>/activate/        apps.kpi.api.v1.views.kpi.KPIViewSet    kpi:kpi-activate
/api/v1/kpis/kpis/<pk>/activate/\.<format>/     apps.kpi.api.v1.views.kpi.KPIViewSet    kpi:kpi-activate
/api/v1/kpis/kpis/<pk>/deactivate/      apps.kpi.api.v1.views.kpi.KPIViewSet    kpi:kpi-deactivate
/api/v1/kpis/kpis/<pk>/deactivate/\.<format>/   apps.kpi.api.v1.views.kpi.KPIViewSet    kpi:kpi-deactivate
/api/v1/kpis/kpis/<pk>/scores/  apps.kpi.api.v1.views.kpi.KPIViewSet    kpi:kpi-scores
/api/v1/kpis/kpis/<pk>/scores/\.<format>/       apps.kpi.api.v1.views.kpi.KPIViewSet    kpi:kpi-scores
/api/v1/kpis/kpis/<pk>/targets/ apps.kpi.api.v1.views.kpi.KPIViewSet    kpi:kpi-targets
/api/v1/kpis/kpis/<pk>/targets/\.<format>/      apps.kpi.api.v1.views.kpi.KPIViewSet    kpi:kpi-targets
/api/v1/kpis/kpis/<pk>/validate/        apps.kpi.api.v1.views.kpi.KPIViewSet    kpi:kpi-validate
/api/v1/kpis/kpis/<pk>/validate/\.<format>/     apps.kpi.api.v1.views.kpi.KPIViewSet    kpi:kpi-validate
/api/v1/kpis/kpis/<pk>/weights/ apps.kpi.api.v1.views.kpi.KPIViewSet    kpi:kpi-weights
/api/v1/kpis/kpis/<pk>/weights/\.<format>/      apps.kpi.api.v1.views.kpi.KPIViewSet    kpi:kpi-weights
/api/v1/kpis/kpis/\.<format>/   apps.kpi.api.v1.views.kpi.KPIViewSet    kpi:kpi-list
/api/v1/kpis/monthly-phasing/   apps.kpi.api.v1.views.target.MonthlyPhasingViewSet      kpi:monthly-phasing-list
/api/v1/kpis/monthly-phasing/<pk>/      apps.kpi.api.v1.views.target.MonthlyPhasingViewSet      kpi:monthly-phasing-detail
/api/v1/kpis/monthly-phasing/<pk>/\.<format>/   apps.kpi.api.v1.views.target.MonthlyPhasingViewSet
kpi:monthly-phasing-detail
/api/v1/kpis/monthly-phasing/<pk>/lock/ apps.kpi.api.v1.views.target.MonthlyPhasingViewSet      kpi:monthly-phasing-lock
/api/v1/kpis/monthly-phasing/<pk>/lock/\.<format>/      apps.kpi.api.v1.views.target.MonthlyPhasingViewSet
kpi:monthly-phasing-lock
/api/v1/kpis/monthly-phasing/\.<format>/        apps.kpi.api.v1.views.target.MonthlyPhasingViewSet      kpi:monthly-phasing-list
/api/v1/kpis/monthly-phasing/lock_cycle/        apps.kpi.api.v1.views.target.MonthlyPhasingViewSet
kpi:monthly-phasing-lock-cycle
/api/v1/kpis/monthly-phasing/lock_cycle/\.<format>/     apps.kpi.api.v1.views.target.MonthlyPhasingViewSet
kpi:monthly-phasing-lock-cycle
/api/v1/kpis/notifications/preferences/ apps.kpi.api.v1.views.analytics.NotificationPreferencesView
kpi:notification-preferences
/api/v1/kpis/organization-health/       apps.kpi.api.v1.views.analytics.OrganizationHealthViewSet
kpi:organization-health-list
/api/v1/kpis/organization-health/<pk>/  apps.kpi.api.v1.views.analytics.OrganizationHealthViewSet
kpi:organization-health-detail
/api/v1/kpis/organization-health/<pk>/\.<format>/       apps.kpi.api.v1.views.analytics.OrganizationHealthViewSet
kpi:organization-health-detail
/api/v1/kpis/organization-health/\.<format>/    apps.kpi.api.v1.views.analytics.OrganizationHealthViewSet
kpi:organization-health-list
/api/v1/kpis/organization-health/current/       apps.kpi.api.v1.views.analytics.OrganizationHealthViewSet
kpi:organization-health-current
/api/v1/kpis/organization-health/current/\.<format>/    apps.kpi.api.v1.views.analytics.OrganizationHealthViewSet
kpi:organization-health-current
/api/v1/kpis/organization-health/history/       apps.kpi.api.v1.views.analytics.OrganizationHealthViewSet
kpi:organization-health-history
/api/v1/kpis/organization-health/history/\.<format>/    apps.kpi.api.v1.views.analytics.OrganizationHealthViewSet
kpi:organization-health-history
/api/v1/kpis/reference-data/    apps.kpi.api.v1.views.reference_data.KpiReferenceDataView       kpi:kpi-reference-data
/api/v1/kpis/rejection-reasons/ apps.kpi.api.v1.views.validation.RejectionReasonViewSet kpi:rejection-reason-list
/api/v1/kpis/rejection-reasons/<pk>/    apps.kpi.api.v1.views.validation.RejectionReasonViewSet
kpi:rejection-reason-detail
/api/v1/kpis/rejection-reasons/<pk>/\.<format>/ apps.kpi.api.v1.views.validation.RejectionReasonViewSet
kpi:rejection-reason-detail
/api/v1/kpis/rejection-reasons/\.<format>/      apps.kpi.api.v1.views.validation.RejectionReasonViewSet
kpi:rejection-reason-list
/api/v1/kpis/reports/custom/    apps.kpi.api.v1.views.analytics.CustomReportView        kpi:custom-report
/api/v1/kpis/scores/    apps.kpi.api.v1.views.score.ScoreViewSet        kpi:score-list
/api/v1/kpis/scores/<pk>/       apps.kpi.api.v1.views.score.ScoreViewSet        kpi:score-detail
/api/v1/kpis/scores/<pk>/\.<format>/    apps.kpi.api.v1.views.score.ScoreViewSet        kpi:score-detail
/api/v1/kpis/scores/\.<format>/ apps.kpi.api.v1.views.score.ScoreViewSet        kpi:score-list
/api/v1/kpis/scores/my_scores/  apps.kpi.api.v1.views.score.ScoreViewSet        kpi:score-my-scores
/api/v1/kpis/scores/my_scores/\.<format>/       apps.kpi.api.v1.views.score.ScoreViewSet        kpi:score-my-scores
/api/v1/kpis/scores/statistics/ apps.kpi.api.v1.views.score.ScoreViewSet        kpi:score-statistics
/api/v1/kpis/scores/statistics/\.<format>/      apps.kpi.api.v1.views.score.ScoreViewSet        kpi:score-statistics
/api/v1/kpis/scores/team_scores/        apps.kpi.api.v1.views.score.ScoreViewSet        kpi:score-team-scores
/api/v1/kpis/scores/team_scores/\.<format>/     apps.kpi.api.v1.views.score.ScoreViewSet        kpi:score-team-scores
/api/v1/kpis/sectors/   apps.kpi.api.v1.views.framework.SectorViewSet   kpi:sector-list
/api/v1/kpis/sectors/<pk>/      apps.kpi.api.v1.views.framework.SectorViewSet   kpi:sector-detail
/api/v1/kpis/sectors/<pk>/\.<format>/   apps.kpi.api.v1.views.framework.SectorViewSet   kpi:sector-detail
/api/v1/kpis/sectors/<pk>/frameworks/   apps.kpi.api.v1.views.framework.SectorViewSet   kpi:sector-frameworks
/api/v1/kpis/sectors/<pk>/frameworks/\.<format>/        apps.kpi.api.v1.views.framework.SectorViewSet   kpi:sector-frameworks
/api/v1/kpis/sectors/\.<format>/        apps.kpi.api.v1.views.framework.SectorViewSet   kpi:sector-list
/api/v1/kpis/strategic-linkages/        apps.kpi.api.v1.views.kpi.StrategicLinkageViewSet       kpi:strategic-linkage-list
/api/v1/kpis/strategic-linkages/<pk>/   apps.kpi.api.v1.views.kpi.StrategicLinkageViewSet       kpi:strategic-linkage-detail
/api/v1/kpis/strategic-linkages/<pk>/\.<format>/        apps.kpi.api.v1.views.kpi.StrategicLinkageViewSet
kpi:strategic-linkage-detail
/api/v1/kpis/strategic-linkages/\.<format>/     apps.kpi.api.v1.views.kpi.StrategicLinkageViewSet
kpi:strategic-linkage-list
/api/v1/kpis/system-settings/   apps.kpi.api.v1.views.system_settings_views.KpiSystemSettingsView       kpi:kpi-system-settings
/api/v1/kpis/system-settings/reset/     apps.kpi.api.v1.views.system_settings_views.KpiSystemSettingsResetView
kpi:kpi-system-settings-reset
/api/v1/kpis/target-history/    apps.kpi.api.v1.views.history.TargetHistoryViewSet      kpi:target-history-list
/api/v1/kpis/target-history/<pk>/       apps.kpi.api.v1.views.history.TargetHistoryViewSet      kpi:target-history-detail
/api/v1/kpis/target-history/<pk>/\.<format>/    apps.kpi.api.v1.views.history.TargetHistoryViewSet
kpi:target-history-detail
/api/v1/kpis/target-history/\.<format>/ apps.kpi.api.v1.views.history.TargetHistoryViewSet      kpi:target-history-list
/api/v1/kpis/target-history/for_target/ apps.kpi.api.v1.views.history.TargetHistoryViewSet
kpi:target-history-for-target
/api/v1/kpis/target-history/for_target/\.<format>/      apps.kpi.api.v1.views.history.TargetHistoryViewSet
kpi:target-history-for-target
/api/v1/kpis/targets/   apps.kpi.api.v1.views.target.AnnualTargetViewSet        kpi:target-list
/api/v1/kpis/targets/<pk>/      apps.kpi.api.v1.views.target.AnnualTargetViewSet        kpi:target-detail
/api/v1/kpis/targets/<pk>/\.<format>/   apps.kpi.api.v1.views.target.AnnualTargetViewSet        kpi:target-detail
/api/v1/kpis/targets/<pk>/phase/        apps.kpi.api.v1.views.target.AnnualTargetViewSet        kpi:target-phase
/api/v1/kpis/targets/<pk>/phase/\.<format>/     apps.kpi.api.v1.views.target.AnnualTargetViewSet        kpi:target-phase
/api/v1/kpis/targets/<pk>/phasing/      apps.kpi.api.v1.views.target.AnnualTargetViewSet        kpi:target-phasing
/api/v1/kpis/targets/<pk>/phasing/\.<format>/   apps.kpi.api.v1.views.target.AnnualTargetViewSet        kpi:target-phasing
/api/v1/kpis/targets/<pk>/validate/     apps.kpi.api.v1.views.target.AnnualTargetViewSet        kpi:target-validate
/api/v1/kpis/targets/<pk>/validate/\.<format>/  apps.kpi.api.v1.views.target.AnnualTargetViewSet        kpi:target-validate
/api/v1/kpis/targets/\.<format>/        apps.kpi.api.v1.views.target.AnnualTargetViewSet        kpi:target-list
/api/v1/kpis/templates/ apps.kpi.api.v1.views.framework.KPITemplateViewSet      kpi:template-list
/api/v1/kpis/templates/<pk>/    apps.kpi.api.v1.views.framework.KPITemplateViewSet      kpi:template-detail
/api/v1/kpis/templates/<pk>/\.<format>/ apps.kpi.api.v1.views.framework.KPITemplateViewSet      kpi:template-detail
/api/v1/kpis/templates/<pk>/publish/    apps.kpi.api.v1.views.framework.KPITemplateViewSet      kpi:template-publish
/api/v1/kpis/templates/<pk>/publish/\.<format>/ apps.kpi.api.v1.views.framework.KPITemplateViewSet      kpi:template-publish
/api/v1/kpis/templates/<pk>/use_template/       apps.kpi.api.v1.views.framework.KPITemplateViewSet      kpi:template-use-template
/api/v1/kpis/templates/<pk>/use_template/\.<format>/    apps.kpi.api.v1.views.framework.KPITemplateViewSet
kpi:template-use-template
/api/v1/kpis/templates/\.<format>/      apps.kpi.api.v1.views.framework.KPITemplateViewSet      kpi:template-list
/api/v1/kpis/traffic-lights/    apps.kpi.api.v1.views.score.TrafficLightViewSet kpi:traffic-light-list
/api/v1/kpis/traffic-lights/<pk>/       apps.kpi.api.v1.views.score.TrafficLightViewSet kpi:traffic-light-detail
/api/v1/kpis/traffic-lights/<pk>/\.<format>/    apps.kpi.api.v1.views.score.TrafficLightViewSet kpi:traffic-light-detail
/api/v1/kpis/traffic-lights/\.<format>/ apps.kpi.api.v1.views.score.TrafficLightViewSet kpi:traffic-light-list
/api/v1/kpis/traffic-lights/my_red_alerts/      apps.kpi.api.v1.views.score.TrafficLightViewSet
kpi:traffic-light-my-red-alerts
/api/v1/kpis/traffic-lights/my_red_alerts/\.<format>/   apps.kpi.api.v1.views.score.TrafficLightViewSet
kpi:traffic-light-my-red-alerts
/api/v1/kpis/traffic-lights/red_alerts/ apps.kpi.api.v1.views.score.TrafficLightViewSet kpi:traffic-light-red-alerts
/api/v1/kpis/traffic-lights/red_alerts/\.<format>/      apps.kpi.api.v1.views.score.TrafficLightViewSet
kpi:traffic-light-red-alerts
/api/v1/kpis/users/     apps.kpi.api.v1.views.user_nested.UserViewSet   kpi:user-list
/api/v1/kpis/users/<pk>/        apps.kpi.api.v1.views.user_nested.UserViewSet   kpi:user-detail
/api/v1/kpis/users/<pk>/\.<format>/     apps.kpi.api.v1.views.user_nested.UserViewSet   kpi:user-detail
/api/v1/kpis/users/<user_pk>/actuals/   apps.kpi.api.v1.views.user_nested.UserActualsViewSet    kpi:user-actuals-list
/api/v1/kpis/users/<user_pk>/actuals/<pk>/      apps.kpi.api.v1.views.user_nested.UserActualsViewSet    kpi:user-actuals-detail
/api/v1/kpis/users/<user_pk>/actuals/<pk>/\.<format>/   apps.kpi.api.v1.views.user_nested.UserActualsViewSet
kpi:user-actuals-detail
/api/v1/kpis/users/<user_pk>/actuals/\.<format>/        apps.kpi.api.v1.views.user_nested.UserActualsViewSet
kpi:user-actuals-list
/api/v1/kpis/users/<user_pk>/kpis/      apps.kpi.api.v1.views.user_nested.UserKPIsViewSet       kpi:user-kpis-list
/api/v1/kpis/users/<user_pk>/kpis/<pk>/ apps.kpi.api.v1.views.user_nested.UserKPIsViewSet       kpi:user-kpis-detail
/api/v1/kpis/users/<user_pk>/kpis/<pk>/\.<format>/      apps.kpi.api.v1.views.user_nested.UserKPIsViewSet
kpi:user-kpis-detail
/api/v1/kpis/users/<user_pk>/kpis/\.<format>/   apps.kpi.api.v1.views.user_nested.UserKPIsViewSet       kpi:user-kpis-list
/api/v1/kpis/users/<user_pk>/scores/    apps.kpi.api.v1.views.user_nested.UserScoresViewSet     kpi:user-scores-list
/api/v1/kpis/users/<user_pk>/scores/<pk>/       apps.kpi.api.v1.views.user_nested.UserScoresViewSet     kpi:user-scores-detail
/api/v1/kpis/users/<user_pk>/scores/<pk>/\.<format>/    apps.kpi.api.v1.views.user_nested.UserScoresViewSet
kpi:user-scores-detail
/api/v1/kpis/users/<user_pk>/scores/\.<format>/ apps.kpi.api.v1.views.user_nested.UserScoresViewSet
kpi:user-scores-list
/api/v1/kpis/users/<user_pk>/targets/   apps.kpi.api.v1.views.user_nested.UserTargetsViewSet    kpi:user-targets-list
/api/v1/kpis/users/<user_pk>/targets/<pk>/      apps.kpi.api.v1.views.user_nested.UserTargetsViewSet    kpi:user-targets-detail
/api/v1/kpis/users/<user_pk>/targets/<pk>/\.<format>/   apps.kpi.api.v1.views.user_nested.UserTargetsViewSet
kpi:user-targets-detail
/api/v1/kpis/users/<user_pk>/targets/\.<format>/        apps.kpi.api.v1.views.user_nested.UserTargetsViewSet
kpi:user-targets-list
/api/v1/kpis/users/\.<format>/  apps.kpi.api.v1.views.user_nested.UserViewSet   kpi:user-list
/api/v1/kpis/validations/       apps.kpi.api.v1.views.validation.ValidationRecordViewSet        kpi:validation-list
/api/v1/kpis/validations/<pk>/  apps.kpi.api.v1.views.validation.ValidationRecordViewSet        kpi:validation-detail
/api/v1/kpis/validations/<pk>/\.<format>/       apps.kpi.api.v1.views.validation.ValidationRecordViewSet
kpi:validation-detail
/api/v1/kpis/validations/\.<format>/    apps.kpi.api.v1.views.validation.ValidationRecordViewSet        kpi:validation-list
/api/v1/kpis/validations/pending-summary/       apps.kpi.api.v1.views.validation.ValidationRecordViewSet
kpi:validation-pending-summary
/api/v1/kpis/validations/pending-summary/\.<format>/    apps.kpi.api.v1.views.validation.ValidationRecordViewSet
kpi:validation-pending-summary
/api/v1/kpis/validations/pending/       apps.kpi.api.v1.views.validation.ValidationRecordViewSet        kpi:validation-pending
/api/v1/kpis/validations/pending/\.<format>/    apps.kpi.api.v1.views.validation.ValidationRecordViewSet
kpi:validation-pending
