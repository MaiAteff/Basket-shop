import toast from "react-hot-toast";
import { IOrder } from "../Interfaces/Order";
import { api } from "../supabaseClient";
import { CartItem } from "../Interfaces/CartItem";

type Order = {
  id: string;
};
export async function addOrder(
  order: IOrder,
  setLoading: Function,
  token: string | null,
  userId: string | null,
  clearCart: Function
) {
  try {
    setLoading(true);
    const { data } = await api.post<Order[]>(
      "/orders",
      { ...order.orderData, user_id: userId },
      {
        headers: {

          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: { select: "id" },
      }
    );
    let orderId = data[0].id;
    // Adjusting cartItmes
    const fixedItems = order.cartItems.map((item: CartItem) => {
      if (item.quantity > item.products.quantity) {
        toast.error(`${item.products.name} stock reduced. Adjusting cart.`);
        return { ...item, quantity: item.products.quantity };
      }
      return item;
    });
    // cartItems it to orderItems
    const orderItems = order.cartItems.map((item) => ({
      order_id: orderId,
      product_id: item.products.id,
      quantity: item.quantity,
      price: (
        item.products.price *
        (1 - item?.products?.discountPercentage / 100)
      ).toFixed(2),
    }));

    await api.post("/orderItems", orderItems, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    clearCart();
    toast.success("Order placed successfully");
  } catch (error) {
    toast.error("Something went wrong");
  } finally {
    setLoading(false);
  }
}
