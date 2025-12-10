import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useDatabase } from '@/hooks/useDatabase';
import { Product, Sale, Alert } from '@/types/inventory';
import { useInventoryStore } from '@/store/inventoryStore';

interface DatabaseContextType {
  products: Product[];
  sales: Sale[];
  alerts: Alert[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  sellProduct: (productId: string, quantity: number, soldBy: string) => Promise<boolean>;
  restockProduct: (productId: string, quantity: number) => Promise<void>;
  getProductByBarcode: (barcode: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  getActiveAlerts: () => Alert[];
  getOutOfStockProducts: () => Product[];
  getLowStockProducts: () => Product[];
  resolveAlert: (alertId: string) => void;
  refresh: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const database = useDatabase();
  const inventoryStore = useInventoryStore();

  // Sync database products to local store for offline/fallback support
  useEffect(() => {
    if (database.isConnected && database.products.length > 0) {
      // Broadcast updates for cross-window sync
      inventoryStore.broadcast({ 
        type: 'PRODUCT_UPDATE', 
        product: database.products[0] 
      });
    }
  }, [database.products, database.isConnected]);

  // If database is not connected, fall back to local store
  const contextValue: DatabaseContextType = database.isConnected
    ? database
    : {
        ...database,
        products: inventoryStore.products,
        sales: inventoryStore.sales,
        alerts: inventoryStore.alerts,
        addProduct: async (product) => {
          inventoryStore.addProduct(product);
        },
        updateProduct: async (product) => {
          inventoryStore.updateProduct(product);
        },
        deleteProduct: async (productId) => {
          inventoryStore.deleteProduct(productId);
        },
        sellProduct: async (productId, quantity, soldBy) => {
          return inventoryStore.sellProduct(productId, quantity, soldBy);
        },
        restockProduct: async (productId, quantity) => {
          inventoryStore.restockProduct(productId, quantity);
        },
        getProductByBarcode: inventoryStore.getProductByBarcode,
        getProductById: inventoryStore.getProductById,
        getActiveAlerts: inventoryStore.getActiveAlerts,
        getOutOfStockProducts: inventoryStore.getOutOfStockProducts,
        getLowStockProducts: inventoryStore.getLowStockProducts,
        resolveAlert: inventoryStore.resolveAlert,
        refresh: async () => {
          await database.refresh();
        },
      };

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabaseContext() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider');
  }
  return context;
}
