# Formateo de Números Paraguayos

## Descripción

Esta implementación maneja el formato de números paraguayos (Guaraníes) que utiliza:
- Punto (.) como separador de miles
- Sin decimales (números enteros)
- Prefijo "Gs" para la moneda

## Ejemplos de formato

### Números típicos paraguayos:
- `1000` → `Gs 1.000`
- `15000` → `Gs 15.000`
- `100000` → `Gs 100.000`
- `1000000` → `Gs 1.000.000`
- `2500000` → `Gs 2.500.000`

### Funciones disponibles

#### `formatParaguayanCurrency(value: number | string): string`
Convierte un número a formato de moneda paraguaya con prefijo "Gs".

```typescript
formatParaguayanCurrency(100000) // "Gs 100.000"
```

#### `formatNumberWithDots(value: number | string): string`
Convierte un número a formato paraguayo sin prefijo "Gs".

```typescript
formatNumberWithDots(100000) // "100.000"
```

#### `parseParaguayanCurrency(value: string): number`
Convierte un string en formato paraguayo de vuelta a número.

```typescript
parseParaguayanCurrency("Gs 100.000") // 100000
parseParaguayanCurrency("100.000") // 100000
```

## Componentes implementados

### PriceInput
Componente de input especializado para precios paraguayos que:
- Permite solo números y puntos
- Formatea automáticamente mientras se escribe
- Envía el valor numérico real al formulario
- Muestra formato paraguayo al usuario

### Uso en formularios
El componente se integra en el formulario de productos permitiendo entrada natural de precios paraguayos:

```tsx
<PriceInput 
  name="price" 
  placeholder="Ej: 100.000 (Guaraníes)" 
  defaultValue={product?.price || ''} 
  required 
/>
```

## Integración en el sistema

Los precios se muestran consistentemente en formato paraguayo en:
- ✅ Formulario de productos
- ✅ Lista de productos en facturación
- ✅ Modal de búsqueda de productos
- ✅ Resumen de factura (subtotales, IVA, total)
- ✅ Confirmación de pago

## Características técnicas

- **Sin decimales**: El sistema maneja solo números enteros (Guaraníes)
- **Separador de miles**: Usa punto (.) en lugar de coma (,)
- **Formato consistente**: Todos los precios usan el mismo formato
- **Validación**: Input restringido a números y puntos válidos
- **Usabilidad**: Formateo automático en tiempo real
