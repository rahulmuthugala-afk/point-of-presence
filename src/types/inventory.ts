// Product interface following OOP principles
export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  barcode: string;
  currentStock: number;
  minimumStock: number;
  price: number;
  supplierInfo: string;
  lastRestocked: string;
  imageUrl?: string;
}

export type ProductCategory = 
  | 'Rice' 
  | 'Lentils' 
  | 'Sugar' 
  | 'Beverages' 
  | 'Ice Cream' 
  | 'Dairy' 
  | 'Snacks' 
  | 'Cleaning' 
  | 'Personal Care'
  | 'Other';

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantitySold: number;
  saleTimestamp: string;
  soldBy: string;
}

export interface Alert {
  id: string;
  productId: string;
  productName: string;
  alertType: 'low-stock' | 'out-of-stock';
  alertTimestamp: string;
  status: 'active' | 'resolved';
}

export type UserRole = 'manager' | 'cashier' | 'customer';

export interface User {
  role: UserRole;
  name: string;
}

// Event types for real-time updates
export interface StockUpdateEvent {
  type: 'STOCK_UPDATE';
  productId: string;
  newStock: number;
  soldQuantity?: number;
}

export interface ProductUpdateEvent {
  type: 'PRODUCT_UPDATE';
  product: Product;
}

export interface ProductAddEvent {
  type: 'PRODUCT_ADD';
  product: Product;
}

export interface ProductDeleteEvent {
  type: 'PRODUCT_DELETE';
  productId: string;
}

export interface SaleEvent {
  type: 'SALE';
  sale: Sale;
}

export type InventoryEvent = 
  | StockUpdateEvent 
  | ProductUpdateEvent 
  | ProductAddEvent 
  | ProductDeleteEvent 
  | SaleEvent;

// Utility function to determine stock status
export function getStockStatus(product: Product): StockStatus {
  if (product.currentStock === 0) return 'out-of-stock';
  if (product.currentStock <= product.minimumStock) return 'low-stock';
  return 'in-stock';
}
