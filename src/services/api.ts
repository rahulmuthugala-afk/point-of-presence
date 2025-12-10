// API Service for SQLite Backend Communication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Product API types matching backend schema
export interface DBProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost_price: number | null;
  stock_quantity: number;
  reorder_level: number;
  image_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBSale {
  id: string;
  customer_id: string | null;
  cashier_id: string | null;
  total_amount: number;
  payment_method: string | null;
  status: string;
  created_at: string;
  item_count?: number;
}

export interface DBSaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Products API
export const productsApi = {
  getAll: () => apiRequest<DBProduct[]>('/products'),
  
  getById: (id: string) => apiRequest<DBProduct>(`/products/${id}`),
  
  create: (product: Omit<DBProduct, 'id' | 'created_at' | 'updated_at'>) =>
    apiRequest<DBProduct>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
  
  update: (id: string, product: Partial<DBProduct>) =>
    apiRequest<DBProduct>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),
  
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    }),
  
  getLowStock: () => apiRequest<DBProduct[]>('/products/inventory/low-stock'),
};

// Sales API
export const salesApi = {
  getAll: () => apiRequest<DBSale[]>('/sales'),
  
  getById: (id: string) => apiRequest<DBSale & { items: DBSaleItem[] }>(`/sales/${id}`),
  
  create: (sale: {
    cashier_id?: string;
    payment_method?: string;
    items: { product_id: string; quantity: number; unit_price: number }[];
  }) =>
    apiRequest<DBSale>('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    }),
  
  getDailySummary: () =>
    apiRequest<{ date: string; transaction_count: number; total_sales: number }[]>(
      '/sales/summary/daily'
    ),
};

// Inventory API
export const inventoryApi = {
  getLevels: () => apiRequest<DBProduct[]>('/inventory/levels'),
  
  getAlerts: () => apiRequest<DBProduct[]>('/inventory/alerts'),
  
  getMovements: () =>
    apiRequest<
      {
        id: string;
        product_id: string;
        movement_type: string;
        quantity: number;
        reference_type: string | null;
        reference_id: string | null;
        notes: string | null;
        created_at: string;
        product_name: string;
      }[]
    >('/inventory/movements'),
  
  restock: (productId: string, quantity: number, notes?: string) =>
    apiRequest<{ message: string; product: DBProduct }>('/inventory/restock', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity, notes }),
    }),
  
  adjust: (productId: string, quantity: number, notes?: string) =>
    apiRequest<{ message: string; product: DBProduct }>('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity, notes }),
    }),
};

// Users API
export const usersApi = {
  login: (username: string, password: string) =>
    apiRequest<{ id: string; username: string; role: string; name: string }>(
      '/users/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    ),
  
  getAll: () =>
    apiRequest<{ id: string; username: string; role: string; name: string }[]>('/users'),
};

// Health check
export const healthCheck = () =>
  apiRequest<{ status: string; timestamp: string; database: string }>('/health');
