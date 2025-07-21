/**
 * Zentraler Storage-Hook für die FreshTrack Anwendung
 * 
 * Verwaltet alle Daten (Produkte, Bewegungen, Warnungen) mit AsyncStorage
 * und stellt eine einheitliche API für Datenzugriff und -manipulation bereit.
 * 
 * Features:
 * - Automatische Datensynchronisation zwischen Komponenten
 * - Event-basierte Datenaktualisierung
 * - Automatische Warnungsgenerierung
 * - Vollständige CRUD-Operationen für alle Datentypen
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Movement, Alert } from '@/types';

/**
 * Event-Emitter für Datenänderungen
 * 
 * Ermöglicht die Kommunikation zwischen verschiedenen Komponenten
 * bei Datenänderungen ohne direkte Abhängigkeiten.
 */
class DataEventEmitter {
  private listeners: { [key: string]: Function[] } = {};

  /**
   * Registriert einen Event-Listener
   * @param event - Name des Events
   * @param callback - Callback-Funktion
   */
  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Entfernt einen Event-Listener
   * @param event - Name des Events
   * @param callback - Zu entfernende Callback-Funktion
   */
  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Löst ein Event aus und benachrichtigt alle Listener
   * @param event - Name des Events
   * @param data - Optionale Daten für das Event
   */
  emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

const dataEmitter = new DataEventEmitter();

// Export für externe Nutzung
export { dataEmitter };

/**
 * Haupthook für Datenverwaltung
 * 
 * @returns Objekt mit allen Daten und Manipulationsfunktionen
 */
export const useStorage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();

    // Event-Listener für Datenänderungen registrieren
    const handleDataChange = () => {
      loadData();
    };

    dataEmitter.on('dataChanged', handleDataChange);

    return () => {
      dataEmitter.off('dataChanged', handleDataChange);
    };
  }, []);

  /**
   * Lädt alle Daten aus dem AsyncStorage
   * 
   * Lädt Produkte, Bewegungen und Warnungen parallel und
   * aktualisiert den Ladezustand entsprechend.
   */
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

  /**
   * Speichert Produkte im AsyncStorage und löst Datenänderungs-Event aus
   * @param newProducts - Array der zu speichernden Produkte
   */
  const saveProducts = async (newProducts: Product[]) => {
    try {
      await AsyncStorage.setItem('products', JSON.stringify(newProducts));
      setProducts(newProducts);
      dataEmitter.emit('dataChanged');
    } catch (error) {
      console.error('Error saving products:', error);
    }
  };

  /**
   * Speichert Bewegungen im AsyncStorage und löst Datenänderungs-Event aus
   * @param newMovements - Array der zu speichernden Bewegungen
   */
  const saveMovements = async (newMovements: Movement[]) => {
    try {
      await AsyncStorage.setItem('movements', JSON.stringify(newMovements));
      setMovements(newMovements);
      dataEmitter.emit('dataChanged');
    } catch (error) {
      console.error('Error saving movements:', error);
    }
  };

  /**
   * Speichert Warnungen im AsyncStorage und löst Datenänderungs-Event aus
   * @param newAlerts - Array der zu speichernden Warnungen
   */
  const saveAlerts = async (newAlerts: Alert[]) => {
    try {
      await AsyncStorage.setItem('alerts', JSON.stringify(newAlerts));
      setAlerts(newAlerts);
      dataEmitter.emit('dataChanged');
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  };

  /**
   * Fügt ein neues Produkt zum Inventar hinzu
   * 
   * Generiert automatisch ID und Zeitstempel, erstellt eine Anfangsbewegung
   * falls Bestand vorhanden ist, und generiert entsprechende Warnungen.
   * 
   * @param product - Produktdaten ohne ID, createdAt und updatedAt
   */
  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedProducts = [...products, newProduct];
    await saveProducts(updatedProducts);
    
    // Erstelle Anfangsbewegung falls Bestand vorhanden
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
    
    // Prüfe und generiere Warnungen für das neue Produkt
    generateAlertsForProduct(newProduct);
  };

  /**
   * Aktualisiert ein bestehendes Produkt
   * 
   * @param id - ID des zu aktualisierenden Produkts
   * @param updates - Teilweise Produktdaten für die Aktualisierung
   */
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const updatedProducts = products.map(product =>
      product.id === id
        ? { ...product, ...updates, updatedAt: new Date().toISOString() }
        : product
    );
    await saveProducts(updatedProducts);
    
    // Prüfe Warnungen für das aktualisierte Produkt
    const updatedProduct = updatedProducts.find(p => p.id === id);
    if (updatedProduct) {
      generateAlertsForProduct(updatedProduct);
    }
  };

  /**
   * Löscht ein Produkt und alle zugehörigen Daten
   * 
   * @param id - ID des zu löschenden Produkts
   */
  const deleteProduct = async (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    await saveProducts(updatedProducts);
    
    // Entferne zugehörige Warnungen
    const updatedAlerts = alerts.filter(alert => alert.productId !== id);
    await saveAlerts(updatedAlerts);
  };

  /**
   * Fügt eine neue Lagerbewegung hinzu und aktualisiert den Produktbestand
   * 
   * @param movement - Bewegungsdaten ohne ID und Zeitstempel
   */
  const addMovement = async (movement: Omit<Movement, 'id' | 'timestamp'>) => {
    const newMovement: Movement = {
      ...movement,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    
    const updatedMovements = [newMovement, ...movements];
    await saveMovements(updatedMovements);
    
    // Aktualisiere Produktbestand basierend auf Bewegungstyp
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

  /**
   * Generiert automatische Warnungen für ein Produkt
   * 
   * Prüft Verfallsdatum und Bestandslevel und erstellt entsprechende
   * Warnungen für abgelaufene Produkte und niedrige Bestände.
   * 
   * @param product - Produkt für das Warnungen generiert werden sollen
   */
  const generateAlertsForProduct = async (product: Product) => {
    const newAlerts: Alert[] = [];
    const now = new Date();
    
    /**
     * Hilfsfunktion zum Parsen des deutschen Datumsformats DD.MM.YYYY
     * @param dateString - Datumsstring im deutschen Format
     * @returns Date-Objekt oder aktuelles Datum bei Fehlern
     */
    const parseGermanDate = (dateString: string) => {
      if (!dateString) return new Date();
      
      // Prüfe ob bereits im DD.MM.YYYY Format
      const germanDateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
      const match = dateString.match(germanDateRegex);
      
      if (match) {
        const [, day, month, year] = match;
        // Erstelle Datum mit month-1 da JavaScript-Monate 0-indexiert sind
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      
      // Fallback auf Standard-Datums-Parsing
      return new Date(dateString);
    };
    
    const expiryDate = parseGermanDate(product.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

    // Verfallsdatum-Warnungen
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

    // Niedrigbestand-Warnungen
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

    // Entferne alte Warnungen für dieses Produkt und füge neue hinzu
    const filteredAlerts = alerts.filter(alert => 
      !alert.productId || alert.productId !== product.id
    );
    
    const updatedAlerts = [...filteredAlerts, ...newAlerts];
    await saveAlerts(updatedAlerts);
  };

  /**
   * Markiert eine Warnung als bestätigt
   * @param alertId - ID der zu bestätigenden Warnung
   */
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