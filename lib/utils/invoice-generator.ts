/**
 * Invoice number generator utilities
 * Format: xxx-xxx-zzzzzzz
 * Where:
 * - xxx: Prefix (configurable, default: 001)
 * - xxx: Middle (configurable, default: 001) 
 * - zzzzzzz: Sequential number (7 digits)
 */

export interface InvoiceNumberConfig {
  prefix?: string // First 3 digits
  middle?: string // Middle 3 digits
  sequence: number // Sequential number
}

/**
 * Generate invoice number in format xxx-xxx-zzzzzzz
 */
export function generateInvoiceNumber(config: InvoiceNumberConfig): string {
  const prefix = (config.prefix || '001').padStart(3, '0')
  const middle = (config.middle || '001').padStart(3, '0')
  const sequence = config.sequence.toString().padStart(7, '0')
  
  return `${prefix}-${middle}-${sequence}`
}

/**
 * Parse invoice number to extract components
 */
export function parseInvoiceNumber(invoiceNumber: string): InvoiceNumberConfig | null {
  const pattern = /^(\d{3})-(\d{3})-(\d{7})$/
  const match = invoiceNumber.match(pattern)
  
  if (!match) {
    return null
  }
  
  return {
    prefix: match[1],
    middle: match[2],
    sequence: parseInt(match[3])
  }
}

/**
 * Validate invoice number format
 */
export function isValidInvoiceNumber(invoiceNumber: string): boolean {
  const pattern = /^\d{3}-\d{3}-\d{7}$/
  return pattern.test(invoiceNumber)
}

/**
 * Get next sequence number from database
 * This should be called from the server side
 */
export async function getNextInvoiceSequence(): Promise<number> {
  // This will be implemented with actual database logic
  // For now, return a mock sequence
  const timestamp = Date.now()
  const randomPart = Math.floor(Math.random() * 1000)
  return (timestamp % 1000000) + randomPart
}

/**
 * Generate complete invoice data with sequence
 */
export async function generateInvoiceData(config?: Partial<InvoiceNumberConfig>) {
  const sequence = await getNextInvoiceSequence()
  const fullConfig: InvoiceNumberConfig = {
    prefix: config?.prefix || '001',
    middle: config?.middle || '001',
    sequence
  }
  
  return {
    saleNumber: generateInvoiceNumber(fullConfig),
    invoicePrefix: fullConfig.prefix,
    invoiceMiddle: fullConfig.middle,
    invoiceSequence: fullConfig.sequence
  }
}
