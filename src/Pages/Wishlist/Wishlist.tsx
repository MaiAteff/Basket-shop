import React, { useContext, useEffect, useState } from 'react'
import { product } from '../../Interfaces/IproductCard';
import Loading from '../../Components/Loading/Loading';
import ProductCard from '../../Components/ProductCard/ProductCard';
import { getWishlist } from '../../Apis/getWishlist';
import { User } from '../../Context/UserContext';
import { cartContext } from '../../Context/CartContext';
import { WishlistItem } from '../../Interfaces/WishlistItem';
import { ProductContext } from '../../Context/ProductContext';
import ProductDetails from '../../Components/ProductDetails/ProductDetails';

export default function Wishlist() {
  let [displayProducts, setDisplayProducts] = useState<WishlistItem[]>([]);
  let productContext = useContext(ProductContext);
  let { addToCart, updateQuantity } = useContext(cartContext)!;
  let { userId, auth } = useContext(User)!;
  let [isLoading, setLoading] = useState<boolean>(true);
  async function getData() {
    setLoading(true);
    let result = await getWishlist(userId, auth);
    setDisplayProducts(result);
    setLoading(false);
  }

  //get products api
  useEffect(() => {
    getData();
  }, []);
  return (
    <div className='w-[80%] mx-auto my-5'>

      {isLoading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ">
          {displayProducts.map((item) => {
            console.log('item ', item.products);

            return <div className=" h-full" key={item.id}>
              <ProductCard product={item.products} addProductToCart={addToCart} updateQuantity={updateQuantity} />
            </div>;
          })}
          {productContext?.productDetails ? <ProductDetails /> : ""}
        </div>
      )}
    </div>
  )
}
