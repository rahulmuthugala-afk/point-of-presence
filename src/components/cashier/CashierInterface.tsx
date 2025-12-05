import { useState, useEffect } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { Product, Sale } from '@/types/inventory';
import { BarcodeScanner } from './BarcodeScanner';
import { ProductCard } from '@/components/ui/ProductCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  ShoppingCart,
  LogOut,
  Minus,
  Plus,
  Trash2,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStockStatus } from '@/types/inventory';
import { toast } from 'sonner';

interface CashierInterfaceProps {
  onLogout: () => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export function CashierInterface({ onLogout }: CashierInterfaceProps) {
  useRealtimeSync();
  const { products, sellProduct, getProductByBarcode, sales } = useInventoryStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastScanned, setLastScanned] = useState<Product | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const recentSales = sales.slice(0, 10);

  const handleBarcodeScan = (barcode: string) => {
    setScanError(null);
    const product = getProductByBarcode(barcode);

    if (!product) {
      setScanError(`Product not found: ${barcode}`);
      toast.error('Product not found', { description: `Barcode: ${barcode}` });
      return;
    }

    if (product.currentStock === 0) {
      setScanError(`${product.name} is out of stock`);
      toast.error('Out of stock', { description: product.name });
      return;
    }

    setLastScanned(product);
    addToCart(product);
    toast.success('Product added', { description: product.name });
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) {
          toast.warning('Maximum stock reached', {
            description: `Only ${product.currentStock} units available`,
          });
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQuantity = item.quantity + delta;
            if (newQuantity > item.product.currentStock) {
              toast.warning('Maximum stock reached');
              return item;
            }
            return { ...item, quantity: Math.max(0, newQuantity) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    let allSuccess = true;

    cart.forEach((item) => {
      const success = sellProduct(item.product.id, item.quantity, 'Cashier');
      if (!success) {
        allSuccess = false;
        toast.error(`Failed to process ${item.product.name}`);
      }
    });

    if (allSuccess) {
      toast.success('Sale completed!', {
        description: `Total: $${cartTotal.toFixed(2)}`,
      });
      setCart([]);
      setLastScanned(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card/80 backdrop-blur-lg border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg gradient-primary">
                <ShoppingCart className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Easy Mart</h1>
                <p className="text-sm text-muted-foreground">Cashier Terminal</p>
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
        </header>

        <div className="flex-1 p-6 overflow-auto">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Scanner Section */}
            <div className="space-y-6">
              <BarcodeScanner
                onScan={handleBarcodeScan}
                onManualEntry={handleBarcodeScan}
              />

              {scanError && (
                <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 flex items-center gap-3 animate-fade-in">
                  <XCircle className="w-5 h-5 text-danger flex-shrink-0" />
                  <p className="text-sm">{scanError}</p>
                </div>
              )}

              {lastScanned && (
                <div className="animate-slide-up">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Last Scanned
                  </h3>
                  <ProductCard product={lastScanned} variant="detailed" />
                </div>
              )}

              {/* Recent Sales */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Sales
                </h3>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {recentSales.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No sales yet
                    </p>
                  ) : (
                    recentSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium text-sm">{sale.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(sale.saleTimestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <span className="text-sm font-medium">
                          x{sale.quantitySold}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick Product Search */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Quick Add Products
              </h3>
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-auto">
                {products
                  .filter((p) => p.currentStock > 0)
                  .map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="p-3 rounded-lg bg-muted hover:bg-muted/80 text-left transition-colors"
                    >
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-success">
                          {product.currentStock} in stock
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <aside className="w-96 bg-card border-l border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Current Sale
            {cart.length > 0 && (
              <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            )}
          </h2>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Cart is empty</p>
              <p className="text-sm">Scan a product to begin</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-muted rounded-lg p-3 animate-fade-in"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.product.price.toFixed(2)} each
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-muted-foreground hover:text-danger transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="p-1 rounded bg-background hover:bg-secondary transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="p-1 rounded bg-background hover:bg-secondary transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-semibold">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Total & Checkout */}
        <div className="p-6 border-t border-border bg-muted/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium">Total</span>
            <span className="text-2xl font-bold">${cartTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={cn(
              'w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all',
              cart.length > 0
                ? 'gradient-success text-success-foreground hover:opacity-90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            <CreditCard className="w-5 h-5" />
            Complete Sale
          </button>
        </div>
      </aside>
    </div>
  );
}
