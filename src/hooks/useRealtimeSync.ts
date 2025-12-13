import { useEffect, useCallback } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import { InventoryEvent, Product } from '@/types/inventory';
import { useWebSocket } from './useWebSocket';

export function useRealtimeSync() {
  const { products } = useInventoryStore();

  const handleInventoryEvent = useCallback((data: InventoryEvent) => {
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
  }, []);

  // Connect to WebSocket for cross-device sync
  const { send: wsSend, isConnected: wsConnected } = useWebSocket(handleInventoryEvent);

  // Also keep BroadcastChannel for same-device sync (faster)
  useEffect(() => {
    const channel = new BroadcastChannel('easymart-inventory');

    const handleMessage = (event: MessageEvent<InventoryEvent>) => {
      handleInventoryEvent(event.data);
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [handleInventoryEvent]);

  // Broadcast function that sends to both WebSocket and BroadcastChannel
  const broadcast = useCallback((event: InventoryEvent) => {
    // Send via BroadcastChannel for same-device sync
    const channel = new BroadcastChannel('easymart-inventory');
    channel.postMessage(event);
    channel.close();

    // Send via WebSocket for cross-device sync
    wsSend(event);
  }, [wsSend]);

  return { products, broadcast, wsConnected };
}
