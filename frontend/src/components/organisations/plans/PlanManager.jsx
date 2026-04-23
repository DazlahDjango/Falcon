import React, { useState, useEffect } from 'react';
import { usePlans } from '@/hooks/organisations';
import { Card, CardHeader, CardTitle, CardContent } from '../../../common/UI/Card';
import { Button } from '../../../common/UI/Button';
import { Badge } from '../../../common/UI/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../common/UI/Tabs';
import { Loader2, Crown, Check, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PlanManager = () => {
  const { plans, loading, error, fetchPlans, subscribeToPlan } = usePlans();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSubscribe = async (plan) => {
    try {
      await subscribeToPlan(plan.id, billingCycle);
      toast.success(`Successfully subscribed to ${plan.name}`);
    } catch (error) {
      toast.error('Failed to subscribe to plan');
    }
  };

  const formatPrice = (plan, cycle) => {
    const price = cycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
    if (price === 0) return 'Free';
    return `$${price}/${cycle === 'yearly' ? 'year' : 'month'}`;
  };

  const getFeaturesList = (features) => {
    if (!features) return [];
    return Object.entries(features).map(([key, value]) => ({
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      enabled: value
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading plans...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-red-600">
            <p>Failed to load plans</p>
            <Button
              variant="outline"
              onClick={fetchPlans}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="w-5 h-5 mr-2" />
            Subscription Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={billingCycle} onValueChange={setBillingCycle}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>

            <TabsContent value={billingCycle} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans && plans.length > 0 ? (
                  plans.filter(plan => plan.is_active).map(plan => (
                    <Card
                      key={plan.id}
                      className={`relative ${plan.is_popular ? 'border-blue-500 shadow-lg' : ''}`}
                    >
                      {plan.is_popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-blue-500 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            Most Popular
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="text-center">
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <div className="text-3xl font-bold text-blue-600">
                          {formatPrice(plan, billingCycle)}
                        </div>
                        {billingCycle === 'yearly' && plan.price_yearly > 0 && (
                          <div className="text-sm text-green-600">
                            Save ${(plan.price_monthly * 12 - plan.price_yearly).toFixed(2)} yearly
                          </div>
                        )}
                        <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Users:</span>
                            <span>{plan.max_users === 999999 ? 'Unlimited' : plan.max_users}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Departments:</span>
                            <span>{plan.max_departments === 999999 ? 'Unlimited' : plan.max_departments}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Storage:</span>
                            <span>{plan.max_storage_gb === 999999 ? 'Unlimited' : `${plan.max_storage_gb}GB`}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>API Calls:</span>
                            <span>{plan.max_api_calls_monthly === 999999 ? 'Unlimited' : plan.max_api_calls_monthly.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Features:</h4>
                          <div className="space-y-1">
                            {getFeaturesList(plan.features).map((feature, index) => (
                              <div key={index} className="flex items-center text-sm">
                                <Check className={`w-4 h-4 mr-2 ${feature.enabled ? 'text-green-500' : 'text-gray-400'}`} />
                                <span className={feature.enabled ? 'text-gray-900' : 'text-gray-500'}>
                                  {feature.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          variant={plan.is_popular ? 'default' : 'outline'}
                          onClick={() => handleSubscribe(plan)}
                        >
                          Subscribe to {plan.name}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No plans available
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanManager;