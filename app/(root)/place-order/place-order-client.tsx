"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createOrder } from "@/lib/actions/order.actions";
import CheckoutLayout from "@/components/shared/checkout/checkout-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { ShippingAddress, CartItem, Cart } from "@/types";

interface PlaceOrderClientProps {
  user: {
    id: string;
    address?: any;
    paymentMethod?: string;
  };
  cart: Cart;
  userAddress: ShippingAddress;
}

export default function PlaceOrderClient({
  user,
  cart,
  userAddress,
}: PlaceOrderClientProps) {
  const router = useRouter();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const res = await createOrder();
      
      if (res.redirectTo) {
        router.push(res.redirectTo);
      }
    } catch (error) {
      console.error("Error placing order:", error);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <CheckoutLayout 
      user={user} 
      cart={cart}
      nextStepLabel={isPlacingOrder ? "Placing Order..." : "Place Order"}
      onNext={handlePlaceOrder}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Review & Place Order</h1>
        <p className="text-muted-foreground">
          Review your order details and confirm your purchase.
        </p>
      </div>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="md:col-span-2 overflow-x-auto space-y-4">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Shipping Address</h2>
              <p>{userAddress.fullName}</p>
              <p>
                {userAddress.streetAddress}, {userAddress.city}{" "}
                {userAddress.postalCode}, {userAddress.country}{" "}
              </p>
              <div className="mt-3">
                <Link href="/shipping-address">
                  <Button variant="outline">Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Payment Method</h2>
              <p>{user.paymentMethod}</p>
              <div className="mt-3">
                <Link href="/payment-method">
                  <Button variant="outline">Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map((item: CartItem) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link href={`/product/${item.slug}`}
                        className="flex items-center">
                          <Image
                              src={item.image}
                              alt={item.name}
                              width={50}
                              height={50}
                          />
                          <span className="px-2">{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="px-2">{item.qty} </span>
                      </TableCell>
                      <TableCell>
                        ${item.price}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
            <Card>
                <CardContent className="p-4 gap-4 space-y-4">
                    <h2 className="text-xl pb-4">Order Summary</h2>
                    <div className="flex justify-between">
                        <div>Items</div>
                        <div> {formatCurrency(cart.itemsPrice)} </div>
                    </div>
                    <div className="flex justify-between">
                        <div>Tax</div>
                        <div> {formatCurrency(cart.taxPrice)} </div>
                    </div>
                    <div className="flex justify-between">
                        <div>Shipping</div>
                        <div> {formatCurrency(cart.shippingPrice)} </div>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-4">
                        <div>Total</div>
                        <div> {formatCurrency(cart.totalPrice)} </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </CheckoutLayout>
  );
}