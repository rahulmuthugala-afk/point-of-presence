import { create } from 'zustand';
import { Product, Sale, Alert, InventoryEvent, getStockStatus } from '@/types/inventory';
import { sampleProducts } from '@/data/sampleProducts';

interface InventoryState {
  products: Product[];
  sales: Sale[];
  alerts: Alert[];
  subscribers: ((event: InventoryEvent) => void)[];
  
  // Product actions
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  
  // Stock actions
  sellProduct: (productId: string, quantity: number, soldBy: string) => boolean;
  restockProduct: (productId: string, quantity: number) => void;
  
  // Alert actions
  resolveAlert: (alertId: string) => void;
  
  // Subscription for real-time updates
  subscribe: (callback: (event: InventoryEvent) => void) => () => void;
  broadcast: (event: InventoryEvent) => void;
  
  // Getters
  getProductByBarcode: (barcode: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  getActiveAlerts: () => Alert[];
  getOutOfStockProducts: () => Product[];
  getLowStockProducts: () => Product[];
}

// Generate alerts based on stock levels
function generateAlerts(products: Product[]): Alert[] {
  const alerts: Alert[] = [];
  products.forEach(product => {
    const status = getStockStatus(product);
    if (status === 'out-of-stock' || status === 'low-stock') {
      alerts.push({
        id: `alert-${product.id}-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        alertType: status === 'out-of-stock' ? 'out-of-stock' : 'low-stock',
        alertTimestamp: new Date().toISOString(),
        status: 'active',
      });
    }
  });
  return alerts;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: sampleProducts,
  sales: [],
  alerts: generateAlerts(sampleProducts),
  subscribers: [],

  addProduct: (product) => {
    set((state) => ({
      products: [...state.products, product],
    }));
    get().broadcast({ type: 'PRODUCT_ADD', product });
  },

  updateProduct: (product) => {
    set((state) => {
      const updatedProducts = state.products.map((p) =>
        p.id === product.id ? product : p
      );
      
      // Check if we need to update alerts
      const newAlerts = [...state.alerts];
      const status = getStockStatus(product);
      
      // Remove old alerts for this product
      const filteredAlerts = newAlerts.filter(a => a.productId !== product.id);
      
      // Add new alert if needed
      if (status === 'out-of-stock' || status === 'low-stock') {
        filteredAlerts.push({
          id: `alert-${product.id}-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          alertType: status === 'out-of-stock' ? 'out-of-stock' : 'low-stock',
          alertTimestamp: new Date().toISOString(),
          status: 'active',
        });
      }
      
      return {
        products: updatedProducts,
        alerts: filteredAlerts,
      };
    });
    get().broadcast({ type: 'PRODUCT_UPDATE', product });
  },

  deleteProduct: (productId) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== productId),
      alerts: state.alerts.filter((a) => a.productId !== productId),
    }));
    get().broadcast({ type: 'PRODUCT_DELETE', productId });
  },

  sellProduct: (productId, quantity, soldBy) => {
    const product = get().products.find((p) => p.id === productId);
    if (!product || product.currentStock < quantity) {
      return false;
    }

    const newStock = product.currentStock - quantity;
    const updatedProduct = { ...product, currentStock: newStock };

    const sale: Sale = {
      id: `sale-${Date.now()}`,
      productId,
      productName: product.name,
      quantitySold: quantity,
      saleTimestamp: new Date().toISOString(),
      soldBy,
    };

    set((state) => {
      const updatedProducts = state.products.map((p) =>
        p.id === productId ? updatedProduct : p
      );
      
      // Update alerts
      const newAlerts = [...state.alerts];
      const status = getStockStatus(updatedProduct);
      
      // Remove old alerts for this product
      const filteredAlerts = newAlerts.filter(a => a.productId !== productId);
      
      // Add new alert if needed
      if (status === 'out-of-stock' || status === 'low-stock') {
        filteredAlerts.push({
          id: `alert-${productId}-${Date.now()}`,
          productId,
          productName: product.name,
          alertType: status === 'out-of-stock' ? 'out-of-stock' : 'low-stock',
          alertTimestamp: new Date().toISOString(),
          status: 'active',
        });
      }
      
      return {
        products: updatedProducts,
        sales: [sale, ...state.sales],
        alerts: filteredAlerts,
      };
    });

    get().broadcast({ type: 'SALE', sale });
    get().broadcast({ type: 'STOCK_UPDATE', productId, newStock, soldQuantity: quantity });
    
    return true;
  },

  restockProduct: (productId, quantity) => {
    const product = get().products.find((p) => p.id === productId);
    if (!product) return;

    const newStock = product.currentStock + quantity;
    const updatedProduct = {
      ...product,
      currentStock: newStock,
      lastRestocked: new Date().toISOString().split('T')[0],
    };

    set((state) => {
      const updatedProducts = state.products.map((p) =>
        p.id === productId ? updatedProduct : p
      );
      
      // Update alerts - remove if stock is now sufficient
      const status = getStockStatus(updatedProduct);
      const filteredAlerts = state.alerts.filter(a => a.productId !== productId);
      
      if (status === 'out-of-stock' || status === 'low-stock') {
        filteredAlerts.push({
          id: `alert-${productId}-${Date.now()}`,
          productId,
          productName: product.name,
          alertType: status === 'out-of-stock' ? 'out-of-stock' : 'low-stock',
          alertTimestamp: new Date().toISOString(),
          status: 'active',
        });
      }
      
      return {
        products: updatedProducts,
        alerts: filteredAlerts,
      };
    });

    get().broadcast({ type: 'STOCK_UPDATE', productId, newStock });
  },

  resolveAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, status: 'resolved' as const } : a
      ),
    }));
  },

  subscribe: (callback) => {
    set((state) => ({
      subscribers: [...state.subscribers, callback],
    }));
    return () => {
      set((state) => ({
        subscribers: state.subscribers.filter((cb) => cb !== callback),
      }));
    };
  },

  broadcast: (event) => {
    // Use BroadcastChannel for cross-window communication
    const channel = new BroadcastChannel('easymart-inventory');
    channel.postMessage(event);
    channel.close();
    
    // Also notify local subscribers
    get().subscribers.forEach((callback) => callback(event));
  },

  getProductByBarcode: (barcode) => {
    return get().products.find((p) => p.barcode === barcode);
  },

  getProductById: (id) => {
    return get().products.find((p) => p.id === id);
  },

  getActiveAlerts: () => {
    return get().alerts.filter((a) => a.status === 'active');
  },

  getOutOfStockProducts: () => {
    return get().products.filter((p) => p.currentStock === 0);
  },

  getLowStockProducts: () => {
    return get().products.filter(
      (p) => p.currentStock > 0 && p.currentStock <= p.minimumStock
    );
  },
}));
