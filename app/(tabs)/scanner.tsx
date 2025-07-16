import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { Camera, QrCode, Plus, Package, Calendar } from 'lucide-react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useLanguage } from '@/hooks/useLanguage';
import { useStorage } from '@/hooks/useStorage';
import designSystem from '@/styles/designSystem';

export default function ScannerScreen() {
  const { t } = useLanguage();
  const { products, addMovement, addProduct } = useStorage();
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [pendingBarcode, setPendingBarcode] = useState<string>('');
  
  // Scanner State Management - Lösung für Multiple Dialog Bug
  const [scannerState, setScannerState] = useState({
    isProcessing: false,
    lastScannedCode: '',
    lastScanTime: 0,
    dialogActive: false
  });
  
  // Refs für zusätzliche Kontrolle
  const scanProcessingRef = useRef(false);
  const dialogActiveRef = useRef(false);
  const scanCooldownRef = useRef<NodeJS.Timeout | null>(null);
  
  const [movementData, setMovementData] = useState({
    type: 'in' as 'in' | 'out' | 'adjustment',
    quantity: 0,
    reason: '',
    notes: '',
  });
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    currentStock: 0,
    minStock: 0,
    unit: '',
    expiryDate: '',
    location: '',
    supplier: '',
    barcode: '',
  });

  // Konstanten für Scan-Kontrolle
  const SCAN_COOLDOWN_MS = 2000; // 2 Sekunden zwischen Scans
  const PROCESSING_TIMEOUT_MS = 5000; // 5 Sekunden Timeout für Processing

  /**
   * Debounced Barcode Handler - Hauptlösung für Multiple Dialog Problem
   */
  const handleBarcodeScanned = useCallback(async (data: string) => {
    const now = Date.now();
    
    // Debug-Logging für Entwicklung
    if (__DEV__) {
      console.log('🔍 Barcode Scan Event:', {
        data,
        isProcessing: scannerState.isProcessing,
        dialogActive: scannerState.dialogActive,
        lastCode: scannerState.lastScannedCode,
        timeSinceLastScan: now - scannerState.lastScanTime,
        timestamp: new Date().toISOString()
      });
    }
    
    // Schutz 1: Bereits in Verarbeitung
    if (scannerState.isProcessing || scanProcessingRef.current) {
      console.log('⚠️ Scan blocked: Already processing');
      return;
    }
    
    // Schutz 2: Dialog bereits aktiv
    if (scannerState.dialogActive || dialogActiveRef.current) {
      console.log('⚠️ Scan blocked: Dialog already active');
      return;
    }
    
    // Schutz 3: Cooldown-Periode
    if (now - scannerState.lastScanTime < SCAN_COOLDOWN_MS) {
      console.log('⚠️ Scan blocked: Cooldown period');
      return;
    }
    
    // Schutz 4: Duplikat-Scan
    if (data === scannerState.lastScannedCode && now - scannerState.lastScanTime < SCAN_COOLDOWN_MS * 2) {
      console.log('⚠️ Scan blocked: Duplicate code');
      return;
    }
    
    // Processing-State setzen
    setScannerState(prev => ({
      ...prev,
      isProcessing: true,
      lastScannedCode: data,
      lastScanTime: now
    }));
    scanProcessingRef.current = true;
    
    // Kamera sofort schließen
    setShowCamera(false);
    
    // Kurze Verzögerung für UI-Update
    setTimeout(async () => {
      try {
        // Produktsuche
        const product = products.find(p => p.barcode === data);
        
        if (product) {
          // Produkt gefunden - Movement Modal öffnen
          console.log('✅ Product found:', product.name);
          setSelectedProduct(product);
          setShowMovementModal(true);
          resetScannerState();
        } else {
          // Produkt nicht gefunden - Dialog anzeigen
          console.log('❌ Product not found, showing dialog');
          showProductNotFoundDialog(data);
        }
      } catch (error) {
        console.error('❌ Error processing scan:', error);
        resetScannerState();
        Alert.alert('Fehler', 'Fehler beim Verarbeiten des Scans. Bitte versuchen Sie es erneut.');
      }
    }, 150); // Kurze Verzögerung für bessere UX
    
  }, [products, scannerState]);

  /**
   * Sicherer Dialog für "Produkt nicht gefunden"
   */
  const showProductNotFoundDialog = useCallback((barcode: string) => {
    // Doppelter Schutz vor mehrfachen Dialogen
    if (dialogActiveRef.current || scannerState.dialogActive) {
      console.log('⚠️ Dialog blocked: Already active');
      resetScannerState();
      return;
    }
    
    // Dialog-State setzen
    setScannerState(prev => ({ ...prev, dialogActive: true }));
    dialogActiveRef.current = true;
    
    Alert.alert(
      t('productNotFound'),
      `Barcode: ${barcode}\n\nMöchten Sie ein neues Produkt anlegen?`,
      [
        { 
          text: t('cancel'), 
          style: 'cancel',
          onPress: () => {
            console.log('🚫 User cancelled product creation');
            resetScannerState();
          }
        },
        { 
          text: 'Produkt anlegen', 
          onPress: () => {
            console.log('✅ User confirmed product creation');
            handleCreateProduct(barcode);
          }
        }
      ],
      { 
        cancelable: false, // Verhindert versehentliches Schließen
        onDismiss: () => {
          console.log('📱 Dialog dismissed');
          resetScannerState();
        }
      }
    );
  }, [t, scannerState.dialogActive]);

  /**
   * Scanner-State zurücksetzen
   */
  const resetScannerState = useCallback(() => {
    console.log('🔄 Resetting scanner state');
    
    setScannerState({
      isProcessing: false,
      lastScannedCode: '',
      lastScanTime: 0,
      dialogActive: false
    });
    
    scanProcessingRef.current = false;
    dialogActiveRef.current = false;
    setScannedData(null);
    
    // Cooldown-Timer löschen
    if (scanCooldownRef.current) {
      clearTimeout(scanCooldownRef.current);
      scanCooldownRef.current = null;
    }
  }, []);

  /**
   * Sicherheits-Timeout für Processing-State
   */
  useEffect(() => {
    if (scannerState.isProcessing) {
      const timeout = setTimeout(() => {
        console.log('⏰ Processing timeout reached, resetting state');
        resetScannerState();
      }, PROCESSING_TIMEOUT_MS);
      
      return () => clearTimeout(timeout);
    }
  }, [scannerState.isProcessing, resetScannerState]);

  /**
   * Überwachter useEffect für scannedData
   */
  useEffect(() => {
    if (scannedData && !scannerState.isProcessing && !scannerState.dialogActive) {
      console.log('📊 Processing scanned data:', scannedData);
      handleBarcodeScanned(scannedData);
    }
  }, [scannedData, handleBarcodeScanned, scannerState.isProcessing, scannerState.dialogActive]);

  /**
   * Cleanup beim Unmount
   */
  useEffect(() => {
    return () => {
      resetScannerState();
    };
  }, [resetScannerState]);

  const handleCreateProduct = (barcode: string) => {
    setPendingBarcode(barcode);
    setNewProduct({
      name: '',
      category: '',
      currentStock: 0,
      minStock: 0,
      unit: '',
      expiryDate: '',
      location: '',
      supplier: '',
      barcode: barcode,
    });
    setShowAddProductModal(true);
    resetScannerState();
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) {
      Alert.alert('Fehler', 'Bitte geben Sie einen Produktnamen ein.');
      return;
    }
    
    // Validate date format before saving
    const validateGermanDate = (dateString: string) => {
      if (!dateString) return true; // Allow empty dates
      
      const germanDateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
      const match = dateString.match(germanDateRegex);
      
      if (!match) return false;
      
      const [, day, month, year] = match;
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      // Basic validation
      if (dayNum < 1 || dayNum > 31) return false;
      if (monthNum < 1 || monthNum > 12) return false;
      if (yearNum < 1900 || yearNum > 2100) return false;
      
      // Create date to check if it's valid
      const testDate = new Date(yearNum, monthNum - 1, dayNum);
      return testDate.getDate() === dayNum && 
             testDate.getMonth() === monthNum - 1 && 
             testDate.getFullYear() === yearNum;
    };
    
    if (newProduct.expiryDate && !validateGermanDate(newProduct.expiryDate)) {
      Alert.alert('Fehler', 'Bitte geben Sie ein gültiges Datum im Format DD.MM.YYYY ein (z.B. 30.03.1973)');
      return;
    }
    
    try {
      await addProduct(newProduct);
      setShowAddProductModal(false);
      
      // Reset form
      setNewProduct({
        name: '',
        category: '',
        currentStock: 0,
        minStock: 0,
        unit: '',
        expiryDate: '',
        location: '',
        supplier: '',
        barcode: '',
      });
      setPendingBarcode('');
      
      Alert.alert('Erfolg', 'Produkt wurde erfolgreich angelegt!');
    } catch (error) {
      Alert.alert('Fehler', 'Produkt konnte nicht angelegt werden.');
    }
  };

  const handleManualEntry = () => {
    if (manualBarcode.trim()) {
      handleBarcodeScanned(manualBarcode.trim());
      setManualBarcode('');
      setShowManualEntry(false);
    }
  };

  const handleMovement = async () => {
    if (!selectedProduct || !movementData.quantity || !movementData.reason) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    await addMovement({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      type: movementData.type,
      quantity: movementData.quantity,
      reason: movementData.reason,
      user: 'Current User', // In real app, get from auth
      notes: movementData.notes,
    });

    setShowMovementModal(false);
    setSelectedProduct(null);
    setMovementData({
      type: 'in',
      quantity: 0,
      reason: '',
      notes: '',
    });

    Alert.alert('Erfolg', 'Bewegung wurde erfasst');
  };

  /**
   * Sicherer Camera Handler mit Debouncing
   */
  const handleCameraBarcodeScan = useCallback(({ data }: { data: string }) => {
    // Zusätzlicher Schutz auf Camera-Level
    if (scannerState.isProcessing || scannerState.dialogActive) {
      return;
    }
    
    console.log('📷 Camera scan detected:', data);
    setScannedData(data);
  }, [scannerState.isProcessing, scannerState.dialogActive]);

  if (!permission) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color={designSystem.colors.text.secondary} />
          <Text style={styles.permissionTitle}>Kamera-Berechtigung erforderlich</Text>
          <Text style={styles.permissionText}>
            Um Barcodes zu scannen, benötigen wir Zugriff auf Ihre Kamera.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={requestPermission}
            activeOpacity={designSystem.interactive.states.active.opacity}
            accessibilityRole="button"
            accessibilityLabel="Kamera-Berechtigung erteilen"
          >
            <Text style={styles.permissionButtonText}>Berechtigung erteilen</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('scanner')}</Text>
        {/* Debug-Info in Development */}
        {__DEV__ && (
          <Text style={styles.debugText}>
            Processing: {scannerState.isProcessing ? 'Yes' : 'No'} | 
            Dialog: {scannerState.dialogActive ? 'Yes' : 'No'}
          </Text>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.scanOptions}>
          <TouchableOpacity 
            style={[
              styles.scanButton,
              scannerState.isProcessing && styles.scanButtonDisabled
            ]}
            onPress={() => !scannerState.isProcessing && setShowCamera(true)}
            activeOpacity={designSystem.interactive.states.active.opacity}
            accessibilityRole="button"
            accessibilityLabel={t('scanBarcode')}
            disabled={scannerState.isProcessing}
          >
            <QrCode size={32} color={
              scannerState.isProcessing 
                ? designSystem.colors.text.disabled 
                : designSystem.colors.text.primary
            } />
            <Text style={[
              styles.scanButtonText,
              scannerState.isProcessing && styles.scanButtonTextDisabled
            ]}>
              {scannerState.isProcessing ? 'Verarbeitung...' : t('scanBarcode')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.manualButton,
              scannerState.isProcessing && styles.manualButtonDisabled
            ]}
            onPress={() => !scannerState.isProcessing && setShowManualEntry(true)}
            activeOpacity={designSystem.interactive.states.active.opacity}
            accessibilityRole="button"
            accessibilityLabel={t('manualEntry')}
            disabled={scannerState.isProcessing}
          >
            <Plus size={24} color={
              scannerState.isProcessing 
                ? designSystem.colors.text.disabled 
                : designSystem.colors.success[500]
            } />
            <Text style={[
              styles.manualButtonText,
              scannerState.isProcessing && styles.manualButtonTextDisabled
            ]}>
              {t('manualEntry')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>So funktioniert's:</Text>
          <Text style={styles.instructionsText}>
            1. Tippen Sie auf "Barcode scannen" um die Kamera zu öffnen{'\n'}
            2. Richten Sie die Kamera auf den Barcode{'\n'}
            3. Warten Sie, bis der Code automatisch erkannt wird{'\n'}
            4. Geben Sie die Lagerbewegung ein
          </Text>
        </View>
      </View>

      {/* Camera Modal */}
      <Modal visible={showCamera} animationType="slide">
        <SafeAreaView style={styles.cameraContainer}>
          <View style={styles.cameraHeader}>
            <TouchableOpacity 
              onPress={() => {
                setShowCamera(false);
                resetScannerState();
              }}
              activeOpacity={designSystem.interactive.states.active.opacity}
              accessibilityRole="button"
              accessibilityLabel="Kamera schließen"
            >
              <Text style={styles.cancelButton}>Abbrechen</Text>
            </TouchableOpacity>
            <Text style={styles.cameraTitle}>Barcode scannen</Text>
            <View style={{ width: 80 }} />
          </View>
          
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleCameraBarcodeScan}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'pdf417', 'ean13', 'ean8', 'code128', 'code39'],
            }}
          >
            <View style={styles.scanOverlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanInstructions}>
                Richten Sie den Barcode im Rahmen aus
              </Text>
              {scannerState.isProcessing && (
                <Text style={styles.processingText}>
                  Verarbeitung läuft...
                </Text>
              )}
            </View>
          </CameraView>
        </SafeAreaView>
      </Modal>

      {/* Manual Entry Modal */}
      <Modal visible={showManualEntry} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowManualEntry(false)}
              activeOpacity={designSystem.interactive.states.active.opacity}
              accessibilityRole="button"
              accessibilityLabel={t('cancel')}
            >
              <Text style={styles.cancelButton}>{t('cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Barcode eingeben</Text>
            <TouchableOpacity 
              onPress={handleManualEntry}
              activeOpacity={designSystem.interactive.states.active.opacity}
              accessibilityRole="button"
              accessibilityLabel="Barcode suchen"
            >
              <Text style={styles.saveButton}>Suchen</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Barcode</Text>
            <TextInput
              style={styles.textInput}
              value={manualBarcode}
              onChangeText={setManualBarcode}
              placeholder="Barcode eingeben..."
              placeholderTextColor={designSystem.colors.text.disabled}
              autoFocus
              returnKeyType="search"
              accessibilityLabel="Barcode eingeben"
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Add Product Modal */}
      <Modal visible={showAddProductModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddProductModal(false)}>
              <Text style={styles.cancelButton}>{t('cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Neues Produkt</Text>
            <TouchableOpacity onPress={handleAddProduct}>
              <Text style={styles.saveButton}>{t('save')}</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {pendingBarcode && (
              <View style={styles.barcodeInfo}>
                <Text style={styles.barcodeLabel}>Gescannter Barcode:</Text>
                <Text style={styles.barcodeValue}>{pendingBarcode}</Text>
              </View>
            )}
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('productName')} *</Text>
              <TextInput
                style={styles.textInput}
                value={newProduct.name}
                onChangeText={(text) => setNewProduct({...newProduct, name: text})}
                placeholder="z.B. Tomaten"
                placeholderTextColor="#6B7280"
                autoFocus
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('category')}</Text>
              <TextInput
                style={styles.textInput}
                value={newProduct.category}
                onChangeText={(text) => setNewProduct({...newProduct, category: text})}
                placeholder="z.B. Gemüse"
                placeholderTextColor="#6B7280"
              />
            </View>
            
            <View style={styles.inputRow}>
              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>{t('quantity')}</Text>
                <TextInput
                  style={styles.textInput}
                  value={newProduct.currentStock.toString()}
                  onChangeText={(text) => setNewProduct({...newProduct, currentStock: parseInt(text) || 0})}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#6B7280"
                />
              </View>
              
              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>{t('unit')}</Text>
                <TextInput
                  style={styles.textInput}
                  value={newProduct.unit}
                  onChangeText={(text) => setNewProduct({...newProduct, unit: text})}
                  placeholder="kg, Stück, L"
                  placeholderTextColor="#6B7280"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mindestbestand</Text>
              <TextInput
                style={styles.textInput}
                value={newProduct.minStock.toString()}
                onChangeText={(text) => setNewProduct({...newProduct, minStock: parseInt(text) || 0})}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#6B7280"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('expiryDate')}</Text>
              <View style={styles.dateInputContainer}>
                <TextInput
                  style={[styles.textInput, styles.dateInput]}
                  value={newProduct.expiryDate}
                  onChangeText={(text) => setNewProduct({...newProduct, expiryDate: text})}
                  placeholder="DD.MM.YYYY"
                  placeholderTextColor="#6B7280"
                />
                <TouchableOpacity style={styles.calendarButton}>
                  <Calendar size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('location')}</Text>
              <TextInput
                style={styles.textInput}
                value={newProduct.location}
                onChangeText={(text) => setNewProduct({...newProduct, location: text})}
                placeholder="z.B. Kühlschrank A1"
                placeholderTextColor="#6B7280"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Lieferant</Text>
              <TextInput
                style={styles.textInput}
                value={newProduct.supplier}
                onChangeText={(text) => setNewProduct({...newProduct, supplier: text})}
                placeholder="z.B. Frische AG"
                placeholderTextColor="#6B7280"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Movement Modal */}
      <Modal visible={showMovementModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMovementModal(false)}>
              <Text style={styles.cancelButton}>{t('cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Lagerbewegung</Text>
            <TouchableOpacity onPress={handleMovement}>
              <Text style={styles.saveButton}>{t('save')}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            {selectedProduct && (
              <View style={styles.productInfo}>
                <Package size={24} color="#22C55E" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{selectedProduct.name}</Text>
                  <Text style={styles.productDetails}>
                    Aktueller Bestand: {selectedProduct.currentStock} {selectedProduct.unit}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.movementTypeContainer}>
              <Text style={styles.inputLabel}>Bewegungstyp</Text>
              <View style={styles.buttonGroup}>
                {[
                  { key: 'in', label: 'Wareneingang', color: '#22C55E' },
                  { key: 'out', label: 'Warenausgang', color: '#EF4444' },
                  { key: 'adjustment', label: 'Anpassung', color: '#6B7280' },
                ].map(type => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.typeButton,
                      movementData.type === type.key && { backgroundColor: type.color }
                    ]}
                    onPress={() => setMovementData({...movementData, type: type.key as any})}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      movementData.type === type.key && { color: '#ffffff' }
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('quantity')}</Text>
              <TextInput
                style={styles.textInput}
                value={movementData.quantity.toString()}
                onChangeText={(text) => setMovementData({...movementData, quantity: parseInt(text) || 0})}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('reason')}</Text>
              <TextInput
                style={styles.textInput}
                value={movementData.reason}
                onChangeText={(text) => setMovementData({...movementData, reason: text})}
                placeholder="z.B. Lieferung, Verkauf, Korrektur"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('notes')}</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={movementData.notes}
                onChangeText={(text) => setMovementData({...movementData, notes: text})}
                placeholder="Zusätzliche Notizen..."
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
  debugText: {
    ...designSystem.componentStyles.textCaption,
    color: designSystem.colors.warning[500],
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: designSystem.spacing.xl,
  },
  scanOptions: {
    gap: designSystem.spacing.lg,
    marginBottom: 40,
  },
  scanButton: {
    ...designSystem.componentStyles.interactiveBase,
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    padding: designSystem.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    ...designSystem.shadows.low,
  },
  scanButtonDisabled: {
    opacity: 0.6,
    backgroundColor: designSystem.colors.neutral[200],
  },
  scanButtonText: {
    ...designSystem.componentStyles.textSubtitle,
    fontWeight: '600',
    marginTop: designSystem.spacing.sm,
  },
  scanButtonTextDisabled: {
    color: designSystem.colors.text.disabled,
  },
  manualButton: {
    ...designSystem.componentStyles.interactiveBase,
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    padding: designSystem.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designSystem.spacing.sm,
    ...designSystem.shadows.low,
  },
  manualButtonDisabled: {
    opacity: 0.6,
    backgroundColor: designSystem.colors.neutral[200],
  },
  manualButtonText: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
  },
  manualButtonTextDisabled: {
    color: designSystem.colors.text.disabled,
  },
  instructionsContainer: {
    ...designSystem.componentStyles.interactiveBase,
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    padding: designSystem.spacing.xl,
    ...designSystem.shadows.low,
  },
  instructionsTitle: {
    ...designSystem.componentStyles.textSubtitle,
    fontWeight: '600',
    marginBottom: designSystem.spacing.md,
  },
  instructionsText: {
    ...designSystem.componentStyles.textSecondary,
    lineHeight: 20,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionTitle: {
    ...designSystem.componentStyles.textHeader,
    fontWeight: '600',
    marginTop: designSystem.spacing.lg,
    marginBottom: designSystem.spacing.sm,
    textAlign: 'center',
  },
  permissionText: {
    ...designSystem.componentStyles.textPrimary,
    textAlign: 'center',
    marginBottom: designSystem.spacing.xxl,
    lineHeight: 22,
  },
  permissionButton: {
    ...designSystem.componentStyles.interactiveBase,
    backgroundColor: designSystem.colors.background.secondary,
    paddingHorizontal: designSystem.spacing.xxl,
    paddingVertical: designSystem.spacing.md,
    borderRadius: designSystem.interactive.border.radius,
    ...designSystem.accessibility.minTouchTarget,
    ...designSystem.shadows.low,
  },
  permissionButtonText: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: designSystem.colors.neutral[900],
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: designSystem.spacing.xl,
    backgroundColor: designSystem.colors.neutral[900],
  },
  cameraTitle: {
    ...designSystem.componentStyles.textSubtitle,
    fontWeight: '600',
    color: designSystem.colors.text.inverse,
  },
  cancelButton: {
    ...designSystem.componentStyles.textPrimary,
    color: designSystem.colors.text.inverse,
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.colors.secondary[500],
    borderRadius: designSystem.interactive.border.radius,
    backgroundColor: 'transparent',
  },
  scanInstructions: {
    ...designSystem.componentStyles.textPrimary,
    color: designSystem.colors.text.inverse,
    textAlign: 'center',
    marginTop: designSystem.spacing.xl,
    paddingHorizontal: 40,
  },
  processingText: {
    ...designSystem.componentStyles.textPrimary,
    color: designSystem.colors.warning[500],
    textAlign: 'center',
    marginTop: designSystem.spacing.md,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: designSystem.colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: designSystem.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: designSystem.interactive.border.color,
  },
  modalTitle: {
    ...designSystem.componentStyles.textSubtitle,
  },
  saveButton: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: designSystem.spacing.xl,
  },
  productInfo: {
    ...designSystem.componentStyles.interactiveBase,
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    padding: designSystem.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.md,
    marginBottom: designSystem.spacing.xxl,
    ...designSystem.shadows.low,
  },
  productName: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
  },
  productDetails: {
    ...designSystem.componentStyles.textSecondary,
    marginTop: 2,
  },
  movementTypeContainer: {
    marginBottom: designSystem.spacing.xl,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: designSystem.spacing.sm,
  },
  typeButton: {
    flex: 1,
    backgroundColor: designSystem.colors.background.secondary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    paddingVertical: designSystem.spacing.md,
    borderRadius: designSystem.interactive.border.radius,
    alignItems: 'center',
    ...designSystem.shadows.low,
  },
  typeButtonText: {
    ...designSystem.componentStyles.textSecondary,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: designSystem.spacing.xl,
  },
  inputLabel: {
    ...designSystem.componentStyles.textSecondary,
    fontWeight: '600',
    marginBottom: designSystem.spacing.sm,
  },
  textInput: {
    ...designSystem.componentStyles.interactiveBase,
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    padding: designSystem.spacing.md,
    ...designSystem.componentStyles.textPrimary,
    minHeight: 48,
    ...designSystem.shadows.low,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.sm,
  },
  dateInput: {
    flex: 1,
  },
  calendarButton: {
    backgroundColor: designSystem.colors.background.secondary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    width: 44,
    height: 44,
    borderRadius: designSystem.interactive.border.radius,
    justifyContent: 'center',
    alignItems: 'center',
    ...designSystem.shadows.low,
  },
  barcodeInfo: {
    ...designSystem.componentStyles.interactiveBase,
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    padding: designSystem.spacing.md,
    marginBottom: designSystem.spacing.xl,
    ...designSystem.shadows.low,
  },
  barcodeLabel: {
    ...designSystem.componentStyles.textCaption,
    fontWeight: '600',
    marginBottom: 4,
  },
  barcodeValue: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  inputRow: {
    flexDirection: 'row',
    gap: designSystem.spacing.md,
  },
  inputGroupHalf: {
    flex: 1,
  },
});