import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Spinner({ className, ...props }) {
  return (
    <Loader2
      className={cn('h-6 w-6 animate-spin text-blue-600', className)}
      {...props}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
