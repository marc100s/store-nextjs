// export const dynamic = 'force-dynamic';

import { auth } from "@/auth";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getUserById } from "@/lib/actions/user.actions";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShippingAddress } from "@/types";
import ShippingAddressForm from './shipping-address-form';
import CheckoutSteps from "@/components/shared/checkout-steps";

export const metadata: Metadata = {
    title: 'Shipping Address',
};


const ShippingAddressPage = async () => {
    const cart = await getMyCart();
  
    if (!cart || cart.items.length === 0) redirect('/cart');
  
    const session = await auth();
  
    const userId = session?.user?.id;
  
    if (!userId) throw new Error('No user ID');
  
    const user = await getUserById(userId);
  
    return (
      <>
        <CheckoutSteps current={1} />
        <ShippingAddressForm address={user.address as ShippingAddress} />
      </>
    );
  };
  
  export default ShippingAddressPage;
// const ShippingAddressPage = async () => {
//     try {
//         // Fetch the cart
//         const cart = await getMyCart();

//         if (!cart || cart.items.length === 0) {
//             redirect('/cart');
//             return;
//         }
       
//         const session = await auth();
        
//         if (!session) {
//             redirect('/sign-in'); // Redirect to login page if no session is found
//             return;
//         }

//         const userId = session?.user?.id;
        
//         if (!userId) {
//             throw new Error('No user ID');
//         }

//         // Fetch user details by ID
//         const user = await getUserById(userId);
//         return (
//             <>
//             <CheckoutSteps current={1} />
//             <ShippingAddressForm address={user.address as ShippingAddress} />
//             </>
//         );
//     } catch (error) {
//         console.error('Error:', error);
//         // You can add additional error handling here if needed
//     }
// }

// export default ShippingAddressPage;