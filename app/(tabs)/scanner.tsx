import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, QrCode, Plus, Package } from 'lucide-react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useLanguage } from '@/hooks/useLanguage';
import { useStorage } from '@/hooks/useStorage';

export default function ScannerScreen() {
  const { t } = useLanguage();
  const { products, addMovement } = useStorage();
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [movementData, setMovementData] = useState({
    type: 'in' as 'in' | 'out' | 'adjustment',
    quantity: 0,
    reason: '',
    notes: '',
  });

  useEffect(() => {
    if (scannedData) {
      handleBarcodeScanned(scannedData);
    }
  }, [scannedData]);

  const handleBarcodeScanned = (data: string) => {
    setShowCamera(false);
    
    // Find product by barcode
    const product = products.find(p => p.barcode === data);
    
    if (product) {
      setSelectedProduct(product);
      setShowMovementModal(true);
    } else {
      Alert.alert(
        t('productNotFound'),
        `Barcode: ${data}\n\nMöchten Sie ein neues Produkt anlegen?`,
        [
          { text: t('cancel'), style: 'cancel' },
          { text: 'Produkt anlegen', onPress: () => {
            // Navigate to add product with barcode
            console.log('Navigate to add product with barcode:', data);
          }}
        ]
      );
    }
    
    setScannedData(null);
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

  if (!permission) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color="#6b7280" />
          <Text style={styles.permissionTitle}>Kamera-Berechtigung erforderlich</Text>
          <Text style={styles.permissionText}>
            Um Barcodes zu scannen, benötigen wir Zugriff auf Ihre Kamera.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
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
      </View>

      <View style={styles.content}>
        <View style={styles.scanOptions}>
          <TouchableOpacity 
            style={styles.scanButton}
            onPress={() => setShowCamera(true)}
          >
            <QrCode size={32} color="#ffffff" />
            <Text style={styles.scanButtonText}>{t('scanBarcode')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.manualButton}
            onPress={() => setShowManualEntry(true)}
          >
            <Plus size={24} color="#22C55E" />
            <Text style={styles.manualButtonText}>{t('manualEntry')}</Text>
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
            <TouchableOpacity onPress={() => setShowCamera(false)}>
              <Text style={styles.cancelButton}>Abbrechen</Text>
            </TouchableOpacity>
            <Text style={styles.cameraTitle}>Barcode scannen</Text>
            <View style={{ width: 80 }} />
          </View>
          
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={({ data }) => setScannedData(data)}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'pdf417', 'ean13', 'ean8', 'code128', 'code39'],
            }}
          >
            <View style={styles.scanOverlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanInstructions}>
                Richten Sie den Barcode im Rahmen aus
              </Text>
            </View>
          </CameraView>
        </SafeAreaView>
      </Modal>

      {/* Manual Entry Modal */}
      <Modal visible={showManualEntry} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowManualEntry(false)}>
              <Text style={styles.cancelButton}>{t('cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Barcode eingeben</Text>
            <TouchableOpacity onPress={handleManualEntry}>
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
              autoFocus
            />
          </View>
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
    backgroundColor: '#f8fafc',
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
    padding: 20,
  },
  scanOptions: {
    gap: 16,
    marginBottom: 40,
  },
  scanButton: {
    backgroundColor: '#22C55E',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  manualButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#22C55E',
    gap: 8,
  },
  manualButtonText: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  cancelButton: {
    fontSize: 16,
    color: '#ffffff',
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
    borderWidth: 2,
    borderColor: '#22C55E',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanInstructions: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  saveButton: {
    fontSize: 16,
    color: '#22C55E',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  productInfo: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  productDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  movementTypeContainer: {
    marginBottom: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});