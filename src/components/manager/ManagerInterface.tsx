import { useState, useEffect } from 'react';
import { useDatabaseContext } from '@/contexts/DatabaseContext';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { Product, Alert, getStockStatus, ProductCategory } from '@/types/inventory';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductForm } from './ProductForm';
import { RestockModal } from './RestockModal';
import { DatabaseStatus } from '@/components/ui/DatabaseStatus';
import {
  ShoppingCart,
  LogOut,
  Bell,
  Package,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Filter,
  TrendingDown,
  CheckCircle,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ManagerInterfaceProps {
  onLogout: () => void;
}

export function ManagerInterface({ onLogout }: ManagerInterfaceProps) {
  useRealtimeSync();
  const {
    products,
    alerts,
    isLoading,
    isConnected,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    restockProduct,
    resolveAlert,
    getActiveAlerts,
    getOutOfStockProducts,
    getLowStockProducts,
    refresh,
  } = useDatabaseContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const activeAlerts = getActiveAlerts();
  const outOfStock = getOutOfStockProducts();
  const lowStock = getLowStockProducts();

  const categories: (ProductCategory | 'All')[] = [
    'All',
    'Rice',
    'Lentils',
    'Sugar',
    'Beverages',
    'Ice Cream',
    'Dairy',
    'Snacks',
    'Cleaning',
    'Personal Care',
    'Other',
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveProduct = async (product: Product) => {
    try {
      if (editingProduct) {
        await updateProduct(product);
      } else {
        await addProduct(product);
      }
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (err) {
      // Error toast is handled by the database hook
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      await deleteProduct(product.id);
    }
  };

  const handleRestock = async (productId: string, quantity: number) => {
    await restockProduct(productId, quantity);
  };

  // Listen for new alerts
  useEffect(() => {
    const channel = new BroadcastChannel('easymart-inventory');
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data.type === 'STOCK_UPDATE' && data.newStock === 0) {
        toast.error('Product out of stock!', {
          description: 'Check notifications for details',
        });
      }
    };
    channel.addEventListener('message', handleMessage);
    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg gradient-primary">
                <ShoppingCart className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Easy Mart</h1>
                <p className="text-sm text-muted-foreground">Manager Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Database Status */}
              <DatabaseStatus 
                isConnected={isConnected} 
                isLoading={isLoading}
                error={error}
              />

              {/* Refresh Button */}
              <button
                onClick={refresh}
                disabled={isLoading}
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
              </button>

              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {activeAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-danger text-xs font-bold flex items-center justify-center animate-pulse">
                    {activeAlerts.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>

              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="fixed top-20 right-4 z-50 w-96 bg-card rounded-xl border border-border shadow-2xl animate-slide-up">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-sm text-primary hover:underline"
            >
              Close
            </button>
          </div>
          <div className="max-h-96 overflow-auto">
            {activeAlerts.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No active alerts</p>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'p-4 border-b border-border flex items-start gap-3',
                    alert.alertType === 'out-of-stock' && 'bg-danger/5',
                    alert.alertType === 'low-stock' && 'bg-warning/5'
                  )}
                >
                  {alert.alertType === 'out-of-stock' ? (
                    <XCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{alert.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.alertType === 'out-of-stock'
                        ? 'Out of stock'
                        : 'Running low on stock'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.alertTimestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const product = products.find((p) => p.id === alert.productId);
                      if (product) setRestockingProduct(product);
                    }}
                    className="text-xs px-2 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                  >
                    Restock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm text-muted-foreground">Total Products</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-success">
                  {products.filter((p) => getStockStatus(p) === 'in-stock').length}
                </div>
                <div className="text-sm text-muted-foreground">In Stock</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <TrendingDown className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">{lowStock.length}</div>
                <div className="text-sm text-muted-foreground">Low Stock</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-danger/20">
                <XCircle className="w-5 h-5 text-danger" />
              </div>
              <div>
                <div className="text-2xl font-bold text-danger">{outOfStock.length}</div>
                <div className="text-sm text-muted-foreground">Out of Stock</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Banners */}
        {outOfStock.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 animate-pulse-glow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-danger" />
                <div>
                  <h3 className="font-semibold text-danger">
                    Critical: {outOfStock.length} product{outOfStock.length > 1 ? 's' : ''} out of stock!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {outOfStock.map((p) => p.name).join(', ')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNotifications(true)}
                className="px-4 py-2 rounded-lg bg-danger text-danger-foreground font-medium hover:opacity-90 transition-opacity"
              >
                View All
              </button>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products by name or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ProductCategory | 'All')}
              className="px-4 py-3 rounded-lg bg-card border border-border focus:border-primary focus:outline-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard
                product={product}
                variant="detailed"
                showActions
                onEdit={() => {
                  setEditingProduct(product);
                  setShowProductForm(true);
                }}
                onRestock={() => setRestockingProduct(product)}
              />
              <button
                onClick={() => handleDeleteProduct(product)}
                className="absolute top-2 right-2 p-2 rounded-lg bg-danger/20 text-danger opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger/30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or add a new product
            </p>
            <button
              onClick={() => setShowProductForm(true)}
              className="px-6 py-2 rounded-lg gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Add Product
            </button>
          </div>
        )}
      </main>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Restock Modal */}
      {restockingProduct && (
        <RestockModal
          product={restockingProduct}
          onRestock={handleRestock}
          onClose={() => setRestockingProduct(null)}
        />
      )}
    </div>
  );
}
