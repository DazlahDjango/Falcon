"""
Complete guide to test the Falcon billing system end-to-end.

This script helps you verify all components are working correctly.
"""

# ============================================================================
# STEP 1: Set Up Environment Variables
# ============================================================================
"""
Add these to your .env file (create if doesn't exist):

# Stripe Configuration (from https://dashboard.stripe.com)
STRIPE_PUBLIC_KEY=pk_test_your_public_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend URL for callbacks
FRONTEND_URL=http://localhost:3000  # For development
# FRONTEND_URL=https://yourdomain.com  # For production
"""


# ============================================================================
# STEP 2: Initialize Database with Plans
# ============================================================================
"""
Run this command in your project root:

python manage.py migrate billing
python manage.py seed_billing_plans

Expected output:
  ============================================================
  Starting billing plans seeding...
  ✓ Created: Trial (trial)
  ✓ Created: Starter (basic)
  ✓ Created: Professional (professional)
  ✓ Created: Enterprise (enterprise)
  ✓ Exists: ... (if re-running)
  ============================================================
"""


# ============================================================================
# STEP 3: Test API Endpoints
# ============================================================================
"""
Test 1: Get All Plans
--------
GET /api/billing/plans/

curl -X GET http://localhost:8000/api/billing/plans/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

Expected Response (200 OK):
{
  "plans": [
    {
      "id": "uuid",
      "name": "Trial",
      "slug": "trial",
      "plan_type": "trial",
      "price_monthly": 0,
      "price_yearly": 0,
      "currency": "KES",
      "trial_days": 14,
      "is_recommended": false,
      "features": [...]
    },
    ...
  ],
  "recommended_plan_id": "uuid-of-professional-plan",
  "count": 4
}


Test 2: Create Checkout Session
--------
POST /api/billing/checkout/

curl -X POST http://localhost:8000/api/billing/checkout/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": "PLAN_UUID_FROM_STEP_1",
    "billing_interval": "month"
  }'

Expected Response (201 Created):
{
  "session_id": "cs_test_...",
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_...",
  "stripe_customer_id": "cus_..."
}

This checkout_url is what you'll redirect users to!


Test 3: Get Checkout Session Status
--------
GET /api/billing/checkout/session/?session_id=cs_test_...

curl -X GET "http://localhost:8000/api/billing/checkout/session/?session_id=YOUR_SESSION_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

Expected Response (200 OK):
{
  "id": "cs_test_...",
  "status": "complete",  # or "open", "expired"
  "payment_status": "paid",  # or "unpaid", "no_payment_required"
  "customer": "cus_...",
  "subscription": "sub_...",
  "amount_total": 2999,  # in cents
  "currency": "kes"
}


Test 4: Get Current Subscription
--------
GET /api/billing/subscriptions/current/

curl -X GET http://localhost:8000/api/billing/subscriptions/current/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

Expected Response (200 OK):
{
  "id": "uuid",
  "tenant": "uuid",
  "plan": {
    "id": "uuid",
    "name": "Professional",
    "price_monthly": 9999
  },
  "status": "active",  # or "trialing", "past_due", "canceled"
  "billing_interval": "month",
  "trial_end": "2024-06-01T10:00:00Z",
  "current_period_end": "2024-07-01T10:00:00Z",
  "auto_renew": true
}


Test 5: Upgrade Plan
--------
PATCH /api/billing/subscriptions/{subscription_id}/

curl -X PATCH http://localhost:8000/api/billing/subscriptions/SUBSCRIPTION_ID/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": "NEW_PLAN_UUID",
    "billing_interval": "month"
  }'

Expected Response (200 OK):
{
  "id": "uuid",
  "plan": {
    "id": "NEW_PLAN_UUID",
    "name": "Enterprise"
  },
  "status": "active"
}


Test 6: Cancel Subscription
--------
POST /api/billing/subscriptions/{subscription_id}/cancel/

curl -X POST http://localhost:8000/api/billing/subscriptions/SUBSCRIPTION_ID/cancel/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "at_period_end": true,
    "reason": "User requested cancellation"
  }'

Expected Response (200 OK):
{
  "id": "uuid",
  "status": "active",  # Still active but cancel_at_period_end = true
  "cancel_at_period_end": true,
  "canceled_at": "2024-05-14T10:00:00Z"
}
"""


# ============================================================================
# STEP 4: Test Stripe Webhook
# ============================================================================
"""
Stripe webhooks are how your backend knows about payment events.

1. Register Webhook in Stripe Dashboard:
   - Go to https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - Endpoint URL: https://yourdomain.com/api/billing/webhook/stripe/
   - Select events:
     * charge.succeeded
     * checkout.session.completed
     * customer.subscription.created
     * customer.subscription.updated
     * customer.subscription.deleted
     * invoice.paid
     * invoice.payment_failed
   - Copy the Signing Secret to STRIPE_WEBHOOK_SECRET in .env

2. Test locally using Stripe CLI:
   
   # Download Stripe CLI from https://stripe.com/docs/stripe-cli
   
   stripe listen --forward-to localhost:8000/api/billing/webhook/stripe/
   
   # In another terminal:
   stripe trigger payment_intent.succeeded
   
   # You should see:
   # 2024-05-14 10:00:00 [200] POST 
   #   /api/billing/webhook/stripe/ <- Webhook processed successfully

3. Check webhook logs:
   - Go to https://dashboard.stripe.com/webhooks
   - Click your endpoint
   - See "Events" tab for recent webhook deliveries
"""


# ============================================================================
# STEP 5: Test Frontend Flow
# ============================================================================
"""
1. Start your Django backend:
   python manage.py runserver

2. Start your frontend:
   cd frontend
   npm run dev

3. Navigate to: http://localhost:3000/billing/plans

   What you should see:
   - [ ✓ ] "Choose Your Plan" heading
   - [ ✓ ] 4 plan cards: Trial, Starter, Professional, Enterprise
   - [ ✓ ] Monthly/Yearly toggle button
   - [ ✓ ] "Subscribe to X" button on each plan
   - [ ✓ ] Trial plan showing "14-day free trial" badge

4. Click on "Professional" plan → "Subscribe"

   You should be redirected to:
   https://checkout.stripe.com/pay/cs_test_...
   
   Expected Stripe Checkout Page:
   - [ ✓ ] Shows plan name and price
   - [ ✓ ] Email field
   - [ ✓ ] Card input
   - [ ✓ ] "Subscribe" button

5. Use test card: 4242 4242 4242 4242
   - Expiry: 12/34
   - CVC: 567

6. After payment, you should be redirected to:
   /billing/success?session_id=cs_test_...

7. Check subscription status:
   - Go to /billing/subscription
   - You should see: "Professional Plan - KES 99.99/month"
   - Status: "Trialing" or "Active"
   - Trial ends: [future date]
"""


# ============================================================================
# STEP 6: Verify Database Records
# ============================================================================
"""
Django Shell Tests:

python manage.py shell

# Check plans were created
from apps.billing.models import Plan
plans = Plan.objects.all()
print(f"Plans in DB: {plans.count()}")  # Should be 4
for plan in plans:
    print(f"  - {plan.name}: {plan.price_monthly}/{plan.price_yearly}")

# Check subscription was created
from apps.billing.models import Subscription
subs = Subscription.objects.all()
for sub in subs:
    print(f"  - {sub.tenant.name}: {sub.plan.name} ({sub.status})")

# Check payment method was created
from apps.billing.models import PaymentMethod
methods = PaymentMethod.objects.all()
for method in methods:
    print(f"  - {method.tenant.name}: {method.get_method_type_display()}")

# Check webhook was processed
from apps.billing.models import WebhookEvent
events = WebhookEvent.objects.all()
for event in events:
    print(f"  - {event.event_type}: {'✓' if event.is_processed else '✗'}")
"""


# ============================================================================
# STEP 7: Common Issues & Solutions
# ============================================================================
"""

Issue: "No plans shown in /billing/plans"
Solution:
  1. Run: python manage.py seed_billing_plans
  2. Check: python manage.py shell
            from apps.billing.models import Plan
            print(Plan.objects.count())
  3. Verify: GET /api/billing/plans/ returns data

Issue: "Checkout button doesn't work"
Solution:
  1. Check Stripe keys in .env:
     echo $STRIPE_PUBLIC_KEY  # Should show pk_test_...
     echo $STRIPE_SECRET_KEY  # Should show sk_test_...
  2. Verify checkout service can access Stripe:
     python manage.py shell
     from apps.billing.services import StripeClient
     client = StripeClient()
     client.stripe.Account.retrieve()  # If this works, Stripe is configured

Issue: "Payment completes but subscription not created"
Solution:
  1. Check webhook secret is correct:
     STRIPE_WEBHOOK_SECRET in .env matches Stripe Dashboard
  2. Check webhook is being called:
     tail -f logs/django.log | grep webhook
  3. Manually trigger webhook:
     stripe trigger checkout.session.completed

Issue: "Subscription shows but says 'Canceled'"
Solution:
  1. Check subscription status in Django:
     python manage.py shell
     from apps.billing.models import Subscription
     sub = Subscription.objects.latest('created_at')
     print(sub.status, sub.stripe_subscription_id)
  2. Check Stripe dashboard:
     https://dashboard.stripe.com/subscriptions
     Verify subscription is "Active" on Stripe side

Issue: "CORS errors between frontend and backend"
Solution:
  1. Ensure CORS_ALLOWED_ORIGINS in settings includes frontend URL
  2. Check FRONTEND_URL matches your frontend origin
"""


# ============================================================================
# STEP 8: Success Checklist
# ============================================================================
"""
You'll know it's working when:

✓ [ ] Plans show in /billing/plans
✓ [ ] Can create checkout session via API
✓ [ ] Redirected to Stripe checkout page
✓ [ ] Payment processes with test card
✓ [ ] Webhook is received and processed
✓ [ ] Subscription shows in database
✓ [ ] Frontend shows "Active subscription"
✓ [ ] Can upgrade/downgrade plans
✓ [ ] Can cancel subscription
✓ [ ] Trial period counts down
✓ [ ] Can view invoices and payment history
✓ [ ] Payment methods are saved

If all above are working, congratulations! 🎉
Your billing system is fully functional.
"""


# ============================================================================
# STEP 9: Useful Commands
# ============================================================================
"""
# Clear all billing data (for testing):
python manage.py shell
from apps.billing.models import *
Subscription.objects.all().delete()
Plan.objects.all().delete()
WebhookEvent.objects.all().delete()
exit()

# Re-seed plans:
python manage.py seed_billing_plans

# Watch webhook logs:
tail -f logs/django.log | grep -i webhook

# Test Stripe connection:
python manage.py shell
from apps.billing.services import StripeClient
s = StripeClient()
s.stripe.Account.retrieve()  # If no error, Stripe is working

# List all subscriptions:
python manage.py shell
from apps.billing.models import Subscription
for sub in Subscription.objects.select_related('tenant', 'plan'):
    print(f"{sub.tenant.name}: {sub.plan.name} ({sub.status})")
"""
