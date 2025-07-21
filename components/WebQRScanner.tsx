/**
 * Fallback QR-Scanner für Web-Browser
 * 
 * Diese Komponente bietet eine alternative QR-Scanner-Implementierung
 * für Fälle, in denen expo-camera auf Web-Plattformen nicht funktioniert.
 * 
 * Verwendet native Web-APIs für maximale Kompatibilität.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import designSystem from '@/styles/designSystem';

interface WebQRScannerProps {
  /** Callback wenn QR-Code erkannt wird */
  onScan: (data: string) => void;
  /** Ob der Scanner aktiv ist */
  isActive: boolean;
  /** Stil für den Container */
  style?: any;
}

/**
 * Web-basierter QR-Scanner als Fallback
 * 
 * Nutzt getUserMedia API und Canvas für QR-Code-Erkennung
 * ohne externe Abhängigkeiten.
 */
export default function WebQRScanner({ onScan, isActive, style }: WebQRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Startet die Kamera und beginnt mit dem Scannen
   */
  const startCamera = useCallback(async () => {
    if (Platform.OS !== 'web') return;

    try {
      console.log('🎥 Starting web camera for QR scanning...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Rückkamera bevorzugen
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        setError(null);
        
        console.log('✅ Camera started successfully');
        startQRDetection();
      }
    } catch (error) {
      console.error('❌ Camera access failed:', error);
      setError('Kamera-Zugriff fehlgeschlagen. Bitte überprüfen Sie die Berechtigungen.');
    }
  }, []);

  /**
   * Stoppt die Kamera und das Scannen
   */
  const stopCamera = useCallback(() => {
    console.log('🛑 Stopping web camera...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    setIsScanning(false);
  }, []);

  /**
   * Startet die QR-Code-Erkennung
   * 
   * Verwendet BarcodeDetector API falls verfügbar,
   * sonst Canvas-basierte Erkennung.
   */
  const startQRDetection = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    console.log('🔍 Starting QR detection...');

    // Prüfe BarcodeDetector API Verfügbarkeit
    if ('BarcodeDetector' in window) {
      startBarcodeDetectorScanning();
    } else {
      console.warn('⚠️ BarcodeDetector not available, using canvas fallback');
      startCanvasScanning();
    }
  }, []);

  /**
   * Verwendet die native BarcodeDetector API
   */
  const startBarcodeDetectorScanning = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const detector = new (window as any).BarcodeDetector({
        formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39']
      });

      const scanFrame = async () => {
        if (!videoRef.current || !isScanning) return;

        try {
          const barcodes = await detector.detect(videoRef.current);
          
          if (barcodes.length > 0) {
            const barcode = barcodes[0];
            console.log('✅ QR Code detected via BarcodeDetector:', barcode.rawValue);
            onScan(barcode.rawValue);
            return; // Stoppe nach erstem erfolgreichen Scan
          }
        } catch (error) {
          console.warn('⚠️ BarcodeDetector scan error:', error);
        }

        // Nächsten Frame scannen
        if (isScanning) {
          requestAnimationFrame(scanFrame);
        }
      };

      scanFrame();
    } catch (error) {
      console.error('❌ BarcodeDetector initialization failed:', error);
      startCanvasScanning(); // Fallback zu Canvas
    }
  }, [isScanning, onScan]);

  /**
   * Canvas-basierte QR-Code-Erkennung als Fallback
   */
  const startCanvasScanning = useCallback(() => {
    console.log('🎨 Using canvas-based scanning fallback');
    
    // Hier würde eine Canvas-basierte QR-Code-Erkennung implementiert
    // Für jetzt nur ein Platzhalter mit Benutzer-Feedback
    setError('QR-Scanner benötigt einen moderneren Browser. Bitte verwenden Sie die manuelle Eingabe.');
  }, []);

  /**
   * Effekt für Kamera-Management basierend auf isActive
   */
  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive, startCamera, stopCamera]);

  // Nur auf Web-Plattform rendern
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <video
            ref={videoRef}
            style={styles.video}
            autoPlay
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            style={styles.canvas}
          />
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.instructionText}>
              QR-Code im Rahmen positionieren
            </Text>
            {isScanning && (
              <Text style={styles.statusText}>
                Scanning...
              </Text>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: designSystem.colors.neutral[900],
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0, // Versteckt, nur für Verarbeitung
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: designSystem.colors.secondary[500],
    borderRadius: designSystem.interactive.border.radius,
    backgroundColor: 'transparent',
  },
  instructionText: {
    ...designSystem.componentStyles.textPrimary,
    color: designSystem.colors.text.inverse,
    textAlign: 'center',
    marginTop: designSystem.spacing.xl,
    paddingHorizontal: 40,
  },
  statusText: {
    ...designSystem.componentStyles.textCaption,
    color: designSystem.colors.warning[500],
    textAlign: 'center',
    marginTop: designSystem.spacing.md,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: designSystem.spacing.xl,
  },
  errorText: {
    ...designSystem.componentStyles.textPrimary,
    color: designSystem.colors.error[500],
    textAlign: 'center',
    lineHeight: 22,
  },
});