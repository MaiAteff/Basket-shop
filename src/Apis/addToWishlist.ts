import toast from "react-hot-toast";
import { api } from "../supabaseClient";

export async function addToWishlist(
  product_id: string,
  user_id: string | null,
  token: string | null
) {
  if (!user_id) {
    toast.error("Please login first");
    return;
  }
  try {
    const { data } = await api.post(
      "/wishlist",
      { product_id, user_id },
      {
        headers: {

          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    toast.success("Product added to whishlist");
    return data[0].id;
  } catch (error) {
    toast.error("Something went wrong");
    return null;
  }
}
