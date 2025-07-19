import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Globe, Bell, Download, Upload, Shield, CircleHelp as HelpCircle, ChevronRight, User, Building } from 'lucide-react-native';
import { useLanguage } from '@/hooks/useLanguage';
import { useStorage, dataEmitter } from '@/hooks/useStorage';
import HelpModal from '@/components/HelpModal';
import { handleDataExport, ExportError, getErrorMessage } from '@/utils/dataExport';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import designSystem from '@/styles/designSystem';

export default function SettingsScreen() {
  const { t, currentLanguage, changeLanguage, availableLanguages, languageMetadata } = useLanguage();
  const { products, movements, alerts, addProduct } = useStorage();
  const [isExporting, setIsExporting] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  /**
   * Handles the data export process with comprehensive error handling
   * Implements loading states and user feedback
   */
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      
      // Call the comprehensive export function
      await handleDataExport(products, movements, alerts);
      
      // Show success message
      Alert.alert(
        'Export erfolgreich',
        `Daten wurden erfolgreich exportiert!\n\n` +
        `Exportierte Datensätze:\n` +
        `• ${products.length} Produkte\n` +
        `• ${movements.length} Bewegungen\n` +
        `• ${alerts.length} Warnungen\n` +
        `• Benutzereinstellungen\n` +
        `• Verlaufsdaten`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      // Handle different types of export errors
      let errorMessage = 'Ein unerwarteter Fehler ist aufgetreten.';
      
      if (error instanceof ExportError) {
        errorMessage = getErrorMessage(error);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Export fehlgeschlagen',
        errorMessage,
        [
          { text: 'OK' },
          { 
            text: 'Erneut versuchen', 
            onPress: () => handleExportData() 
          }
        ]
      );
      
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const fileUri = result.assets[0].uri;
        
        // Read the file content
        const response = await fetch(fileUri);
        const fileContent = await response.text();
        
        try {
          // Parse JSON data
          const importedData = JSON.parse(fileContent);
          
          // Validate data structure
          if (!validateImportData(importedData)) {
            Alert.alert(
              'Import-Fehler',
              'Die JSON-Datei hat ein ungültiges Format. Bitte überprüfen Sie die Datenstruktur.'
            );
            return;
          }
          
          // Process the imported data
          await processImportedData(importedData);
          
          Alert.alert(
            'Import erfolgreich',
            `Daten wurden erfolgreich importiert!\n\n` +
            `Importierte Datensätze:\n` +
            `• ${importedData.products?.length || 0} Produkte\n` +
            `• Bewegungen wurden nicht importiert\n` +
            `• ${importedData.alerts?.length || 0} Warnungen`
          );
          
        } catch (parseError) {
          Alert.alert(
            'Import-Fehler',
            'Die Datei konnte nicht als JSON geparst werden. Bitte überprüfen Sie das Dateiformat.'
          );
        }
      }
    } catch (error) {
      Alert.alert('Fehler', 'Datei konnte nicht gelesen werden.');
    }
  };

  /**
   * Validates the structure of imported JSON data
   * @param data - The imported data object
   * @returns boolean - Whether the data is valid
   */
  const validateImportData = (data: any): boolean => {
    try {
      // Check if data is an object
      if (!data || typeof data !== 'object') {
        return false;
      }
      
      // Check for required top-level properties
      const requiredProps = ['products', 'movements', 'alerts'];
      const hasRequiredProps = requiredProps.some(prop => Array.isArray(data[prop]));
      
      if (!hasRequiredProps) {
        return false;
      }
      
      // Validate products array if present
      if (data.products && Array.isArray(data.products)) {
        for (const product of data.products) {
          if (!product.name || !product.category || typeof product.currentStock !== 'number') {
            return false;
          }
        }
      }
      
      // Validate movements array if present
      if (data.movements && Array.isArray(data.movements)) {
        for (const movement of data.movements) {
          if (!movement.productName || !movement.type || typeof movement.quantity !== 'number') {
            return false;
          }
        }
      }
      
      // Validate alerts array if present
      if (data.alerts && Array.isArray(data.alerts)) {
        for (const alert of data.alerts) {
          if (!alert.type || !alert.productName || !alert.message) {
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  };

  /**
   * Processes and imports the validated data
   * @param data - The validated import data
   */
  const processImportedData = async (data: any) => {
    try {
      // Import products if present
      if (data.products && Array.isArray(data.products)) {
        // Get current products first
        const currentProducts = [...products];
        let importedCount = 0;
        
        for (const productData of data.products) {
          // Check if product already exists
          const existingProduct = currentProducts.find(p => 
            p.name === productData.name && p.category === productData.category
          );
          
          if (!existingProduct) {
            // Create product object without calling addProduct
            const newProduct = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              name: productData.name,
              category: productData.category || '',
              currentStock: productData.currentStock || 0,
              minStock: productData.minStock || 0,
              unit: productData.unit || '',
              expiryDate: productData.expiryDate || '',
              location: productData.location || '',
              supplier: productData.supplier || '',
              barcode: productData.barcode || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            currentProducts.push(newProduct);
            importedCount++;
          }
        }
        
        // Save all products at once using the storage hook's saveProducts method
        if (importedCount > 0) {
          await AsyncStorage.setItem('products', JSON.stringify(currentProducts));
          
          // Trigger data reload using the data emitter
          dataEmitter.emit('dataChanged');
        }
      }
      
      // Note: Movement import is currently not supported
      // Movements data will be skipped during import process
      
    } catch (error) {
      console.error('Import processing error:', error);
      throw new Error('Fehler beim Verarbeiten der importierten Daten');
    }
  };

  const handleImportData_old = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        // Legacy CSV import functionality
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
        <View style={styles.settingsContainer}>
          <SettingItem
            icon={<User size={22} color={designSystem.colors.text.secondary} />}
            title="Profil"
            subtitle="CurrentUser"
          />
          <SettingItem
            icon={<Building size={22} color={designSystem.colors.text.secondary} />}
            title="Restaurant"
            subtitle="Coop Restaurant Aarberg"
          />
          <SettingItem
            icon={<Globe size={22} color={designSystem.colors.text.secondary} />}
            title={t('language')}
            subtitle={languageMetadata[currentLanguage as keyof typeof languageMetadata]?.name}
            rightElement={
              <View style={styles.languageSelector}>
                {availableLanguages.map(langCode => {
                  const lang = languageMetadata[langCode as keyof typeof languageMetadata];
                  return (
                  <TouchableOpacity
                    key={langCode}
                    style={[
                      styles.languageButton,
                      currentLanguage === langCode && styles.languageButtonActive
                    ]}
                    onPress={() => changeLanguage(langCode)}
                    activeOpacity={designSystem.interactive.states.active.opacity}
                    accessibilityRole="button"
                    accessibilityLabel={`Sprache ändern zu ${lang.name}`}
                    accessibilityState={{ selected: currentLanguage === langCode }}
                  >
                    <View style={styles.languageContent}>
                      <Text style={styles.languageText}>{lang.name}</Text>
                    </View>
                  </TouchableOpacity>
                  );
                })}
              </View>
            }
          />
          <SettingItem
            icon={<Download size={22} color={designSystem.colors.text.secondary} />}
            title={t('exportData')}
            subtitle={isExporting ? t('loading') : "Alle Daten als JSON herunterladen"}
            onPress={handleExportData}
            rightElement={isExporting ? (
              <View style={styles.loadingIndicator}>
                <Text style={styles.loadingText}>⏳</Text>
              </View>
            ) : undefined}
          />
          <SettingItem
            icon={<Upload size={22} color={designSystem.colors.text.secondary} />}
            title={t('importData')}
            subtitle="JSON-Datei mit Produktdaten auswählen"
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
          <SettingItem
            icon={<HelpCircle size={22} color={designSystem.colors.text.secondary} />}
            title={t('help')}
            subtitle="Häufig gestellte Fragen und Anleitungen"
            onPress={() => setShowHelpModal(true)}
          />
          <SettingItem
            icon={<HelpCircle size={22} color={designSystem.colors.text.secondary} />}
            title={t('support')}
            subtitle="Technischen Support kontaktieren"
            onPress={() => console.log('Contact')}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>FreshTrack v0.5.1</Text>
          <Text style={styles.copyrightText}>
            © 2025 FreshTrack. Entwickelt für nachhaltige Gastronomie.
          </Text>
        </View>
      </ScrollView>
      
      <HelpModal 
        visible={showHelpModal} 
        onClose={() => setShowHelpModal(false)} 
      />
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
  settingsContainer: {
    backgroundColor: designSystem.colors.background.secondary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    marginHorizontal: designSystem.spacing.xl,
    borderRadius: designSystem.interactive.border.radius,
    marginBottom: designSystem.spacing.xxxl,
    ...designSystem.shadows.low,
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
    gap: designSystem.spacing.sm,
    minWidth: designSystem.getResponsiveValue(140, 160, 180),
  },
  languageButton: {
    width: '100%',
    height: designSystem.accessibility.minTouchTarget.minHeight,
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
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageText: {
    ...designSystem.componentStyles.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: designSystem.getResponsiveValue(16, 18, 20),
    fontSize: designSystem.getResponsiveValue(14, 15, 16),
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
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.sm,
  },
  loadingText: {
    fontSize: 16,
  },
});