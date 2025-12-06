import { cn } from '@/lib/utils';
import { StockStatus } from '@/types/inventory';

interface StatusBadgeProps {
  status: StockStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    'in-stock': {
      label: 'In Stock',
      className: 'status-badge status-in-stock',
    },
    'low-stock': {
      label: 'Low Stock',
      className: 'status-badge status-low-stock',
    },
    'out-of-stock': {
      label: 'Out of Stock',
      className: 'status-badge status-out-of-stock',
    },
  };

  const config = statusConfig[status];

  return (
    <span className={cn(config.className, className)}>
      {config.label}
    </span>
  );
}
