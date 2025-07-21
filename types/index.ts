/**
 * Zentrale TypeScript-Typdefinitionen für die FreshTrack Anwendung
 * 
 * Diese Datei definiert alle wichtigen Datenstrukturen und Interfaces,
 * die in der gesamten Anwendung verwendet werden.
 */

/**
 * Hauptdatenstruktur für ein Produkt im Inventarsystem
 * 
 * Repräsentiert ein einzelnes Produkt mit allen relevanten Informationen
 * für die Lagerverwaltung in der Gastronomie.
 */
export interface Product {
  /** Eindeutige Identifikation des Produkts */
  id: string;
  /** Name des Produkts (z.B. "Tomaten") */
  name: string;
  /** Produktkategorie (z.B. "Gemüse") */
  category: string;
  /** Aktueller Lagerbestand */
  currentStock: number;
  /** Mindestbestand für Warnungen */
  minStock: number;
  /** Maßeinheit (z.B. "kg", "Stück", "L") */
  unit: string;
  /** Verfallsdatum im deutschen Format DD.MM.YYYY */
  expiryDate: string;
  /** Optionale Chargennummer für Rückverfolgbarkeit */
  batchNumber?: string;
  /** Lagerort (z.B. "Kühlschrank A1") */
  location: string;
  /** Optionaler Lieferant */
  supplier?: string;
  /** Optionaler Preis pro Einheit */
  price?: number;
  /** Optionaler Barcode für Scanner-Funktionalität */
  barcode?: string;
  /** Zeitstempel der Erstellung */
  createdAt: string;
  /** Zeitstempel der letzten Änderung */
  updatedAt: string;
}

/**
 * Datenstruktur für Lagerbewegungen
 * 
 * Dokumentiert alle Ein- und Ausgänge sowie Bestandsanpassungen
 * für die vollständige Nachverfolgbarkeit.
 */
export interface Movement {
  /** Eindeutige Identifikation der Bewegung */
  id: string;
  /** Referenz auf das betroffene Produkt */
  productId: string;
  /** Name des Produkts zum Zeitpunkt der Bewegung */
  productName: string;
  /** Art der Bewegung: Eingang, Ausgang oder Anpassung */
  type: 'in' | 'out' | 'adjustment';
  /** Anzahl der bewegten Einheiten */
  quantity: number;
  /** Grund für die Bewegung (z.B. "Lieferung", "Verkauf") */
  reason: string;
  /** Benutzer, der die Bewegung durchgeführt hat */
  user: string;
  /** Zeitstempel der Bewegung */
  timestamp: string;
  /** Optionale zusätzliche Notizen */
  notes?: string;
  /** Optionale Chargennummer */
  batchNumber?: string;
}

/**
 * Sprachdefinition für die Mehrsprachigkeits-Unterstützung
 */
export interface Language {
  /** Sprachcode (z.B. "de", "en") */
  code: string;
  /** Anzeigename der Sprache */
  name: string;
  /** Flaggen-Emoji für die UI */
  flag: string;
}

/**
 * Warnsystem für kritische Ereignisse
 * 
 * Benachrichtigt Benutzer über ablaufende Produkte und niedrige Bestände.
 */
export interface Alert {
  /** Eindeutige Identifikation der Warnung */
  id: string;
  /** Typ der Warnung */
  type: 'expiry' | 'low_stock';
  /** Schweregrad der Warnung */
  severity: 'high' | 'medium' | 'low';
  /** Referenz auf das betroffene Produkt */
  productId: string;
  /** Name des betroffenen Produkts */
  productName: string;
  /** Warnmeldung für den Benutzer */
  message: string;
  /** Zeitstempel der Warnung */
  timestamp: string;
  /** Status, ob die Warnung bestätigt wurde */
  acknowledged: boolean;
}