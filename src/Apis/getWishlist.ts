import toast from "react-hot-toast";
import { api } from "../supabaseClient";

export async function getWishlist(userId: string | null, token: string | null){
    if (!userId) {
        toast.error("Please login first");
        return [];
    }
    try {
        const { data } = await api.get("/wishlist", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                user_id: `eq.${userId}`,
                select: "id,products(*)",
            },
        });
        return data?? [];
    } catch (error) {
        console.error("Error checking wishlist:", error);
        return [];
    }
};