import React, { createContext, useState, useEffect } from 'react';

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    console.log(savedCart);
    try {
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      localStorage.removeItem('cart'); // Remove the invalid item
      return [];
    }
  });


  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    const productKey = product.id || product._id;
    const existingProduct = cart.find(item => (item.id || item._id) === productKey);
    if (existingProduct) {
      setCart(cart.map(item => (item.id || item._id) === productKey ? { ...item, quantity: item.quantity + product.quantity } : item));
    } else {
      setCart([...cart, product]);
    }
  };

  const updateQuantity = (productId, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        (item.id || item._id) === productId ? { ...item, quantity: quantity } : item
      )
    );
  };


  const removeFromCart = (id) => {
    setCart(cart.filter((product) => (product.id || product._id) !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export { CartProvider, CartContext };
