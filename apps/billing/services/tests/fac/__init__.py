# tests/factories/__init__.py
import factory
from faker import Faker
from uuid import uuid4
from django.utils import timezone
from datetime import timedelta

fake = Faker()

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = 'accounts.User'

    id = factory.LazyFunction(lambda: uuid4())
    email = factory.LazyFunction(lambda: fake.email())
    username = factory.LazyFunction(lambda: fake.user_name())
    tenant_id = factory.LazyFunction(lambda: uuid4())
    role = 'staff'

class SubscriptionPlanFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = 'billing.SubscriptionPlan'

    id = factory.LazyFunction(lambda: uuid4())
    name = factory.LazyFunction(lambda: fake.word().capitalize())
    slug = factory.LazyFunction(lambda: fake.word())
    plan_type = factory.Iterator(['basic', 'professional', 'enterprise'])
    price = factory.Iterator([500000, 2500000, 10000000])
    max_users = factory.Iterator([50, 500, -1])
    max_kpis = factory.Iterator([100, 1000, -1])
    is_active = True
    display_order = factory.Sequence(lambda n: n)

class SubscriptionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = 'billing.Subscription'

    id = factory.LazyFunction(lambda: uuid4())
    tenant_id = factory.LazyFunction(lambda: uuid4())
    plan = factory.SubFactory(SubscriptionPlanFactory)
    subscription_code = factory.LazyFunction(lambda: f"SUB_{fake.uuid4()}")
    status = factory.Iterator(['active', 'trialing', 'past_due', 'cancelled'])
    start_date = factory.LazyFunction(lambda: timezone.now())
    current_period_start = factory.LazyFunction(lambda: timezone.now())
    current_period_end = factory.LazyFunction(lambda: timezone.now() + timedelta(days=30))
    amount = 500000
    currency = 'KES'
    auto_renew = True

class TransactionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = 'billing.Transaction'

    id = factory.LazyFunction(lambda: uuid4())
    tenant_id = factory.LazyFunction(lambda: uuid4())
    reference = factory.LazyFunction(lambda: f"TXN_{fake.uuid4()}")
    amount = 500000
    total_amount = 580000
    currency = 'KES'
    status = 'pending'

class UsageRecordFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = 'billing.UsageRecord'

    id = factory.LazyFunction(lambda: uuid4())
    tenant_id = factory.LazyFunction(lambda: uuid4())
    subscription = factory.SubFactory(SubscriptionFactory)
    usage_type = factory.Iterator(['users', 'kpis', 'api_calls'])
    current_value = factory.Sequence(lambda n: n * 10)
    limit_value = 500
    period_start = factory.LazyFunction(lambda: timezone.now())
    period_end = factory.LazyFunction(lambda: timezone.now() + timedelta(days=30))

class FailedPaymentRetryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = 'billing.FailedPaymentRetry'

    id = factory.LazyFunction(lambda: uuid4())
    tenant_id = factory.LazyFunction(lambda: uuid4())
    subscription = factory.SubFactory(SubscriptionFactory)
    retry_number = factory.Sequence(lambda n: n)
    scheduled_at = factory.LazyFunction(lambda: timezone.now() + timedelta(hours=24))
    status = 'pending'