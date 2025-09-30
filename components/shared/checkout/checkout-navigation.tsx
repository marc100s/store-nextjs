"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getPreviousStepUrl, getNextStepUrl } from "@/hooks/use-checkout-progress";

interface CheckoutNavigationProps {
  currentStep: string;
  canProceedToNext: boolean;
  nextStepLabel?: string;
  onNext?: () => void;
  className?: string;
}

export default function CheckoutNavigation({
  currentStep,
  canProceedToNext,
  nextStepLabel,
  onNext,
  className,
}: CheckoutNavigationProps) {
  const previousStepUrl = getPreviousStepUrl(currentStep);
  const nextStepUrl = getNextStepUrl(currentStep);

  const getStepLabel = (step: string): string => {
    switch (step) {
      case "cart":
        return "Cart";
      case "shipping":
        return "Shipping Address";
      case "payment":
        return "Payment Method";
      case "review":
        return "Place Order";
      default:
        return "Continue";
    }
  };

  return (
    <div className={`flex items-center justify-between pt-6 ${className || ""}`}>
      <div>
        {previousStepUrl && (
          <Button variant="outline" asChild>
            <Link href={previousStepUrl} className="flex items-center">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        )}
      </div>

      <div>
        {nextStepUrl && canProceedToNext && (
          <>
            {onNext ? (
              <Button onClick={onNext} className="flex items-center">
                {nextStepLabel || getStepLabel(getNextStep(currentStep))}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button asChild>
                <Link href={nextStepUrl} className="flex items-center">
                  {nextStepLabel || `Continue to ${getStepLabel(getNextStep(currentStep))}`}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
          </>
        )}
        
        {currentStep === "review" && canProceedToNext && onNext && (
          <Button onClick={onNext} className="flex items-center bg-green-600 hover:bg-green-700">
            {nextStepLabel || "Place Order"}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

function getNextStep(currentStep: string): string {
  const stepOrder = ["cart", "shipping", "payment", "review"];
  const currentIndex = stepOrder.indexOf(currentStep);
  
  if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
    return "";
  }

  return stepOrder[currentIndex + 1];
}