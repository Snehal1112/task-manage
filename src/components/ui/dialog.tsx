import * as React from "react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogFooterProps {
  className?: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onClose, onOpenChange, children }) => {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (open) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the dialog
      setTimeout(() => {
        dialogRef.current?.focus();
      }, 100);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Add escape key listener
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    } else {
      // Restore focus when closing
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [open]);

  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="fixed inset-0 bg-black/80" 
        onClick={handleClose}
        aria-hidden="true"
      />
      <div 
        ref={dialogRef}
        className="relative z-50 max-w-lg w-full mx-4"
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
};

export const DialogContent: React.FC<DialogContentProps> = ({ className, children }) => (
  <div
    className={cn(
      "relative bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
      className
    )}
  >
    {children}
  </div>
);

export const DialogHeader: React.FC<DialogHeaderProps> = ({ className, children }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
    {children}
  </div>
);

export const DialogTitle: React.FC<DialogTitleProps> = ({ className, children }) => (
  <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
    {children}
  </h3>
);

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ className, children }) => (
  <p className={cn("text-sm text-muted-foreground", className)}>
    {children}
  </p>
);

export const DialogFooter: React.FC<DialogFooterProps> = ({ className, children }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>
    {children}
  </div>
);