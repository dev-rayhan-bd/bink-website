"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { isValidElement, type ReactNode } from "react";

interface ModalWrapperProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  actionTrigger?: ReactNode;
  showClose?: boolean;
}

export function ModalWrapper({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  title,
  description,
  children,
  actionTrigger,
  showClose = false,
}: ModalWrapperProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const onOpenChange = controlledOnOpenChange ?? setInternalOpen;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {isValidElement(actionTrigger) && (
        <DialogTrigger asChild>{actionTrigger}</DialogTrigger>
      )}

      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 shadow-md shadow-primary">
        {/* Header Section */}
        {(title || description) && (
          <DialogHeader className="shrink-0 border-b p-4 text-left gap-0">
            {title && (
              <DialogTitle className="text-xl font-medium">{title}</DialogTitle>
            )}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}

        {/* Content Body */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {showClose && (
          <div className="flex shrink-0 justify-end border-t bg-muted p-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
