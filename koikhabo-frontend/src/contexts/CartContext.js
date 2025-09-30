import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem =>
        cartItem.id === item.id && cartItem.restaurant_id === item.restaurant_id
      );
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id && cartItem.restaurant_id === item.restaurant_id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeFromCart = (itemId, restaurantId) => {
    setCartItems(prev => prev.filter(item =>
      !(item.id === itemId && item.restaurant_id === restaurantId)
    ));
  };

  const updateQuantity = (itemId, restaurantId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId, restaurantId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId && item.restaurant_id === restaurantId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const getCartTotal = () => {
    return getTotalPrice();
  };

  const getItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getCartTotal,
      getItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
