import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, id, name, ...props }, ref) => {
  const generatedId = React.useId();
  const resolvedId = id ?? generatedId;
  const resolvedName = name ?? id ?? generatedId;

  return (
    <textarea
      {...props}
      id={resolvedId}
      name={resolvedName}
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className
      )}
      ref={ref}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
