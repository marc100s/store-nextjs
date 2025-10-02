"use client";

import { useEffect, useState } from "react";
import { Cart } from "@/types";
import type { JsonValue } from '@prisma/client/runtime/library';

interface User {
  id: string;
  address?: JsonValue;
  paymentMethod?: string | null;
}

interface CheckoutProgress {
  currentStep: string;
  completedSteps: string[];
  isAuthenticated: boolean;
  hasCartItems: boolean;
  canProceedToNext: boolean;
}

interface UseCheckoutProgressProps {
  user?: User | null;
  cart?: Cart | null;
  pathname: string;
}

export function useCheckoutProgress({
  user,
  cart,
  pathname,
}: UseCheckoutProgressProps): CheckoutProgress {
  const [progress, setProgress] = useState<CheckoutProgress>({
    currentStep: "cart",
    completedSteps: [],
    isAuthenticated: !!user,
    hasCartItems: !!cart?.items?.length,
    canProceedToNext: false,
  });

  useEffect(() => {
    const isAuthenticated = !!user;
    const hasCartItems = !!cart?.items?.length;
    const hasAddress = !!user?.address;
    const hasPaymentMethod = !!user?.paymentMethod;

    let currentStep = "cart";
    let completedSteps: string[] = [];

    // Determine current step based on pathname
    if (pathname === "/cart") {
      currentStep = "cart";
    } else if (pathname === "/shipping-address") {
      currentStep = "shipping";
    } else if (pathname === "/payment-method") {
      currentStep = "payment";
    } else if (pathname === "/place-order") {
      currentStep = "review";
    }

    // Determine completed steps based on user data
    if (hasCartItems) {
      completedSteps.push("cart");
    }

    if (isAuthenticated && hasAddress) {
      completedSteps.push("shipping");
    }

    if (isAuthenticated && hasPaymentMethod) {
      completedSteps.push("payment");
    }

    // All previous steps must be completed to proceed to place order
    if (hasCartItems && hasAddress && hasPaymentMethod) {
      completedSteps.push("review");
    }

    // Determine if can proceed to next step
    let canProceedToNext = false;
    switch (currentStep) {
      case "cart":
        canProceedToNext = hasCartItems && isAuthenticated;
        break;
      case "shipping":
        canProceedToNext = hasCartItems && isAuthenticated;
        break;
      case "payment":
        canProceedToNext = hasCartItems && isAuthenticated && hasAddress;
        break;
      case "review":
        canProceedToNext = hasCartItems && isAuthenticated && hasAddress && hasPaymentMethod;
        break;
      default:
        canProceedToNext = false;
    }

    setProgress({
      currentStep,
      completedSteps,
      isAuthenticated,
      hasCartItems,
      canProceedToNext,
    });
  }, [user, cart, pathname]);

  return progress;
}

export function getNextStepUrl(currentStep: string): string | null {
  const stepOrder = ["cart", "shipping", "payment", "review"];
  const currentIndex = stepOrder.indexOf(currentStep);
  
  if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
    return null;
  }

  const nextStep = stepOrder[currentIndex + 1];
  
  switch (nextStep) {
    case "shipping":
      return "/shipping-address";
    case "payment":
      return "/payment-method";
    case "review":
      return "/place-order";
    default:
      return null;
  }
}

export function getPreviousStepUrl(currentStep: string): string | null {
  const stepOrder = ["cart", "shipping", "payment", "review"];
  const currentIndex = stepOrder.indexOf(currentStep);
  
  if (currentIndex <= 0) {
    return null;
  }

  const previousStep = stepOrder[currentIndex - 1];
  
  switch (previousStep) {
    case "cart":
      return "/cart";
    case "shipping":
      return "/shipping-address";
    case "payment":
      return "/payment-method";
    default:
      return null;
  }
}