
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import LoadingLink from '@/components/ui/loading-link';

const plans = {
  monthly: {
    price: 9,
    suffix: '/mo',
  },
  annual: {
    price: 90,
    suffix: '/yr',
  },
};

export default function PremiumPage() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');

  const handlePlanChange = (plan: 'monthly' | 'annual') => {
    setSelectedPlan(plan);
  };
  
  const currentPlan = plans[selectedPlan];

  return (
    <div className="flex items-center justify-center p-4 w-full">
      <div className="premium-modal">
        <div className="premium-form">
          <div className="premium-banner" data-ai-hint="abstract geometric"></div>
          <label className="premium-title">Unlock Your Potential</label>
          <p className="premium-description">
            Go Premium to get exclusive access to top projects, direct mentorship opportunities, and enhanced visibility.
          </p>
          <div className="premium-tab-container">
            <button
              className={cn('premium-tab', 'premium-tab--1', { active: selectedPlan === 'monthly' })}
              onClick={() => handlePlanChange('monthly')}
            >
              Monthly
            </button>
            <button
              className={cn('premium-tab', 'premium-tab--2', { active: selectedPlan === 'annual' })}
              onClick={() => handlePlanChange('annual')}
            >
              Annual
            </button>
            <div
              className={cn('premium-indicator', { 'monthly': selectedPlan === 'monthly', 'annual': selectedPlan === 'annual' })}
            ></div>
          </div>

          <div className="premium-benefits">
            <span>What we offer</span>
            <ul>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" height="16" width="16">
                  <rect fill="currentColor" rx="8" height="16" width="16"></rect>
                  <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke="hsl(var(--background))" d="M5 8.5L7.5 10.5L11 6"></path>
                </svg>
                <span>Priority access to Alumni Projects</span>
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" height="16" width="16">
                  <rect fill="currentColor" rx="8" height="16" width="16"></rect>
                  <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke="hsl(var(--background))" d="M5 8.5L7.5 10.5L11 6"></path>
                </svg>
                <span>Direct mentorship from project owners</span>
              </li>
               <li>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" height="16" width="16">
                  <rect fill="currentColor" rx="8" height="16" width="16"></rect>
                  <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke="hsl(var(--background))" d="M5 8.5L7.5 10.5L11 6"></path>
                </svg>
                <span>'Premium' badge on your profile</span>
              </li>
            </ul>
          </div>

          <div className="premium-modal--footer">
            <label className="premium-price">
              <sup>$</sup>{currentPlan.price}<sub>{currentPlan.suffix}</sub>
            </label>
            <button className="premium-upgrade-btn">Upgrade to PRO</button>
          </div>
        </div>
      </div>
    </div>
  );
}
