interface ReportsModuleProps {
  onBack: () => void
}

export default function ReportsModule({ onBack }: ReportsModuleProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-orange-500">Reportes de Ventas</h2>
      <p className="text-muted-foreground mt-2">Aquí se mostrarán los reportes de ventas diarias y mensuales.</p>
      <button className="mt-4 text-orange-500 underline" onClick={onBack}>Volver</button>
    </div>
  )
}
