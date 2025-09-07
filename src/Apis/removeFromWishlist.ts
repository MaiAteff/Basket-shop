import toast from "react-hot-toast";
import { api } from "../supabaseClient";

export async function removeFromWishlist(
  wishlistId: string,
  token: string | null
) {
  try {
    await api.delete("/wishlist", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: { id: `eq.${wishlistId}` },
    });

    toast.success("Product removed from whishlist");
  } catch (error) {
    toast.error("Something went wrong");
  }
}
