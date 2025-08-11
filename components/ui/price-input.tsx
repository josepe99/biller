'use client'

import { Input } from '@/components/ui/input'
import { formatNumberWithDots, parseParaguayanCurrency } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface PriceInputProps {
  id?: string
  name?: string
  placeholder?: string
  defaultValue?: string | number
  required?: boolean
  className?: string
  onChange?: (value: number) => void
}

export function PriceInput({
  id,
  name,
  placeholder = "Precio en Guaraníes",
  defaultValue = '',
  required = false,
  className,
  onChange
}: PriceInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [actualValue, setActualValue] = useState(0)

  useEffect(() => {
    if (defaultValue) {
      const numValue = typeof defaultValue === 'string' 
        ? parseParaguayanCurrency(defaultValue)
        : defaultValue
      setActualValue(numValue)
      setDisplayValue(formatNumberWithDots(numValue))
    }
  }, [defaultValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Permitir solo números y puntos
    const cleanValue = value.replace(/[^\d.]/g, '')
    
    // Evitar múltiples puntos consecutivos
    const normalizedValue = cleanValue.replace(/\.+/g, '.')
    
    // Remover puntos para obtener el valor numérico real
    const numericValue = parseInt(normalizedValue.replace(/\./g, '')) || 0
    
    setActualValue(numericValue)
    
    // Formatear el valor para mostrar
    if (normalizedValue) {
      setDisplayValue(formatNumberWithDots(numericValue))
    } else {
      setDisplayValue('')
    }
    
    if (onChange) {
      onChange(numericValue)
    }
  }

  const handleBlur = () => {
    // Reformatear al perder el foco para asegurar formato correcto
    if (actualValue > 0) {
      setDisplayValue(formatNumberWithDots(actualValue))
    }
  }

  return (
    <>
      <Input
        id={id}
        type="text"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        required={required}
        className={className}
      />
      {/* Input oculto para enviar el valor numérico real en el formulario */}
      <input
        type="hidden"
        name={name}
        value={actualValue}
      />
    </>
  )
}
