import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';

const CartContext = createContext();
const getCartStorageKey = (customerId) => (customerId ? `cart_customer_${customerId}` : 'cart_guest');

const readCartFromStorage = (storageKey) => {
  const savedCart = localStorage.getItem(storageKey);

  try {
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    localStorage.removeItem(storageKey);
    return [];
  }
};

const CartProvider = ({ children }) => {
  const { customer } = useContext(AuthContext);
  const [storageKey, setStorageKey] = useState(() => getCartStorageKey(null));
  const [cart, setCart] = useState(() => readCartFromStorage(getCartStorageKey(null)));
  const [cartReady, setCartReady] = useState(true);

  useEffect(() => {
    const nextStorageKey = getCartStorageKey(customer?.id);
    setCartReady(false);
    setStorageKey(nextStorageKey);
    setCart(readCartFromStorage(nextStorageKey));
    setCartReady(true);
  }, [customer?.id]);

  useEffect(() => {
    if (!cartReady) {
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart, cartReady, storageKey]);

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
