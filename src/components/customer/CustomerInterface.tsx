import { useState, useEffect } from 'react';
import { useDatabaseContext } from '@/contexts/DatabaseContext';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { Product, ProductCategory } from '@/types/inventory';
import { ProductCard } from '@/components/ui/ProductCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DatabaseStatus } from '@/components/ui/DatabaseStatus';
import {
  ShoppingCart,
  Search,
  Package,
  Filter,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerInterfaceProps {
  onLogout?: () => void;
}

export function CustomerInterface({ onLogout }: CustomerInterfaceProps) {
  useRealtimeSync();
  const { products, isLoading, isConnected, error, refresh } = useDatabaseContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [animatingProducts, setAnimatingProducts] = useState<Set<string>>(new Set());

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

  const filteredProducts = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Get stock status priority: out of stock = 0, low stock = 1, in stock = 2
      const getStockPriority = (product: Product) => {
        if (product.currentStock === 0) return 0; // Out of stock - highest priority (top)
        if (product.currentStock <= product.minimumStock) return 1; // Low stock
        return 2; // In stock - lowest priority (bottom)
      };
      return getStockPriority(a) - getStockPriority(b);
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

            <div className="flex items-center gap-4">
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
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </button>

              <span className="text-sm text-muted-foreground">Live Stock Display</span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[2000px] mx-auto px-6 py-8">
        {/* Search and Filter - Optimized for widescreen */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
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

        {/* All Products - Grid optimized for widescreen displays */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Package className="w-7 h-7 text-primary" />
            Products ({filteredProducts.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {filteredProducts.map((product) => (
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
