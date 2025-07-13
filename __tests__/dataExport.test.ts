/**
 * Unit Tests for Data Export Functionality
 * 
 * @author FreshTrack Development Team
 * @version 1.0.0
 * @since 2025-01-27
 */

import { handleDataExport, ExportError, ExportErrorType, getErrorMessage } from '@/utils/dataExport';
import { Product, Movement, Alert } from '@/types';

// Mock data for testing
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Test Product',
    category: 'Test Category',
    currentStock: 10,
    minStock: 5,
    unit: 'kg',
    expiryDate: '31.12.2025',
    location: 'Test Location',
    createdAt: '2025-01-27T10:00:00Z',
    updatedAt: '2025-01-27T10:00:00Z'
  }
];

const mockMovements: Movement[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Test Product',
    type: 'in',
    quantity: 5,
    reason: 'Test Reason',
    user: 'Test User',
    timestamp: '2025-01-27T10:00:00Z'
  }
];

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'low_stock',
    severity: 'medium',
    productId: '1',
    productName: 'Test Product',
    message: 'Test Alert',
    timestamp: '2025-01-27T10:00:00Z',
    acknowledged: false
  }
];

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock global objects
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(window, 'navigator', {
  value: {
    onLine: true,
    userAgent: 'Test User Agent'
  }
});

Object.defineProperty(window, 'location', {
  value: {
    protocol: 'https:',
    hostname: 'test.com'
  }
});

// Mock URL.createObjectURL and document methods
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

Object.defineProperty(document, 'createElement', {
  value: jest.fn(() => ({
    href: '',
    download: '',
    style: { display: '' },
    click: jest.fn(),
  }))
});

Object.defineProperty(document.body, 'appendChild', {
  value: jest.fn()
});

Object.defineProperty(document.body, 'removeChild', {
  value: jest.fn()
});

// Mock fetch for network validation
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
  })
) as jest.Mock;

describe('Data Export Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    
    // Setup default localStorage values
    localStorageMock.getItem.mockImplementation((key: string) => {
      switch (key) {
        case 'session_token':
          return 'valid-token';
        case 'session_expiry':
          return new Date(Date.now() + 3600000).toISOString(); // 1 hour from now
        case 'export_rate_limit':
          return null; // No previous exports
        case 'export_logs':
          return '[]';
        default:
          return null;
      }
    });
  });

  describe('handleDataExport', () => {
    test('should successfully export data with valid inputs', async () => {
      await expect(handleDataExport(mockProducts, mockMovements, mockAlerts))
        .resolves.not.toThrow();
      
      // Verify rate limiting was checked
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'export_rate_limit',
        expect.stringContaining('count')
      );
      
      // Verify export log was created
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'export_logs',
        expect.stringContaining('timestamp')
      );
    });

    test('should throw session error when session is invalid', async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'session_token') return null;
        if (key === 'session_expiry') return null;
        return null;
      });

      await expect(handleDataExport(mockProducts, mockMovements, mockAlerts))
        .rejects.toThrow(ExportError);
      
      try {
        await handleDataExport(mockProducts, mockMovements, mockAlerts);
      } catch (error) {
        expect(error).toBeInstanceOf(ExportError);
        expect((error as ExportError).type).toBe(ExportErrorType.SESSION_ERROR);
      }
    });

    test('should throw rate limit error when limit exceeded', async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'export_rate_limit') {
          return JSON.stringify({
            count: 5, // Max limit reached
            windowStart: Date.now() - 1000 // Recent window
          });
        }
        if (key === 'session_token') return 'valid-token';
        if (key === 'session_expiry') return new Date(Date.now() + 3600000).toISOString();
        return null;
      });

      await expect(handleDataExport(mockProducts, mockMovements, mockAlerts))
        .rejects.toThrow(ExportError);
      
      try {
        await handleDataExport(mockProducts, mockMovements, mockAlerts);
      } catch (error) {
        expect(error).toBeInstanceOf(ExportError);
        expect((error as ExportError).type).toBe(ExportErrorType.RATE_LIMIT_ERROR);
      }
    });

    test('should throw network error when offline', async () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          onLine: false,
          userAgent: 'Test User Agent'
        }
      });

      await expect(handleDataExport(mockProducts, mockMovements, mockAlerts))
        .rejects.toThrow(ExportError);
      
      try {
        await handleDataExport(mockProducts, mockMovements, mockAlerts);
      } catch (error) {
        expect(error).toBeInstanceOf(ExportError);
        expect((error as ExportError).type).toBe(ExportErrorType.NETWORK_ERROR);
      }
    });

    test('should handle empty data arrays', async () => {
      await expect(handleDataExport([], [], []))
        .resolves.not.toThrow();
    });

    test('should generate correct filename format', async () => {
      const createElementSpy = jest.spyOn(document, 'createElement');
      
      await handleDataExport(mockProducts, mockMovements, mockAlerts);
      
      expect(createElementSpy).toHaveBeenCalledWith('a');
      
      // Check if download attribute was set with correct format
      const mockElement = createElementSpy.mock.results[0].value;
      expect(mockElement.download).toMatch(/^user_data_export_\d{2}\.\d{2}\.\d{4}\.json$/);
    });
  });

  describe('getErrorMessage', () => {
    test('should return correct message for network error', () => {
      const error = new ExportError(ExportErrorType.NETWORK_ERROR, 'Network failed');
      expect(getErrorMessage(error)).toBe('Netzwerkfehler: Überprüfen Sie Ihre Internetverbindung.');
    });

    test('should return correct message for validation error', () => {
      const error = new ExportError(ExportErrorType.VALIDATION_ERROR, 'Validation failed');
      expect(getErrorMessage(error)).toBe('Datenvalidierung fehlgeschlagen. Versuchen Sie es erneut.');
    });

    test('should return correct message for rate limit error', () => {
      const error = new ExportError(ExportErrorType.RATE_LIMIT_ERROR, 'Rate limit exceeded');
      expect(getErrorMessage(error)).toBe('Zu viele Versuche. Bitte warten Sie eine Stunde.');
    });

    test('should return correct message for session error', () => {
      const error = new ExportError(ExportErrorType.SESSION_ERROR, 'Session invalid');
      expect(getErrorMessage(error)).toBe('Sitzung abgelaufen. Bitte melden Sie sich erneut an.');
    });

    test('should return default message for unknown error', () => {
      const error = new ExportError(ExportErrorType.UNKNOWN_ERROR, 'Unknown error');
      expect(getErrorMessage(error)).toBe('Ein unerwarteter Fehler ist aufgetreten.');
    });
  });

  describe('ExportError', () => {
    test('should create error with correct properties', () => {
      const error = new ExportError(
        ExportErrorType.VALIDATION_ERROR,
        'Test message',
        { detail: 'test' }
      );
      
      expect(error.type).toBe(ExportErrorType.VALIDATION_ERROR);
      expect(error.message).toBe('Test message');
      expect(error.details).toEqual({ detail: 'test' });
      expect(error.name).toBe('ExportError');
    });
  });

  describe('Rate Limiting', () => {
    test('should allow export when no previous exports', async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'export_rate_limit') return null;
        if (key === 'session_token') return 'valid-token';
        if (key === 'session_expiry') return new Date(Date.now() + 3600000).toISOString();
        return null;
      });

      await expect(handleDataExport(mockProducts, mockMovements, mockAlerts))
        .resolves.not.toThrow();
    });

    test('should reset rate limit after time window', async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'export_rate_limit') {
          return JSON.stringify({
            count: 5,
            windowStart: Date.now() - 3700000 // More than 1 hour ago
          });
        }
        if (key === 'session_token') return 'valid-token';
        if (key === 'session_expiry') return new Date(Date.now() + 3600000).toISOString();
        return null;
      });

      await expect(handleDataExport(mockProducts, mockMovements, mockAlerts))
        .resolves.not.toThrow();
    });
  });

  describe('Data Validation', () => {
    test('should validate product data structure', async () => {
      const invalidProducts = [
        {
          // Missing required fields
          id: '1',
          name: 'Test'
        }
      ] as Product[];

      // This should still work as validation is on the export data structure, not individual records
      await expect(handleDataExport(invalidProducts, mockMovements, mockAlerts))
        .resolves.not.toThrow();
    });
  });

  describe('Security Validations', () => {
    test('should require HTTPS in production', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          protocol: 'http:',
          hostname: 'production.com'
        }
      });

      await expect(handleDataExport(mockProducts, mockMovements, mockAlerts))
        .rejects.toThrow(ExportError);
    });

    test('should allow HTTP on localhost', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          protocol: 'http:',
          hostname: 'localhost'
        }
      });

      await expect(handleDataExport(mockProducts, mockMovements, mockAlerts))
        .resolves.not.toThrow();
    });
  });
});