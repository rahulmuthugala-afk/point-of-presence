import { cn } from '@/lib/utils';
import { Product, getStockStatus } from '@/types/inventory';
import { StatusBadge } from './StatusBadge';
import { Package, AlertTriangle, XCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onEdit?: (product: Product) => void;
  onRestock?: (product: Product) => void;
  className?: string;
  isAnimating?: boolean;
}

export function ProductCard({
  product,
  variant = 'default',
  showActions = false,
  onEdit,
  onRestock,
  className,
  isAnimating = false,
}: ProductCardProps) {
  const status = getStockStatus(product);

  const cardGlow = {
    'in-stock': '',
    'low-stock': 'card-glow-warning border-warning/30',
    'out-of-stock': 'card-glow-danger border-danger/30',
  };

  const statusIcon = {
    'in-stock': <Package className="w-5 h-5 text-success" />,
    'low-stock': <AlertTriangle className="w-5 h-5 text-warning" />,
    'out-of-stock': <XCircle className="w-5 h-5 text-danger" />,
  };

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'bg-card rounded-lg p-3 border border-border transition-all duration-300',
          cardGlow[status],
          isAnimating && 'animate-stock-update',
          className
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {statusIcon[status]}
            <span className="font-medium truncate">{product.name}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-muted-foreground">
              {product.currentStock} units
            </span>
            <StatusBadge status={status} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-card rounded-xl p-5 border border-border transition-all duration-300 hover:border-primary/50',
        cardGlow[status],
        isAnimating && 'animate-stock-update',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {statusIcon[status]}
          <StatusBadge status={status} />
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
          {product.category}
        </span>
      </div>

      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Current Stock</span>
          <span className={cn(
            'font-semibold',
            status === 'out-of-stock' && 'text-danger',
            status === 'low-stock' && 'text-warning',
            status === 'in-stock' && 'text-success'
          )}>
            {product.currentStock} units
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Min. Stock Level</span>
          <span>{product.minimumStock} units</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Price</span>
          <span className="font-medium">LKR {product.price.toFixed(2)}</span>
        </div>
        {variant === 'detailed' && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Barcode</span>
              <span className="font-mono text-xs">{product.barcode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Supplier</span>
              <span className="truncate ml-2">{product.supplierInfo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Restocked</span>
              <span>{product.lastRestocked}</span>
            </div>
          </>
        )}
      </div>

      {showActions && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          {onEdit && (
            <button
              onClick={() => onEdit(product)}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              Edit
            </button>
          )}
          {onRestock && (
            <button
              onClick={() => onRestock(product)}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Restock
            </button>
          )}
        </div>
      )}
    </div>
  );
}
