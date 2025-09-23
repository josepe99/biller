import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface SaleNavigationProps {
  beforeLink?: string;
  nextLink?: string | null;
}

export function SaleNavigation({ beforeLink, nextLink }: SaleNavigationProps) {
  return (
    <div className="flex justify-between mt-10">
      {beforeLink ? (
        <Link href={beforeLink}>
          <Button variant="outline">Anterior</Button>
        </Link>
      ) : (
        <Button variant="outline" disabled>Anterior</Button>
      )}
      {nextLink ? (
        <Link href={nextLink}>
          <Button variant="outline">Siguiente</Button>
        </Link>
      ) : (
        <Button variant="outline" disabled>Siguiente</Button>
      )}
    </div>
  );
}