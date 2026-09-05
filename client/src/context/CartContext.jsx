import { createContext, useContext, useMemo, useState } from 'react';
const CartContext = createContext(null);
export function CartProvider({ children }) {
  const [cart, setCart] = useState({ restaurant: null, items: [] });
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    const id = Date.now();
    setToast({ id, message });
    setTimeout(() => {
      setToast((current) => (current && current.id === id ? null : current));
    }, 2200);
  };

  const addItem = (item) => {
    setCart((current) => {
      if (current.restaurant && current.restaurant._id !== item.restaurant._id) {
        const replace = window.confirm('Your cart contains items from another restaurant. Start a new cart?');
        if (!replace) return current;
        return { restaurant: item.restaurant, items: [{ ...item, quantity: 1 }] };
      }
      const existing = current.items.find(i => i._id === item._id);
      const items = existing
        ? current.items.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...current.items, { ...item, quantity: 1 }];
      return { restaurant: current.restaurant || item.restaurant, items };
    });
    showToast(`Added ${item.name} to cart`);
  };
  const updateQuantity = (id, quantity) => setCart((current) => ({
    ...current,
    items: current.items.map(i => i._id === id ? { ...i, quantity: Math.max(1, Number(quantity)) } : i)
  }));
  const removeItem = (id) => setCart((current) => ({ ...current, items: current.items.filter(i => i._id !== id) }));
  const clearCart = () => setCart({ restaurant: null, items: [] });
  const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const total = cart.items.reduce((sum, i) => {
    const price = Math.round(i.price * (1 - (i.discountPercent || 0) / 100));
    return sum + price * i.quantity;
  }, 0);
  const value = useMemo(() => ({ cart, count, total, addItem, updateQuantity, removeItem, clearCart, toast, showToast }), [cart, count, total, toast]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);