"use client";

import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Plus } from "lucide-react";

interface RolesHeaderProps {
  canCreate: boolean;
  onBack: () => void;
  onCreateClick: () => void;
}

export function RolesHeader({
  canCreate,
  onBack,
  onCreateClick,
}: RolesHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-5 w-5 mr-1" />
          Volver al panel
        </Button>
        <CardTitle className="text-orange-500">Gestión de Roles</CardTitle>
      </div>
      {canCreate && (
        <Button
          className="bg-orange-500 hover:bg-orange-600"
          onClick={onCreateClick}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Rol
        </Button>
      )}
    </CardHeader>
  );
}
