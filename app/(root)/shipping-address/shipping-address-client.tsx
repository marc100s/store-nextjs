"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { ShippingAddress, Cart } from "@/types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { shippingAddressSchema } from "@/lib/validators";
import { shippingAddressDefaultValues } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { updateUserAddress } from "@/lib/actions/user.actions";
import CheckoutLayout from "@/components/shared/checkout/checkout-layout";
import type { JsonValue } from '@prisma/client/runtime/library';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ShippingAddressClientProps {
  user: {
    id: string;
    address?: JsonValue;
    paymentMethod?: string | null;
  };
  cart: Cart;
  address: ShippingAddress | null;
}

export default function ShippingAddressClient({
  user,
  cart,
  address,
}: ShippingAddressClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<z.infer<typeof shippingAddressSchema>>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: address || shippingAddressDefaultValues,
  });

  const handleSaveAndContinue = async () => {
    // Trigger form validation
    const isValid = await form.trigger();
    
    if (!isValid) {
      toast({
        title: "Please fix the errors",
        description: "Check the form for validation errors.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    const formData = form.getValues();
    
    startTransition(() => {
      toast({ title: "Updating address..." });
      
      return new Promise<void>((resolve) => {
        setTimeout(async () => {
          try {
            await updateUserAddress(formData);
            toast({ title: "Address updated successfully" });
            router.push("/payment-method");
            resolve();
          } catch (error: unknown) {
            console.error("Update address error:", error);
            toast({
              title: "Failed to update address",
              description: (error as Error)?.message || "An unexpected error occurred",
              variant: "destructive",
            });
            setIsUpdating(false);
          }
        }, 0);
      });
    });
  };

  return (
    <CheckoutLayout
      user={user}
      cart={cart}
      nextStepLabel={isUpdating ? "Saving..." : "Save & Continue"}
      onNext={handleSaveAndContinue}
    >
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Shipping Address</h1>
          <p className="text-muted-foreground">
            Please provide your delivery address information.
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <Form {...form}>
            <form className="space-y-4">
              <div className="flex flex-col gap-5 md:flex-row">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<
                      z.infer<typeof shippingAddressSchema>,
                      "fullName"
                    >;
                  }) => (
                    <FormItem className="w-full">
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="streetAddress"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<
                      z.infer<typeof shippingAddressSchema>,
                      "streetAddress"
                    >;
                  }) => (
                    <FormItem className="w-full">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-5 md:flex-row">
                <FormField
                  control={form.control}
                  name="city"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<
                      z.infer<typeof shippingAddressSchema>,
                      "city"
                    >;
                  }) => (
                    <FormItem className="w-full">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<
                      z.infer<typeof shippingAddressSchema>,
                      "country"
                    >;
                  }) => (
                    <FormItem className="w-full">
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<
                      z.infer<typeof shippingAddressSchema>,
                      "postalCode"
                    >;
                  }) => (
                    <FormItem className="w-full">
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter postal code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
      </div>
    </CheckoutLayout>
  );
}