"use server";

import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from '@prisma/client';

// Calculate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(0.21 * itemsPrice),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};
export async function addItemToCart(data: CartItem) {
  try {
    // Check for the cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart Session not found");

    // Get session and userId
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // Get cart
    const cart = await getMyCart();

    // Parse and validate data item
    const item = cartItemSchema.parse(data);

    // Find product in DDBB
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });
    if (!product) throw new Error("Product not found");

    if (!cart) {
      // Create a new cart object
      const newCart = insertCartSchema.parse({
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calcPrice([item]),
      });

      // Add to DDBB
      await prisma.cart.create({
        data: newCart,
      });

      //Revalidate product page
      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} added to cart`,
      };
    } else {
      // Check if item is already in cart
      const existItem = (cart.items as CartItem[]).find((x) => x.productId === item.productId);

      if (existItem) {
        // Check stock
        if(product.stock < existItem.qty + 1) {
            throw new Error("Not enough stock");
        }
        // Increase qty
        (cart.items as CartItem[]).find((x) =>  x.productId === item.productId)!.qty = existItem.qty + 1              
        } else {
            // If item doesn't exist in cart
            // Check stock
            if (product.stock < 1) throw new Error("Not enough stock");
            // Add item to the cart.items
            cart.items.push(item);
        }
        
        // Save to DDBB
        await prisma.cart.update({
            where: { id: cart.id },
            data: {
                items: cart.items as Prisma.CartUpdateitemsInput[],
                ...calcPrice(cart.items as CartItem[]),
            }
        });

        revalidatePath(`/product/${product.slug}`);

        return {
            success: true,
            message: `${product.name} ${existItem ? 'updated in' : 'added to'} cart`,
        };
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyCart() {
  // Check for cart cookie - return undefined if not found instead of throwing
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) return undefined;

  // Get session and user ID
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  // Get user cart from database
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });

  if (!cart) return undefined;

  // Convert decimals and return
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}

export async function removeItemfromCart(productId: string) {
  try {
    // Check for the cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart Session not found");

    // Get Product
    const product = await prisma.product.findFirst({
        where: { id: productId },
    });
    if(!product) throw new Error("Product not found");

    // Get user cart
    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    // Check for item 
    const exist = (cart.items as CartItem[]).find((x) => x.productId === productId);
    if (!exist) throw new Error("Item not found");

    //  Check if only 1 in qty
    if(exist.qty === 1) {
        // Remove item from cart
        cart.items = (cart.items as CartItem[]).filter((x) => x.productId !== exist.productId);
    } else {
        // Decresea qty
        (cart.items as CartItem[]).find((x) =>  x.productId === exist.productId)!.qty = exist.qty - 1;
    }

    // Update card in DDBB
    await prisma.cart.update({
        where: { id: cart.id },
        data: {
            items: cart.items as Prisma.CartUpdateitemsInput[],
            ...calcPrice(cart.items as CartItem[]),
        }
    });

    // Revalidate product page
    revalidatePath(`/product/${product.slug}`);

    return ({
        success: true,
        message: `${product.name} was removed from cart`,
    })

  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}