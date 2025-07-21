# FreshTrack - Intelligente Lagerverwaltung für die Gastronomie

## 📱 Überblick

FreshTrack ist eine moderne, benutzerfreundliche Mobile-App für die professionelle Lagerverwaltung in der Gastronomie. Die App hilft Restaurants, Cafés und anderen Gastronomiebetrieben dabei, ihre Lebensmittelbestände effizient zu verwalten, Verschwendung zu reduzieren und die Lebensmittelsicherheit zu gewährleisten.

## ✨ Hauptfunktionen

### 🏠 **Dashboard**
- **Echtzeit-Übersicht** über alle wichtigen Kennzahlen
- **Produktanzahl gesamt** mit aktuellen Bestandszahlen
- **Niedriger Bestand** - Warnung bei Unterschreitung der Mindestbestände
- **Läuft bald ab** - Produkte, die in den nächsten 7 Tagen ablaufen
- **Kritische Warnungen** - Abgelaufene Produkte und Produkte mit niedrigem Bestand
- **Letzte Bewegungen** - Schneller Überblick über aktuelle Lagerbewegungen

### 📦 **Inventarverwaltung**
- **Produktkatalog** mit detaillierten Informationen
- **Kategoriefilter** für schnelle Navigation
- **Suchfunktion** nach Name, Kategorie oder Standort
- **Bestandsverfolgung** mit aktuellen und Mindestbeständen
- **Verfallsdatumsverwaltung** im deutschen Format (DD.MM.YYYY)
- **Standortverwaltung** für verschiedene Lagerorte
- **Lieferantenverwaltung** für bessere Nachverfolgbarkeit

### 📱 **Barcode-Scanner**
- **Kamera-Scanner** für schnelle Produkterfassung
- **Manuelle Eingabe** als Alternative zum Scannen
- **Automatische Produkterkennung** bei bekannten Barcodes
- **Neue Produkte anlegen** direkt nach dem Scannen
- **Lagerbewegungen erfassen** durch einfaches Scannen

### 📊 **Bewegungsverfolgung**
- **Wareneingang** - Neue Lieferungen erfassen
- **Warenausgang** - Verbrauch und Verkäufe dokumentieren
- **Bestandsanpassungen** - Korrekturen und Inventuren
- **Bewegungshistorie** mit vollständiger Nachverfolgbarkeit
- **Benutzer-Tracking** für Verantwortlichkeit
- **Grund-Dokumentation** für jede Bewegung

### ⚙️ **Einstellungen & Verwaltung**
- **Mehrsprachigkeit** (Deutsch, Englisch, Französisch, Italienisch)
- **Datenexport** als JSON-Datei mit allen Informationen
- **Datenimport** für Migration und Backup-Wiederherstellung
- **Benutzerprofile** und Restaurantinformationen

## 🛠️ Technische Spezifikationen

### **Plattform & Framework**
- **React Native** mit Expo SDK 52.0.30
- **Expo Router 4.0.17** für Navigation
- **TypeScript** für Typsicherheit
- **Cross-Platform** - iOS, Android und Web

### **Design System**
- **Material Design** Prinzipien
- **WCAG 2.1 AA** Barrierefreiheit
- **Responsive Design** für alle Bildschirmgrössen
- **8px Grid System** für konsistente Abstände
- **Professionelle Farbpalette** mit hohem Kontrast

### **Datenspeicherung**
- **AsyncStorage** für lokale Datenpersistierung
- **JSON-Export/Import** für Datensicherung
- **Echtzeit-Synchronisation** zwischen App-Bereichen
- **Sichere Datenverwaltung** mit Validierung

### **Barcode-Unterstützung**
- **QR-Codes** und Standard-Barcodes
- **EAN-13, EAN-8** für Lebensmittel
- **Code 128, Code 39** für interne Codes
- **PDF417** für erweiterte Informationen

## 📋 Systemanforderungen

### **Mobile Geräte**
- **iOS**: Version 13.0 oder höher
- **Android**: API Level 21 (Android 5.0) oder höher
- **Kamera**: Für Barcode-Scanning erforderlich
- **Speicher**: Mindestens 100 MB freier Speicherplatz

### **Web Browser** (Optional)
- **Chrome**: Version 88 oder höher
- **Safari**: Version 14 oder höher
- **Firefox**: Version 85 oder höher
- **Edge**: Version 88 oder höher

## 🚀 Installation & Setup

### **Entwicklungsumgebung**

```bash
# Repository klonen
git clone [repository-url]
cd freshtrack

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

### **Expo Go App** (Empfohlen für Tests)

1. **Expo Go** aus dem App Store/Google Play Store installieren
2. QR-Code scannen, der beim Start des Entwicklungsservers angezeigt wird
3. App wird automatisch geladen und aktualisiert

### **Production Build**

```bash
# Web-Build erstellen
npm run build:web

# Native Builds (erfordert Expo EAS)
eas build --platform ios
eas build --platform android
```

## 📱 Benutzerhandbuch

### **Erste Schritte**

1. **App öffnen** - Das Dashboard zeigt eine Übersicht aller wichtigen Informationen
2. **Erstes Produkt hinzufügen** - Über das "+" Symbol im Inventar-Tab
3. **Barcode scannen** - Im Scanner-Tab für schnelle Produkterfassung
4. **Bewegungen erfassen** - Wareneingänge und -ausgänge dokumentieren

### **Produktverwaltung**

**Neues Produkt anlegen:**
- Name und Kategorie eingeben
- Aktuellen Bestand und Mindestbestand festlegen
- Verfallsdatum im Format DD.MM.YYYY
- Lagerort und Lieferant (optional)

**Bestand aktualisieren:**
- Produkt im Inventar auswählen oder scannen
- Bewegungstyp wählen (Ein-/Ausgang/Anpassung)
- Menge und Grund eingeben
- Speichern - Bestand wird automatisch aktualisiert

### **Kategoriefilter verwenden**

- **Alle Kategorien** anzeigen oder spezifische auswählen
- **Mehrfachauswahl** durch Antippen mehrerer Kategorien
- **Filter zurücksetzen** über "View All" Button
- **Suchfunktion** kombiniert mit Kategoriefiltern

### **Warnungen verstehen**

- **🟡 Läuft bald ab**: Produkte, die in 7 Tagen oder weniger ablaufen
- **🔴 Abgelaufen**: Produkte mit überschrittenem Verfallsdatum
- **🟠 Niedriger Bestand**: Produkte unter dem Mindestbestand
- **⚠️ Kritische Warnungen**: Kombination aus abgelaufenen und niedrigen Beständen

## 🔧 Konfiguration

### **Datenexport/-import**

**Export:**
- Einstellungen → "Daten exportieren"
- JSON-Datei wird heruntergeladen
- Enthält alle Produkte, Bewegungen und Einstellungen

**Import:**
- Einstellungen → "Daten importieren"
- JSON-Datei auswählen
- Daten werden validiert und importiert

### **Benachrichtigungen**

- **Verfallswarnungen**: 7, 3 und 1 Tag vor Ablauf
- **Bestandswarnungen**: Bei Unterschreitung des Mindestbestands
- **Tägliche Zusammenfassung**: Optional aktivierbar

## 🎨 Design & Benutzerfreundlichkeit

### **Barrierefreiheit**
- **WCAG 2.1 AA** konform
- **Hohe Kontraste** für bessere Lesbarkeit
- **Grosse Touch-Targets** (mindestens 44x44 Punkte)
- **Screen Reader** Unterstützung
- **Tastaturnavigation** vollständig unterstützt

### **Responsive Design**
- **Mobile First** Ansatz
- **Tablet-optimiert** mit Zwei-Spalten-Layout
- **Automatische Anpassung** an Bildschirmgrösse

### **Performance**
- **Schnelle Ladezeiten** durch optimierte Komponenten
- **Smooth Animationen** mit 60fps
- **Effiziente Datenverwaltung** ohne Speicher-Leaks
- **Offline-Funktionalität** für Kernfunktionen

## 🔒 Datenschutz & Sicherheit

### **Lokale Datenspeicherung**
- Alle Daten werden **lokal auf dem Gerät** gespeichert
- **Keine Cloud-Synchronisation** ohne explizite Zustimmung
- **Verschlüsselte Speicherung** sensibler Informationen

### **Datenexport**
- **Rate Limiting**: Maximal 5 Exports pro Stunde
- **Validierung**: Vollständige Datenprüfung vor Export
- **Sichere Übertragung**: HTTPS für alle Netzwerkoperationen
- **Audit-Log**: Vollständige Protokollierung aller Exports

## 🐛 Fehlerbehebung

### **Häufige Probleme**

**Barcode-Scanner funktioniert nicht:**
- Kamera-Berechtigung prüfen
- Ausreichend Licht sicherstellen
- Barcode vollständig im Rahmen positionieren

**Daten werden nicht gespeichert:**
- App-Berechtigungen prüfen
- Ausreichend Speicherplatz sicherstellen
- App neu starten

**Performance-Probleme:**
- App-Cache leeren
- Gerät neu starten
- Alte Bewegungsdaten archivieren

### **Support kontaktieren**

Bei technischen Problemen:
- **E-Mail**: supportfreshtrack@isobel.ch
- **Dokumentation**: [Link zur Online-Dokumentation]
- **FAQ**: [Link zu häufigen Fragen]

## 🚀 Roadmap & Zukünftige Features

### **Version 1.0** (Q4 2025)
- ****
  **Automatische Backups** optional aktivierbar
- **Cloud-Synchronisation** zwischen Geräten
- **Team-Funktionen** für mehrere Benutzer
- **Erweiterte Berichte** und Analytics
- **API-Integration** für Lieferanten
- **Multisprachumgebung** auch Englisch, Französisch und Italienisch

Sprache ändern: Einstellungen → Sprache → Gewünschte Sprache auswählen

### **Version 1.1** (Q1 2026)
- **Automatische Bestellvorschläge** basierend auf Verbrauch
- **Rezeptverwaltung** mit Zutatenverfolgung
- **Kostenverfolgung** und Gewinnmargen-Analyse
- **Mobile Etikettendruck** für Produkte

### **Version 2.0** (Q3 2026)
- **KI-gestützte Vorhersagen** für Bestellmengen
- **Integration mit Kassensystemen**
- **Erweiterte Compliance-Features** für Lebensmittelsicherheit
- **Multi-Standort-Verwaltung** für Ketten

Entwickelt für nachhaltige Gastronomie und effiziente Lagerverwaltung.

**Technologie-Stack:**
- React Native & Expo
- TypeScript
- Material Design
- AsyncStorage
- Expo Camera

**Unterstützte Plattformen:**
- iOS (iPhone & iPad)
- Android (Smartphones & Tablets)
- Web (Desktop & Mobile Browser)

---

*Für weitere Informationen besuchen Sie unsere Website oder kontaktieren Sie unser Support-Team.*