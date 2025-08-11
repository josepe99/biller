import { Product, User, Category } from '@/lib/types'

export const sampleProducts: Product[] = [
  { id: 'P001', barcode: 7891234567891, name: 'Coca-Cola 2L', price: 2500, stock: 50, category: 'Bebidas', iva: 10 },
  { id: 'P002', barcode: 7891234567892, name: 'Pan de Molde', price: 1800, stock: 30, category: 'Panadería', iva: 5 },
  { id: 'P003', barcode: 7891234567893, name: 'Leche Entera 1L', price: 1200, stock: 10, category: 'Lácteos', iva: 5 },
  { id: 'P004', barcode: 7891234567894, name: 'Manzanas (kg)', price: 3000, stock: 15, category: 'Frutas', iva: 10 },
  { id: 'P005', barcode: 7891234567895, name: 'Arroz 1kg', price: 1500, stock: 5, category: 'Granos', iva: 5 }, // Low stock
  { id: 'P006', barcode: 7891234567896, name: 'Jabón de Baño', price: 900, stock: 2, category: 'Higiene', iva: 10 }, // Low stock
  { id: 'P007', barcode: 7891234567897, name: 'Libro de Texto', price: 50000, stock: 10, category: 'Educación', iva: 5 },
  { id: 'P008', barcode: 7891234567898, name: 'Televisor 4K', price: 2500000, stock: 3, category: 'Electrónica', iva: 10 },
  { id: 'P009', barcode: 7891234567899, name: 'Gaseosa Naranja', price: 2000, stock: 40, category: 'Bebidas', iva: 10 },
  { id: 'P010', barcode: 7891234567900, name: 'Gaseosa Limón', price: 2000, stock: 35, category: 'Bebidas', iva: 10 },
]

export const sampleUsers: User[] = [
  { id: 'U001', name: 'Juan Pérez', role: 'admin' },
  { id: 'U002', name: 'María García', role: 'cashier' },
  { id: 'U003', name: 'Pedro López', role: 'cashier' },
]

export const sampleCategories: Category[] = [
  { id: 'C001', name: 'Bebidas' },
  { id: 'C002', name: 'Panadería' },
  { id: 'C003', name: 'Lácteos' },
  { id: 'C004', name: 'Frutas' },
  { id: 'C005', name: 'Granos' },
  { id: 'C006', name: 'Higiene' },
  { id: 'C007', name: 'Educación' },
  { id: 'C008', name: 'Electrónica' },
]
