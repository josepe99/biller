import { generateInvoiceNumber } from '@/lib/utils/invoice-generator'
import { getCheckoutByIdAction } from '@/lib/actions/checkouts'

/**
 * Obtiene el número de factura actual del checkout
 * @param checkoutId string
 * @returns string | null
 */
export async function getCurrentInvoiceNumberFromCheckout(checkoutId: string): Promise<string | null> {
  const checkout = await getCheckoutByIdAction(checkoutId)
  if (!checkout) return null
  const prefix = checkout.invoicePrefix || '001'
  const middle = checkout.invoiceMiddle || '001'
  const sequence = checkout.invoiceSequence || 1
  return generateInvoiceNumber({ prefix, middle, sequence })
}
