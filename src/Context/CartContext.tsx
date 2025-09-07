import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { api, supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import axios from "axios";
import { CartItem } from "../Interfaces/CartItem";
import { ICartContext } from "../Interfaces/CartContext";
import { User } from "../Context/UserContext";
// Create context with default undefined
export const cartContext = createContext<ICartContext | undefined>(undefined);

// Define props type
interface CartProviderProps {
  children: ReactNode;
}

type Cart = {
  id: string;
};

export default function CartContextProvider({ children }: CartProviderProps) {
  const [cartCount, setCartCount] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [cartId, setCartId] = useState<string>("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const userContext = useContext(User)!;

  // ensure cart exists
  useEffect(() => {
    const initUserCart = async () => {
      if (!userContext.userId || !userContext.auth) {
        setCartId("");
        setCartItems([]);
        setCartCount(0);
        return;
      }

      try {
        // Fetch existing cart
        const { data: carts } = await api.get<Cart[]>("/carts", {
          headers: {

            Authorization: `Bearer ${userContext.auth}`,
          },
          params: { user_id: `eq.${userContext.userId}`, select: "id" },
        });

        let cartId: string;

        if (carts && carts.length > 0) {
          cartId = carts[0]?.id;
        } else {
          // Create new cart only if none exists
          const { data: newCart } = await api.post<Cart[]>(
            "/carts",
            { user_id: userContext.userId },
            {
              headers: {

                Authorization: `Bearer ${userContext.auth}`,
                "Content-Type": "application/json",
              },
              params: {
                select: "id",
              },
            }
          );

          cartId = newCart[0]?.id;
        }

        setCartId(cartId);

        // Fetch cart items safely
        await fetchCartItems(cartId);
      } catch (error: any) {
        console.error("Failed");
      }
    };

    initUserCart();
  }, [userContext.auth, userContext.userId]);

  useEffect(() => {
    setTotalPrice(calculateTotalPrice(cartItems));
  }, [cartItems]);
  function calculateTotalPrice(items: CartItem[]) {
    return items.reduce((sum, item) => {
      const priceAfterDiscount =
        item.products.price *
        (1 - (item.products.discountPercentage ?? 0) / 100);

      return sum + item.quantity * priceAfterDiscount;
    }, 0);
  }
  async function fetchCartItems(cartIdParam?: string | null) {
    try {
      // Fetch CartItems
      const { data: cartItems } = await api.get<CartItem[]>("/cartItems", {
        headers: {

          Authorization: `Bearer ${userContext.auth}`,
        },
        params: {
          select:
            "id,quantity, products(id, name, price, discountPercentage, images)",
          cart_id: `eq.${cartIdParam ?? cartId}`,
        },
      });

      // Update CartItems, CartCount
      setCartItems(cartItems || []);
      setCartCount(cartItems?.length ?? 0);
      return cartItems;
    } catch (error) {
      console.error("Error fetching cart items:", error);
      return [];
    }
  }
  async function addToCart(productId: string, quantity?: number) {
    if (!userContext.auth) {
      toast.error("Please login first");
      return;
    }
    try {
      const { data: newItem } = await api.post<CartItem[]>(
        "/cartItems",
        { cart_id: cartId, product_id: productId, quantity: quantity ?? 1 },
        {
          headers: {
            Authorization: `Bearer ${userContext.auth}`,
            Prefer: "return=representation,resolution=merge-duplicates",
          },
          params: {
            select:
              "id,quantity, products(id, name, price, discountPercentage, images)",
          },
        }
      );
      toast.success("Product added successfully");
      // Update CartItems, CartCount
      setCartItems((prev) => [...prev, newItem[0]]);
      setCartCount((prev) => prev + 1);
    } catch (error) {
      toast.error("Faild");
    }
  }
  async function removeFromCart(itemId: string) {
    try {
      await api.delete("/cartItems", {
        headers: {

          Authorization: `Bearer ${userContext.auth}`,
        },
        params: { id: `eq.${itemId}` },
      });
      toast.success("Product removed successfully");
      // Update CartItems, CartCount
      setCartItems((prev) => prev.filter((cartItem) => cartItem.id !== itemId));
      setCartCount((prev) => prev - 1);
    } catch (error) {
      toast.error("Faild");
    }
  }
  async function clearCart() {
    try {
      const { data, status } = await api.delete("/cartItems", {
        headers: {

          Authorization: `Bearer ${userContext.auth}`,
        },
        params: {
          cart_id: `eq.${cartId}`, // delete this user's cart items
        },
      });

      if (status === 200 || status === 204) {
        // Update state only if deletion succeeded
        setCartItems([]);
        setCartCount(0);
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
      throw error;
    }
  }
  async function updateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity === 0) {
      await removeFromCart(itemId);
    } else {
      try {
        // Update in Supabase (cartItems table)
        const { data } = await api.patch(
          `/cartItems`,
          { quantity: newQuantity },
          {
            headers: {

              Authorization: `Bearer ${userContext.auth}`,
            },
            params: { id: `eq.${itemId}` }, // update where id = itemId
          }
        );
        toast.success("Quantity updated");
        // Update CartItems
        setCartItems((prev) =>
          prev.map((ci) =>
            ci.id === itemId ? { ...ci, quantity: newQuantity } : ci
          )
        );
      } catch (err) {
        toast.error("Failed to update quantity");
      }
    }
  }
  return (
    <cartContext.Provider
      value={{
        cartCount,
        setCartCount,
        addToCart,
        cartItems,
        totalPrice,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </cartContext.Provider>
  );
}
