import { useEffect, useCallback } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import { InventoryEvent, Product } from '@/types/inventory';

export function useRealtimeSync() {
  const { products } = useInventoryStore();

  useEffect(() => {
    const channel = new BroadcastChannel('easymart-inventory');

    const handleMessage = (event: MessageEvent<InventoryEvent>) => {
      const data = event.data;
      const state = useInventoryStore.getState();

      switch (data.type) {
        case 'STOCK_UPDATE':
          useInventoryStore.setState({
            products: state.products.map((p) =>
              p.id === data.productId
                ? { ...p, currentStock: data.newStock }
                : p
            ),
          });
          break;

        case 'PRODUCT_UPDATE':
          useInventoryStore.setState({
            products: state.products.map((p) =>
              p.id === data.product.id ? data.product : p
            ),
          });
          break;

        case 'PRODUCT_ADD':
          if (!state.products.find((p) => p.id === data.product.id)) {
            useInventoryStore.setState({
              products: [...state.products, data.product],
            });
          }
          break;

        case 'PRODUCT_DELETE':
          useInventoryStore.setState({
            products: state.products.filter((p) => p.id !== data.productId),
          });
          break;

        case 'SALE':
          if (!state.sales.find((s) => s.id === data.sale.id)) {
            useInventoryStore.setState({
              sales: [data.sale, ...state.sales],
            });
          }
          break;
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, []);

  return { products };
}
