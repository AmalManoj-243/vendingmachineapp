import { create } from 'zustand';

const useProductStore = create((set, get) => ({
  currentCustomerId: null,
  cartItems: {}, // Object: {customerId: [...items]}
  
  // Set current customer
  setCurrentCustomer: (customerId) => set({ currentCustomerId: customerId }),
  
  // Get current customer's cart
  getCurrentCart: () => {
    const { currentCustomerId, cartItems } = get();
    return cartItems[currentCustomerId] || [];
  },
  
  // Backward compatibility - returns current customer's products
  get products() {
    return get().getCurrentCart();
  },
  
  addProduct: (product) => set((state) => {
    const { currentCustomerId } = state;
    if (!currentCustomerId) return state;

    // Enforce single-item cart: replace any existing items with the new one
    const newPriceUnit = typeof product.price_unit !== 'undefined'
      ? product.price_unit
      : (typeof product.price !== 'undefined' ? product.price : (product.price_unit ?? product.price ?? 0));
    const newPrice = typeof product.price !== 'undefined' ? product.price : (product.price ?? newPriceUnit);
    const subtotal = 1 * Number(newPriceUnit);

    const prod = {
      ...product,
      quantity: 1,
      qty: 1,
      price: newPrice,
      price_unit: newPriceUnit,
      price_subtotal: subtotal,
      price_subtotal_incl: subtotal,
    };

    return {
      ...state,
      cartItems: {
        ...state.cartItems,
        [currentCustomerId]: [prod]
      }
    };
  }),
  
  removeProduct: (productId) => set((state) => {
    const { currentCustomerId } = state;
    if (!currentCustomerId) return state;
    
    const currentCart = state.cartItems[currentCustomerId] || [];
    return {
      ...state,
      cartItems: {
        ...state.cartItems,
        [currentCustomerId]: currentCart.filter((product) => product.id !== productId)
      }
    };
  }),
  
  clearProducts: () => set((state) => {
    const { currentCustomerId } = state;
    if (!currentCustomerId) return state;
    
    return {
      ...state,
      cartItems: {
        ...state.cartItems,
        [currentCustomerId]: []
      }
    };
  }),
  
  // Load customer cart (from API or localStorage)
  loadCustomerCart: (customerId, cartData) => set((state) => ({
    ...state,
    currentCustomerId: customerId,
    cartItems: {
      ...state.cartItems,
      [customerId]: cartData || []
    }
  })),
  
  // Clear all carts
  clearAllCarts: () => set({ cartItems: {}, currentCustomerId: null }),
}));

export default useProductStore;
