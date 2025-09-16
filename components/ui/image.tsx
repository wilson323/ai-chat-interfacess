import * as React from 'react';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';

interface ImageProps extends React.ComponentProps<typeof NextImage> {
  className?: string;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, ...props }, ref) => {
    return (
      <NextImage
        ref={ref}
        className={cn('', className)}
        {...props}
      />
    );
  }
);
Image.displayName = 'Image';

export { Image };