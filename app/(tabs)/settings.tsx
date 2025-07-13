import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Globe, Bell, Download, Upload, Shield, CircleHelp as HelpCircle, ChevronRight, User, Building } from 'lucide-react-native';
import { useLanguage } from '@/hooks/useLanguage';
import { useStorage } from '@/hooks/useStorage';
import * as DocumentPicker from 'expo-document-picker';
import designSystem from '@/styles/designSystem';

const languages = [
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'en', name: 'English' },
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
      activeOpacity={onPress ? designSystem.interactive.states.active.opacity : 1}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : "none"}
      accessibilityLabel={title}
      accessibilityHint={subtitle}
    >
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && { color: designSystem.colors.error[500] }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        )}
      </View>
      {rightElement || (onPress && <ChevronRight size={20} color={designSystem.colors.text.disabled} />)}
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
            icon={<User size={22} color={designSystem.colors.text.secondary} />}
            title="Profil"
            subtitle="Benutzerdaten verwalten"
            onPress={() => console.log('Profile')}
          />
          <SettingItem
            icon={<Building size={22} color={designSystem.colors.text.secondary} />}
            title="Restaurant"
            subtitle="Betriebsdaten und Standorte"
            onPress={() => console.log('Restaurant')}
          />
        </SettingSection>

        <SettingSection title="Sprache & Region">
          <SettingItem
            icon={<Globe size={22} color={designSystem.colors.text.secondary} />}
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
                    activeOpacity={designSystem.interactive.states.active.opacity}
                    accessibilityRole="button"
                    accessibilityLabel={`Sprache ändern zu ${lang.name}`}
                    accessibilityState={{ selected: currentLanguage === lang.code }}
                  >
                    <Text style={styles.languageText}>{lang.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            }
          />
        </SettingSection>

        <SettingSection title="Benachrichtigungen">
          <SettingItem
            icon={<Bell size={22} color={designSystem.colors.text.secondary} />}
            title="Verfallsdatum Warnungen"
            subtitle="Bei ablaufenden Produkten benachrichtigen"
            rightElement={
              <Switch 
                value={true} 
                onValueChange={() => {}}
                trackColor={{ 
                  false: designSystem.colors.neutral[300], 
                  true: designSystem.colors.success[500] 
                }}
                thumbColor={designSystem.colors.background.surface}
              />
            }
          />
          <SettingItem
            icon={<Bell size={22} color={designSystem.colors.text.secondary} />}
            title="Niedriger Bestand"
            subtitle="Bei niedrigem Lagerbestand benachrichtigen"
            rightElement={
              <Switch 
                value={true} 
                onValueChange={() => {}}
                trackColor={{ 
                  false: designSystem.colors.neutral[300], 
                  true: designSystem.colors.success[500] 
                }}
                thumbColor={designSystem.colors.background.surface}
              />
            }
          />
        </SettingSection>

        <SettingSection title="Daten & Backup">
          <SettingItem
            icon={<Download size={22} color={designSystem.colors.text.secondary} />}
            title="Daten exportieren"
            subtitle="Inventardaten als CSV herunterladen"
            onPress={handleExportData}
          />
          <SettingItem
            icon={<Upload size={22} color={designSystem.colors.text.secondary} />}
            title="Daten importieren"
            subtitle="Produktdaten aus CSV-Datei importieren"
            onPress={handleImportData}
          />
          <SettingItem
            icon={<Shield size={22} color={designSystem.colors.text.secondary} />}
            title="Automatisches Backup"
            subtitle="Tägliche Datensicherung"
            rightElement={
              <Switch 
                value={false} 
                onValueChange={() => {}}
                trackColor={{ 
                  false: designSystem.colors.neutral[300], 
                  true: designSystem.colors.success[500] 
                }}
                thumbColor={designSystem.colors.background.surface}
              />
            }
          />
        </SettingSection>

        <SettingSection title="Support">
          <SettingItem
            icon={<HelpCircle size={22} color={designSystem.colors.text.secondary} />}
            title="Hilfe & FAQ"
            subtitle="Häufig gestellte Fragen"
            onPress={() => console.log('Help')}
          />
          <SettingItem
            icon={<HelpCircle size={22} color={designSystem.colors.text.secondary} />}
            title="Kontakt"
            subtitle="Support kontaktieren"
            onPress={() => console.log('Contact')}
          />
        </SettingSection>

        <View style={styles.footer}>
          <Text style={styles.versionText}>FreshTrack v0.1.1</Text>
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
    backgroundColor: designSystem.colors.background.primary,
  },
  header: {
    padding: designSystem.spacing.xl,
    paddingBottom: 10,
  },
  title: {
    ...designSystem.componentStyles.textTitle,
  },
  content: {
    flex: 1,
  },
  settingSection: {
    marginBottom: designSystem.spacing.xxxl,
  },
  sectionTitle: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
    marginBottom: designSystem.spacing.md,
    marginHorizontal: designSystem.spacing.xl,
  },
  sectionContent: {
    backgroundColor: designSystem.colors.background.secondary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    marginHorizontal: designSystem.spacing.xl,
    borderRadius: designSystem.interactive.border.radius,
    ...designSystem.shadows.low,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: designSystem.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: designSystem.interactive.border.color,
    minHeight: 64,
    ...designSystem.accessibility.minTouchTarget,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: designSystem.interactive.border.radius,
    backgroundColor: designSystem.colors.background.primary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: designSystem.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    ...designSystem.componentStyles.textSecondary,
  },
  languageSelector: {
    flexDirection: 'column',
    gap: designSystem.spacing.md,
    minWidth: 120,
  },
  languageButton: {
    width: '100%',
    height: 44,
    borderRadius: designSystem.interactive.border.radius,
    backgroundColor: designSystem.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    paddingHorizontal: designSystem.spacing.md,
    ...designSystem.accessibility.minTouchTarget,
    ...designSystem.shadows.low,
  },
  languageButtonActive: {
    backgroundColor: designSystem.colors.secondary[500],
    borderColor: designSystem.interactive.border.color,
    ...designSystem.shadows.medium,
  },
  languageText: {
    ...designSystem.componentStyles.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    padding: designSystem.spacing.xl,
    alignItems: 'center',
    marginTop: designSystem.spacing.xl,
  },
  versionText: {
    ...designSystem.componentStyles.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  copyrightText: {
    ...designSystem.componentStyles.textCaption,
    textAlign: 'center',
    lineHeight: 16,
  },
});