// // project2/lib/cartUtils.tsx
// 'use client';

// import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// /**
//  * Cart Item Interface
//  * Defines the structure of items stored in the shopping cart
//  */
// interface CartItem {
//   id: string;        // Unique product identifier (e.g., "prod-123-50ml")
//   name: string;      // Product name
//   price: number;     // Product price per unit
//   image: string;     // Product image URL
//   size: string;      // Selected size (e.g., "50ml", "100ml")
//   quantity: number;  // Number of items
//   inStock: boolean;  // <--- NEW: Stock status when added to cart
// }

// /**
//  * Cart State Interface
//  * Defines the overall cart state structure
//  */
// interface CartState {
//   items: CartItem[];     // Array of cart items
//   total: number;         // Total price of all items
//   itemCount: number;     // Total number of items (sum of quantities)
// }

// /**
//  * Cart Action Types
//  * Defines all possible actions that can be performed on the cart
//  */
// type CartAction =
//   | { type: 'ADD_ITEM'; payload: CartItem }                           // Add new item to cart
//   | { type: 'REMOVE_ITEM'; payload: string }                         // Remove item by ID
//   | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } } // Update item quantity
//   | { type: 'CLEAR_CART' }                                          // Empty the cart
//   | { type: 'LOAD_CART'; payload: CartState };                      // Load cart from storage

// /**
//  * Cart Context Interface
//  * Defines the context API for cart operations
//  */
// interface CartContextType {
//   state: CartState;
//   dispatch: React.Dispatch<CartAction>;
//   // UPDATED: addToCart now explicitly accepts the full CartItem including quantity
//   addToCart: (item: CartItem) => void;
//   removeFromCart: (id: string) => void;
//   updateQuantity: (id: string, quantity: number) => void;
//   clearCart: () => void;
// }

// // Create the cart context
// const CartContext = createContext<CartContextType | undefined>(undefined);

// /**
//  * Cart Reducer Function
//  * Handles all cart state changes based on dispatched actions
//  *
//  * @param state - Current cart state
//  * @param action - Action to perform
//  * @returns New cart state
//  */
// const cartReducer = (state: CartState, action: CartAction): CartState => {
//   switch (action.type) {
//     case 'ADD_ITEM': {
//       // Check if item with same ID and size already exists
//       const existingItemIndex = state.items.findIndex(item => 
//         item.id === action.payload.id
//       );

//       if (existingItemIndex !== -1) {
//         // Update quantity of existing item
//         const updatedItems = state.items.map((item, index) =>
//           index === existingItemIndex
//             ? { ...item, quantity: item.quantity + action.payload.quantity }
//             : item
//         );

//         return {
//           ...state,
//           items: updatedItems,
//           total: calculateTotal(updatedItems),
//           itemCount: calculateItemCount(updatedItems)
//         };
//       } else {
//         // Add new item to cart
//         const updatedItems = [...state.items, action.payload];
//         return {
//           ...state,
//           items: updatedItems,
//           total: calculateTotal(updatedItems),
//           itemCount: calculateItemCount(updatedItems)
//         };
//       }
//     }

//     case 'REMOVE_ITEM': {
//       // Remove item by ID (removes all variants of the product)
//       const updatedItems = state.items.filter(item => item.id !== action.payload);
//       return {
//         ...state,
//         items: updatedItems,
//         total: calculateTotal(updatedItems),
//         itemCount: calculateItemCount(updatedItems)
//       };
//     }

//     case 'UPDATE_QUANTITY': {
//       // Update quantity of specific item
//       const updatedItems = state.items.map(item =>
//         item.id === action.payload.id
//           ? { ...item, quantity: action.payload.quantity }
//           : item
//       ).filter(item => item.quantity > 0); // Remove items with 0 quantity

//       return {
//         ...state,
//         items: updatedItems,
//         total: calculateTotal(updatedItems),
//         itemCount: calculateItemCount(updatedItems)
//       };
//     }

//     case 'CLEAR_CART':
//       // Empty the entire cart
//       return {
//         items: [],
//         total: 0,
//         itemCount: 0
//       };

//     case 'LOAD_CART':
//       // Load cart state from storage
//       return action.payload;

//     default:
//       return state;
//   }
// };

// /**
//  * Calculate total price of all items in cart
//  * @param items - Array of cart items
//  * @returns Total price
//  */
// const calculateTotal = (items: CartItem[]): number => {
//   return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
// };

// /**
//  * Calculate total number of items in cart
//  * @param items - Array of cart items
//  * @returns Total item count
//  */
// const calculateItemCount = (items: CartItem[]): number => {
//   return items.reduce((sum, item) => sum + item.quantity, 0);
// };

// /**
//  * Cart Provider Component
//  * Provides cart context to child components
//  * Handles localStorage persistence
//  *
//  * @param children - Child components that need access to cart
//  */
// export function CartProvider({ children }: { children: ReactNode }) {
//   // Initialize cart state with reducer
//   const [state, dispatch] = useReducer(cartReducer, {
//     items: [],
//     total: 0,
//     itemCount: 0
//   });

//   /**
//    * Load cart from localStorage on component mount
//    * This ensures cart persists across browser sessions
//    */
//   useEffect(() => {
//     const savedCart = localStorage.getItem('lumiere-cart');
//     if (savedCart) {
//       try {
//         const parsedCart = JSON.parse(savedCart);
//         // Ensure loaded cart items have the `inStock` property, defaulting to true if not present (for old data)
//         const sanitizedItems = parsedCart.items.map((item: any) => ({
//           ...item,
//           inStock: typeof item.inStock === 'boolean' ? item.inStock : true
//         }));
//         dispatch({ type: 'LOAD_CART', payload: { ...parsedCart, items: sanitizedItems } });
//       } catch (error) {
//         console.error('Error loading cart from localStorage:', error);
//         // Clear corrupted cart data
//         localStorage.removeItem('lumiere-cart');
//       }
//     }
//   }, []);

//   /**
//    * Save cart to localStorage whenever state changes
//    * This ensures cart persistence across browser sessions
//    */
//   useEffect(() => {
//     localStorage.setItem('lumiere-cart', JSON.stringify(state));
//   }, [state]);

//   /**
//    * Add item to cart
//    * @param item - Item to add (now includes quantity)
//    */
//   // UPDATED: addToCart now correctly uses the quantity from the passed item
//   const addToCart = (item: CartItem) => {
//     dispatch({ type: 'ADD_ITEM', payload: item });
//   };

//   /**
//    * Remove item from cart completely
//    * @param id - Item ID to remove
//    */
//   const removeFromCart = (id: string) => {
//     dispatch({ type: 'REMOVE_ITEM', payload: id });
//   };

//   /**
//    * Update quantity of specific item
//    * @param id - Item ID to update
//    * @param quantity - New quantity (if 0 or less, item is removed)
//    */
//   const updateQuantity = (id: string, quantity: number) => {
//     if (quantity <= 0) {
//       removeFromCart(id);
//     } else {
//       dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
//     }
//   };

//   /**
//    * Clear entire cart
//    */
//   const clearCart = () => {
//     dispatch({ type: 'CLEAR_CART' });
//   };

//   // Provide cart context to children
//   return (
//     <CartContext.Provider value={{
//       state,
//       dispatch,
//       addToCart,
//       removeFromCart,
//       updateQuantity,
//       clearCart
//     }}>
//       {children}
//     </CartContext.Provider>
//   );
// }

// /**
//  * Custom hook to use cart context
//  * Must be used within CartProvider
//  *
//  * @returns Cart context with state and methods
//  * @throws Error if used outside CartProvider
//  */
// export function useCart(): CartContextType {
//   const context = useContext(CartContext);
//   if (context === undefined) {
//     throw new Error('useCart must be used within a CartProvider');
//   }
//   return context;
// }

// /**
//  * Export types for use in other components
//  */
// export type { CartItem, CartState };
// project2/lib/cartUtils.tsx
'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

/**
 * Cart Item Interface
 * Defines the structure of items stored in the shopping cart
 */
interface CartItem {
  id: string;        // Unique product identifier (e.g., "prod-123-50ml")
  name: string;      // Product name
  price: number;     // Product price per unit
  image: string;     // Product image URL
  size: string;      // Selected size (e.g., "50ml", "100ml")
  quantity: number;  // Number of items
  inStock: boolean;  // Stock status when added to cart
  stock?: number;    // <--- NEW: Available stock quantity
}

/**
 * Cart State Interface
 * Defines the overall cart state structure
 */
interface CartState {
  items: CartItem[];     // Array of cart items
  total: number;         // Total price of all items
  itemCount: number;     // Total number of items (sum of quantities)
}

/**
 * Cart Action Types
 * Defines all possible actions that can be performed on the cart
 */
type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

/**
 * Cart Context Interface
 * Defines the context API for cart operations
 */
interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

// Create the cart context
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Cart Reducer Function
 * Handles all cart state changes based on dispatched actions
 *
 * @param state - Current cart state
 * @param action - Action to perform
 * @returns New cart state
 */
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Determine the maximum quantity that can be added based on product stock
      const availableStock = action.payload.stock !== undefined ? action.payload.stock : Infinity;

      const existingItemIndex = state.items.findIndex(item =>
        item.id === action.payload.id
      );

      if (existingItemIndex !== -1) {
        // Item already exists, update its quantity
        const existingItem = state.items[existingItemIndex];
        const newRequestedQuantity = existingItem.quantity + action.payload.quantity;
        // Cap the new quantity at available stock
        const finalQuantity = Math.min(newRequestedQuantity, availableStock);

        const updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: finalQuantity }
            : item
        );

        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems)
        };
      } else {
        // New item, add it to cart, capping initial quantity at stock
        const initialQuantity = Math.min(action.payload.quantity, availableStock);
        const updatedItems = [...state.items, { ...action.payload, quantity: initialQuantity }];

        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems)
        };
      }
    }

    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
        itemCount: calculateItemCount(updatedItems)
      };
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item => {
        if (item.id === action.payload.id) {
          const availableStock = item.stock !== undefined ? item.stock : Infinity;
          // Cap the requested quantity at available stock
          const finalQuantity = Math.min(action.payload.quantity, availableStock);
          return { ...item, quantity: finalQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0); // Remove items with 0 quantity

      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
        itemCount: calculateItemCount(updatedItems)
      };
    }

    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        itemCount: 0
      };

    case 'LOAD_CART':
      // Sanitize loaded cart items to ensure all properties, including new 'stock', are present
      const sanitizedLoadedItems = action.payload.items.map(item => ({
        ...item,
        inStock: typeof item.inStock === 'boolean' ? item.inStock : true,
        stock: typeof item.stock === 'number' ? item.stock : Infinity // Default to Infinity if stock is missing
      }));
      return { ...action.payload, items: sanitizedLoadedItems };

    default:
      return state;
  }
};

/**
 * Calculate total price of all items in cart
 * @param items - Array of cart items
 * @returns Total price
 */
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

/**
 * Calculate total number of items in cart
 * @param items - Array of cart items
 * @returns Total item count
 */
const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

/**
 * Cart Provider Component
 * Provides cart context to child components
 * Handles localStorage persistence
 *
 * @param children - Child components that need access to cart
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('lumiere-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('lumiere-cart');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lumiere-cart', JSON.stringify(state));
  }, [state]);

  const addToCart = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{
      state,
      dispatch,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Custom hook to use cart context
 * Must be used within CartProvider
 *
 * @returns Cart context with state and methods
 * @throws Error if used outside CartProvider
 */
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

/**
 * Export types for use in other components
 */
export type { CartItem, CartState };