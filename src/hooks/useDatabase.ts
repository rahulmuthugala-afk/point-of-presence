import { useState, useEffect, useCallback } from 'react';
import { productsApi, salesApi, inventoryApi, DBProduct } from '@/services/api';
import { Product, Sale, Alert, getStockStatus, ProductCategory } from '@/types/inventory';
import { toast } from 'sonner';

// Convert DB product to frontend Product type
function dbToProduct(dbProduct: DBProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: (dbProduct.category as ProductCategory) || 'Other',
    barcode: dbProduct.sku,
    currentStock: dbProduct.stock_quantity,
    minimumStock: dbProduct.reorder_level,
    price: dbProduct.price,
    supplierInfo: dbProduct.description || '',
    lastRestocked: dbProduct.updated_at.split('T')[0],
    imageUrl: dbProduct.image_url || undefined,
  };
}

// Convert frontend Product to DB format
function productToDb(product: Product): Partial<DBProduct> {
  return {
    name: product.name,
    sku: product.barcode,
    category: product.category,
    price: product.price,
    stock_quantity: product.currentStock,
    reorder_level: product.minimumStock,
    description: product.supplierInfo,
    image_url: product.imageUrl || null,
  };
}

// Generate alerts from products
function generateAlerts(products: Product[]): Alert[] {
  const alerts: Alert[] = [];
  products.forEach((product) => {
    const status = getStockStatus(product);
    if (status === 'out-of-stock' || status === 'low-stock') {
      alerts.push({
        id: `alert-${product.id}`,
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

export function useDatabase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all products from database
  const fetchProducts = useCallback(async () => {
    try {
      const dbProducts = await productsApi.getAll();
      const frontendProducts = dbProducts.map(dbToProduct);
      setProducts(frontendProducts);
      setAlerts(generateAlerts(frontendProducts));
      setIsConnected(true);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to connect to database');
      setIsConnected(false);
    }
  }, []);

  // Fetch sales
  const fetchSales = useCallback(async () => {
    try {
      const dbSales = await salesApi.getAll();
      const frontendSales: Sale[] = dbSales.map((s) => ({
        id: s.id,
        productId: '',
        productName: `${s.item_count || 0} items`,
        quantitySold: s.item_count || 0,
        saleTimestamp: s.created_at,
        soldBy: s.cashier_id || 'Unknown',
      }));
      setSales(frontendSales);
    } catch (err) {
      console.error('Failed to fetch sales:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchProducts(), fetchSales()]);
      setIsLoading(false);
    };
    init();
  }, [fetchProducts, fetchSales]);

  // Add product
  const addProduct = useCallback(async (product: Product) => {
    try {
      const dbData = productToDb(product);
      await productsApi.create(dbData as any);
      await fetchProducts();
      toast.success('Product added successfully');
    } catch (err) {
      toast.error('Failed to add product');
      throw err;
    }
  }, [fetchProducts]);

  // Update product
  const updateProduct = useCallback(async (product: Product) => {
    try {
      const dbData = productToDb(product);
      await productsApi.update(product.id, dbData);
      await fetchProducts();
      toast.success('Product updated successfully');
    } catch (err) {
      toast.error('Failed to update product');
      throw err;
    }
  }, [fetchProducts]);

  // Delete product
  const deleteProduct = useCallback(async (productId: string) => {
    try {
      await productsApi.delete(productId);
      await fetchProducts();
      toast.success('Product deleted successfully');
    } catch (err) {
      toast.error('Failed to delete product');
      throw err;
    }
  }, [fetchProducts]);

  // Sell product
  const sellProduct = useCallback(async (
    productId: string,
    quantity: number,
    soldBy: string
  ): Promise<boolean> => {
    const product = products.find((p) => p.id === productId);
    if (!product || product.currentStock < quantity) {
      toast.error('Insufficient stock');
      return false;
    }

    try {
      await salesApi.create({
        cashier_id: soldBy,
        payment_method: 'cash',
        items: [
          {
            product_id: productId,
            quantity,
            unit_price: product.price,
          },
        ],
      });
      await Promise.all([fetchProducts(), fetchSales()]);
      toast.success('Sale completed successfully');
      return true;
    } catch (err) {
      toast.error('Failed to process sale');
      return false;
    }
  }, [products, fetchProducts, fetchSales]);

  // Restock product
  const restockProduct = useCallback(async (productId: string, quantity: number) => {
    try {
      await inventoryApi.restock(productId, quantity);
      await fetchProducts();
      toast.success('Product restocked successfully');
    } catch (err) {
      toast.error('Failed to restock product');
      throw err;
    }
  }, [fetchProducts]);

  // Get product by barcode
  const getProductByBarcode = useCallback(
    (barcode: string) => products.find((p) => p.barcode === barcode),
    [products]
  );

  // Get product by ID
  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  // Get active alerts
  const getActiveAlerts = useCallback(
    () => alerts.filter((a) => a.status === 'active'),
    [alerts]
  );

  // Get out of stock products
  const getOutOfStockProducts = useCallback(
    () => products.filter((p) => p.currentStock === 0),
    [products]
  );

  // Get low stock products
  const getLowStockProducts = useCallback(
    () => products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minimumStock),
    [products]
  );

  // Resolve alert
  const resolveAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'resolved' as const } : a))
    );
  }, []);

  // Refresh data
  const refresh = useCallback(async () => {
    await Promise.all([fetchProducts(), fetchSales()]);
  }, [fetchProducts, fetchSales]);

  return {
    products,
    sales,
    alerts,
    isLoading,
    isConnected,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    sellProduct,
    restockProduct,
    getProductByBarcode,
    getProductById,
    getActiveAlerts,
    getOutOfStockProducts,
    getLowStockProducts,
    resolveAlert,
    refresh,
  };
}
