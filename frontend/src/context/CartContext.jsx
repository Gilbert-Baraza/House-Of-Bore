import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from './AuthContext';

const CartContext = createContext();
const getCartStorageKey = (customerId) => (customerId ? `cart_customer_${customerId}` : 'cart_guest');
const getCartItemKey = (item) => [
  item.id || item._id,
  item.selectedColor || '',
  item.selectedSize || ''
].join(':');

const readCartFromStorage = (storageKey) => {
  const savedCart = localStorage.getItem(storageKey);

  try {
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    localStorage.removeItem(storageKey);
    return [];
  }
};

const mergeCartCollections = (baseCart, incomingCart) => {
  const mergedMap = new Map();

  [...baseCart, ...incomingCart].forEach((item) => {
    const itemKey = getCartItemKey(item);
    const existingItem = mergedMap.get(itemKey);

    if (existingItem) {
      mergedMap.set(itemKey, {
        ...existingItem,
        quantity: existingItem.quantity + item.quantity
      });
      return;
    }

    mergedMap.set(itemKey, { ...item });
  });

  return Array.from(mergedMap.values());
};

const CartProvider = ({ children }) => {
  const { customer } = useContext(AuthContext);
  const [storageKey, setStorageKey] = useState(() => getCartStorageKey(null));
  const [cart, setCart] = useState(() => readCartFromStorage(getCartStorageKey(null)));
  const [cartReady, setCartReady] = useState(true);
  const previousCustomerIdRef = useRef(customer?.id || null);

  useEffect(() => {
    const previousCustomerId = previousCustomerIdRef.current;
    const nextCustomerId = customer?.id || null;
    const nextStorageKey = getCartStorageKey(customer?.id);
    const guestStorageKey = getCartStorageKey(null);
    const isGuestToAccountTransition = !previousCustomerId && Boolean(nextCustomerId);

    setCartReady(false);
    setStorageKey(nextStorageKey);

    const nextStoredCart = readCartFromStorage(nextStorageKey);

    if (isGuestToAccountTransition) {
      const guestCart = readCartFromStorage(guestStorageKey);
      const mergedCart = mergeCartCollections(nextStoredCart, guestCart);

      localStorage.setItem(nextStorageKey, JSON.stringify(mergedCart));
      localStorage.removeItem(guestStorageKey);
      setCart(mergedCart);
    } else {
      setCart(nextStoredCart);
    }

    previousCustomerIdRef.current = nextCustomerId;
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
