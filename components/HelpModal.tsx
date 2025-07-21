/**
 * Hilfe-Modal-Komponente für umfassende Benutzerunterstützung
 * 
 * Diese Komponente stellt eine vollständige Hilfe-Sektion bereit mit:
 * - FAQ (Häufig gestellte Fragen)
 * - Schritt-für-Schritt-Anleitungen
 * - Problembehebungs-Leitfäden
 * - Support-Kontaktinformationen
 * 
 * Organisiert in übersichtliche Tabs für bessere Navigation und
 * optimiert für mobile Geräte mit Touch-freundlichen Elementen.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ChevronRight, ChevronDown, Search, Package, Camera, ChartBar as BarChart3, Settings, TriangleAlert as AlertTriangle, Clock, TrendingDown } from 'lucide-react-native';
import { useLanguage } from '@/hooks/useLanguage';
import designSystem from '@/styles/designSystem';

/**
 * Props für die HelpModal-Komponente
 */
interface HelpModalProps {
  /** Sichtbarkeitsstatus des Modals */
  visible: boolean;
  /** Callback zum Schließen des Modals */
  onClose: () => void;
}

/**
 * Interface für FAQ-Einträge
 */
interface FAQItem {
  /** Eindeutige ID */
  id: string;
  /** Frage-Text */
  question: string;
  /** Antwort-Text */
  answer: string;
  /** Kategorie für Gruppierung */
  category: string;
}

/**
 * Interface für Anleitungs-Abschnitte
 */
interface GuideSection {
  /** Eindeutige ID */
  id: string;
  /** Titel der Anleitung */
  title: string;
  /** Icon für visuelle Darstellung */
  icon: React.ReactNode;
  /** Array von Anleitungsschritten */
  content: string[];
}

/**
 * HelpModal Hauptkomponente
 * 
 * Vollständiges Hilfe-System mit drei Hauptbereichen:
 * 1. FAQ - Häufig gestellte Fragen
 * 2. Anleitungen - Schritt-für-Schritt-Guides
 * 3. Problembehebung - Lösungen für häufige Probleme
 * 
 * @param props - Modal-Konfiguration
 * @returns JSX.Element - Interaktives Hilfe-Modal
 */
export default function HelpModal({ visible, onClose }: HelpModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'faq' | 'guide' | 'troubleshooting'>('faq');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  /**
   * FAQ-Daten mit umfassenden Fragen und Antworten
   * Kategorisiert nach Funktionsbereichen der App
   */
  const faqData: FAQItem[] = [
    {
      id: 'faq1',
      question: 'Wie füge ich ein neues Produkt hinzu?',
      answer: 'Gehen Sie zum Inventar-Tab und tippen Sie auf das "+" Symbol oben rechts. Füllen Sie die erforderlichen Felder aus: Produktname (Pflichtfeld), Kategorie, aktueller Bestand, Mindestbestand, Einheit und Verfallsdatum. Tippen Sie auf "Speichern" um das Produkt hinzuzufügen.',
      category: 'Grundlagen'
    },
    {
      id: 'faq2',
      question: 'Wie scanne ich einen Barcode?',
      answer: 'Öffnen Sie den Scanner-Tab und tippen Sie auf "Barcode scannen". Richten Sie die Kamera auf den Barcode und warten Sie, bis er automatisch erkannt wird. Falls das Produkt bereits existiert, können Sie eine Lagerbewegung erfassen. Bei unbekannten Produkten können Sie ein neues Produkt anlegen.',
      category: 'Scanner'
    },
    {
      id: 'faq3',
      question: 'Was bedeuten die verschiedenen Warnungen?',
      answer: 'Rote Warnung "Abgelaufen": Das Produkt ist bereits abgelaufen. Gelbe Warnung "Läuft bald ab": Das Produkt läuft in den nächsten 7 Tagen ab. Orange Warnung "Niedriger Bestand": Der Bestand ist unter dem festgelegten Mindestbestand.',
      category: 'Warnungen'
    },
    {
      id: 'faq4',
      question: 'Wie erfasse ich Lagerbewegungen?',
      answer: 'Scannen Sie das Produkt oder wählen Sie es im Inventar aus. Wählen Sie den Bewegungstyp: Wareneingang (+), Warenausgang (-) oder Anpassung. Geben Sie die Menge und den Grund ein. Optional können Sie Notizen hinzufügen. Der Bestand wird automatisch aktualisiert.',
      category: 'Lagerverwaltung'
    },
    {
      id: 'faq5',
      question: 'Wie ändere ich die Sprache der App?',
      answer: 'Gehen Sie zu Einstellungen und tippen Sie auf "Sprache". Wählen Sie aus Deutsch, Englisch, Französisch oder Italienisch. Die Änderung wird sofort übernommen.',
      category: 'Einstellungen'
    },
    {
      id: 'faq6',
      question: 'Wie exportiere ich meine Daten?',
      answer: 'In den Einstellungen finden Sie "Daten exportieren". Die App erstellt eine JSON-Datei mit allen Produkten, Bewegungen und Einstellungen. Diese können Sie als Backup verwenden oder in andere Systeme importieren.',
      category: 'Datenverwaltung'
    },
    {
      id: 'faq7',
      question: 'Welches Datumsformat wird verwendet?',
      answer: 'FreshTrack verwendet das deutsche Datumsformat DD.MM.YYYY (z.B. 31.12.2025). Beim Eingeben von Verfallsdaten verwenden Sie bitte dieses Format oder nutzen Sie den Kalender-Button.',
      category: 'Grundlagen'
    },
    {
      id: 'faq8',
      question: 'Wie filtere ich Produkte nach Kategorien?',
      answer: 'Im Inventar-Tab sehen Sie unter der Suchleiste die Kategorie-Buttons. Tippen Sie auf eine oder mehrere Kategorien um zu filtern. Mit "View All" können Sie alle Filter zurücksetzen.',
      category: 'Navigation'
    },
    {
      id: 'faq9',
      question: 'Was passiert wenn ich ein Produkt lösche?',
      answer: 'Beim Löschen eines Produkts werden auch alle zugehörigen Lagerbewegungen und Warnungen entfernt. Diese Aktion kann nicht rückgängig gemacht werden. Erstellen Sie vorher ein Backup über den Datenexport.',
      category: 'Datenverwaltung'
    },
    {
      id: 'faq10',
      question: 'Wie importiere ich Daten?',
      answer: 'In den Einstellungen wählen Sie "Daten importieren" und wählen eine JSON-Datei aus. Die App validiert die Daten und importiert nur gültige Produkte. Bewegungen werden aus Sicherheitsgründen nicht importiert.',
      category: 'Datenverwaltung'
    },
    {
      id: 'faq11',
      question: 'Warum wird mein Barcode nicht erkannt?',
      answer: 'Stellen Sie sicher, dass ausreichend Licht vorhanden ist und der Barcode vollständig im Rahmen sichtbar ist. Reinigen Sie die Kameralinse und halten Sie das Gerät ruhig. Bei anhaltenden Problemen nutzen Sie die manuelle Eingabe.',
      category: 'Scanner'
    },
    {
      id: 'faq12',
      question: 'Wie setze ich einen Mindestbestand fest?',
      answer: 'Beim Anlegen oder Bearbeiten eines Produkts geben Sie im Feld "Mindestbestand" die gewünschte Anzahl ein. Fällt der aktuelle Bestand auf oder unter diesen Wert, erhalten Sie eine Warnung.',
      category: 'Lagerverwaltung'
    },
    {
      id: 'faq13',
      question: 'Können mehrere Personen die App nutzen?',
      answer: 'Aktuell ist FreshTrack für die Nutzung auf einem Gerät konzipiert. Alle Daten werden lokal gespeichert. Für Team-Funktionen ist eine Cloud-Synchronisation in zukünftigen Versionen geplant.',
      category: 'Grundlagen'
    },
    {
      id: 'faq14',
      question: 'Wie sichere ich meine Daten?',
      answer: 'Nutzen Sie regelmäßig die Export-Funktion in den Einstellungen. Die JSON-Datei enthält alle Ihre Daten und kann als Backup gespeichert werden. Bewahren Sie Backups an einem sicheren Ort auf.',
      category: 'Datenverwaltung'
    },
    {
      id: 'faq15',
      question: 'Was bedeuten die Zahlen im Dashboard?',
      answer: 'Produkte gesamt: Alle erfassten Produkte. Niedriger Bestand: Produkte unter Mindestbestand. Läuft bald ab: Produkte die in 7 Tagen ablaufen. Kritische Warnungen: Abgelaufene Produkte oder solche mit niedrigem Bestand.',
      category: 'Dashboard'
    }
  ];

  /**
   * Anleitungs-Daten mit detaillierten Schritt-für-Schritt-Guides
   * Für alle Hauptfunktionen der Anwendung
   */
  const guideData: GuideSection[] = [
    {
      id: 'dashboard',
      title: 'Dashboard verstehen',
      icon: <BarChart3 size={20} color={designSystem.colors.success[500]} />,
      content: [
        '1. Das Dashboard zeigt eine Übersicht aller wichtigen Kennzahlen',
        '2. Tippen Sie auf die Statistik-Karten um zu den entsprechenden Filtern zu gelangen',
        '3. "Letzte Bewegungen" zeigt die 5 neuesten Lagerbewegungen',
        '4. Grüne Punkte = Wareneingang, Rote Punkte = Warenausgang, Graue Punkte = Anpassung',
        '5. Das Dashboard aktualisiert sich automatisch bei Änderungen'
      ]
    },
    {
      id: 'inventory',
      title: 'Inventar verwalten',
      icon: <Package size={20} color={designSystem.colors.secondary[500]} />,
      content: [
        '1. Nutzen Sie die Suchleiste um Produkte nach Name, Kategorie oder Standort zu finden',
        '2. Kategorie-Filter: Tippen Sie auf gelbe Buttons um nach Kategorien zu filtern',
        '3. Mehrfachauswahl: Wählen Sie mehrere Kategorien gleichzeitig',
        '4. Produktkarten zeigen Status-Badges: Grün = Auf Lager, Gelb = Läuft bald ab, Rot = Abgelaufen',
        '5. Tippen Sie auf ein Produkt um Details anzuzeigen oder zu bearbeiten',
        '6. "+" Button oben rechts um neue Produkte hinzuzufügen'
      ]
    },
    {
      id: 'scanner',
      title: 'Barcode-Scanner nutzen',
      icon: <Camera size={20} color={designSystem.colors.warning[500]} />,
      content: [
        '1. Tippen Sie auf "Barcode scannen" um die Kamera zu öffnen',
        '2. Richten Sie den Barcode im weißen Rahmen aus',
        '3. Halten Sie das Gerät ruhig und sorgen Sie für gute Beleuchtung',
        '4. Der Scan erfolgt automatisch - warten Sie auf die Erkennung',
        '5. Bei bekannten Produkten öffnet sich das Bewegungs-Formular',
        '6. Bei unbekannten Barcodes können Sie ein neues Produkt anlegen',
        '7. Alternative: "Manuelle Eingabe" für Barcode-Eingabe per Tastatur'
      ]
    },
    {
      id: 'movements',
      title: 'Lagerbewegungen erfassen',
      icon: <TrendingDown size={20} color={designSystem.colors.error[500]} />,
      content: [
        '1. Drei Bewegungstypen: Wareneingang (grün), Warenausgang (rot), Anpassung (grau)',
        '2. Wareneingang: Neue Lieferungen, Retouren, Korrekturen nach oben',
        '3. Warenausgang: Verkäufe, Verbrauch, Verluste, Korrekturen nach unten',
        '4. Anpassung: Setzt den Bestand auf einen absoluten Wert (für Inventuren)',
        '5. Grund angeben: Beschreiben Sie warum die Bewegung stattfindet',
        '6. Notizen sind optional aber hilfreich für die Nachverfolgung',
        '7. Der Bestand wird automatisch nach dem Speichern aktualisiert'
      ]
    },
    {
      id: 'settings',
      title: 'Einstellungen konfigurieren',
      icon: <Settings size={20} color={designSystem.colors.neutral[500]} />,
      content: [
        '1. Sprache: Wählen Sie zwischen Deutsch, Englisch, Französisch, Italienisch',
        '2. Datenexport: Erstellt eine JSON-Datei mit allen Daten als Backup',
        '3. Datenimport: Lädt Produktdaten aus einer JSON-Datei',
        '4. Profil und Restaurant: Zeigt aktuelle Benutzer- und Betriebsinformationen',
        '5. Hilfe: Öffnet diese Hilfe-Sektion',
        '6. Support: Kontaktmöglichkeiten für technische Probleme'
      ]
    }
  ];

  /**
   * Problembehebungs-Daten mit Lösungen für häufige technische Probleme
   */
  const troubleshootingData = [
    {
      problem: 'Barcode wird nicht erkannt',
      solutions: [
        'Überprüfen Sie die Kamera-Berechtigung in den Geräteeinstellungen',
        'Sorgen Sie für ausreichende Beleuchtung',
        'Reinigen Sie die Kameralinse',
        'Halten Sie das Gerät ruhig und den Barcode vollständig im Rahmen',
        'Versuchen Sie die manuelle Eingabe als Alternative'
      ]
    },
    {
      problem: 'App lädt langsam oder friert ein',
      solutions: [
        'Schließen Sie andere Apps um Speicher freizugeben',
        'Starten Sie die App neu',
        'Starten Sie das Gerät neu',
        'Überprüfen Sie den verfügbaren Speicherplatz',
        'Erstellen Sie ein Backup und löschen Sie alte Bewegungsdaten'
      ]
    },
    {
      problem: 'Daten sind verschwunden',
      solutions: [
        'Überprüfen Sie ob Sie versehentlich Filter aktiviert haben',
        'Nutzen Sie die Suchfunktion um Produkte zu finden',
        'Prüfen Sie ob ein Datenimport die Daten überschrieben hat',
        'Importieren Sie ein vorheriges Backup falls vorhanden',
        'Kontaktieren Sie den Support mit Details zum Datenverlust'
      ]
    },
    {
      problem: 'Export/Import funktioniert nicht',
      solutions: [
        'Überprüfen Sie die Dateiberechtigungen',
        'Stellen Sie sicher, dass genügend Speicherplatz vorhanden ist',
        'Verwenden Sie nur JSON-Dateien für den Import',
        'Überprüfen Sie die Internetverbindung',
        'Versuchen Sie es nach einer Wartezeit erneut (Rate Limiting)'
      ]
    },
    {
      problem: 'Falsche Datumsanzeige',
      solutions: [
        'Verwenden Sie das Format DD.MM.YYYY (z.B. 31.12.2025)',
        'Nutzen Sie den Kalender-Button für die Datumseingabe',
        'Überprüfen Sie die Geräte-Zeitzone in den Systemeinstellungen',
        'Bearbeiten Sie das Produkt und korrigieren Sie das Datum',
        'Bei Import-Problemen: Überprüfen Sie das Datumsformat in der JSON-Datei'
      ]
    }
  ];

  /**
   * Extrahiert eindeutige Kategorien aus FAQ-Daten
   */
  const categories = Array.from(new Set(faqData.map(item => item.category)));

  /**
   * Schaltet die Sichtbarkeit eines FAQ-Eintrags um
   * @param id - ID des FAQ-Eintrags
   */
  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  /**
   * Schaltet die Sichtbarkeit einer Anleitung um
   * @param id - ID der Anleitung
   */
  const toggleGuide = (id: string) => {
    setExpandedGuide(expandedGuide === id ? null : id);
  };

  /**
   * Tab-Button-Komponente für Navigation zwischen Hilfe-Bereichen
   */
  const TabButton = ({ tab, title, isActive, onPress }: any) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={onPress}
      activeOpacity={designSystem.interactive.states.active.opacity}
    >
      <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  /**
   * FAQ-Eintrag-Komponente mit erweiterbarem Inhalt
   */
  const FAQItem = ({ item }: { item: FAQItem }) => {
    const isExpanded = expandedFAQ === item.id;
    return (
      <View style={styles.faqItem}>
        <TouchableOpacity
          style={styles.faqQuestion}
          onPress={() => toggleFAQ(item.id)}
          activeOpacity={designSystem.interactive.states.active.opacity}
        >
          <Text style={styles.faqQuestionText}>{item.question}</Text>
          {isExpanded ? (
            <ChevronDown size={20} color={designSystem.colors.text.secondary} />
          ) : (
            <ChevronRight size={20} color={designSystem.colors.text.secondary} />
          )}
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.faqAnswer}>
            <Text style={styles.faqAnswerText}>{item.answer}</Text>
          </View>
        )}
      </View>
    );
  };

  /**
   * Anleitungs-Eintrag-Komponente mit erweiterbarem Inhalt
   */
  const GuideItem = ({ item }: { item: GuideSection }) => {
    const isExpanded = expandedGuide === item.id;
    return (
      <View style={styles.guideItem}>
        <TouchableOpacity
          style={styles.guideHeader}
          onPress={() => toggleGuide(item.id)}
          activeOpacity={designSystem.interactive.states.active.opacity}
        >
          <View style={styles.guideHeaderContent}>
            {item.icon}
            <Text style={styles.guideTitle}>{item.title}</Text>
          </View>
          {isExpanded ? (
            <ChevronDown size={20} color={designSystem.colors.text.secondary} />
          ) : (
            <ChevronRight size={20} color={designSystem.colors.text.secondary} />
          )}
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.guideContent}>
            {item.content.map((step, index) => (
              <Text key={index} style={styles.guideStep}>{step}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={designSystem.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hilfe & Support</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.tabContainer}>
          <TabButton
            tab="faq"
            title="FAQ"
            isActive={activeTab === 'faq'}
            onPress={() => setActiveTab('faq')}
          />
          <TabButton
            tab="guide"
            title="Anleitung"
            isActive={activeTab === 'guide'}
            onPress={() => setActiveTab('guide')}
          />
          <TabButton
            tab="troubleshooting"
            title="Problembehebung"
            isActive={activeTab === 'troubleshooting'}
            onPress={() => setActiveTab('troubleshooting')}
          />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'faq' && (
            <View style={styles.faqContainer}>
              <Text style={styles.sectionDescription}>
                Hier finden Sie Antworten auf die häufigsten Fragen zur Nutzung von FreshTrack.
              </Text>
              
              {categories.map(category => (
                <View key={category} style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>{category}</Text>
                  {faqData
                    .filter(item => item.category === category)
                    .map(item => (
                      <FAQItem key={item.id} item={item} />
                    ))}
                </View>
              ))}
            </View>
          )}

          {activeTab === 'guide' && (
            <View style={styles.guideContainer}>
              <Text style={styles.sectionDescription}>
                Schritt-für-Schritt Anleitungen für alle Hauptfunktionen von FreshTrack.
              </Text>
              
              {guideData.map(item => (
                <GuideItem key={item.id} item={item} />
              ))}
            </View>
          )}

          {activeTab === 'troubleshooting' && (
            <View style={styles.troubleshootingContainer}>
              <Text style={styles.sectionDescription}>
                Lösungen für häufige Probleme und technische Schwierigkeiten.
              </Text>
              
              {troubleshootingData.map((item, index) => (
                <View key={index} style={styles.troubleshootingItem}>
                  <View style={styles.problemHeader}>
                    <AlertTriangle size={20} color={designSystem.colors.warning[500]} />
                    <Text style={styles.problemTitle}>{item.problem}</Text>
                  </View>
                  <View style={styles.solutionsList}>
                    {item.solutions.map((solution, solutionIndex) => (
                      <Text key={solutionIndex} style={styles.solutionText}>
                        • {solution}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerTitle}>Weitere Hilfe benötigt?</Text>
            <Text style={styles.footerText}>
              Kontaktieren Sie unser Support-Team unter:
            </Text>
            <Text style={styles.contactInfo}>
              📧 supportfreshtrack@isobel.ch{'\n'}
              📱 +41 79 601 77 33
            </Text>
            <Text style={styles.versionInfo}>
              FreshTrack Version 0.3.7.3{'\n'}
              © 2025 FreshTrack Development Team
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

/**
 * Styling für HelpModal nach Design-System
 * Organisiert in logische Gruppen für bessere Wartbarkeit
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designSystem.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: designSystem.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: designSystem.colors.border.secondary,
    backgroundColor: designSystem.colors.background.secondary,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: designSystem.interactive.border.radius,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: designSystem.colors.background.primary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
  },
  headerTitle: {
    ...designSystem.componentStyles.textSubtitle,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 44,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: designSystem.colors.background.secondary,
    paddingHorizontal: designSystem.spacing.xl,
    paddingBottom: designSystem.spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: designSystem.spacing.md,
    paddingHorizontal: designSystem.spacing.lg,
    borderRadius: designSystem.interactive.border.radius,
    marginHorizontal: designSystem.spacing.xs,
    backgroundColor: designSystem.colors.background.primary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: designSystem.colors.secondary[500],
    borderColor: designSystem.colors.border.primary,
  },
  tabButtonText: {
    ...designSystem.componentStyles.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabButtonTextActive: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: designSystem.spacing.xl,
  },
  sectionDescription: {
    ...designSystem.componentStyles.textSecondary,
    marginBottom: designSystem.spacing.xl,
    lineHeight: 22,
  },
  
  // FAQ-Styling
  faqContainer: {
    flex: 1,
  },
  categorySection: {
    marginBottom: designSystem.spacing.xxl,
  },
  categoryTitle: {
    ...designSystem.componentStyles.textHeader,
    fontWeight: '600',
    marginBottom: designSystem.spacing.lg,
    paddingBottom: designSystem.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: designSystem.colors.secondary[500],
  },
  faqItem: {
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    marginBottom: designSystem.spacing.md,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: designSystem.spacing.lg,
    minHeight: 60,
  },
  faqQuestionText: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
    flex: 1,
    marginRight: designSystem.spacing.md,
    lineHeight: 22,
  },
  faqAnswer: {
    padding: designSystem.spacing.lg,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: designSystem.colors.border.secondary,
  },
  faqAnswerText: {
    ...designSystem.componentStyles.textSecondary,
    lineHeight: 22,
  },
  
  // Anleitungs-Styling
  guideContainer: {
    flex: 1,
  },
  guideItem: {
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    marginBottom: designSystem.spacing.lg,
    overflow: 'hidden',
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: designSystem.spacing.lg,
    minHeight: 60,
  },
  guideHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: designSystem.spacing.md,
  },
  guideTitle: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  guideContent: {
    padding: designSystem.spacing.lg,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: designSystem.colors.border.secondary,
  },
  guideStep: {
    ...designSystem.componentStyles.textSecondary,
    lineHeight: 22,
    marginBottom: designSystem.spacing.sm,
  },
  
  // Problembehebungs-Styling
  troubleshootingContainer: {
    flex: 1,
  },
  troubleshootingItem: {
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    padding: designSystem.spacing.lg,
    marginBottom: designSystem.spacing.lg,
  },
  problemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.md,
    marginBottom: designSystem.spacing.md,
  },
  problemTitle: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  solutionsList: {
    paddingLeft: designSystem.spacing.lg,
  },
  solutionText: {
    ...designSystem.componentStyles.textSecondary,
    lineHeight: 22,
    marginBottom: designSystem.spacing.sm,
  },
  
  // Footer-Styling
  footer: {
    marginTop: designSystem.spacing.xxxl,
    padding: designSystem.spacing.xl,
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    alignItems: 'center',
  },
  footerTitle: {
    ...designSystem.componentStyles.textHeader,
    fontWeight: '600',
    marginBottom: designSystem.spacing.md,
    textAlign: 'center',
  },
  footerText: {
    ...designSystem.componentStyles.textSecondary,
    textAlign: 'center',
    marginBottom: designSystem.spacing.lg,
  },
  contactInfo: {
    ...designSystem.componentStyles.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: designSystem.spacing.xl,
    fontFamily: 'monospace',
  },
  versionInfo: {
    ...designSystem.componentStyles.textCaption,
    textAlign: 'center',
    lineHeight: 18,
  },
});