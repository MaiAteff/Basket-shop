import toast from "react-hot-toast";
import { IOrder } from "../Interfaces/Order";
import { api } from "../supabaseClient";

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
    // if(order.cartItems.some((item) => item.quantity > item.products.quantity)){
    //   toast.error("Something went wrong");
    //   return;
    // }
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
