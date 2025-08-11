// Script de prueba para validar el formateo de números paraguayos
import { formatParaguayanCurrency, parseParaguayanCurrency, formatNumberWithDots } from '../lib/utils'

console.log('=== Pruebas de formateo paraguayo ===')

// Pruebas de formateo
const testNumbers = [1000, 15000, 100000, 1000000, 2500000]

console.log('\n1. Formateo de moneda paraguaya:')
testNumbers.forEach(num => {
  console.log(`${num} -> ${formatParaguayanCurrency(num)}`)
})

console.log('\n2. Formateo con puntos (sin Gs):')
testNumbers.forEach(num => {
  console.log(`${num} -> ${formatNumberWithDots(num)}`)
})

console.log('\n3. Parseo de strings paraguayas:')
const testStrings = ['Gs 100.000', 'Gs 1.000', '15.000', '2.500.000']
testStrings.forEach(str => {
  const parsed = parseParaguayanCurrency(str)
  console.log(`"${str}" -> ${parsed}`)
})

console.log('\n4. Casos especiales:')
console.log(`Formato de 0: ${formatParaguayanCurrency(0)}`)
console.log(`Formato de número negativo: ${formatParaguayanCurrency(-1000)}`)
console.log(`Parse de string vacía: ${parseParaguayanCurrency('')}`)
console.log(`Parse de "Gs": ${parseParaguayanCurrency('Gs')}`)
