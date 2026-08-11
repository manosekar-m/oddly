import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('oddly_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    localStorage.setItem('oddly_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, size) => {
    const sizeObj = product.sizes.find(s => s.size === size);
    const maxStock = sizeObj ? sizeObj.quantity : 1;

    setCart(prev => {
      const existing = prev.find(i => i.productId === product._id && i.size === size);
      if (existing) {
        // Don't exceed stock
        if (existing.quantity >= maxStock) return prev;
        return prev.map(i =>
          i.productId === product._id && i.size === size
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, {
        productId: product._id,
        name: product.name,
        price: product.discountedPrice,
        image: product.images[0],
        size,
        quantity: 1,
        maxStock, // ✅ Store max allowed quantity
      }];
    });
  };

  const updateQuantity = (productId, size, qty) => {
    if (qty <= 0) return removeFromCart(productId, size);
    setCart(prev => prev.map(i => {
      if (i.productId === productId && i.size === size) {
        // ✅ Never exceed maxStock
        const newQty = Math.min(qty, i.maxStock || qty);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const removeFromCart = (productId, size) => {
    setCart(prev => prev.filter(i => !(i.productId === productId && i.size === size)));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmount = coupon ? coupon.discount : 0;
  const finalTotal = cartTotal - discountAmount;

  const applyCoupon = (couponData) => setCoupon(couponData);
  const removeCoupon = () => setCoupon(null);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, updateQuantity, removeFromCart, clearCart, 
      cartCount, cartTotal, coupon, applyCoupon, removeCoupon, 
      discountAmount, finalTotal 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
