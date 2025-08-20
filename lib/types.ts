export enum ProductUnity {
  UN = 'UN',
  KG = 'KG',
  G = 'G',
  L = 'L',
  ML = 'ML',
  PACK = 'PACK',
  CAJA = 'CAJA',
  DOC = 'DOC',
  PAR = 'PAR',
  M = 'M',
  CM = 'CM',
  MM = 'MM',
  OTRO = 'OTRO',
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  iva: number;
  discount?: number;
  unity: ProductUnity;
}

// Tipos para autenticación
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  [key: string]: any;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  [key: string]: any;
}
