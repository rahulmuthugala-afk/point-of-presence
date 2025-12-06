import { useState, useEffect } from 'react';
import { Product, ProductCategory } from '@/types/inventory';
import { X, Save, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const categories: ProductCategory[] = [
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

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Other',
    barcode: '',
    currentStock: 0,
    minimumStock: 10,
    price: 0,
    supplierInfo: '',
    lastRestocked: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.barcode?.trim()) {
      newErrors.barcode = 'Barcode is required';
    }
    if (formData.price === undefined || formData.price < 0) {
      newErrors.price = 'Valid price is required';
    }
    if (formData.currentStock === undefined || formData.currentStock < 0) {
      newErrors.currentStock = 'Valid stock amount is required';
    }
    if (formData.minimumStock === undefined || formData.minimumStock < 0) {
      newErrors.minimumStock = 'Valid minimum stock is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const productData: Product = {
      id: product?.id || `product-${Date.now()}`,
      name: formData.name!.trim(),
      category: formData.category as ProductCategory,
      barcode: formData.barcode!.trim(),
      currentStock: Number(formData.currentStock),
      minimumStock: Number(formData.minimumStock),
      price: Number(formData.price),
      supplierInfo: formData.supplierInfo?.trim() || '',
      lastRestocked: formData.lastRestocked || new Date().toISOString().split('T')[0],
    };

    onSave(productData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg mx-4 animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package className="w-5 h-5" />
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className={cn(
                'w-full px-4 py-2 rounded-lg bg-muted border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all',
                errors.name ? 'border-danger' : 'border-border focus:border-primary'
              )}
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-danger">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                name="category"
                value={formData.category || 'Other'}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Barcode</label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode || ''}
                onChange={handleChange}
                className={cn(
                  'w-full px-4 py-2 rounded-lg bg-muted border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono',
                  errors.barcode ? 'border-danger' : 'border-border focus:border-primary'
                )}
                placeholder="Enter barcode"
              />
              {errors.barcode && (
                <p className="mt-1 text-sm text-danger">{errors.barcode}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price || ''}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={cn(
                  'w-full px-4 py-2 rounded-lg bg-muted border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all',
                  errors.price ? 'border-danger' : 'border-border focus:border-primary'
                )}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Current Stock</label>
              <input
                type="number"
                name="currentStock"
                value={formData.currentStock || ''}
                onChange={handleChange}
                min="0"
                className={cn(
                  'w-full px-4 py-2 rounded-lg bg-muted border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all',
                  errors.currentStock ? 'border-danger' : 'border-border focus:border-primary'
                )}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Min. Stock</label>
              <input
                type="number"
                name="minimumStock"
                value={formData.minimumStock || ''}
                onChange={handleChange}
                min="0"
                className={cn(
                  'w-full px-4 py-2 rounded-lg bg-muted border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all',
                  errors.minimumStock ? 'border-danger' : 'border-border focus:border-primary'
                )}
                placeholder="10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Supplier Info</label>
            <input
              type="text"
              name="supplierInfo"
              value={formData.supplierInfo || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Enter supplier information"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-lg bg-secondary hover:bg-secondary/80 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-lg gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Save className="w-4 h-4" />
              {product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
