"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title: string;
  description?: string;
  renderComponent: () => React.ReactNode;
  onSubmit?: () => void;
}

export default function Modal({
  isOpen,
  setIsOpen,
  title,
  description,
  renderComponent,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="mt-5">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Dynamic content from parent */}
        <div className="grid gap-4 py-4 ">{renderComponent()}</div>

        {/* <DialogFooter>
          <Button type="submit" onClick={onSubmit}>
            Save changes
          </Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}

