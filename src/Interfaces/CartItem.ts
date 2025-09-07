interface productCartItem {
    id: string;
    name: string;
    price: number;
    discountPercentage: number;
    images: string[];
}
export interface CartItem {
    id: string;
    cart_id: string;
    product_id: string;
    quantity: number;
    products: productCartItem;
};