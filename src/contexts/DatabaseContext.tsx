import React, { createContext, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useDatabase } from '@/hooks/useDatabase';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { Product, Sale, Alert } from '@/types/inventory';
import { useInventoryStore } from '@/store/inventoryStore';

interface DatabaseContextType {
  products: Product[];
  sales: Sale[];
  alerts: Alert[];
  isLoading: boolean;
  isConnected: boolean;
  wsConnected: boolean;
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
  const { broadcast, wsConnected } = useRealtimeSync();

  // Wrap database operations to broadcast changes via WebSocket
  const addProductWithSync = useCallback(async (product: Product) => {
    await database.addProduct(product);
    broadcast({ type: 'PRODUCT_ADD', product });
  }, [database, broadcast]);

  const updateProductWithSync = useCallback(async (product: Product) => {
    await database.updateProduct(product);
    broadcast({ type: 'PRODUCT_UPDATE', product });
  }, [database, broadcast]);

  const deleteProductWithSync = useCallback(async (productId: string) => {
    await database.deleteProduct(productId);
    broadcast({ type: 'PRODUCT_DELETE', productId });
  }, [database, broadcast]);

  const sellProductWithSync = useCallback(async (
    productId: string,
    quantity: number,
    soldBy: string
  ): Promise<boolean> => {
    const result = await database.sellProduct(productId, quantity, soldBy);
    if (result) {
      const product = database.products.find(p => p.id === productId);
      if (product) {
        broadcast({
          type: 'STOCK_UPDATE',
          productId,
          newStock: product.currentStock - quantity,
        });
      }
    }
    return result;
  }, [database, broadcast]);

  const restockProductWithSync = useCallback(async (productId: string, quantity: number) => {
    await database.restockProduct(productId, quantity);
    const product = database.products.find(p => p.id === productId);
    if (product) {
      broadcast({
        type: 'STOCK_UPDATE',
        productId,
        newStock: product.currentStock + quantity,
      });
    }
  }, [database, broadcast]);

  // If database is not connected, fall back to local store
  const contextValue: DatabaseContextType = database.isConnected
    ? {
        ...database,
        wsConnected,
        addProduct: addProductWithSync,
        updateProduct: updateProductWithSync,
        deleteProduct: deleteProductWithSync,
        sellProduct: sellProductWithSync,
        restockProduct: restockProductWithSync,
      }
    : {
        ...database,
        wsConnected,
        products: inventoryStore.products,
        sales: inventoryStore.sales,
        alerts: inventoryStore.alerts,
        addProduct: async (product) => {
          inventoryStore.addProduct(product);
          broadcast({ type: 'PRODUCT_ADD', product });
        },
        updateProduct: async (product) => {
          inventoryStore.updateProduct(product);
          broadcast({ type: 'PRODUCT_UPDATE', product });
        },
        deleteProduct: async (productId) => {
          inventoryStore.deleteProduct(productId);
          broadcast({ type: 'PRODUCT_DELETE', productId });
        },
        sellProduct: async (productId, quantity, soldBy) => {
          const result = inventoryStore.sellProduct(productId, quantity, soldBy);
          if (result) {
            const product = inventoryStore.products.find(p => p.id === productId);
            if (product) {
              broadcast({
                type: 'STOCK_UPDATE',
                productId,
                newStock: product.currentStock - quantity,
              });
            }
          }
          return result;
        },
        restockProduct: async (productId, quantity) => {
          inventoryStore.restockProduct(productId, quantity);
          const product = inventoryStore.products.find(p => p.id === productId);
          if (product) {
            broadcast({
              type: 'STOCK_UPDATE',
              productId,
              newStock: product.currentStock + quantity,
            });
          }
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
