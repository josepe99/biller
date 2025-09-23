'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface SaleDetailHeaderProps {
  onSearch?: (value: string) => void;
  placeholder?: string;
}

export function SaleDetailHeader({ onSearch, placeholder = "Buscar..." }: SaleDetailHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="border-orange-200 text-orange-600 hover:bg-orange-50"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="font-semibold text-lg text-orange-500">Detalle de Factura</span>
      </div>
      <div className="w-full md:w-80">
        <Input
          type="text"
          placeholder={placeholder}
          className="w-full"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
    </div>
  );
}