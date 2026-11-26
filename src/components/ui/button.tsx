import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold
   transition-all duration-fast
   focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2
   disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed
   active:scale-[0.98] transition-transform duration-fast',
  {
    variants: {
      variant: {
        default: 'bg-accent text-accent-foreground hover:brightness-105 shadow-sm',
        destructive:
          'bg-destructive text-destructive-foreground hover:brightness-105 shadow-sm',
        outline:
          'border-2 border-accent text-accent bg-transparent hover:bg-accent/10 hover:bg-accent/5',
        secondary:
          'bg-surface border border-border text-foreground hover:bg-surface-elevated hover:border-accent/30',
        ghost: 'bg-transparent hover:bg-surface-elevated',
        link: 'text-accent underline-offset-4 hover:underline',
      },
      size: {
        default: 'min-h-[44px] px-5 py-2.5 text-sm rounded-full',
        sm: 'min-h-[36px] px-3 py-1.5 text-xs rounded-full',
        lg: 'min-h-[48px] px-8 text-base rounded-full',
        icon: 'min-h-[44px] w-[44px] rounded-full p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };