"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CustomersSearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  disabled?: boolean;
}

export function CustomersSearchBar({
  initialQuery = "",
  onSearch,
  disabled = false,
}: CustomersSearchBarProps) {
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
      <Input
        type="text"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Buscar por nombre, email o RUC..."
        className="w-64"
        aria-label="Buscar clientes"
        disabled={disabled}
      />
      <Button type="submit" disabled={disabled}>
        Buscar
      </Button>
    </form>
  );
}

