"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@lumiere/dashboard-ui/components/alert-dialog";
import { Button } from "@lumiere/dashboard-ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@lumiere/dashboard-ui/components/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@lumiere/dashboard-ui/components/drawer";
import { cn } from "@lumiere/dashboard-ui/utils";
import { useCallback, useEffect, useState, type ReactNode } from "react";

export const RESPONSIVE_MODAL_DESKTOP_QUERY = "(min-width: 768px)";

type ResponsiveModalControls = {
  requestClose: () => void;
};

type ResponsiveModalProps = {
  children: ReactNode | ((controls: ResponsiveModalControls) => ReactNode);
  contentClassName?: string;
  description: string;
  dirty?: boolean;
  onDiscard?: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
};

export function ResponsiveModal({
  children,
  contentClassName,
  description,
  dirty = false,
  onDiscard,
  onOpenChange,
  open,
  title,
}: ResponsiveModalProps) {
  const isDesktop = useDesktopModal();
  const [confirmingClose, setConfirmingClose] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmingClose(false);
    }
  }, [open]);

  const requestClose = useCallback(() => {
    if (dirty) {
      setConfirmingClose(true);
      return;
    }

    onOpenChange(false);
  }, [dirty, onOpenChange]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      requestClose();
      return;
    }

    onOpenChange(true);
  };
  const content = typeof children === "function" ? children({ requestClose }) : children;
  const modalHeader = (
    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
      <div className="min-w-0">
        {isDesktop ? (
          <DialogHeader>
            <DialogTitle className="text-lg">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
        ) : (
          <DrawerHeader className="p-0 text-left">
            <DrawerTitle className="text-lg">{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
        )}
      </div>
      <Button
        aria-label={`Close ${title}`}
        className="shrink-0"
        onClick={requestClose}
        size="icon-lg"
        type="button"
        variant="ghost"
      >
        <CloseIcon />
      </Button>
    </div>
  );
  const modalBody = (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
      {content}
    </div>
  );

  return (
    <>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent
            className={cn(
              "max-h-[min(90dvh,56rem)] max-w-3xl gap-0 overflow-hidden p-0 sm:max-w-3xl",
              contentClassName,
            )}
            showCloseButton={false}
          >
            {modalHeader}
            {modalBody}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={handleOpenChange} showSwipeHandle>
          <DrawerContent
            className={cn(
              "[--drawer-height:min(92dvh,56rem)] motion-reduce:transition-none",
              contentClassName,
            )}
          >
            {modalHeader}
            {modalBody}
          </DrawerContent>
        </Drawer>
      )}

      <AlertDialog open={confirmingClose} onOpenChange={setConfirmingClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your changes have not been saved. Keep editing or discard them and close this form.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmingClose(false);
                onDiscard?.();
                onOpenChange(false);
              }}
              variant="destructive"
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function useDesktopModal() {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(RESPONSIVE_MODAL_DESKTOP_QUERY);
    const update = () => setIsDesktop(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="m7 7 10 10M17 7 7 17"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
