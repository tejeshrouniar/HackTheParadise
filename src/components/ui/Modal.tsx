import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  required = false,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  required?: boolean;
  wide?: boolean;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!value && !required) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="sc-overlay" />
        <Dialog.Content
          className={`sc-modal ${wide ? "sc-modal-wide" : ""}`}
          {...(!description ? { "aria-describedby": undefined } : {})}
          onEscapeKeyDown={(e) => {
            if (required) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (required) e.preventDefault();
          }}
        >
          <div className="sc-modal-heading">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              {description && (
                <Dialog.Description>{description}</Dialog.Description>
              )}
            </div>
            {!required && (
              <Dialog.Close
                className="sc-icon-button"
                aria-label="Close dialog"
              >
                <X size={20} />
              </Dialog.Close>
            )}
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
