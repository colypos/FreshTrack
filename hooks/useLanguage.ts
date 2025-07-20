import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// Comprehensive Multi-Language Support
const translations: Translations = {
  de: {
    // Dashboard
    dashboard: 'Dashboard',
    overview: 'Übersicht',
    summary: 'Zusammenfassung',
    totalProducts: 'Produkte gesamt',
    lowStock: 'Niedriger Bestand',
    expiringSoon: 'Läuft bald ab',
    criticalAlerts: 'Kritische Warnungen',
    recentMovements: 'Letzte Bewegungen',
    viewAll: 'Alle anzeigen',
    refresh: 'Aktualisieren',
    lastUpdated: 'Zuletzt aktualisiert',
    
    // Inventory
    inventory: 'Inventar',
    products: 'Produkte',
    productList: 'Produktliste',
    addProduct: 'Produkt hinzufügen',
    editProduct: 'Produkt bearbeiten',
    deleteProduct: 'Produkt löschen',
    searchProducts: 'Produkte suchen...',
    searchPlaceholder: 'Name, Kategorie oder Standort eingeben...',
    filterBy: 'Filtern nach',
    allCategories: 'Alle Kategorien',
    noCategories: 'Keine Kategorien',
    productName: 'Produktname',
    category: 'Kategorie',
    stock: 'Bestand',
    currentStock: 'Aktueller Bestand',
    minimumStock: 'Mindestbestand',
    expiryDate: 'Verfallsdatum',
    location: 'Standort',
    supplier: 'Lieferant',
    barcode: 'Barcode',
    batchNumber: 'Chargennummer',
    price: 'Preis',
    cost: 'Kosten',
    
    // Product Status
    inStock: 'Auf Lager',
    lowStockWarning: 'Niedriger Bestand',
    outOfStock: 'Nicht vorrätig',
    expired: 'Abgelaufen',
    expiresToday: 'Läuft heute ab',
    expiresThisWeek: 'Läuft diese Woche ab',
    expiresThisMonth: 'Läuft diesen Monat ab',
    
    // Scanner
    scanner: 'Scanner',
    barcodeScanner: 'Barcode-Scanner',
    scanBarcode: 'Barcode scannen',
    manualEntry: 'Manuelle Eingabe',
    enterBarcode: 'Barcode eingeben',
    productFound: 'Produkt gefunden',
    productNotFound: 'Produkt nicht gefunden',
    scanInstructions: 'Richten Sie den Barcode im Rahmen aus',
    scanAgain: 'Erneut scannen',
    processing: 'Verarbeitung...',
    
    // Movements
    movements: 'Bewegungen',
    stockMovements: 'Lagerbewegungen',
    movementHistory: 'Bewegungsverlauf',
    stockIn: 'Wareneingang',
    stockOut: 'Warenausgang',
    adjustment: 'Anpassung',
    correction: 'Korrektur',
    filterMovements: 'Bewegungen filtern',
    addMovement: 'Bewegung hinzufügen',
    movementType: 'Bewegungstyp',
    movementReason: 'Bewegungsgrund',
    movementDate: 'Bewegungsdatum',
    movementUser: 'Benutzer',
    
    // Settings
    settings: 'Einstellungen',
    preferences: 'Einstellungen',
    configuration: 'Konfiguration',
    language: 'Sprache',
    selectLanguage: 'Sprache auswählen',
    notifications: 'Benachrichtigungen',
    alerts: 'Warnungen',
    backup: 'Datensicherung',
    dataManagement: 'Datenverwaltung',
    exportData: 'Daten exportieren',
    importData: 'Daten importieren',
    profile: 'Profil',
    account: 'Konto',
    help: 'Hilfe',
    support: 'Support',
    about: 'Über',
    version: 'Version',
    
    // Common
    save: 'Speichern',
    cancel: 'Abbrechen',
    close: 'Schließen',
    delete: 'Löschen',
    remove: 'Entfernen',
    edit: 'Bearbeiten',
    update: 'Aktualisieren',
    add: 'Hinzufügen',
    create: 'Erstellen',
    confirm: 'Bestätigen',
    back: 'Zurück',
    next: 'Weiter',
    previous: 'Zurück',
    finish: 'Fertig',
    done: 'Fertig',
    ok: 'OK',
    yes: 'Ja',
    no: 'Nein',
    
    // Form Fields
    quantity: 'Menge',
    amount: 'Anzahl',
    unit: 'Einheit',
    date: 'Datum',
    time: 'Uhrzeit',
    datetime: 'Datum und Uhrzeit',
    user: 'Benutzer',
    notes: 'Notizen',
    comments: 'Kommentare',
    description: 'Beschreibung',
    reason: 'Grund',
    purpose: 'Zweck',
    
    // Validation & Errors
    required: 'Pflichtfeld',
    invalid: 'Ungültig',
    error: 'Fehler',
    warning: 'Warnung',
    success: 'Erfolg',
    info: 'Information',
    loading: 'Laden...',
    noData: 'Keine Daten',
    noResults: 'Keine Ergebnisse',
    tryAgain: 'Erneut versuchen',
    
    // Time & Dates
    today: 'Heute',
    yesterday: 'Gestern',
    tomorrow: 'Morgen',
    thisWeek: 'Diese Woche',
    thisMonth: 'Dieser Monat',
    lastWeek: 'Letzte Woche',
    lastMonth: 'Letzter Monat',
    
    // Units
    kg: 'kg',
    g: 'g',
    l: 'l',
    ml: 'ml',
    pieces: 'Stück',
    boxes: 'Kartons',
    packages: 'Packungen',
    
    // Navigation
    home: 'Startseite',
    menu: 'Menü',
    search: 'Suchen',
    filter: 'Filter',
    sort: 'Sortieren',
    
    // Accessibility
    tapToOpen: 'Tippen zum Öffnen',
    tapToClose: 'Tippen zum Schließen',
    tapToSelect: 'Tippen zum Auswählen',
    swipeLeft: 'Nach links wischen',
    swipeRight: 'Nach rechts wischen',
  },
  
  en: {
    // Dashboard
    dashboard: 'Dashboard',
    overview: 'Overview',
    summary: 'Summary',
    totalProducts: 'Total Products',
    lowStock: 'Low Stock',
    expiringSoon: 'Expiring Soon',
    criticalAlerts: 'Critical Alerts',
    recentMovements: 'Recent Movements',
    viewAll: 'View All',
    refresh: 'Refresh',
    lastUpdated: 'Last Updated',
    
    // Inventory
    inventory: 'Inventory',
    products: 'Products',
    productList: 'Product List',
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',
    searchProducts: 'Search products...',
    searchPlaceholder: 'Enter name, category or location...',
    filterBy: 'Filter by',
    allCategories: 'All Categories',
    noCategories: 'No Categories',
    productName: 'Product Name',
    category: 'Category',
    stock: 'Stock',
    currentStock: 'Current Stock',
    minimumStock: 'Minimum Stock',
    expiryDate: 'Expiry Date',
    location: 'Location',
    supplier: 'Supplier',
    barcode: 'Barcode',
    batchNumber: 'Batch Number',
    price: 'Price',
    cost: 'Cost',
    
    // Product Status
    inStock: 'In Stock',
    lowStockWarning: 'Low Stock',
    outOfStock: 'Out of Stock',
    expired: 'Expired',
    expiresToday: 'Expires Today',
    expiresThisWeek: 'Expires This Week',
    expiresThisMonth: 'Expires This Month',
    
    // Scanner
    scanner: 'Scanner',
    barcodeScanner: 'Barcode Scanner',
    scanBarcode: 'Scan Barcode',
    manualEntry: 'Manual Entry',
    enterBarcode: 'Enter Barcode',
    productFound: 'Product Found',
    productNotFound: 'Product Not Found',
    scanInstructions: 'Align barcode within the frame',
    scanAgain: 'Scan Again',
    processing: 'Processing...',
    
    // Movements
    movements: 'Movements',
    stockMovements: 'Stock Movements',
    movementHistory: 'Movement History',
    stockIn: 'Stock In',
    stockOut: 'Stock Out',
    adjustment: 'Adjustment',
    correction: 'Correction',
    filterMovements: 'Filter Movements',
    addMovement: 'Add Movement',
    movementType: 'Movement Type',
    movementReason: 'Movement Reason',
    movementDate: 'Movement Date',
    movementUser: 'User',
    
    // Settings
    settings: 'Settings',
    preferences: 'Preferences',
    configuration: 'Configuration',
    language: 'Language',
    selectLanguage: 'Select Language',
    notifications: 'Notifications',
    alerts: 'Alerts',
    backup: 'Backup',
    dataManagement: 'Data Management',
    exportData: 'Export Data',
    importData: 'Import Data',
    profile: 'Profile',
    account: 'Account',
    help: 'Help',
    support: 'Support',
    about: 'About',
    version: 'Version',
    
    // Common Actions
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    delete: 'Delete',
    remove: 'Remove',
    edit: 'Edit',
    update: 'Update',
    add: 'Add',
    create: 'Create',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    done: 'Done',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    
    // Form Fields
    quantity: 'Quantity',
    amount: 'Amount',
    unit: 'Unit',
    date: 'Date',
    time: 'Time',
    datetime: 'Date and Time',
    user: 'User',
    notes: 'Notes',
    comments: 'Comments',
    description: 'Description',
    reason: 'Reason',
    purpose: 'Purpose',
    
    // Validation & Errors
    required: 'Required',
    invalid: 'Invalid',
    error: 'Error',
    warning: 'Warning',
    success: 'Success',
    info: 'Information',
    loading: 'Loading...',
    noData: 'No Data',
    noResults: 'No Results',
    tryAgain: 'Try Again',
    
    // Time & Dates
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    lastWeek: 'Last Week',
    lastMonth: 'Last Month',
    
    // Units
    kg: 'kg',
    g: 'g',
    l: 'l',
    ml: 'ml',
    pieces: 'pieces',
    boxes: 'boxes',
    packages: 'packages',
    
    // Navigation
    home: 'Home',
    menu: 'Menu',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    
    // Accessibility
    tapToOpen: 'Tap to Open',
    tapToClose: 'Tap to Close',
    tapToSelect: 'Tap to Select',
    swipeLeft: 'Swipe Left',
    swipeRight: 'Swipe Right',
  },
  
  fr: {
    // Dashboard
    dashboard: 'Tableau de bord',
    overview: 'Vue d\'ensemble',
    summary: 'Résumé',
    totalProducts: 'Produits totaux',
    lowStock: 'Stock faible',
    expiringSoon: 'Expire bientôt',
    criticalAlerts: 'Alertes critiques',
    recentMovements: 'Mouvements récents',
    viewAll: 'Voir tout',
    refresh: 'Actualiser',
    lastUpdated: 'Dernière mise à jour',
    
    // Inventory
    inventory: 'Inventaire',
    products: 'Produits',
    productList: 'Liste des produits',
    addProduct: 'Ajouter produit',
    editProduct: 'Modifier produit',
    deleteProduct: 'Supprimer produit',
    searchProducts: 'Rechercher produits...',
    searchPlaceholder: 'Entrer nom, catégorie ou emplacement...',
    filterBy: 'Filtrer par',
    allCategories: 'Toutes catégories',
    noCategories: 'Aucune catégorie',
    productName: 'Nom du produit',
    category: 'Catégorie',
    stock: 'Stock',
    currentStock: 'Stock actuel',
    minimumStock: 'Stock minimum',
    expiryDate: 'Date d\'expiration',
    location: 'Emplacement',
    supplier: 'Fournisseur',
    barcode: 'Code-barres',
    batchNumber: 'Numéro de lot',
    price: 'Prix',
    cost: 'Coût',
    
    // Product Status
    inStock: 'En stock',
    lowStockWarning: 'Stock faible',
    outOfStock: 'Rupture de stock',
    expired: 'Expiré',
    expiresToday: 'Expire aujourd\'hui',
    expiresThisWeek: 'Expire cette semaine',
    expiresThisMonth: 'Expire ce mois',
    
    // Scanner
    scanner: 'Scanner',
    barcodeScanner: 'Scanner de code-barres',
    scanBarcode: 'Scanner code-barres',
    manualEntry: 'Saisie manuelle',
    enterBarcode: 'Entrer code-barres',
    productFound: 'Produit trouvé',
    productNotFound: 'Produit non trouvé',
    scanInstructions: 'Alignez le code-barres dans le cadre',
    scanAgain: 'Scanner à nouveau',
    processing: 'Traitement...',
    
    // Movements
    movements: 'Mouvements',
    stockMovements: 'Mouvements de stock',
    movementHistory: 'Historique des mouvements',
    stockIn: 'Entrée stock',
    stockOut: 'Sortie stock',
    adjustment: 'Ajustement',
    correction: 'Correction',
    filterMovements: 'Filtrer mouvements',
    addMovement: 'Ajouter mouvement',
    movementType: 'Type de mouvement',
    movementReason: 'Raison du mouvement',
    movementDate: 'Date du mouvement',
    movementUser: 'Utilisateur',
    
    // Settings
    settings: 'Paramètres',
    preferences: 'Préférences',
    configuration: 'Configuration',
    language: 'Langue',
    selectLanguage: 'Sélectionner langue',
    notifications: 'Notifications',
    alerts: 'Alertes',
    backup: 'Sauvegarde',
    dataManagement: 'Gestion des données',
    exportData: 'Exporter données',
    importData: 'Importer données',
    profile: 'Profil',
    account: 'Compte',
    help: 'Aide',
    support: 'Support',
    about: 'À propos',
    version: 'Version',
    
    // Common Actions
    save: 'Enregistrer',
    cancel: 'Annuler',
    close: 'Fermer',
    delete: 'Supprimer',
    remove: 'Retirer',
    edit: 'Modifier',
    update: 'Mettre à jour',
    add: 'Ajouter',
    create: 'Créer',
    confirm: 'Confirmer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    finish: 'Terminer',
    done: 'Terminé',
    ok: 'OK',
    yes: 'Oui',
    no: 'Non',
    
    // Form Fields
    quantity: 'Quantité',
    amount: 'Montant',
    unit: 'Unité',
    date: 'Date',
    time: 'Heure',
    datetime: 'Date et heure',
    user: 'Utilisateur',
    notes: 'Notes',
    comments: 'Commentaires',
    description: 'Description',
    reason: 'Raison',
    purpose: 'Objectif',
    
    // Validation & Errors
    required: 'Obligatoire',
    invalid: 'Invalide',
    error: 'Erreur',
    warning: 'Avertissement',
    success: 'Succès',
    info: 'Information',
    loading: 'Chargement...',
    noData: 'Aucune donnée',
    noResults: 'Aucun résultat',
    tryAgain: 'Réessayer',
    
    // Time & Dates
    today: 'Aujourd\'hui',
    yesterday: 'Hier',
    tomorrow: 'Demain',
    thisWeek: 'Cette semaine',
    thisMonth: 'Ce mois',
    lastWeek: 'Semaine dernière',
    lastMonth: 'Mois dernier',
    
    // Units
    kg: 'kg',
    g: 'g',
    l: 'l',
    ml: 'ml',
    pieces: 'pièces',
    boxes: 'boîtes',
    packages: 'paquets',
    
    // Navigation
    home: 'Accueil',
    menu: 'Menu',
    search: 'Rechercher',
    filter: 'Filtrer',
    sort: 'Trier',
    
    // Accessibility
    tapToOpen: 'Appuyer pour ouvrir',
    tapToClose: 'Appuyer pour fermer',
    tapToSelect: 'Appuyer pour sélectionner',
    swipeLeft: 'Glisser à gauche',
    swipeRight: 'Glisser à droite',
  },
  
  it: {
    // Dashboard
    dashboard: 'Dashboard',
    overview: 'Panoramica',
    summary: 'Riepilogo',
    totalProducts: 'Prodotti totali',
    lowStock: 'Scorte basse',
    expiringSoon: 'In scadenza',
    criticalAlerts: 'Avvisi critici',
    recentMovements: 'Movimenti recenti',
    viewAll: 'Vedi tutto',
    refresh: 'Aggiorna',
    lastUpdated: 'Ultimo aggiornamento',
    
    // Inventory
    inventory: 'Inventario',
    products: 'Prodotti',
    productList: 'Elenco prodotti',
    addProduct: 'Aggiungi prodotto',
    editProduct: 'Modifica prodotto',
    deleteProduct: 'Elimina prodotto',
    searchProducts: 'Cerca prodotti...',
    searchPlaceholder: 'Inserisci nome, categoria o posizione...',
    filterBy: 'Filtra per',
    allCategories: 'Tutte le categorie',
    noCategories: 'Nessuna categoria',
    productName: 'Nome prodotto',
    category: 'Categoria',
    stock: 'Scorte',
    currentStock: 'Scorte attuali',
    minimumStock: 'Scorte minime',
    expiryDate: 'Data di scadenza',
    location: 'Posizione',
    supplier: 'Fornitore',
    barcode: 'Codice a barre',
    batchNumber: 'Numero lotto',
    price: 'Prezzo',
    cost: 'Costo',
    
    // Product Status
    inStock: 'Disponibile',
    lowStockWarning: 'Scorte basse',
    outOfStock: 'Esaurito',
    expired: 'Scaduto',
    expiresToday: 'Scade oggi',
    expiresThisWeek: 'Scade questa settimana',
    expiresThisMonth: 'Scade questo mese',
    
    // Scanner
    scanner: 'Scanner',
    barcodeScanner: 'Scanner codice a barre',
    scanBarcode: 'Scansiona codice a barre',
    manualEntry: 'Inserimento manuale',
    enterBarcode: 'Inserisci codice a barre',
    productFound: 'Prodotto trovato',
    productNotFound: 'Prodotto non trovato',
    scanInstructions: 'Allinea il codice a barre nel riquadro',
    scanAgain: 'Scansiona di nuovo',
    processing: 'Elaborazione...',
    
    // Movements
    movements: 'Movimenti',
    stockMovements: 'Movimenti di magazzino',
    movementHistory: 'Cronologia movimenti',
    stockIn: 'Entrata merce',
    stockOut: 'Uscita merce',
    adjustment: 'Aggiustamento',
    correction: 'Correzione',
    filterMovements: 'Filtra movimenti',
    addMovement: 'Aggiungi movimento',
    movementType: 'Tipo movimento',
    movementReason: 'Motivo movimento',
    movementDate: 'Data movimento',
    movementUser: 'Utente',
    
    // Settings
    settings: 'Impostazioni',
    preferences: 'Preferenze',
    configuration: 'Configurazione',
    language: 'Lingua',
    selectLanguage: 'Seleziona lingua',
    notifications: 'Notifiche',
    alerts: 'Avvisi',
    backup: 'Backup',
    dataManagement: 'Gestione dati',
    exportData: 'Esporta dati',
    importData: 'Importa dati',
    profile: 'Profilo',
    account: 'Account',
    help: 'Aiuto',
    support: 'Supporto',
    about: 'Informazioni',
    version: 'Versione',
    
    // Common Actions
    save: 'Salva',
    cancel: 'Annulla',
    close: 'Chiudi',
    delete: 'Elimina',
    remove: 'Rimuovi',
    edit: 'Modifica',
    update: 'Aggiorna',
    add: 'Aggiungi',
    create: 'Crea',
    confirm: 'Conferma',
    back: 'Indietro',
    next: 'Avanti',
    previous: 'Precedente',
    finish: 'Fine',
    done: 'Fatto',
    ok: 'OK',
    yes: 'Sì',
    no: 'No',
    
    // Form Fields
    quantity: 'Quantità',
    amount: 'Importo',
    unit: 'Unità',
    date: 'Data',
    time: 'Ora',
    datetime: 'Data e ora',
    user: 'Utente',
    notes: 'Note',
    comments: 'Commenti',
    description: 'Descrizione',
    reason: 'Motivo',
    purpose: 'Scopo',
    
    // Validation & Errors
    required: 'Obbligatorio',
    invalid: 'Non valido',
    error: 'Errore',
    warning: 'Avvertimento',
    success: 'Successo',
    info: 'Informazione',
    loading: 'Caricamento...',
    noData: 'Nessun dato',
    noResults: 'Nessun risultato',
    tryAgain: 'Riprova',
    
    // Time & Dates
    today: 'Oggi',
    yesterday: 'Ieri',
    tomorrow: 'Domani',
    thisWeek: 'Questa settimana',
    thisMonth: 'Questo mese',
    lastWeek: 'Settimana scorsa',
    lastMonth: 'Mese scorso',
    
    // Units
    kg: 'kg',
    g: 'g',
    l: 'l',
    ml: 'ml',
    pieces: 'pezzi',
    boxes: 'scatole',
    packages: 'pacchetti',
    
    // Navigation
    home: 'Home',
    menu: 'Menu',
    search: 'Cerca',
    filter: 'Filtro',
    sort: 'Ordina',
    
    // Accessibility
    tapToOpen: 'Tocca per aprire',
    tapToClose: 'Tocca per chiudere',
    tapToSelect: 'Tocca per selezionare',
    swipeLeft: 'Scorri a sinistra',
    swipeRight: 'Scorri a destra',
  },
};

// Language metadata for UI display
export const languageMetadata = {
  de: { name: 'Deutsch', flag: '🇩🇪', rtl: false },
  en: { name: 'English', flag: '🇺🇸', rtl: false },
  fr: { name: 'Français', flag: '🇫🇷', rtl: false },
  it: { name: 'Italiano', flag: '🇮🇹', rtl: false },
};

// Available languages list
export const availableLanguages = Object.keys(languageMetadata);

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
    return translations[currentLanguage]?.[key] || translations['en']?.[key] || key;
  };

  const getLanguageMetadata = (langCode: string) => {
    return languageMetadata[langCode as keyof typeof languageMetadata];
  };

  const isRTL = () => {
    return languageMetadata[currentLanguage as keyof typeof languageMetadata]?.rtl || false;
  };

  return {
    currentLanguage,
    changeLanguage,
    t,
    getLanguageMetadata,
    isRTL,
    availableLanguages,
    languageMetadata,
  };
};