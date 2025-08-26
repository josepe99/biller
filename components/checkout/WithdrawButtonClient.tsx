"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import WithdrawModal from './WithdrawModal'
import { useToast } from '@/hooks/use-toast'

interface Props {
  checkoutId: string
}

export default function WithdrawButtonClient({ checkoutId }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async (data: { amount: number; description?: string }) => {
    setLoading(true)
    try {
      // TODO: call server action to register the withdrawal. For now just simulate.
      // You can replace this with a real action, e.g. "createWithdrawalAction(checkoutId, data)"
      await new Promise(resolve => setTimeout(resolve, 700))
      toast.toast({ title: 'Extracción registrada', description: `Se registró la extracción de Gs ${data.amount.toLocaleString('es-PY')}` })
      setOpen(false)
    } catch (err) {
      toast.toast({ title: 'Error', description: 'No se pudo registrar la extracción.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        className="bg-orange-500 hover:bg-orange-600 text-white mb-3 me-3"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Extraer dinero
      </Button>

      <WithdrawModal open={open} onOpenChange={setOpen} onSubmit={handleSubmit} loading={loading} />
    </>
  )
}
