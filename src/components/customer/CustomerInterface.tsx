import { useState, useEffect } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { Product, getStockStatus, ProductCategory } from '@/types/inventory';
import { ProductCard } from '@/components/ui/ProductCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  ShoppingCart,
  AlertTriangle,
  XCircle,
  Search,
  LogOut,
  Package,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerInterfaceProps {
  onLogout: () => void;
}

export function CustomerInterface({ onLogout }: CustomerInterfaceProps) {
  useRealtimeSync();
  const { products } = useInventoryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [animatingProducts, setAnimatingProducts] = useState<Set<string>>(new Set());

  const outOfStock = products.filter((p) => p.currentStock === 0);
  const lowStock = products.filter(
    (p) => p.currentStock > 0 && p.currentStock <= p.minimumStock
  );
  const inStock = products.filter((p) => p.currentStock > p.minimumStock);

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

  // Listen for real-time updates and animate
  useEffect(() => {
    const channel = new BroadcastChannel('easymart-inventory');
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data.type === 'STOCK_UPDATE' || data.type === 'SALE') {
        const productId = data.productId || data.sale?.productId;
        if (productId) {
          setAnimatingProducts((prev) => new Set(prev).add(productId));
          setTimeout(() => {
            setAnimatingProducts((prev) => {
              const next = new Set(prev);
              next.delete(productId);
              return next;
            });
          }, 500);
        }
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
                <p className="text-sm text-muted-foreground">Customer View</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Alert Banners */}
        {outOfStock.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 animate-fade-in">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-danger flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-danger">Out of Stock Items</h3>
                <p className="text-sm text-muted-foreground">
                  {outOfStock.length} product{outOfStock.length > 1 ? 's are' : ' is'} currently unavailable
                </p>
              </div>
            </div>
          </div>
        )}

        {lowStock.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-warning/10 border border-warning/30 animate-fade-in">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-warning">Low Stock Warning</h3>
                <p className="text-sm text-muted-foreground">
                  {lowStock.length} product{lowStock.length > 1 ? 's are' : ' is'} running low
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <Package className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-success">{inStock.length}</div>
                <div className="text-sm text-muted-foreground">In Stock</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <AlertTriangle className="w-5 h-5 text-warning" />
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

        {/* Out of Stock Section */}
        {outOfStock.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-danger" />
              Out of Stock ({outOfStock.length})
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {outOfStock
                .filter((p) => filteredProducts.includes(p))
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isAnimating={animatingProducts.has(product.id)}
                  />
                ))}
            </div>
          </section>
        )}

        {/* Low Stock Section */}
        {lowStock.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Low Stock ({lowStock.length})
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {lowStock
                .filter((p) => filteredProducts.includes(p))
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isAnimating={animatingProducts.has(product.id)}
                  />
                ))}
            </div>
          </section>
        )}

        {/* In Stock Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-success" />
            In Stock ({filteredProducts.filter((p) => getStockStatus(p) === 'in-stock').length})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts
              .filter((p) => getStockStatus(p) === 'in-stock')
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAnimating={animatingProducts.has(product.id)}
                />
              ))}
          </div>
        </section>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
