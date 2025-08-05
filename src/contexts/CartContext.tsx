import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "@/lib/axios";
import { useDispatch, useSelector } from "react-redux";
import {
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  clearCart as emptyCart,
  getAllCartItems,
} from "@/redux/slices/cartSlices";
import { v4 as uuidv4 } from "uuid";
import { RootState } from "@/redux/store";
import { toast } from "@/hooks/use-toast";

// === TYPES ===
export interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
  stock?: number; // Available stock for validation
}

export interface CartError {
  type: 'NETWORK' | 'VALIDATION' | 'AUTH' | 'STOCK' | 'UNKNOWN';
  message: string;
  details?: any;
}

export interface CartOperation {
  type: 'ADD' | 'REMOVE' | 'UPDATE' | 'CLEAR';
  itemId?: string;
  brand?: string;
  quantity?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity: number) => Promise<void>;
  removeFromCart: (id: string, brand: string) => Promise<void>;
  updateQuantity: (
    id: string,
    brand: string,
    quantity: number
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  loading: boolean;
  operationLoading: CartOperation | null;
  error: CartError | null;
  clearError: () => void;
  refreshCart: () => Promise<void>;
  isItemInCart: (id: string, brand: string) => boolean;
  getItemQuantity: (id: string, brand: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);



// === API CALLS ===
const fetchCart = async (customerId: string) => {
  try {
    const res = await axios.get(`/cart/${customerId}`);
    console.log('Fetched cart:', res.data);
    return res.data.cart;
  } catch (error: any) {
    console.error(
      "Failed to fetch cart:",
      error?.response?.data || error.message
    );
    throw {
      type: error?.response?.status === 401 ? 'AUTH' : 'NETWORK',
      message: error?.response?.data?.message || 'Failed to fetch cart',
      details: error
    } as CartError;
  }
};

const addToCartAPI = async (
  customerId: string,
  productId: string,
  brandName: string,
  quantity: number
) => {
  try {
    const res = await axios.post(`/cart/${customerId}/add`, {
      productId,
      brandName,
      quantity,
    });
    return res.data.cart;
  } catch (error: any) {
    const errorType = error?.response?.status === 400 ? 'VALIDATION' : 
                     error?.response?.status === 401 ? 'AUTH' : 
                     error?.response?.status === 422 ? 'STOCK' : 'NETWORK';
    
    throw {
      type: errorType,
      message: error?.response?.data?.message || 'Failed to add item to cart',
      details: error
    } as CartError;
  }
};

const updateCartAPI = async (
  customerId: string,
  productId: string,
  brandName: string,
  quantity: number
) => {
  try {
    const res = await axios.put(`/cart/${customerId}/update`, {
      productId,
      brandName,
      quantity,
    });
    return res.data.cart;
  } catch (error: any) {
    throw {
      type: error?.response?.status === 400 ? 'VALIDATION' : 'NETWORK',
      message: error?.response?.data?.message || 'Failed to update cart item',
      details: error
    } as CartError;
  }
};

const removeFromCartAPI = async (
  customerId: string,
  productId: string,
  brandName: string
) => {
  try {
    const res = await axios.delete(`/cart/${customerId}/remove`, {
      data: { productId, brandName },
    });
    return res.data.cart;
  } catch (error: any) {
    throw {
      type: 'NETWORK',
      message: error?.response?.data?.message || 'Failed to remove item from cart',
      details: error
    } as CartError;
  }
};

const clearCartAPI = async (customerId: string) => {
  try {
    const res = await axios.delete(`/cart/${customerId}/clear`);
    return res.data.cart;
  } catch (error: any) {
    throw {
      type: 'NETWORK',
      message: error?.response?.data?.message || 'Failed to clear cart',
      details: error
    } as CartError;
  }
};

// === PROVIDER ===
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [operationLoading, setOperationLoading] = useState<CartOperation | null>(null);
  const [error, setError] = useState<CartError | null>(null);

  const customerId = useSelector(
    (state: RootState) => state.customer.customer?._id
  );

  // === CART SYNCING ===
  const syncCart = useCallback((cart: any) => {
    const parsedItems = cart.items.map((item: any) => ({
      id: item.product._id,
      name: item.product.productName,
      brand: item.brandName,
      price: item.price,
      quantity: item.quantity,
      image: item.product.productImages?.[0],
      stock: item.stock || 0,
    }));
    setCartItems(parsedItems);
  }, []);

  // === ERROR HANDLING ===
  const handleError = useCallback((error: CartError) => {
    setError(error);
    
    // Show toast notification
    toast({
      title: "Cart Error",
      description: error.message,
      variant: "destructive",
    });

    // Auto-clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // === CART RECOVERY ===
  const recoverCart = useCallback(async () => {
    if (!customerId) return;

    try {
      const cart = await fetchCart(customerId);
      syncCart(cart);
      dispatch(getAllCartItems(cart));
    } catch (error: any) {
      console.error('Failed to recover cart:', error);
    }
  }, [customerId, syncCart, dispatch]);

  // === STOCK VALIDATION ===
  const validateStock = useCallback((itemId: string, brand: string, quantity: number) => {
    const existingItem = cartItems.find(item => item.id === itemId && item.brand === brand);
    if (existingItem && existingItem.stock && quantity > existingItem.stock) {
      throw {
        type: 'STOCK',
        message: `Only ${existingItem.stock} units available in stock`,
        details: { requested: quantity, available: existingItem.stock }
      } as CartError;
    }
  }, [cartItems]);

  // === OPTIMISTIC UPDATES ===
  const optimisticUpdate = useCallback((operation: CartOperation) => {
    switch (operation.type) {
      case 'ADD':
        if (operation.itemId && operation.brand && operation.quantity) {
          setCartItems(prev => {
            const existingIndex = prev.findIndex(item => 
              item.id === operation.itemId && item.brand === operation.brand
            );
            
            if (existingIndex >= 0) {
              // Update existing item
              const updated = [...prev];
              updated[existingIndex] = {
                ...updated[existingIndex],
                quantity: updated[existingIndex].quantity + operation.quantity!
              };
              return updated;
            } else {
              // Add new item (this would need the full item data)
              return prev;
            }
          });
        }
        break;
      
      case 'REMOVE':
        if (operation.itemId && operation.brand) {
          setCartItems(prev => 
            prev.filter(item => !(item.id === operation.itemId && item.brand === operation.brand))
          );
        }
        break;
      
      case 'UPDATE':
        if (operation.itemId && operation.brand && operation.quantity !== undefined) {
          setCartItems(prev => 
            prev.map(item => 
              item.id === operation.itemId && item.brand === operation.brand
                ? { ...item, quantity: operation.quantity! }
                : item
            )
          );
        }
        break;
      
      case 'CLEAR':
        setCartItems([]);
        break;
    }
  }, []);

  // === CART OPERATIONS ===
  const addToCart = async (item: Omit<CartItem, "quantity">, quantity: number) => {
    try {
      if (!customerId) {
        window.location.href = "/customer/login";
        return;
      }

      // Validate stock
      validateStock(item.id, item.brand, quantity);

      // Optimistic update
      const operation: CartOperation = { type: 'ADD', itemId: item.id, brand: item.brand, quantity };
      setOperationLoading(operation);
      optimisticUpdate(operation);

      const cart = await addToCartAPI(customerId, item.id, item.brand, quantity);
      
      dispatch(addItemToCart({ ...item, quantity, sessionId: cart.sessionId }));
      syncCart(cart);
      
      toast({
        title: "Added to Cart",
        description: `${item.name} added to cart`,
      });
      
    } catch (error: any) {
      // Revert optimistic update
      await refreshCart();
      handleError(error);
    } finally {
      setOperationLoading(null);
    }
  };

  const updateQuantity = async (id: string, brand: string, quantity: number) => {
    try {
      if (!customerId) {
        return;
      }

      // Optimistic update
      const operation: CartOperation = { type: 'UPDATE', itemId: id, brand, quantity };
      setOperationLoading(operation);
      optimisticUpdate(operation);

      const cart = await updateCartAPI(customerId, id, brand, quantity);
      dispatch(updateItemQuantity({ id, quantity }));
      syncCart(cart);
      
    } catch (error: any) {
      // Revert optimistic update
      await refreshCart();
      handleError(error);
    } finally {
      setOperationLoading(null);
    }
  };

  const removeFromCart = async (id: string, brand: string) => {
    try {
      if (!customerId) {
        return;
      }

      // Optimistic update
      const operation: CartOperation = { type: 'REMOVE', itemId: id, brand };
      setOperationLoading(operation);
      optimisticUpdate(operation);

      const cart = await removeFromCartAPI(customerId, id, brand);
      dispatch(removeItemFromCart(id));
      syncCart(cart);
      
      toast({
        title: "Removed from Cart",
        description: "Item removed from cart",
      });
      
    } catch (error: any) {
      // Revert optimistic update
      await refreshCart();
      handleError(error);
    } finally {
      setOperationLoading(null);
    }
  };

  const clearCart = async () => {
    try {
      if (!customerId) {
        return;
      }

      // Optimistic update
      const operation: CartOperation = { type: 'CLEAR' };
      setOperationLoading(operation);
      optimisticUpdate(operation);

      const cart = await clearCartAPI(customerId);
      dispatch(emptyCart());
      syncCart(cart);
      
      toast({
        title: "Cart Cleared",
        description: "All items removed from cart",
      });
      
    } catch (error: any) {
      // Revert optimistic update
      await refreshCart();
      handleError(error);
    } finally {
      setOperationLoading(null);
    }
  };

  // === UTILITY FUNCTIONS ===
  const getTotalPrice = useCallback(() =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0), [cartItems]);

  const getTotalItems = useCallback(() =>
    cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems]);

  const isItemInCart = useCallback((id: string, brand: string) =>
    cartItems.some(item => item.id === id && item.brand === brand), [cartItems]);

  const getItemQuantity = useCallback((id: string, brand: string) => {
    const item = cartItems.find(item => item.id === id && item.brand === brand);
    return item ? item.quantity : 0;
  }, [cartItems]);

  const refreshCart = useCallback(async () => {
    if (!customerId) return;
    
    try {
      setLoading(true);
      const cart = await fetchCart(customerId);
      syncCart(cart);
      dispatch(getAllCartItems(cart));
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [customerId, syncCart, dispatch, handleError]);

  // === EFFECTS ===
  useEffect(() => {
    if (customerId) {
      recoverCart();
    }
  }, [customerId, recoverCart]);

  // === RETRY MECHANISM ===
  useEffect(() => {
    if (error && error.type === 'NETWORK') {
      const retryTimeout = setTimeout(() => {
        refreshCart();
      }, 3000);
      
      return () => clearTimeout(retryTimeout);
    }
  }, [error, refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        loading,
        operationLoading,
        error,
        clearError,
        refreshCart,
        isItemInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// === HOOK ===
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};