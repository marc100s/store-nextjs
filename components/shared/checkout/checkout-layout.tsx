"use client";

import { usePathname } from "next/navigation";
import CheckoutBreadcrumbs from "./checkout-breadcrumbs";
import CheckoutNavigation from "./checkout-navigation";
import { useCheckoutProgress } from "@/hooks/use-checkout-progress";
import { Cart } from "@/types";
import type { JsonValue } from '@prisma/client/runtime/library';

interface CheckoutLayoutProps {
  children: React.ReactNode;
  user?: {
    id: string;
    address?: JsonValue;
    paymentMethod?: string | null;
  } | null;
  cart?: Cart | null;
  showNavigation?: boolean;
  nextStepLabel?: string;
  onNext?: () => void;
}

export default function CheckoutLayout({
  children,
  user,
  cart,
  showNavigation = true,
  nextStepLabel,
  onNext,
}: CheckoutLayoutProps) {
  const pathname = usePathname();
  
  const { currentStep, completedSteps, isAuthenticated, hasCartItems, canProceedToNext } = 
    useCheckoutProgress({
      user,
      cart,
      pathname,
    });

  return (
    <div className="min-h-screen bg-background">
      <CheckoutBreadcrumbs
        currentStep={currentStep}
        completedSteps={completedSteps}
        isAuthenticated={isAuthenticated}
        hasCartItems={hasCartItems}
      />
      
      <main className="container mx-auto px-4 py-8">
        {children}
        
        {showNavigation && (
          <CheckoutNavigation
            currentStep={currentStep}
            canProceedToNext={canProceedToNext}
            nextStepLabel={nextStepLabel}
            onNext={onNext}
          />
        )}
      </main>
    </div>
  );
}
