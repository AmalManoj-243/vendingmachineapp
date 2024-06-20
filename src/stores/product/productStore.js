import { create } from 'zustand';

const useProductStore = create((set) => ({
  products: [],
  addProduct: (product) => set((state) => {
    const exists = state.products.some((p) => p.id === product.id);
    if (!exists) {
      return { products: [...state.products, product] };
    } else {
      const updatedProducts = state.products.map((p) =>
        p.id === product.id ? { ...p, quantity: product.quantity, price: product.price } : p
      );
      return { products: updatedProducts };
    }
  }),
  removeProduct: (productId) => set((state) => ({
    products: state.products.filter((product) => product.id !== productId),
  })),
  clearProducts: () => set({ products: [] }),
}));

export default useProductStore;
