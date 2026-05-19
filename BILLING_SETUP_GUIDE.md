# Falcon Billing System - Complete Setup Guide

## Overview
Your billing app has **most of the infrastructure** built, but is missing several critical components to make the subscription flow work end-to-end. This guide shows exactly what's missing and how to complete it.

---

## ✅ What's Already Implemented

### Backend Structure
- ✅ **Models**: Plan, Subscription, PaymentMethod, Invoice, Payment, Webhook models
- ✅ **Services**: PlanService, SubscriptionService, InvoiceService, PaymentService, WebhookService
- ✅ **API Endpoints**: Plans, Subscriptions, Invoices, Payments, PaymentMethods, Portal
- ✅ **Stripe Integration**: StripeClient with customer, subscription management
- ✅ **Webhook Handling**: WebhookView set up for Stripe events

### Frontend Structure  
- ✅ **Pages**: PlanList, Checkout, CheckoutSuccess/Cancel, SubscriptionUpgrade
- ✅ **Components**: PricingCard, subscription management UI
- ✅ **Hooks**: usePlans, useCheckout, useCurrentSubscription, usePaymentMethods

---

## ❌ What's MISSING (Why You Can't See Plans or Payment Flow)

### 1. **NO PLANS IN DATABASE** 
**Problem**: The frontend shows empty plan list because no plans are created in the database.

**Solution**: Create a Django management command to seed plans:

```bash
python manage.py seed_billing_plans
```

You need to create this file:
```
apps/billing/management/commands/seed_billing_plans.py
```

### 2. **Missing Stripe Checkout Session Method**
**Problem**: The `CheckoutService` calls `self.stripe.create_checkout_session()` but this method **doesn't exist** in `StripeClient`.

**Missing in** `apps/billing/services/stripe_client.py`:
```python
def create_checkout_session(self, customer_id: str, price_id: str, success_url: str, 
                           cancel_url: str, mode: str = 'subscription', **kwargs):
    # Not implemented!
```

### 3. **Missing Stripe Webhook Processing**
**Problem**: The `WebhookView` exists but webhook handlers for processing Stripe events are incomplete.

**What's needed**:
- Process `checkout.session.completed` events
- Process `customer.subscription.created` events
- Process `customer.subscription.updated` events
- Process `customer.subscription.deleted` events
- Update database records when payments succeed/fail

### 4. **NO Environment Variables Set**
**Problem**: Stripe API keys are missing:
```
STRIPE_PUBLIC_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
```

You need:
1. Go to https://dashboard.stripe.com
2. Get your API keys
3. Add them to `.env` file

### 5. **No Payment Webhook Endpoints Exposed**
**Problem**: Frontend can't see payment status or webhook confirmations because:
- Webhook URL is not registered in Stripe Dashboard
- No endpoint to check payment status
- No polling mechanism for async payments

---

## 🔧 Step-by-Step Implementation Plan

### Step 1: Create Stripe Account & Get Keys
```
1. Go to https://dashboard.stripe.com
2. Copy Publishable Key (pk_test_...)
3. Copy Secret Key (sk_test_...)
4. Create a webhook endpoint for your app
5. Copy Webhook Signing Secret (whsec_...)
6. Add all three to .env file
```

### Step 2: Implement Missing Stripe Method
Add to `apps/billing/services/stripe_client.py`:

```python
def create_checkout_session(self, customer_id: str, price_id: str, success_url: str,
                           cancel_url: str, mode: str = 'subscription', 
                           allow_promotion_codes: bool = True, metadata: Dict = None) -> stripe.checkout.Session:
    """Create a Stripe checkout session for subscription."""
    params = {
        'customer': customer_id,
        'success_url': success_url,
        'cancel_url': cancel_url,
        'mode': mode,
        'line_items': [{'price': price_id, 'quantity': 1}],
        'allow_promotion_codes': allow_promotion_codes,
    }
    if metadata:
        params['metadata'] = metadata
    
    session = self.stripe.checkout.Session.create(**params)
    logger.info(f"Created checkout session: {session.id}")
    return session
```

### Step 3: Seed Initial Plans
Create `apps/billing/management/commands/seed_billing_plans.py`:

```python
from django.core.management.base import BaseCommand
from apps.billing.models import Plan, PlanFeature

class Command(BaseCommand):
    help = 'Seed initial billing plans'

    def handle(self, *args, **kwargs):
        plans_data = [
            {
                'name': 'Trial',
                'slug': 'trial',
                'plan_type': 'trial',
                'price_monthly': 0,
                'price_yearly': 0,
                'currency': 'KES',
                'trial_days': 14,
                'display_order': 1,
                'description': 'Free trial plan',
                'features': [
                    {'name': 'Basic Features', 'value': 'Limited'},
                    {'name': 'Users', 'value': '1'},
                ]
            },
            {
                'name': 'Basic',
                'slug': 'basic',
                'plan_type': 'basic',
                'price_monthly': 2999,  # 29.99 KES
                'price_yearly': 29990,  # ~250 KES/month
                'currency': 'KES',
                'trial_days': 14,
                'display_order': 2,
                'description': 'For small teams',
                'features': [
                    {'name': 'All Trial Features', 'value': 'Yes'},
                    {'name': 'Users', 'value': '5'},
                    {'name': 'Projects', 'value': 'Unlimited'},
                ]
            },
            # ... more plans
        ]
        
        for plan_data in plans_data:
            features = plan_data.pop('features', [])
            plan, created = Plan.objects.get_or_create(
                slug=plan_data['slug'],
                defaults=plan_data
            )
            
            for feature in features:
                PlanFeature.objects.get_or_create(
                    plan=plan,
                    name=feature['name'],
                    defaults={'value': feature['value']}
                )
            
            status = "Created" if created else "Exists"
            self.stdout.write(f"{status}: {plan.name}")
```

### Step 4: Complete Webhook Processing
In `apps/billing/api/v1/views/webhook.py`, handle Stripe events:

```python
@staticmethod
def handle_checkout_session_completed(session):
    """Handle successful checkout."""
    tenant_id = session.metadata.get('tenant_id')
    plan_id = session.metadata.get('plan_id')
    # Create/update subscription in database
    
@staticmethod  
def handle_subscription_created(subscription):
    """Handle subscription creation."""
    # Update subscription status to 'active'
    # Record trial dates
    
@staticmethod
def handle_subscription_updated(subscription):
    """Handle subscription updates (upgrades, etc)."""
    # Update subscription in database
    
@staticmethod
def handle_subscription_deleted(subscription):
    """Handle subscription cancellation."""
    # Mark subscription as 'canceled'
```

### Step 5: Test the Full Flow

#### Test 1: View Plans
```bash
curl http://localhost:8000/api/billing/plans/
# Should return list of plans
```

#### Test 2: Create Checkout Session
```bash
curl -X POST http://localhost:8000/api/billing/checkout/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "plan_id": "PLAN_UUID",
    "billing_interval": "month"
  }'
# Should return checkout_url from Stripe
```

#### Test 3: Mock Stripe Webhook
```bash
# In test/test_webhook.py, test webhook verification
```

---

## 📋 Checklist - What To Do Now

- [ ] **Get Stripe API Keys**
  - Create Stripe account at stripe.com
  - Add keys to `.env`
  
- [ ] **Add Missing Stripe Method**
  - Edit `apps/billing/services/stripe_client.py`
  - Add `create_checkout_session()` method
  
- [ ] **Create Billing Plans**
  - Create `apps/billing/management/commands/seed_billing_plans.py`
  - Run `python manage.py seed_billing_plans`
  
- [ ] **Complete Webhook Handling**
  - Edit `apps/billing/api/v1/views/webhook.py`
  - Implement event handlers
  
- [ ] **Register Webhook URL in Stripe**
  - Go to Stripe Dashboard > Webhooks
  - Add `https://yourdomain.com/api/billing/webhook/stripe/`
  - Copy webhook signing secret to `.env`
  
- [ ] **Test the Flow**
  - Visit `/billing/plans` in frontend
  - See plans displayed
  - Click "Subscribe" 
  - Redirected to Stripe Checkout
  - Complete payment (use test card 4242 4242 4242 4242)
  - Redirected back to success page

---

## 🧪 Testing Credentials (Stripe Test Mode)

Use these test cards:
- **Successful**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Expired**: `4000 0000 0000 0069`

Expiry: Any future date
CVV: Any 3 digits

---

## 📞 Current Missing APIs

| Feature | Status | Component |
|---------|--------|-----------|
| View Plans | ✅ Ready | `/api/billing/plans/` |
| Create Checkout | ⚠️ Partial | `/api/billing/checkout/` (missing Stripe method) |
| Webhook Processing | ❌ Incomplete | No event handlers |
| Payment Status | ❌ Missing | Need polling endpoint |
| Customer Portal | ✅ Ready | `/api/billing/portal/` |
| Invoices | ✅ Ready | `/api/billing/invoices/` |

---

## 💡 Summary

Your app **architecture is solid**, but you're missing:
1. **Database Plans** - No plans created
2. **Stripe Keys** - Not configured
3. **Checkout Session API** - Not in StripeClient
4. **Webhook Handlers** - Not processing events
5. **Subscription Creation** - Not triggered from checkout

Once you implement these 5 items, **the entire subscription flow will work**!

The frontend is ready to:
- ✅ List plans → `/api/billing/plans/`
- ✅ Create checkout session → `/api/billing/checkout/`
- ✅ Redirect to Stripe
- ✅ Handle callback from Stripe
- ✅ Display subscription status

---

**Need help with any specific step? Let me know which one and I can implement it for you!**
