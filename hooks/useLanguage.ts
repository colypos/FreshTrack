import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  de: {
    // Dashboard
    dashboard: 'Dashboard',
    totalProducts: 'Produkte gesamt',
    lowStock: 'Niedriger Bestand',
    expiringSoon: 'Läuft bald ab',
    criticalAlerts: 'Kritische Warnungen',
    recentMovements: 'Letzte Bewegungen',
    viewAll: 'Alle anzeigen',
    
    // Inventory
    inventory: 'Inventar',
    addProduct: 'Produkt hinzufügen',
    searchProducts: 'Produkte suchen...',
    filterBy: 'Filtern nach',
    allCategories: 'Alle Kategorien',
    productName: 'Produktname',
    category: 'Kategorie',
    stock: 'Bestand',
    expiryDate: 'Verfallsdatum',
    location: 'Standort',
    
    // Scanner
    scanner: 'Scanner',
    scanBarcode: 'Barcode scannen',
    manualEntry: 'Manuelle Eingabe',
    productFound: 'Produkt gefunden',
    productNotFound: 'Produkt nicht gefunden',
    
    // Movements
    movements: 'Bewegungen',
    stockIn: 'Wareneingang',
    stockOut: 'Warenausgang',
    adjustment: 'Anpassung',
    filterMovements: 'Bewegungen filtern',
    
    // Settings
    settings: 'Einstellungen',
    language: 'Sprache',
    notifications: 'Benachrichtigungen',
    backup: 'Datensicherung',
    
    // Common
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    add: 'Hinzufügen',
    quantity: 'Menge',
    unit: 'Einheit',
    date: 'Datum',
    time: 'Uhrzeit',
    user: 'Benutzer',
    notes: 'Notizen',
    reason: 'Grund',
    
    // Status
    expired: 'Abgelaufen',
    expiresToday: 'Läuft heute ab',
    expiresThisWeek: 'Läuft diese Woche ab',
    lowStockWarning: 'Niedriger Bestand',
    inStock: 'Auf Lager',
  },
  en: {
    // Dashboard
    dashboard: 'Dashboard',
    totalProducts: 'Total Products',
    lowStock: 'Low Stock',
    expiringSoon: 'Expiring Soon',
    criticalAlerts: 'Critical Alerts',
    recentMovements: 'Recent Movements',
    viewAll: 'View All',
    
    // Inventory
    inventory: 'Inventory',
    addProduct: 'Add Product',
    searchProducts: 'Search products...',
    filterBy: 'Filter by',
    allCategories: 'All Categories',
    productName: 'Product Name',
    category: 'Category',
    stock: 'Stock',
    expiryDate: 'Expiry Date',
    location: 'Location',
    
    // Scanner
    scanner: 'Scanner',
    scanBarcode: 'Scan Barcode',
    manualEntry: 'Manual Entry',
    productFound: 'Product Found',
    productNotFound: 'Product Not Found',
    
    // Movements
    movements: 'Movements',
    stockIn: 'Stock In',
    stockOut: 'Stock Out',
    adjustment: 'Adjustment',
    filterMovements: 'Filter Movements',
    
    // Settings
    settings: 'Settings',
    language: 'Language',
    notifications: 'Notifications',
    backup: 'Backup',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    quantity: 'Quantity',
    unit: 'Unit',
    date: 'Date',
    time: 'Time',
    user: 'User',
    notes: 'Notes',
    reason: 'Reason',
    
    // Status
    expired: 'Expired',
    expiresToday: 'Expires Today',
    expiresThisWeek: 'Expires This Week',
    lowStockWarning: 'Low Stock',
    inStock: 'In Stock',
  },
  fr: {
    // Dashboard
    dashboard: 'Tableau de bord',
    totalProducts: 'Produits totaux',
    lowStock: 'Stock faible',
    expiringSoon: 'Expire bientôt',
    criticalAlerts: 'Alertes critiques',
    recentMovements: 'Mouvements récents',
    viewAll: 'Voir tout',
    
    // Inventory
    inventory: 'Inventaire',
    addProduct: 'Ajouter produit',
    searchProducts: 'Rechercher produits...',
    filterBy: 'Filtrer par',
    allCategories: 'Toutes catégories',
    productName: 'Nom du produit',
    category: 'Catégorie',
    stock: 'Stock',
    expiryDate: 'Date d\'expiration',
    location: 'Emplacement',
    
    // Scanner
    scanner: 'Scanner',
    scanBarcode: 'Scanner code-barres',
    manualEntry: 'Saisie manuelle',
    productFound: 'Produit trouvé',
    productNotFound: 'Produit non trouvé',
    
    // Movements
    movements: 'Mouvements',
    stockIn: 'Entrée stock',
    stockOut: 'Sortie stock',
    adjustment: 'Ajustement',
    filterMovements: 'Filtrer mouvements',
    
    // Settings
    settings: 'Paramètres',
    language: 'Langue',
    notifications: 'Notifications',
    backup: 'Sauvegarde',
    
    // Common
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    quantity: 'Quantité',
    unit: 'Unité',
    date: 'Date',
    time: 'Heure',
    user: 'Utilisateur',
    notes: 'Notes',
    reason: 'Raison',
    
    // Status
    expired: 'Expiré',
    expiresToday: 'Expire aujourd\'hui',
    expiresThisWeek: 'Expire cette semaine',
    lowStockWarning: 'Stock faible',
    inStock: 'En stock',
  },
  it: {
    // Dashboard
    dashboard: 'Dashboard',
    totalProducts: 'Prodotti totali',
    lowStock: 'Scorte basse',
    expiringSoon: 'In scadenza',
    criticalAlerts: 'Avvisi critici',
    recentMovements: 'Movimenti recenti',
    viewAll: 'Vedi tutto',
    
    // Inventory
    inventory: 'Inventario',
    addProduct: 'Aggiungi prodotto',
    searchProducts: 'Cerca prodotti...',
    filterBy: 'Filtra per',
    allCategories: 'Tutte le categorie',
    productName: 'Nome prodotto',
    category: 'Categoria',
    stock: 'Scorte',
    expiryDate: 'Data di scadenza',
    location: 'Posizione',
    
    // Scanner
    scanner: 'Scanner',
    scanBarcode: 'Scansiona codice a barre',
    manualEntry: 'Inserimento manuale',
    productFound: 'Prodotto trovato',
    productNotFound: 'Prodotto non trovato',
    
    // Movements
    movements: 'Movimenti',
    stockIn: 'Entrata merce',
    stockOut: 'Uscita merce',
    adjustment: 'Aggiustamento',
    filterMovements: 'Filtra movimenti',
    
    // Settings
    settings: 'Impostazioni',
    language: 'Lingua',
    notifications: 'Notifiche',
    backup: 'Backup',
    
    // Common
    save: 'Salva',
    cancel: 'Annulla',
    delete: 'Elimina',
    edit: 'Modifica',
    add: 'Aggiungi',
    quantity: 'Quantità',
    unit: 'Unità',
    date: 'Data',
    time: 'Ora',
    user: 'Utente',
    notes: 'Note',
    reason: 'Motivo',
    
    // Status
    expired: 'Scaduto',
    expiresToday: 'Scade oggi',
    expiresThisWeek: 'Scade questa settimana',
    lowStockWarning: 'Scorte basse',
    inStock: 'Disponibile',
  },
};

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState('de');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('language');
      if (saved) {
        setCurrentLanguage(saved);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const changeLanguage = async (lang: string) => {
    try {
      await AsyncStorage.setItem('language', lang);
      setCurrentLanguage(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || key;
  };

  return {
    currentLanguage,
    changeLanguage,
    t,
  };
};