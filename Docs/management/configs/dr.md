# Execute all DR actions
python manage.py execute_disaster_recovery --admin-email admin@falcontech.com --force --action all

# Run DR drill only for a specific app
python manage.py execute_disaster_recovery --admin-email admin@falcontech.com --app configs --action drill

# Emergency failover
python manage.py execute_disaster_recovery --admin-email admin@falcontech.com --app configs --action failover
