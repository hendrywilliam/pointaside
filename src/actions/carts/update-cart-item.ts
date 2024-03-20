"use server";
import { db } from "@/db/core";
import { eq } from "drizzle-orm";
import { CartItem } from "@/types";
import { Cart, carts } from "@/db/schema";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateCartItemAction(itemId: number, quantity: number) {
  const cartId = cookies().get("cart_id")?.value;

  if (isNaN(Number(cartId))) {
    throw new Error("Invalid cart id. Try again later.");
  }

  const cart = (await db.query.carts.findFirst({
    where: eq(carts.id, Number(cartId)),
  })) as Cart;

  const cartItems = (cart.items as CartItem[]) ?? [];

  const targetItem = cartItems.find((cartItem) => cartItem.id === itemId);

  if (!targetItem) {
    throw new Error("Item does not exist in cart. Please try again later.");
  }

  const targetItemDetails =
    targetItem &&
    (await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.id, targetItem.id),
    }));

  if (!targetItemDetails) {
    throw new Error("Item does not exist in store. Please try again later.");
  }

  const filteredItem =
    targetItem && cartItems.filter((item) => item.id !== targetItem.id);

  if (quantity > 0) {
    await db
      .update(carts)
      .set({
        items: cartItems && [
          ...filteredItem,
          {
            ...targetItem,
            qty:
              targetItemDetails &&
              quantity + targetItem.qty > targetItemDetails.stock
                ? targetItemDetails.stock
                : quantity,
          },
        ],
      })
      .where(eq(carts.id, Number(cartId)));
  } else {
    await db
      .update(carts)
      .set({
        items: [...filteredItem],
      })
      .where(eq(carts.id, Number(cartId)));
  }

  revalidatePath("/");
}
