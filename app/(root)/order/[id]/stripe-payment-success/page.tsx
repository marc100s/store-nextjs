import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/actions/order.actions";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const SuccessPage = async (props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment_intent?: string; session_id?: string }>;
}) => {
  const { id } = await props.params;
  const { payment_intent: paymentIntentParam, session_id: sessionId } = await props.searchParams;

  // Fetch order
  const order = await getOrderById(id);
  if (!order) notFound();

  // Determine payment intent id from either direct param or checkout session
  let paymentIntentId = paymentIntentParam;
  if (!paymentIntentId && sessionId) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
  }

  if (!paymentIntentId) return redirect(`/order/${id}`);

  // Retrieve the payment intent
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  // Validate payment intent belongs to this order
  if (
    paymentIntent.metadata.orderId == null ||
    paymentIntent.metadata.orderId !== order.id.toString()
  ) {
    return notFound();
  }

  const isSuccess = paymentIntent.status === 'succeeded';
  if (!isSuccess) return redirect(`/order/${id}`);

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8">
      <div className="flex flex-col gap-6 items-center ">
        <h1 className="h1-bold">Thanks for your purchase</h1>
        <div>We are now processing your order.</div>
        <Button asChild>
          <Link href={`/order/${id}`}>View order</Link>
        </Button>
      </div>
    </div>
  );
};

export default SuccessPage;
