import { useState } from "react";

export function usePaymentManager({
  user,
  checkout,
  cart,
  customerInfo,
  currentInvoiceNumber,
  cartTotals,
  handleGenerateInvoiceNumber,
  resetCart,
  resetCustomer,
}: any) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const handleConfirmPayment = async (
    payments: { method: string; amount: number; voucherIdentifier?: string }[],
    createSaleAction: any
  ) => {
    if (!user || !checkout) return;
    const { subtotalWithoutIva, totalIvaAmount, total } = cartTotals;
    const saleData = {
      sale: {
        saleNumber: currentInvoiceNumber,
        total: total,
        subtotal: subtotalWithoutIva,
        tax: totalIvaAmount,
        discount: 0,
        status: "COMPLETED",
        userId: user.id,
        customerId: customerInfo?.id,
        checkoutId: checkout.id,
        cashRegisterId: checkout.cashRegisterId,
        notes: "",
      },
      items: cart.map((item: any) => ({
        quantity: item.quantity,
        unitPrice: item.unitPriceWithIVA,
        total: item.lineTotalWithIVA,
        productId: item.id,
      })),
      payments: payments.map((p) => {
        const paymentObj: any = {
          paymentMethod: p.method,
          movement: "INCOME",
          amount: p.amount,
          userId: user.id,
          checkoutId: checkout.id,
          cashRegisterId: checkout.cashRegisterId,
        };
        if (p.voucherIdentifier) {
          paymentObj.voucherIdentifier = p.voucherIdentifier;
        }
        return paymentObj;
      }),
    };
    await createSaleAction(saleData);
    resetCart();
    resetCustomer();
    setIsPaymentModalOpen(false);
    await handleGenerateInvoiceNumber();
    window.location.reload();
  };

  const handleConfirmCancel = async () => {
    resetCart();
    resetCustomer();
    setIsCancelModalOpen(false);
    await handleGenerateInvoiceNumber();
  };

  return {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    isCancelModalOpen,
    setIsCancelModalOpen,
    handleConfirmPayment,
    handleConfirmCancel,
  };
}
