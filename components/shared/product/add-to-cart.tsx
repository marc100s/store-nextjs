"use client";
import { Button } from "@/components/ui/button";
import { CartItem, Cart } from "@/types";
import { useRouter } from "next/navigation";
import { Plus, Minus, Loader} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { addItemToCart, removeItemfromCart } from "@/lib/actions/cart.actions";
import { useTransition } from "react";

const AddToCart = ({ cart, item }: { cart?: Cart, item: CartItem }) => {
  const router = useRouter();
  const { toast } = useToast();

  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
    startTransition(async () => {
      // Execute the addItemToCart action
      const res = await addItemToCart(item);
  
      // Display appropriate toast message based on the result
      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        });
        return;
      }
  
      toast({
        description: `${item.name} added to the cart`,
        action: (
          <ToastAction
            className='bg-primary text-white hover:bg-gray-800'
            onClick={() => router.push('/cart')}
            altText='Go to cart'
          >
            Go to cart
          </ToastAction>
        ),
      });
    });
  };
   
  // Check if item is already in cart
  const existItem = cart && cart.items.find((x) => x.productId === item.productId);

  // Handle remove from cart
  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemfromCart(item.productId);
  
      toast({
        variant: res.success ? 'default' : 'destructive',
        description: res.message,
      });
  
      return;
    });
  };
  
  return existItem ? (
    <div>
      <Button
        type='button'
        variant='outline'
        disabled={isPending}
        onClick={handleRemoveFromCart}
      >
        {isPending ? (
          <Loader className='w-4 h-4  animate-spin' />
        ) : (
          <Minus className='w-4 h-4' />
        )}
      </Button>
      <span className='px-2'>{existItem.qty}</span>
      <Button
        type='button'
        variant='outline'
        disabled={isPending}
        onClick={handleAddToCart}
      >
        {isPending ? (
          <Loader className='w-4 h-4 animate-spin' />
        ) : (
          <Plus className='w-4 h-4' />
        )}
      </Button>
    </div>
  ) : (
    <Button
      className='w-full'
      type='button'
      disabled={isPending}
      onClick={handleAddToCart}
    >
      {isPending ? (
        <Loader className='w-4 h-4 animate-spin' />
      ) : (
        <Plus className='w-4 h-4' />
      )}
      Add to cart
    </Button>
  );
};


export default AddToCart;