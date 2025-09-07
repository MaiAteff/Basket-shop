import toast from "react-hot-toast";
import { api } from "../supabaseClient";

export const isInWishlist = async (
  userId: string | null,
  productId: string,
  token: string | null
) => {
  if (!userId) {
    return;
  }
  try {
    const { data } = await api.get("/wishlist", {
      headers: {

        Authorization: `Bearer ${token}`,
      },
      params: {
        user_id: `eq.${userId}`,
        product_id: `eq.${productId}`,
        select: "id",
      },
    });

    return data[0]?.id; // true if product exists
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return;
  }
};
