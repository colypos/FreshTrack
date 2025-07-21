/**
 * Web-Polyfills für Kamera und QR-Scanner Funktionalität
 * 
 * Stellt sicher, dass alle notwendigen Web-APIs verfügbar sind
 * und implementiert Fallbacks für nicht unterstützte Browser.
 */

/**
 * Initialisiert Web-spezifische Polyfills und APIs
 */
export const initializeWebPolyfills = () => {
  if (typeof window === 'undefined') return;

  console.log('🌐 Initializing web polyfills...');

  // Prüfe Kamera-API Verfügbarkeit
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log('✅ getUserMedia API available');
  } else {
    console.warn('❌ getUserMedia API not available');
  }

  // Prüfe BarcodeDetector API
  if ('BarcodeDetector' in window) {
    console.log('✅ BarcodeDetector API available');
    
    // Teste unterstützte Formate
    try {
      (window as any).BarcodeDetector.getSupportedFormats().then((formats: string[]) => {
        console.log('📱 Supported barcode formats:', formats);
      }).catch((error: any) => {
        console.warn('⚠️ Could not get supported formats:', error);
      });
    } catch (error) {
      console.warn('⚠️ BarcodeDetector.getSupportedFormats failed:', error);
    }
  } else {
    console.warn('❌ BarcodeDetector API not available - using Expo fallback');
  }

  // Browser-spezifische Informationen loggen
  const browserInfo = getBrowserInfo();
  console.log('🔍 Browser info:', browserInfo);

  // Kamera-Capabilities testen
  testCameraCapabilities();
};

/**
 * Ermittelt Browser-Informationen für Debugging
 */
export const getBrowserInfo = () => {
  if (typeof window === 'undefined') return {};

  const ua = navigator.userAgent;
  return {
    isIOS: /iPad|iPhone|iPod/.test(ua),
    isAndroid: /Android/.test(ua),
    isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
    isChrome: /Chrome/.test(ua),
    isFirefox: /Firefox/.test(ua),
    userAgent: ua,
    platform: navigator.platform,
    language: navigator.language
  };
};

/**
 * Testet verfügbare Kamera-Capabilities
 */
export const testCameraCapabilities = async () => {
  if (typeof window === 'undefined') return;

  try {
    console.log('🎥 Testing camera capabilities...');

    // Teste MediaDevices API
    if (navigator.mediaDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      console.log(`📹 Found ${cameras.length} camera(s):`, cameras.map(c => c.label || 'Unknown Camera'));

      // Teste Kamera-Zugriff
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        console.log('✅ Camera access successful');
        
        // Stream sofort wieder stoppen
        stream.getTracks().forEach(track => track.stop());
      } catch (cameraError) {
        console.error('❌ Camera access failed:', cameraError);
      }
    }

    // Teste BarcodeDetector falls verfügbar
    if ('BarcodeDetector' in window) {
      try {
        const detector = new (window as any).BarcodeDetector({
          formats: ['qr_code', 'ean_13', 'code_128']
        });
        console.log('✅ BarcodeDetector instance created successfully');
      } catch (detectorError) {
        console.error('❌ BarcodeDetector creation failed:', detectorError);
      }
    }

  } catch (error) {
    console.error('❌ Camera capability test failed:', error);
  }
};

/**
 * Loggt Scanner-Events für Debugging
 */
export const logScannerEvent = (event: string, data?: any) => {
  const browserInfo = getBrowserInfo();
  
  console.log(`📊 Scanner Event: ${event}`, {
    timestamp: new Date().toISOString(),
    event,
    data,
    browser: {
      isIOS: browserInfo.isIOS,
      isAndroid: browserInfo.isAndroid,
      isSafari: browserInfo.isSafari,
      isChrome: browserInfo.isChrome
    },
    url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
  });
};

/**
 * Prüft ob die aktuelle Umgebung HTTPS verwendet
 */
export const checkHTTPS = () => {
  if (typeof window === 'undefined') return true;

  const isHTTPS = window.location.protocol === 'https:';
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

  if (!isHTTPS && !isLocalhost) {
    console.warn('⚠️ Camera APIs require HTTPS in production environments');
    return false;
  }

  console.log('✅ HTTPS requirement satisfied');
  return true;
};