import CartTable from "./cart-table";
import { getMyCart } from "@/lib/actions/cart.actions";
import CheckoutLayout from "@/components/shared/checkout/checkout-layout";
import { auth } from "@/auth";
import { getUserById } from "@/lib/actions/user.actions";

export const metadata = {
    title: "Shopping Cart",
};

const cartPage = async  () => {
    const cart = await getMyCart();
    const session = await auth();
    
    let user = null;
    if (session?.user?.id) {
        try {
            user = await getUserById(session.user.id);
        } catch (error) {
            // User not found, continue without user data
            console.log('User not found:', error);
        }
    }
    
    return (
      <CheckoutLayout user={user} cart={cart}>
        <CartTable cart={cart}/>
      </CheckoutLayout> 
    );
}
 
export default cartPage;
