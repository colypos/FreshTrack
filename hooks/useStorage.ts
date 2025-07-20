import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Movement, Alert } from '@/types';

// Event emitter for data changes
class DataEventEmitter {
  private listeners: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

const dataEmitter = new DataEventEmitter();

// Export the dataEmitter for external use
export { dataEmitter };

export const useStorage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();

    // Listen for data changes
    const handleDataChange = () => {
      loadData();
    };

    dataEmitter.on('dataChanged', handleDataChange);

    return () => {
      dataEmitter.off('dataChanged', handleDataChange);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, movementsData, alertsData] = await Promise.all([
        AsyncStorage.getItem('products'),
        AsyncStorage.getItem('movements'),
        AsyncStorage.getItem('alerts'),
      ]);

      setProducts(productsData ? JSON.parse(productsData) : []);
      setMovements(movementsData ? JSON.parse(movementsData) : []);
      setAlerts(alertsData ? JSON.parse(alertsData) : []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProducts = async (newProducts: Product[]) => {
    try {
      await AsyncStorage.setItem('products', JSON.stringify(newProducts));
      setProducts(newProducts);
      dataEmitter.emit('dataChanged');
    } catch (error) {
      console.error('Error saving products:', error);
    }
  };

  const saveMovements = async (newMovements: Movement[]) => {
    try {
      await AsyncStorage.setItem('movements', JSON.stringify(newMovements));
      setMovements(newMovements);
      dataEmitter.emit('dataChanged');
    } catch (error) {
      console.error('Error saving movements:', error);
    }
  };

  const saveAlerts = async (newAlerts: Alert[]) => {
    try {
      await AsyncStorage.setItem('alerts', JSON.stringify(newAlerts));
      setAlerts(newAlerts);
      dataEmitter.emit('dataChanged');
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedProducts = [...products, newProduct];
    await saveProducts(updatedProducts);
    
    // Create initial movement if product has stock
    if (newProduct.currentStock > 0) {
      const initialMovement: Movement = {
        id: `${newProduct.id}-initial`,
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'in',
        quantity: newProduct.currentStock,
        reason: 'Anfangsbestand',
        user: 'System',
        timestamp: new Date().toISOString(),
        notes: 'Automatisch erstellt beim Anlegen des Produkts',
      };
      
      const updatedMovements = [initialMovement, ...movements];
      await saveMovements(updatedMovements);
    }
    
    // Check for alerts
    generateAlertsForProduct(newProduct);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const updatedProducts = products.map(product =>
      product.id === id
        ? { ...product, ...updates, updatedAt: new Date().toISOString() }
        : product
    );
    await saveProducts(updatedProducts);
    
    // Check for alerts for updated product
    const updatedProduct = updatedProducts.find(p => p.id === id);
    if (updatedProduct) {
      generateAlertsForProduct(updatedProduct);
    }
  };

  const deleteProduct = async (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    await saveProducts(updatedProducts);
    
    // Remove related alerts
    const updatedAlerts = alerts.filter(alert => alert.productId !== id);
    await saveAlerts(updatedAlerts);
  };

  const addMovement = async (movement: Omit<Movement, 'id' | 'timestamp'>) => {
    const newMovement: Movement = {
      ...movement,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    
    const updatedMovements = [newMovement, ...movements];
    await saveMovements(updatedMovements);
    
    // Update product stock
    if (movement.type === 'in') {
      await updateProduct(movement.productId, {
        currentStock: products.find(p => p.id === movement.productId)!.currentStock + movement.quantity
      });
    } else if (movement.type === 'out') {
      await updateProduct(movement.productId, {
        currentStock: products.find(p => p.id === movement.productId)!.currentStock - movement.quantity
      });
    } else if (movement.type === 'adjustment') {
      await updateProduct(movement.productId, {
        currentStock: movement.quantity
      });
    }
  };

  const generateAlertsForProduct = async (product: Product) => {
    const newAlerts: Alert[] = [];
    const now = new Date();
    
    // Parse German date format DD.MM.YYYY
    const parseGermanDate = (dateString: string) => {
      if (!dateString) return new Date();
      
      // Check if it's already in DD.MM.YYYY format
      const germanDateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
      const match = dateString.match(germanDateRegex);
      
      if (match) {
        const [, day, month, year] = match;
        // Create date with month-1 because JavaScript months are 0-indexed
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      
      // Fallback to standard Date parsing
      return new Date(dateString);
    };
    
    const expiryDate = parseGermanDate(product.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

    // Expiry alerts
    if (daysUntilExpiry < 0) {
      newAlerts.push({
        id: `${product.id}-expired`,
        type: 'expiry',
        severity: 'high',
        productId: product.id,
        productName: product.name,
        message: `Produkt ist abgelaufen`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    } else if (daysUntilExpiry === 0) {
      newAlerts.push({
        id: `${product.id}-expires-today`,
        type: 'expiry',
        severity: 'high',
        productId: product.id,
        productName: product.name,
        message: `Produkt läuft heute ab`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    } else if (daysUntilExpiry <= 3) {
      newAlerts.push({
        id: `${product.id}-expires-soon`,
        type: 'expiry',
        severity: 'medium',
        productId: product.id,
        productName: product.name,
        message: `Produkt läuft in ${daysUntilExpiry} Tagen ab`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }

    // Low stock alerts
    if (product.currentStock <= product.minStock) {
      newAlerts.push({
        id: `${product.id}-low-stock`,
        type: 'low_stock',
        severity: product.currentStock === 0 ? 'high' : 'medium',
        productId: product.id,
        productName: product.name,
        message: `Niedriger Bestand: ${product.currentStock} ${product.unit}`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }

    // Remove old alerts for this product and add new ones
    const filteredAlerts = alerts.filter(alert => 
      !alert.productId || alert.productId !== product.id
    );
    
    const updatedAlerts = [...filteredAlerts, ...newAlerts];
    await saveAlerts(updatedAlerts);
  };

  const acknowledgeAlert = async (alertId: string) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    );
    await saveAlerts(updatedAlerts);
  };

  return {
    products,
    movements,
    alerts,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    addMovement,
    acknowledgeAlert,
    generateAlertsForProduct,
  };
};