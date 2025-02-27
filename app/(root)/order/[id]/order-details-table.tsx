"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Order, OrderItem } from "@/types";
import Image from "next/image";
import Link from "next/link";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import {
  createPayPalOrder,
  approvePayPalOrder,
  updateOrderToPaidByCOD,
  deliverOrder,
} from "@/lib/actions/order.actions";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

interface OrderDetailsTableProps {
  order: Order;
  PayPalClientId: string;
  isAdmin: boolean;
}

const OrderDetailsTable = ({
  order,
  PayPalClientId,
  isAdmin,
}: OrderDetailsTableProps) => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const {
    shippingAddress,
    orderitems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
  } = order;

  const formattedPaidAt = useMemo(
    () => (paidAt ? formatDateTime(paidAt).dateTime : null),
    [paidAt]
  );
  const formattedDeliveredAt = useMemo(
    () => (deliveredAt ? formatDateTime(deliveredAt).dateTime : null),
    [deliveredAt]
  );

  const PayPalLoadingState = () => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();
    if (isPending) return <div>Loading PayPal...</div>;
    if (isRejected) return <div>Error Loading PayPal</div>;
    return null;
  };

  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order.id);
    if (!res.success) {
      toast({ variant: "destructive", description: res.message });
      return null;
    }
    return res.data;
  };

  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order.id, data);
    toast({
      variant: res.success ? "default" : "destructive",
      description: res.message,
    });
  };

  const handleUpdateOrderPaid = async () => {
    const res = await updateOrderToPaidByCOD(order.id);
    toast({
      variant: res.success ? "default" : "destructive",
      description: res.message,
    });
  };

  const handleDeliverOrder = async () => {
    const res = await deliverOrder(order.id);
    toast({
      variant: res.success ? "default" : "destructive",
      description: res.message,
    });
  };

  // Button to mark the button as paid
  const MarkAsPaidButton = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    return (
      <Button
        type="button"
        disabled={isPending}
        onClick= {() => startTransition(async () => {
          const res = await updateOrderToPaidByCOD(order.id);
          toast({
            variant: res.success ? 'default' : 'destructive',
            description: res.message
          })
        }) }
        >
          {isPending ? 'processing...' : 'Mark as paid'}
          </Button>
    )
  }

  // Button to mark the button as paid
  const MarkAsDeliveredButton = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    return (
      <Button
        type="button"
        disabled={isPending}
        onClick= {() => startTransition(async () => {
          const res = await deliverOrder(order.id);
          toast({
            variant: res.success ? 'default' : 'destructive',
            description: res.message
          })
        }) }
        >
          {isPending ? 'processing...' : 'Mark as delivered'}
          </Button>
    )
  }

  const OrderItemRow = ({ item }: { item: OrderItem }) => (
    <TableRow key={item.slug}>
      <TableCell>
        <Link href={`/product/${item.slug}`} className="flex items-center">
          <Image src={item.image} alt={item.name} width={50} height={50} />
          <span className="px-2">{item.name}</span>
        </Link>
      </TableCell>
      <TableCell>
        <span className="px-2">{item.qty}</span>
      </TableCell>
      <TableCell className="text-right">${item.price}</TableCell>
    </TableRow>
  );

  return (
    <>
      <h1 className="py-4 text-2xl">Order {formatId(order.id)}</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="col-span-2 space-y-4 overflow-x-auto">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Payment Method</h2>
              <p>{paymentMethod}</p>
              {isPaid ? (
                <Badge variant="secondary">Paid at {formattedPaidAt}</Badge>
              ) : (
                <Badge variant="destructive">Not paid</Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Shipping Address</h2>
              <p>{shippingAddress.fullName}</p>
              <p>
                {shippingAddress.streetAddress}, {shippingAddress.city},{" "}
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
              {isDelivered ? (
                <Badge variant="secondary">
                  Delivered at {formattedDeliveredAt}
                </Badge>
              ) : (
                <Badge variant="destructive">Not delivered</Badge>
              )}
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
                  {orderitems.map((item) => (
                    <OrderItemRow key={item.slug} item={item} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-4 space-y-4 gap-4">
              <h2 className="text-xl pb-4">Order Summary</h2>
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Total</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>
              <div>
              {!isPaid && paymentMethod === "PayPal" && (
                <PayPalScriptProvider options={{ clientId: PayPalClientId }}>
                  <PayPalLoadingState />
                  <PayPalButtons
                    createOrder={handleCreatePayPalOrder}
                    onApprove={handleApprovePayPalOrder}
                  />
                </PayPalScriptProvider>
               )} 
               </div>
  
              {isAdmin && !isPaid && paymentMethod === "CashOnDelivery" && (
               <MarkAsPaidButton />
              )}
              {isAdmin && isPaid && !isDelivered && <MarkAsDeliveredButton />}
             
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;