import { Product, User, Category } from '@/lib/types'

export const sampleProducts: Product[] = [
  { id: 'P001', name: 'Coca-Cola 2L', price: 2500, stock: 50, category: 'Bebidas', ivaType: '10%' },
  { id: 'P002', name: 'Pan de Molde', price: 1800, stock: 30, category: 'Panadería', ivaType: '5%' },
  { id: 'P003', name: 'Leche Entera 1L', price: 1200, stock: 10, category: 'Lácteos', ivaType: '5%' },
  { id: 'P004', name: 'Manzanas (kg)', price: 3000, stock: 15, category: 'Frutas', ivaType: '10%' },
  { id: 'P005', name: 'Arroz 1kg', price: 1500, stock: 5, category: 'Granos', ivaType: '5%' }, // Low stock
  { id: 'P006', name: 'Jabón de Baño', price: 900, stock: 2, category: 'Higiene', ivaType: '10%' }, // Low stock
  { id: 'P007', name: 'Libro de Texto', price: 50000, stock: 10, category: 'Educación', ivaType: '5%' },
  { id: 'P008', name: 'Televisor 4K', price: 2500000, stock: 3, category: 'Electrónica', ivaType: '10%' },
  { id: 'P009', name: 'Gaseosa Naranja', price: 2000, stock: 40, category: 'Bebidas', ivaType: '10%' },
  { id: 'P010', name: 'Gaseosa Limón', price: 2000, stock: 35, category: 'Bebidas', ivaType: '10%' },
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
