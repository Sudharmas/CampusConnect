
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { CreditCard, Check } from 'lucide-react';

const plans = {
  monthly: {
    price: 9,
    suffix: '/mo',
    name: 'Monthly',
  },
  annual: {
    price: 90,
    suffix: '/yr',
    name: 'Annual',
  },
};

type Plan = 'monthly' | 'annual';

const CheckoutCard = ({ selectedPlan, onBack }: { selectedPlan: Plan; onBack: () => void }) => {
  const planDetails = plans[selectedPlan];
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      toast({
        title: "Payment Successful!",
        description: "Welcome to Premium! Your benefits are now active."
      })
    }, 2000);
  };

  if (isPaid) {
    return (
        <div className="premium-modal checkout-card">
            <div className="premium-form">
                <div className="flex flex-col items-center text-center gap-4 py-8">
                    <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
                        <Check className="w-10 h-10" />
                    </div>
                    <label className="premium-title">Upgrade Complete!</label>
                    <p className="premium-description">
                        You are now a Premium member. Explore exclusive projects and connect with mentors to kickstart your journey.
                    </p>
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="premium-modal checkout-card">
        <div className="premium-form">
            <label className="premium-title">Confirm Your Purchase</label>
            
            <div className="checkout-summary">
                <div className="flex justify-between items-center">
                    <span>Plan</span>
                    <span className="font-bold">{planDetails.name}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span>Price</span>
                    <span className="font-bold">${planDetails.price}{planDetails.suffix}</span>
                </div>
            </div>

            <div className="checkout-form">
                 <Label htmlFor="card-number">Card Details</Label>
                <div className="relative">
                    <Input id="card-number" placeholder="Card Number" className="pl-10"/>
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex gap-4">
                    <Input placeholder="MM / YY" />
                    <Input placeholder="CVC" />
                </div>
            </div>

            <div className="premium-modal--footer">
                <Button variant="outline" onClick={onBack}>Back</Button>
                <button className="premium-upgrade-btn" onClick={handleConfirm} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : `Pay $${planDetails.price}`}
                </button>
            </div>
        </div>
    </div>
  )
}


const PlanSelectionCard = ({ onSelectPlan }: { onSelectPlan: (plan: Plan) => void }) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('monthly');

  const handlePlanChange = (plan: Plan) => {
    setSelectedPlan(plan);
  };
  
  const currentPlan = plans[selectedPlan];

  return (
    <div className="premium-modal">
      <div className="premium-form">
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
          <button className="premium-upgrade-btn" onClick={() => onSelectPlan(selectedPlan)}>Upgrade to PRO</button>
        </div>
      </div>
    </div>
  )
}

export default function PremiumPage() {
  const [view, setView] = useState<'plans' | 'checkout'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<Plan>('monthly');

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setView('checkout');
  }

  const handleBackToPlans = () => {
    setView('plans');
  }

  return (
    <div className="flex items-center justify-center p-4 w-full">
      {view === 'plans' ? (
        <PlanSelectionCard onSelectPlan={handleSelectPlan} />
      ) : (
        <CheckoutCard selectedPlan={selectedPlan} onBack={handleBackToPlans} />
      )}
    </div>
  );
}
