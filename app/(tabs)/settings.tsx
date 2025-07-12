import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Globe, Bell, Download, Upload, Shield, CircleHelp as HelpCircle, ChevronRight, User, Building } from 'lucide-react-native';
import { useLanguage } from '@/hooks/useLanguage';
import { useStorage } from '@/hooks/useStorage';
import * as DocumentPicker from 'expo-document-picker';

const languages = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

export default function SettingsScreen() {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const { products, addProduct } = useStorage();

  const handleExportData = () => {
    // Create CSV content
    const csvHeader = 'Name,Kategorie,Aktueller Bestand,Mindestbestand,Einheit,Verfallsdatum,Standort,Lieferant,Barcode\n';
    const csvContent = products.map(product => 
      `"${product.name}","${product.category}",${product.currentStock},${product.minStock},"${product.unit}","${product.expiryDate}","${product.location}","${product.supplier || ''}","${product.barcode || ''}"`
    ).join('\n');
    
    const fullCsv = csvHeader + csvContent;
    
    Alert.alert(
      'Daten exportieren',
      `${products.length} Produkte bereit zum Export.\n\nCSV-Inhalt wurde erstellt. In einer vollständigen App würde diese Datei heruntergeladen werden.`,
      [
        { text: 'OK' }
      ]
    );
    
    console.log('CSV Export:', fullCsv);
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        // In a real app, you would read and parse the CSV file here
        Alert.alert(
          'Import-Funktion',
          'CSV-Import ist in Entwicklung. Bitte verwenden Sie das folgende Format:\n\nName,Kategorie,Aktueller Bestand,Mindestbestand,Einheit,Verfallsdatum,Standort,Lieferant,Barcode\n"Tomaten","Gemüse",50,10,"kg","2025-02-15","Kühlschrank A1","Frische AG","1234567890"',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Fehler', 'Datei konnte nicht gelesen werden.');
    }
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement, 
    danger = false 
  }: any) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && { color: '#EF4444' }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        )}
      </View>
      {rightElement || (onPress && <ChevronRight size={20} color="#9ca3af" />)}
    </TouchableOpacity>
  );

  const SettingSection = ({ title, children }: any) => (
    <View style={styles.settingSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SettingSection title="Benutzer">
          <SettingItem
            icon={<User size={22} color="#6b7280" />}
            title="Profil"
            subtitle="Benutzerdaten verwalten"
            onPress={() => console.log('Profile')}
          />
          <SettingItem
            icon={<Building size={22} color="#6b7280" />}
            title="Restaurant"
            subtitle="Betriebsdaten und Standorte"
            onPress={() => console.log('Restaurant')}
          />
        </SettingSection>

        <SettingSection title="Sprache & Region">
          <SettingItem
            icon={<Globe size={22} color="#6b7280" />}
            title={t('language')}
            subtitle={languages.find(l => l.code === currentLanguage)?.name}
            rightElement={
              <View style={styles.languageSelector}>
                {languages.map(lang => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageButton,
                      currentLanguage === lang.code && styles.languageButtonActive
                    ]}
                    onPress={() => changeLanguage(lang.code)}
                  >
                    <Text style={styles.languageFlag}>{lang.flag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            }
          />
        </SettingSection>

        <SettingSection title="Benachrichtigungen">
          <SettingItem
            icon={<Bell size={22} color="#6b7280" />}
            title="Verfallsdatum Warnungen"
            subtitle="Bei ablaufenden Produkten benachrichtigen"
            rightElement={<Switch value={true} onValueChange={() => {}} />}
          />
          <SettingItem
            icon={<Bell size={22} color="#6b7280" />}
            title="Niedriger Bestand"
            subtitle="Bei niedrigem Lagerbestand benachrichtigen"
            rightElement={<Switch value={true} onValueChange={() => {}} />}
          />
        </SettingSection>

        <SettingSection title="Daten & Backup">
          <SettingItem
            icon={<Download size={22} color="#6b7280" />}
            title="Daten exportieren"
            subtitle="Inventardaten als CSV herunterladen"
            onPress={handleExportData}
          />
          <SettingItem
            icon={<Upload size={22} color="#6b7280" />}
            title="Daten importieren"
            subtitle="Produktdaten aus CSV-Datei importieren"
            onPress={handleImportData}
          />
          <SettingItem
            icon={<Shield size={22} color="#6b7280" />}
            title="Automatisches Backup"
            subtitle="Tägliche Datensicherung"
            rightElement={<Switch value={false} onValueChange={() => {}} />}
          />
        </SettingSection>

        <SettingSection title="Support">
          <SettingItem
            icon={<HelpCircle size={22} color="#6b7280" />}
            title="Hilfe & FAQ"
            subtitle="Häufig gestellte Fragen"
            onPress={() => console.log('Help')}
          />
          <SettingItem
            icon={<HelpCircle size={22} color="#6b7280" />}
            title="Kontakt"
            subtitle="Support kontaktieren"
            onPress={() => console.log('Contact')}
          />
        </SettingSection>

        <View style={styles.footer}>
          <Text style={styles.versionText}>FreshTrack v1.0.0</Text>
          <Text style={styles.copyrightText}>
            © 2025 FreshTrack. Entwickelt für nachhaltige Gastronomie.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D0D0D0',
    paddingLeft: 60, // Space for vertical tabs
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    flex: 1,
  },
  settingSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  languageSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageButtonActive: {
    borderColor: '#22C55E',
    backgroundColor: '#f0fdf4',
  },
  languageFlag: {
    fontSize: 18,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
});