"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";

interface CustomersHeaderProps {
  canCreate: boolean;
  onBack: () => void;
  onCreateClick: () => void;
}

export function CustomersHeader({
  canCreate,
  onBack,
  onCreateClick,
}: CustomersHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-5 w-5 mr-1" />
          Volver al panel
        </Button>
        <h1 className="text-2xl font-bold text-orange-500">Clientes</h1>
      </div>
      {canCreate && (
        <Button
          className="bg-orange-500 hover:bg-orange-600"
          onClick={onCreateClick}
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Cliente
        </Button>
      )}
    </div>
  );
}
