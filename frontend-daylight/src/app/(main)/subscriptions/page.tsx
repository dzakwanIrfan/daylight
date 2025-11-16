'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/main/dashboard-layout';
import { useAuth } from '@/hooks/use-auth';
import { useActivePlans, useMyActiveSubscription } from '@/hooks/use-subscriptions';
import { useRouter } from 'next/navigation';
import {
  Crown,
  Loader2,
  Check,
  ArrowRight,
  Calendar,
  Zap,
  Shield,
  Star,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: plansResponse, isLoading } = useActivePlans();
  const { data: activeSubscription } = useMyActiveSubscription();

  const plans = plansResponse?.data || [];
  const hasActiveSubscription = activeSubscription?.hasActiveSubscription ?? false;
  const currentSubscription = activeSubscription?.data;

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      router.push('/auth/login?redirect=/subscriptions');
      return;
    }
    router.push(`/subscriptions/${planId}/checkout`);
  };

  const planConfig = {
    MONTHLY_1: {
      icon: Zap,
      gradient: 'from-orange-500 to-orange-600',
      badge: null,
    },
    MONTHLY_3: {
      icon: Star,
      gradient: 'from-purple-500 to-purple-600',
      badge: 'Popular',
    },
    MONTHLY_6: {
      icon: Sparkles,
      gradient: 'from-pink-500 to-orange-500',
      badge: 'Best Value',
    },
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Crown className="w-7 h-7 text-brand" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Upgrade to Premium
            </h1>
          </div>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Join unlimited events and expand your network without limits
          </p>
        </div>

        {/* Current Subscription Alert */}
        {hasActiveSubscription && currentSubscription && (
          <div className="bg-white border-2 border-orange-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-base mb-1">
                  Active Premium Membership
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Plan:</span>{' '}
                    {currentSubscription.plan.name}
                  </p>
                  {currentSubscription.endDate && (
                    <p>
                      <span className="font-medium">Valid until:</span>{' '}
                      {format(new Date(currentSubscription.endDate), 'dd MMM yyyy')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => router.push('/my-subscriptions')}
                  className="mt-3 text-brand hover:text-brand/80 font-medium text-sm inline-flex items-center gap-1.5 transition-colors"
                >
                  Manage Subscription
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Why Go Premium?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-brand" />
              </div>
              <h3 className="font-semibold text-base text-gray-900">
                Unlimited Events
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Join as many events as you want without any restrictions
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-base text-gray-900">
                Priority Booking
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Get early access to new events before they fill up
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-base text-gray-900">
                Exclusive Access
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Join VIP events and special community gatherings
              </p>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const config = planConfig[plan.type] || planConfig.MONTHLY_1;
            const PlanIcon = config.icon;
            const monthlyPrice = plan.price / plan.durationInMonths;
            const hasBadge = !!config.badge;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-lg border-2 transition-all hover:shadow-lg ${
                  hasBadge
                    ? 'border-brand shadow-md scale-105'
                    : 'border-gray-200 hover:border-brand/30'
                }`}
              >
                {/* Badge */}
                {config.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="px-3 py-1 rounded-full bg-brand text-white text-xs font-semibold">
                      {config.badge}
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-5">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-lg bg-linear-to-br ${config.gradient} flex items-center justify-center`}
                  >
                    <PlanIcon className="w-6 h-6 text-white" />
                  </div>

                  {/* Plan Name */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {plan.name}
                    </h3>
                    {plan.description && (
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatCurrency(plan.price, plan.currency)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(monthlyPrice, plan.currency)}/month
                    </p>
                    <p className="text-xs text-gray-500">
                      Billed every {plan.durationInMonths} month
                      {plan.durationInMonths > 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={hasActiveSubscription}
                    className={`w-full py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      hasActiveSubscription
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : hasBadge
                        ? 'bg-linear-to-r from-brand to-orange-600 text-white hover:shadow-lg hover:scale-[1.02]'
                        : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md'
                    }`}
                  >
                    {hasActiveSubscription ? (
                      'Already Subscribed'
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5 max-w-3xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Yes! You can cancel your subscription at any time. You'll continue
                to have access until the end of your billing period.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                What payment methods do you accept?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We accept various payment methods including bank transfer, e-wallet,
                and credit card through our secure payment gateway.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Currently, you can purchase a new plan once your current subscription
                ends. Future updates will support plan upgrades.
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-5">
          <div className="flex items-start gap-3 max-w-3xl mx-auto">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-blue-900 text-sm mb-1">
                Need Help?
              </p>
              <p className="text-sm text-blue-700 leading-relaxed">
                If you have any questions about our subscription plans, feel free to
                contact our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}