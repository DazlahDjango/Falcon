# First(Seed Default Plans)
python manage.py bill_tenant --seed-plans

#  List All Active Tenant Subscriptions
python manage.py bill_tenant --list

#  Bill a Tenant by Admin Email (Marked as Paid + Invoice + Transaction Receipt + Email)
python manage.py bill_tenant --email [EMAIL_ADDRESS] --plan enterprise --interval yearly --pay

# Bill a Tenant by Tenant ID (Pending Invoice)
python manage.py bill_tenant --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9 --plan professional --interval monthly

#  Dry-Run Mode (Preview Calculations & Actions without DB writes)
python manage.py bill_tenant --email [EMAIL_ADDRESS] --plan professional --interval monthly --dry-run

# Process Upcoming Expiring Subscriptions & Auto-Renewals
python manage.py bill_tenant --process-renewals