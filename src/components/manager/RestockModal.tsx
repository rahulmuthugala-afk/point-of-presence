import { useState } from 'react';
import { Product } from '@/types/inventory';
import { X, Package, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RestockModalProps {
  product: Product;
  onRestock: (productId: string, quantity: number) => void;
  onClose: () => void;
}

export function RestockModal({ product, onRestock, onClose }: RestockModalProps) {
  const [quantity, setQuantity] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity > 0) {
      onRestock(product.id, quantity);
      onClose();
    }
  };

  const quickAmounts = [10, 25, 50, 100];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-full max-w-md mx-4 animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Restock Product
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-muted rounded-lg p-4 mb-6">
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Current stock: <span className="font-medium">{product.currentStock}</span> units
            </p>
            <p className="text-sm text-muted-foreground">
              Minimum stock: <span className="font-medium">{product.minimumStock}</span> units
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Quantity to Add
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-center text-2xl font-bold"
              />
            </div>

            <div className="flex gap-2 mb-6">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setQuantity(amount)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                    quantity === amount
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-secondary'
                  )}
                >
                  +{amount}
                </button>
              ))}
            </div>

            <div className="bg-success/10 border border-success/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm">New stock level:</span>
                <span className="text-xl font-bold text-success">
                  {product.currentStock + quantity} units
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-lg bg-secondary hover:bg-secondary/80 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-lg gradient-success text-success-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Add Stock
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
