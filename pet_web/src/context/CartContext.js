import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const { user } = useContext(AuthContext);
  
  // Key for localStorage will include user ID if logged in
  const getCartKey = () => {
    return user ? `cart_${user.id}` : 'cart_guest';
  };

  // Load cart from localStorage when component mounts or user changes
  useEffect(() => {
    const loadCart = () => {
      const cartKey = getCartKey();
      const storedCart = localStorage.getItem(cartKey);
      
      if (storedCart) {
        try {
          const parsedCart = JSON.parse(storedCart);
          setCartItems(parsedCart);
        } catch (error) {
          console.error(`Error parsing cart from localStorage for ${cartKey}:`, error);
          localStorage.removeItem(cartKey);
        }
      } else {
        // Reset cart when switching users
        setCartItems([]);
      }
    };
    
    loadCart();
  }, [user]); // Re-run when user changes

  // Update cart total whenever cartItems changes
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCartTotal(total);
    
    // Save to localStorage with user-specific key
    if (cartItems.length > 0) {
      localStorage.setItem(getCartKey(), JSON.stringify(cartItems));
    } else {
      localStorage.removeItem(getCartKey());
    }
  }, [cartItems, user]);

  // Add item to cart
  const addToCart = (product, quantity = 1, option = null) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart (with same productId and option)
      const existingItemIndex = prevItems.findIndex(
        item => item.productId === product.productId && item.option === option
      );

      if (existingItemIndex !== -1) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        // Item doesn't exist, add new item
        return [...prevItems, {
          productId: product.productId,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity,
          option
        }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId, option = null) => {
    setCartItems(prevItems => 
      prevItems.filter(item => 
        !(item.productId === productId && item.option === option)
      )
    );
  };

  // Update item quantity
  const updateQuantity = (productId, quantity, option = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, option);
      return;
    }

    setCartItems(prevItems => 
      prevItems.map(item => 
        (item.productId === productId && item.option === option)
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(getCartKey());
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      itemCount: cartItems.reduce((count, item) => count + item.quantity, 0)
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;