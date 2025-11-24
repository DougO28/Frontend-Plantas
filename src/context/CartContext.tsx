// CartContext
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CatalogoPilon } from '../types';

interface CartItem {
  planta: CatalogoPilon;
  cantidad: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (planta: CatalogoPilon, cantidad: number) => void;
  removeItem: (plantaId: number) => void;
  updateQuantity: (plantaId: number, cantidad: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Cargar del localStorage al iniciar
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Guardar en localStorage cuando cambie el carrito
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (planta: CatalogoPilon, cantidad: number) => {
    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => item.planta.id === planta.id);
      
      if (existingIndex >= 0) {
        // Si ya existe, actualizar cantidad
        const newItems = [...prevItems];
        newItems[existingIndex].cantidad += cantidad;
        return newItems;
      } else {
        // Si no existe, agregar nuevo
        return [...prevItems, { planta, cantidad }];
      }
    });
  };

  const removeItem = (plantaId: number) => {
    setItems(prevItems => prevItems.filter(item => item.planta.id !== plantaId));
  };

  const updateQuantity = (plantaId: number, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(plantaId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.planta.id === plantaId 
          ? { ...item, cantidad } 
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.cantidad, 0);
  };

  const getTotalPrice = () => {
    return items.reduce(
      (total, item) => total + parseFloat(item.planta.precio_unitario) * item.cantidad,
      0
    );
  };

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};