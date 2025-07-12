export interface Product {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  expiryDate: string;
  batchNumber?: string;
  location: string;
  supplier?: string;
  price?: number;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Movement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  user: string;
  timestamp: string;
  notes?: string;
  batchNumber?: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface Alert {
  id: string;
  type: 'expiry' | 'low_stock';
  severity: 'high' | 'medium' | 'low';
  productId: string;
  productName: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}