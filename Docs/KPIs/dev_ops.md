# Follow the order of the assets execution
python manage.py loaddata sectors.yaml
python manage.py loaddata kpi_categories.yaml
python manage.py loaddata cascade_rules.yaml
python manage.py loaddata rejection_reasons.yaml
python manage.py loaddata kpi_templates/commercial.yaml
python manage.py loaddata kpi_templates/ngo.yaml
python manage.py loaddata kpi_templates/public_sector.yaml
python manage.py loaddata kpi_templates/consulting.yaml
python manage.py loaddata threshold_configs.yaml
python manage.py loaddata notification_templates.yaml