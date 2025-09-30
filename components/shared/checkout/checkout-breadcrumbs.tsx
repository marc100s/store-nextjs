"use client";

import { ChevronRight, Check, ShoppingCart, MapPin, CreditCard, Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface CheckoutStep {
  id: string;
  title: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth: boolean;
  requiresCart: boolean;
}

const checkoutSteps: CheckoutStep[] = [
  {
    id: "cart",
    title: "Cart",
    href: "/cart",
    description: "Review items",
    icon: ShoppingCart,
    requiresAuth: false,
    requiresCart: true,
  },
  {
    id: "shipping",
    title: "Shipping Address",
    href: "/shipping-address",
    description: "Delivery details",
    icon: MapPin,
    requiresAuth: true,
    requiresCart: true,
  },
  {
    id: "payment",
    title: "Payment Method", 
    href: "/payment-method",
    description: "Payment details",
    icon: CreditCard,
    requiresAuth: true,
    requiresCart: true,
  },
  {
    id: "review",
    title: "Place Order",
    href: "/place-order",
    description: "Review & confirm",
    icon: Package,
    requiresAuth: true,
    requiresCart: true,
  },
];

interface CheckoutBreadcrumbsProps {
  currentStep: string;
  completedSteps: string[];
  isAuthenticated: boolean;
  hasCartItems: boolean;
  className?: string;
}

export default function CheckoutBreadcrumbs({
  currentStep,
  completedSteps,
  isAuthenticated,
  hasCartItems,
  className,
}: CheckoutBreadcrumbsProps) {
  const pathname = usePathname();

  const getStepStatus = (step: CheckoutStep): "completed" | "current" | "upcoming" | "disabled" => {
    if (completedSteps.includes(step.id)) return "completed";
    if (step.id === currentStep || step.href === pathname) return "current";
    if (step.requiresAuth && !isAuthenticated) return "disabled";
    if (step.requiresCart && !hasCartItems) return "disabled";
    return "upcoming";
  };

  const canNavigateToStep = (step: CheckoutStep): boolean => {
    const status = getStepStatus(step);
    return status === "completed" || status === "current";
  };

  return (
    <nav
      className={cn(
        "w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
      aria-label="Checkout progress"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Checkout</h1>
          <div className="text-sm text-muted-foreground">
            Step {checkoutSteps.findIndex(s => s.id === currentStep) + 1} of {checkoutSteps.length}
          </div>
        </div>
        
        <div className="mt-4">
          <ol className="flex items-center w-full space-x-2 text-sm font-medium text-center text-gray-500 sm:text-base">
            {checkoutSteps.map((step, index) => {
              const status = getStepStatus(step);
              const canNavigate = canNavigateToStep(step);
              const Icon = step.icon;
              
              return (
                <li
                  key={step.id}
                  className={cn(
                    "flex items-center",
                    index < checkoutSteps.length - 1 && "flex-1"
                  )}
                >
                  <div className="flex items-center">
                    {canNavigate ? (
                      <Link
                        href={step.href}
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          {
                            "text-primary bg-primary/10": status === "current",
                            "text-green-600 bg-green-50": status === "completed",
                            "text-muted-foreground": status === "upcoming",
                            "text-muted-foreground/50 cursor-not-allowed": status === "disabled",
                          }
                        )}
                        aria-current={status === "current" ? "step" : undefined}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                          {
                            "border-primary bg-primary text-primary-foreground": status === "current",
                            "border-green-500 bg-green-500 text-white": status === "completed",
                            "border-muted-foreground": status === "upcoming",
                            "border-muted-foreground/50": status === "disabled",
                          }
                        )}>
                          {status === "completed" ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="hidden sm:block">
                          <div className={cn(
                            "font-medium",
                            {
                              "text-primary": status === "current",
                              "text-green-600": status === "completed",
                              "text-foreground": status === "upcoming",
                              "text-muted-foreground/50": status === "disabled",
                            }
                          )}>
                            {step.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {step.description}
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-lg",
                          "cursor-not-allowed opacity-50"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full border-2",
                          "border-muted-foreground/30"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="hidden sm:block">
                          <div className="font-medium text-muted-foreground/50">
                            {step.title}
                          </div>
                          <div className="text-xs text-muted-foreground/50">
                            {step.description}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {index < checkoutSteps.length - 1 && (
                    <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground/50 hidden sm:block" />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Mobile step indicator */}
        <div className="sm:hidden mt-3 text-center">
          <div className="text-sm font-medium">
            {checkoutSteps.find(s => s.id === currentStep)?.title}
          </div>
          <div className="text-xs text-muted-foreground">
            {checkoutSteps.find(s => s.id === currentStep)?.description}
          </div>
        </div>
      </div>
    </nav>
  );
}