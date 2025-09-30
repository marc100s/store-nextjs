import { Metadata } from 'next';
import { auth } from '@/auth';
import { getUserById } from '@/lib/actions/user.actions';
import { getMyCart } from '@/lib/actions/cart.actions';
import PaymentMethodForm from './payment-method-form';
import CheckoutLayout from '@/components/shared/checkout/checkout-layout';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Select Payment Method',
};

const PaymentMethodPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error('User not found');

  const user = await getUserById(userId);
  const cart = await getMyCart();

  // Redirect if no cart or empty cart
  if (!cart || cart.items.length === 0) {
    redirect('/cart');
  }

  // Redirect if no shipping address
  if (!user.address) {
    redirect('/shipping-address');
  }

  return (
    <CheckoutLayout user={user} cart={cart}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Payment Method</h1>
          <p className="text-muted-foreground">
            Choose how you'd like to pay for your order.
          </p>
        </div>
        <PaymentMethodForm preferredPaymentMethod={user.paymentMethod} />
      </div>
    </CheckoutLayout>
  );
};

export default PaymentMethodPage;
